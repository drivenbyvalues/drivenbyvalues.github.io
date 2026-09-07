---
layout: article
title: Kafka-as-a-Service — Platform Requirements for Availability, Disaster Recovery & Key Metrics
permalink: /articles/2026-paas-kafka-requirements/
year: 2026
feature_area: Data Services PaaS · Kafka Requirements
summary: The mandatory bar for onboarding a Kafka offering onto a platform-as-a-service catalog — replication and ISR requirements, cross-region DR strategy, and the metrics both the platform team and producer/consumer applications must instrument.
---

# Kafka-as-a-Service — Platform Requirements

*Platform area: Data Services PaaS · Kafka · Status: reference specification*

## Why This Requirements Doc Exists

Kafka's durability guarantees are only as strong as the replication and acknowledgment settings a topic is actually configured with — a topic with `replication.factor=1` and a producer using `acks=0` will lose data on the first broker restart, and Kafka will not stop anyone from creating exactly that topic. A platform-as-a-service layer earns its keep by enforcing sane defaults at the cluster and topic-template level, so individual teams don't have to rediscover Kafka's durability model the hard way. This doc sets that bar, plus what "healthy" looks like once a cluster is live.

## Service Tiers

| Tier | Replication factor | `min.insync.replicas` | Producer `acks` | Intended use |
|---|---|---|---|---|
| **Dev/Sandbox** | 1 | 1 | `1` | Local/integration testing |
| **Standard** | 3 | 2 | `all` | Event streams, analytics pipelines, non-financial telemetry |
| **Critical** | 3 (rack-aware) | 2 | `all` + idempotent producer | Transactional events, financial/audit streams, anything feeding a ledger or compliance system |

## Availability Requirements

- **Replication factor 3 minimum for Standard and Critical**, with `min.insync.replicas=2` — a cluster can lose one broker and keep accepting writes without data loss, and can lose a second before it must stop accepting writes rather than silently under-replicate.
- **`unclean.leader.election.enable=false`** on every Standard/Critical topic. Never elect an out-of-sync replica as leader — the platform accepts unavailability over silent data loss.
- **Rack/AZ awareness (`broker.rack`)** configured so that a topic's replicas are spread across independent AZs, not just independent brokers in the same AZ.
- **Controller and ZooKeeper/KRaft quorum**: minimum 3-node controller quorum (KRaft) or 3-node ZooKeeper ensemble, tolerating one node loss without losing metadata write availability.
- **Availability targets**: Standard tier 99.9%, Critical tier 99.95%, measured as producer-write availability (able to successfully produce within timeout) and consumer-read availability separately — the two can degrade independently.
- **Partition count discipline**: platform-enforced ceiling on partitions-per-broker to prevent controller failover time from degrading as partition count grows unbounded (controller failover time scales with partition count).

## Disaster Recovery Requirements

- **Cross-cluster replication** via MirrorMaker2 (or a managed equivalent) from primary region to a standby DR cluster for every Critical-tier topic, with offset translation so consumer groups can resume from an equivalent position after failover, not from the beginning of the topic.
- **Tiered storage / extended retention** for topics that double as a source-of-truth log (not just a transport layer) — retention long enough to support reprocessing after an extended consumer-side outage, independent of the DR story.
- **RPO / RTO targets**:

| Tier | RPO | RTO |
|---|---|---|
| Standard | Minutes (bounded by MirrorMaker2 replication lag, best-effort) | 30–60 minutes (DNS/cluster cutover + consumer restart) |
| Critical | ≤30 seconds (bounded, monitored MirrorMaker2 lag with alerting) | 15 minutes (pre-provisioned standby cluster, scripted cutover) |

- **DR drill cadence**: full failover to the standby cluster at least twice a year for Critical-tier topics, explicitly validating offset translation correctness — a consumer that "resumes" from the wrong offset after failover either reprocesses everything or silently skips messages, and both are real incidents.
- **Schema Registry DR**: Schema Registry (or equivalent) must be replicated alongside the topics it governs — a topic that survives failover but loses access to its schema history is not actually recovered.

