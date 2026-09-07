---
layout: article
title: Redis-as-a-Service — Platform Requirements for Availability, Disaster Recovery & Key Metrics
permalink: /articles/2026-paas-redis-requirements/
year: 2026
feature_area: Data Services PaaS · Redis Requirements
summary: The mandatory bar for onboarding a Redis offering onto a platform-as-a-service catalog — topology and tiering, availability and failover mechanics, backup/DR targets, and the metrics both the platform team and consuming applications must instrument.
---

# Redis-as-a-Service — Platform Requirements

*Platform area: Data Services PaaS · Redis · Status: reference specification*

## Why This Requirements Doc Exists

Redis gets adopted fast because it's simple to stand up and painfully easy to misuse: a single un-clustered instance with no persistence, treated as if it were a durable store. A platform team offering "Redis-as-a-Service" has to draw a hard line between *cache* usage (loss-tolerant, rebuildable from source of truth) and *primary-data* usage (durability-sensitive — session state, rate-limit counters, leader-election locks, job queues). Every requirement below is written against that split, because the availability and DR bar for the two cases is genuinely different, and treating them identically either over-engineers the cache tier or under-protects the primary-data tier.

## Service Tiers

| Tier | Topology | Intended use | Data-loss tolerance |
|---|---|---|---|
| **Dev/Sandbox** | Single node, no persistence | Local/integration testing | Full loss acceptable |
| **Standard (Cache)** | Sentinel, 1 primary + 2 replicas, 3 sentinels | Read-through/write-through cache, ephemeral session cache | Seconds of loss acceptable; rebuildable from source |
| **Critical (Durable)** | Redis Cluster, 3+ shards, replication factor 2 per shard, cross-AZ | Rate limiters, distributed locks, queues, feature-flag state | Loss must be bounded and recoverable via AOF/replica promotion |

## Availability Requirements

- **Sentinel quorum for Standard tier**: minimum 3 Sentinel processes across independent failure domains (AZs), `quorum` set to majority (2 of 3). A Sentinel deployment with fewer than 3 nodes is not eligible for production traffic — split-brain risk on any single-AZ event is unacceptable.
- **`min-replicas-to-write` / `min-replicas-max-lag`** must be set on every primary handling write traffic (recommended: `min-replicas-to-write 1`, `min-replicas-max-lag 10`) so a primary refuses writes rather than silently diverging when replication has stalled.
- **Cluster mode for Critical tier**: minimum 3 primary shards (16,384 hash slots divided across them) with 1 replica per shard, replicas placed in a different AZ than their primary. `cluster-require-full-coverage` set to `no` for partial availability during a single-shard outage, evaluated per use case.
- **Persistence configuration is an availability decision, not just a durability one**: AOF with `appendfsync everysec` is the default for any tier above Dev; RDB-only snapshotting is permitted only for pure-cache workloads where a cold restart is acceptable.
- **Availability targets**: Standard tier 99.9% (≈8.7h/year), Critical tier 99.95% (≈4.4h/year), measured at the connection layer (client can execute `PING` and get a response within the configured timeout).
- **Failover time budget**: Sentinel-driven failover must complete (new primary elected, clients redirected) within 30 seconds for Standard tier; Cluster-mode failover within 15 seconds for Critical tier, driven by `cluster-node-timeout`.

## Disaster Recovery Requirements

- **Backup cadence**: RDB snapshot every 15 minutes plus continuous AOF for Critical tier; snapshots shipped to cross-region object storage (S3/GCS-equivalent) with 7-day retention minimum, 35-day retention for compliance-tagged datasets.
- **Cross-region strategy**: Critical tier maintains a warm cross-region replica set (async replication) that can be promoted manually or via runbook within the RTO window below. Standard tier relies on snapshot restore into a freshly provisioned Sentinel group in the DR region — no standing cross-region replica required.
- **RPO / RTO targets**:

| Tier | RPO | RTO |
|---|---|---|
| Standard (Cache) | Best-effort (cache is rebuildable) | 30 minutes to reprovision + warm |
| Critical (Durable) | ≤60 seconds (AOF fsync interval + replication lag) | 15 minutes (promote cross-region replica) |

- **DR drill cadence**: full regional failover test at least twice a year for Critical-tier clusters, including validating that client SDKs correctly re-resolve the new primary endpoint. A DR plan that has never been drilled does not count as a DR plan.
- **Point-in-time recovery**: AOF must support replay-to-timestamp for Critical tier, so an operator can recover to "just before" a bad `FLUSHALL` or a bug that corrupted keys — not only to the last snapshot boundary.

