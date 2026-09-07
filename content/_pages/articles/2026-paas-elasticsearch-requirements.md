---
layout: article
title: Elasticsearch-as-a-Service — Platform Requirements for Availability, Disaster Recovery & Key Metrics
permalink: /articles/2026-paas-elasticsearch-requirements/
year: 2026
feature_area: Data Services PaaS · Elasticsearch Requirements
summary: The mandatory bar for onboarding an Elasticsearch/OpenSearch offering onto a platform-as-a-service catalog — cluster topology and quorum requirements, snapshot/DR strategy, and the metrics both the platform team and search/indexing applications must instrument.
---

# Elasticsearch-as-a-Service — Platform Requirements

*Platform area: Data Services PaaS · Elasticsearch · Status: reference specification*

## Why This Requirements Doc Exists

Elasticsearch clusters fail in a specific, recurring pattern: they run fine for months, then a JVM heap pressure event or a bad mapping change causes cascading GC pauses, shards go unassigned, and by the time anyone notices, the cluster is red and search is down for every downstream consumer at once — because most teams treat search as "just an index," not as a stateful service with its own availability and capacity model. This doc defines the topology, quorum, and snapshot requirements that keep a shared Elasticsearch/OpenSearch platform out of that failure mode, plus the metrics needed to see it coming.

## Service Tiers

| Tier | Topology | Replica count per index | Intended use |
|---|---|---|---|
| **Dev/Sandbox** | Single node | 0 | Local/integration testing |
| **Standard** | 3 data nodes + 3 dedicated master-eligible nodes | 1 | Log search, application search, non-critical analytics |
| **Critical** | 5+ data nodes (hot-warm tiering), 3 dedicated master-eligible nodes | 2 | Customer-facing search, compliance/audit log search, anything with a read SLA |

## Availability Requirements

- **Dedicated master-eligible nodes** (not co-located with data nodes) for Standard and Critical tiers — a data node under heavy indexing/query load must never be able to starve cluster-state operations (shard allocation, mapping updates).
- **Master quorum**: minimum 3 master-eligible nodes with `minimum_master_nodes` (or the equivalent voting-configuration setting on modern versions) set to tolerate exactly one node loss without losing the ability to elect a master — this is the single most important setting for avoiding split-brain.
- **Replica shard count ≥1 for Standard, ≥2 for Critical**, with shard allocation awareness (`cluster.routing.allocation.awareness.attributes`) configured on AZ so a replica is never placed in the same AZ as its primary.
- **Disk watermark thresholds** enforced platform-wide: low watermark 85%, high watermark 90%, flood-stage 95% — shard relocation must trigger well before a node fills up, not after.
- **Hot-warm-cold tiering for Critical tier**, so recent, high-query-volume indices sit on fast storage while older indices age onto cheaper storage without losing availability — an availability lever as much as a cost one, since undersized hot-tier capacity is a common cause of query-time degradation.
- **Availability targets**: Standard tier 99.9% (cluster status green or yellow with no query-impacting unassigned shards), Critical tier 99.95%.

## Disaster Recovery Requirements

- **Snapshot Lifecycle Management (SLM)**: automated snapshots to cross-region object storage every 4 hours for Standard tier, hourly for Critical tier, with retention of 14 days minimum (35+ days for compliance-tagged indices).
- **Cross-cluster replication (CCR)** to a standby cluster in a second region for Critical-tier indices that back a live SLA — snapshot restore alone is not sufficient when the RTO requirement is under an hour.
- **RPO / RTO targets**:

| Tier | RPO | RTO |
|---|---|---|
| Standard | ≤4 hours (snapshot interval) | 1–2 hours (restore snapshot into new cluster) |
| Critical | ≤5 minutes (CCR follower lag, monitored) | 15 minutes (promote CCR follower cluster) |

- **DR drill cadence**: full snapshot-restore test quarterly for Standard tier; full CCR failover drill twice a year for Critical tier, including validating that index templates, ILM policies, and security roles restore correctly — a snapshot that restores documents but not the mappings/templates around them is an incomplete recovery.
- **Index-level point-in-time recovery is not native to Elasticsearch** — teams needing recovery to an arbitrary point between snapshots must pair the search index with a replayable source (e.g., the Kafka topic or database that originally fed it) and treat the index itself as a rebuildable projection for Critical use cases wherever possible.