## Platform-Level Metrics (What the Platform Team Watches)

| Metric | Why it matters | Alert threshold |
|---|---|---|
| Under-replicated partitions | Direct signal that a topic is one failure away from `min.insync.replicas` violation | >0 sustained beyond a few minutes |
| ISR shrink/expand rate | Frequent ISR churn indicates network flakiness or overloaded brokers, ahead of a harder failure | Sustained shrink rate |
| Offline partitions count | Partitions with no leader — active write unavailability | Any nonzero value |
| Controller election count | Repeated controller elections indicate cluster instability | >1 per hour outside planned maintenance |
| Broker disk usage | Kafka does not degrade gracefully when it runs out of disk | >80% sustained |
| Request handler / network processor idle ratio | Approaching zero means brokers are saturated and about to start rejecting/queuing requests | <20% idle sustained |
| Produce/fetch request latency (p99) | Broker-side latency, independent of network hops to the client | p99 within SLO for tier |
| MirrorMaker2 replication lag (Critical/Standard DR pairs) | Direct input to RPO | Threshold per tier RPO target |

## Application-Facing Metrics (What Consuming Teams Must Instrument)

| Metric | Why it matters | Target |
|---|---|---|
| Producer send latency / `acks` round-trip time | End-to-end write latency as the application actually experiences it | Documented per topic SLA |
| Producer retry and error rate | Retries hidden behind the client library can mask a degrading cluster until it fails outright | <0.1% terminal failures |
| Consumer lag (per partition, per group) | The single most important consumer-side health signal — growing lag means the consumer can't keep up or has stalled | Alert on sustained growth, not just absolute value |
| End-to-end latency (produce timestamp → consume timestamp) | Captures pipeline health holistically, including anything the platform-level metrics can't see (slow downstream processing) | Documented per pipeline SLA |
| Dead-letter/error-topic volume | Poison messages or schema mismatches accumulating silently | Any sustained nonzero rate |
| Consumer group rebalance frequency | Frequent rebalances (flapping consumers, overly aggressive session timeouts) cause processing pauses | Rebalances should be rare outside deploys |

## Key Decisions

- **`unclean.leader.election.enable=false` is non-negotiable above Dev tier.** The platform would rather serve an availability incident than a silent, undetected data-loss incident — the two require very different postmortems.
- **Consumer lag alerting belongs to the consuming team, not the platform.** The platform can guarantee the log is durable and available; only the consumer team knows what "too far behind" means for their business logic.
- **Rack-awareness is enforced at cluster provisioning, not left as an opt-in topic config** — the failure mode of forgetting it (all replicas in one AZ) is invisible until the AZ has an incident.
- **DR cutover is scripted and drilled, not "we'll figure it out."** Offset translation correctness is the part every team gets wrong on the first real DR event if it hasn't been rehearsed.

## Tech Stack / Reference Implementation

- **Engine** — Kafka (Confluent Platform or Apache Kafka + Strimzi on Kubernetes)
- **Metadata** — KRaft (post-ZooKeeper) 3-node controller quorum
- **Cross-region DR** — MirrorMaker2 with offset translation
- **Schema governance** — Confluent Schema Registry / Karapace, Avro or Protobuf schemas
- **Observability** — JMX exporter → Prometheus → Grafana, Burrow/consumer-lag exporters, client-side OpenTelemetry instrumentation

---

*Part of the Data Services PaaS requirements series — see the [API-compatibility and broker-sizing deep dive](/articles/2026-paas-kafka-api-compatibility-and-scaling/) for this service, the [requirements framework](/articles/2026-paas-requirements-framework/) this spec applies, plus [Redis](/articles/2026-paas-redis-requirements/), [Elasticsearch](/articles/2026-paas-elasticsearch-requirements/), [gRPC/Protobuf Messaging](/articles/2026-paas-grpc-protobuf-requirements/), and [MySQL](/articles/2026-paas-mysql-requirements/).*