## Platform-Level Metrics (What the Platform Team Watches)

| Metric | Why it matters | Alert threshold |
|---|---|---|
| `master_repl_offset` delta (primary vs. each replica) | Replication lag — direct input to RPO | >5s sustained |
| `evicted_keys` rate | Memory pressure forcing unplanned data loss on a cache tier that shouldn't be evicting | Any sustained rate on Critical tier; rate-of-change spike on Standard |
| `used_memory` / `maxmemory` ratio | Capacity headroom before eviction or OOM | >80% sustained |
| `rejected_connections` | Connection-limit exhaustion, often the first sign of a client-side connection leak | >0 sustained |
| `mem_fragmentation_ratio` | Memory fragmentation degrading effective capacity | >1.5 |
| Latency spikes (`redis-cli --latency-history`, or `INFO latencystats`) | Blocking operations (e.g. large `KEYS`, slow `LREM`) stalling the event loop | p99 >5ms for simple ops |
| `rdb_bgsave_in_progress` / fork duration | Long `BGSAVE` forks pausing writes on large-keyspace instances | Fork >200ms |
| Sentinel/Cluster failover event count | Unplanned failovers indicate instability, not just successful HA | Any event outside a planned maintenance window |
| Cluster slot coverage (`CLUSTER INFO` → `cluster_slots_assigned`) | Detects partial cluster degradation before it becomes a hard outage | <16384 assigned |

## Application-Facing Metrics (What Consuming Teams Must Instrument)

| Metric | Why it matters | Target |
|---|---|---|
| Cache hit ratio | Below-threshold hit ratio means the cache isn't earning its cost/risk and is pushing load to the backing store | ≥90% for read-heavy caches (workload-dependent) |
| Client-side command latency (p50/p95/p99) | Detects network or Redis-side degradation before it becomes user-visible | p99 <10ms in-region |
| Connection pool saturation | Exhausted pools cause silent request queuing or timeouts, often before Redis itself shows any stress | <80% pool utilization sustained |
| Command timeout / error rate | Distinguishes "Redis is slow" from "Redis is down" from the app's point of view | <0.1% of commands |
| Fallback-path invocation rate | For cache-aside patterns, how often the app falls through to the source of truth on a miss/error — a proxy for cache effectiveness and blast radius if Redis degrades | Tracked per endpoint; spikes correlate with incidents |
| Stale-read tolerance window (for read-replica reads) | Apps reading from replicas must know their own staleness budget, not assume linearizability | Documented per consumer, validated against measured replication lag |

## Key Decisions

- **Sentinel for Standard, Cluster for Critical** — not Cluster everywhere. Cluster mode adds real operational and client-library complexity (multi-key operation restrictions, slot migration) that isn't worth paying for on workloads that are genuinely just a cache.
- **Persistence is opt-out, not opt-in, above Dev tier.** Defaulting to AOF-on prevents the common failure mode where a "temporary" cache instance quietly becomes load-bearing and only then does anyone notice it has no durability story.
- **RPO for Critical tier is bounded by AOF fsync interval, not by wishful thinking.** `appendfsync always` gives near-zero RPO at a real throughput cost; `everysec` is the default trade-off and must be documented as such to consuming teams.
- **Fallback-path metrics belong to the application team, not the platform team** — the platform can tell you Redis is healthy; only the app can tell you whether its own cache-miss handling is healthy.

## Tech Stack / Reference Implementation

- **Engine** — Redis 7.x (OSS) or Redis Enterprise/Valkey depending on licensing posture
- **HA** — Sentinel (Standard tier), Redis Cluster (Critical tier)
- **Persistence** — AOF (`everysec`) + RDB snapshots
- **Backup transport** — snapshot shipping to cross-region object storage
- **Observability** — `redis_exporter` → Prometheus → Grafana, plus client-side SDK instrumentation (OpenTelemetry)

---

*Part of the Data Services PaaS requirements series — see the [command-compatibility and cluster-sizing deep dive](/articles/2026-paas-redis-command-compatibility-and-scaling/) for this service, the [requirements framework](/articles/2026-paas-requirements-framework/) this spec applies, plus [Kafka](/articles/2026-paas-kafka-requirements/), [Elasticsearch](/articles/2026-paas-elasticsearch-requirements/), [gRPC/Protobuf Messaging](/articles/2026-paas-grpc-protobuf-requirements/), and [MySQL](/articles/2026-paas-mysql-requirements/).*