## Platform-Level Metrics (What the Platform Team Watches)

| Metric | Why it matters | Alert threshold |
|---|---|---|
| Cluster status (green/yellow/red) | The single top-line health signal | Any red; sustained yellow beyond a few minutes |
| Unassigned shards | Direct precursor to reduced availability or data loss risk | >0 sustained |
| JVM heap usage (per node) | Elasticsearch performance falls off a cliff well before OOM due to GC pressure | >75% sustained |
| Old-generation GC pause time/frequency | Long GC pauses stall the node entirely, appearing as request timeouts | p99 pause >1s |
| Disk usage vs. watermark thresholds | Precursor to forced shard relocation or write-blocking | >85% (low watermark) |
| Search/index thread pool rejections | Backpressure exhausted — client requests are being outright rejected, not just slowed | Any sustained rejection rate |
| Indexing latency (p99) | Detects mapping/merge pressure before it becomes query-facing | Threshold per tier SLA |
| Query latency (p95/p99) | Direct user-facing performance signal | Threshold per tier SLA |
| Pending cluster-state tasks | Backlog of cluster-state changes (mapping updates, shard allocation) indicates master overload | Sustained queue growth |

## Application-Facing Metrics (What Consuming Teams Must Instrument)

| Metric | Why it matters | Target |
|---|---|---|
| Query latency as observed by the client (p50/p95/p99) | Captures network + client-side serialization overhead the cluster-side metrics miss | Documented per use case |
| Search error rate (4xx/5xx from the search API) | Distinguishes "no results" from "search is broken" — teams routinely conflate the two in dashboards | <0.1% |
| Indexing throughput vs. backlog | For near-real-time search use cases, a growing backlog means users are seeing stale results | Backlog bounded to documented staleness SLA |
| Time-to-searchable (index refresh lag) | The gap between "document written" and "document appears in search results" — often the actual user-facing SLA, not raw indexing latency | Documented per index refresh interval |
| Query result relevance/zero-result rate | Not an availability metric, but a silent-failure signal — a broken analyzer or mapping change can make search "up" but useless | Tracked as a product-quality metric, reviewed alongside availability |

## Key Decisions

- **Dedicated master nodes are mandatory above Dev tier, not a cost-optimization opt-out.** The failure mode of co-locating masters with data nodes — cluster-state operations starved during a load spike — is exactly the kind of cascading failure this platform exists to prevent.
- **Hot-warm tiering is a Critical-tier requirement, not a nice-to-have**, because undersized hot-tier capacity is the most common root cause of query-latency incidents traced back to this platform.
- **Search indices are treated as rebuildable projections wherever the source data supports it.** Point-in-time recovery gaps are real; the mitigation is architectural (keep the source of truth replayable), not a promise that snapshots alone will save you.
- **Watermark thresholds are platform-enforced defaults**, not per-team tunables, because the consequence of misconfiguring them (a full disk taking a node fully offline) is disproportionate to the convenience of customizing them.

## Tech Stack / Reference Implementation

- **Engine** — Elasticsearch or OpenSearch, version-pinned per platform release cadence
- **Snapshot repository** — cross-region S3/GCS-compatible object storage via the snapshot/restore API
- **Cross-region DR** — Cross-Cluster Replication (CCR) for Critical-tier indices
- **Lifecycle management** — Index Lifecycle Management (ILM) for hot-warm-cold tiering and retention
- **Observability** — Elasticsearch/OpenSearch exporter → Prometheus → Grafana, plus client-side OpenTelemetry instrumentation

---

*Part of the Data Services PaaS requirements series — see the [operation-compatibility and shard-sizing deep dive](/articles/2026-paas-elasticsearch-operation-compatibility-and-scaling/) for this service, the [requirements framework](/articles/2026-paas-requirements-framework/) this spec applies, plus [Redis](/articles/2026-paas-redis-requirements/), [Kafka](/articles/2026-paas-kafka-requirements/), [gRPC/Protobuf Messaging](/articles/2026-paas-grpc-protobuf-requirements/), and [MySQL](/articles/2026-paas-mysql-requirements/).*
