---
layout: article
title: Kafka Deep Dive — API Compatibility for Migration, and Scaling Beyond a Single Broker's Ceiling
permalink: /articles/2026-paas-kafka-api-compatibility-and-scaling/
year: 2026
feature_area: Data Services PaaS · Kafka Deep Dive
summary: An API-by-API migration-compatibility map for Kafka — from simple produce/consume to transactional-producer and compacted-topic state that doesn't transparently follow a cluster migration — plus a partition-and-broker sizing method that scales throughput without over- or under-partitioning.
---

# Kafka Deep Dive — API Compatibility and Broker Sizing

*Platform area: Data Services PaaS · Kafka Deep Dive · Status: reference methodology*

This is the Kafka-specific worked example of the [workload-profiling and migration-path playbook](/articles/2026-paas-workload-profiling-migration-playbook/), applying the same tiering method used elsewhere in this series to Kafka's produce/consume/admin API surface.

## Part 1 — API Surface: What Migrates Cleanly, and What Doesn't

### Tier 1 — Trivial: simple produce/consume

Single-partition-keyed produce, non-transactional consume, no compaction dependency

Migrates cleanly via MirrorMaker2 replication to a new cluster, with consumers resetting to a documented offset policy (earliest, latest, or a specific translated offset) on cutover. This tier is the reason a straightforward Kafka migration can be close to a non-event operationally.

### Tier 2 — Consumer groups with committed offsets

Any consumer using `commitSync`/`commitAsync` with a persisted group offset

Offsets have to be **translated**, not just messages replicated — MirrorMaker2 does this, but it must be explicitly validated per consumer group before cutover, not assumed correct by default. A consumer group that resumes from the wrong translated offset either reprocesses a large backlog or silently skips messages, and both look identical to "the migration succeeded" from a pure availability check.

### Tier 3 — Transactional and idempotent producers

Producers using `transactional.id`, exactly-once semantics

This is Kafka's version of Redis's cross-slot wall: transactional state (producer ID, epoch, in-flight transaction state) does not transparently follow a cluster migration. Migrating a transactional producer means either preserving that state through a coordinated cutover procedure, or accepting a controlled fence-and-restart of the transactional producer against the new cluster — a real operational step that has to be planned per producer, not discovered mid-migration.

### Tier 4 — Compacted topics

Topics relying on log compaction as a changelog or source-of-truth (e.g., feeding a KTable or a materialized view)

A compacted topic's correctness depends on the *full compacted state* having propagated, not just recent messages — naive MirrorMaker2 replication can diverge from the source's compaction behavior if compaction settings or timing don't match between clusters. Before cutting over a compacted topic, explicitly validate that tombstones and the full compacted key-set match between source and target, not just that recent throughput looks healthy.

### Tier 5 — Kafka Streams and ksqlDB stateful applications

Stream-processing apps with local state stores (typically RocksDB-backed) keyed to specific input-topic partitions

Migrating the underlying topics means the stream application's state has to be **rebuilt via changelog replay** against the new topic — simply repointing the app at a new bootstrap-server address does not carry the state store over. This is a real operational migration step with its own runbook, not a configuration change.

### Tier 6 — Administrative operations

Topic deletion, ACL changes, partition reassignment, broker configuration changes

Governance-gated to platform operators, same posture as every other service's Tier 6 in this series.

### Turning the API Mix Into a Migration Verdict

| API usage found | Migration readiness | Required action |
|---|---|---|
| Tier 1 only | Ready as-is | MirrorMaker2 + documented offset-reset policy |
| Tier 2 present | Ready with offset validation | Explicitly verify offset translation per consumer group before cutover |
| Tier 3 present | Blocked until planned | Coordinated transactional-state migration or a planned fence-and-restart per producer |
| Tier 4 present | Blocked until validated | Confirm full compacted state (not just recent messages) matches source and target |
| Tier 5 present | Ready with a runbook | Changelog replay to rebuild state stores against the new topic |
| Tier 6 present | Governance issue, not a migration one | Access restricted independent of migration timeline |

## Part 2 — Scale Partitions and Brokers to the Actual Ceiling, Not a Guess

### The ceiling is disk and network, not CPU

Unlike Redis's single-thread CPU ceiling, a single Kafka broker's throughput is bound primarily by **disk I/O** (sequential write/read to the log) and **network bandwidth**, with page-cache efficiency as a secondary factor. The same underlying lesson still applies, though: an oversized broker doesn't scale linearly with core count, and it concentrates risk — losing one large broker moves far more data during re-replication and recovery than losing one of many smaller, evenly-loaded brokers.

### Size partitions and brokers from two independent ceilings

```
partition_count = max(
  ceil(peak_throughput / per_partition_throughput_ceiling),
  downstream_consumer_parallelism_needed
)
```

Measure `per_partition_throughput_ceiling` against the platform's actual message size and compression settings — it varies enough between workloads that a generic industry number is a starting point, not a substitute for measurement. The second input matters independently: a topic sized purely for throughput can still under-serve a consumer group that needs more parallelism than the partition count provides, since consumer parallelism within a group is capped at the partition count.

### Over-partitioning has a real cost too

Every partition carries overhead — open file handles, replication traffic, controller metadata — and as partition count per broker grows into the thousands, **controller failover time itself degrades**, directly hurting availability. This is the flip side of "more partitions is always better": partition count needs to be sized deliberately against both the throughput/parallelism requirement above and a broker-level partition ceiling, not maximized on the assumption that more is always safer.

### Adding partitions to an existing topic is not free

Adding partitions changes the key-to-partition mapping for keyed messages — existing keys can land on a different partition than they did before, breaking any ordering guarantee consumers were relying on for that key. This has to be a planned change communicated to consuming teams, not a reactive response to a lagging consumer group.

### Tiered storage instead of buying ever-larger broker disks

Offloading older log segments to object storage (tiered storage) lets broker-local disk be sized for **active throughput**, not total historical retention — so retention requirements and broker sizing stop being the same constraint. This is directly analogous to Elasticsearch's hot-warm tiering: don't provision every broker as if all of its data were still hot.

### Growth response, in order

1. **Root-cause the actual lag** — is a consumer group falling behind because it's genuinely under-partitioned, or because the consumer itself is slow (inefficient processing, blocking I/O per message)? Adding partitions doesn't fix a slow consumer.
2. **Audit batching and compression settings** — often the actual fix, and cheaper than any infrastructure change.
3. **Add partitions** — planned, with consuming teams notified about the ordering-guarantee change for existing keys.
4. **Add brokers** — once partition count and per-broker load are already right-sized; adding brokers to compensate for a badly-partitioned topic just spreads the same imbalance across more machines.

### Enforce sizing as policy

Cap maximum broker disk size, require rack-awareness, and require even partition-leader distribution across brokers as provisioning constraints — so throughput and blast radius scale with broker *count*, not broker *size*, by default rather than by discipline.

---

*Part of the Data Services PaaS requirements series — see the [requirements framework](/articles/2026-paas-requirements-framework/), the [workload-profiling and migration-path playbook](/articles/2026-paas-workload-profiling-migration-playbook/), the base [Kafka requirements spec](/articles/2026-paas-kafka-requirements/), and the companion deep dives for [Redis](/articles/2026-paas-redis-command-compatibility-and-scaling/), [Elasticsearch](/articles/2026-paas-elasticsearch-operation-compatibility-and-scaling/), [MySQL](/articles/2026-paas-mysql-query-compatibility-and-scaling/), and [gRPC/Protobuf Messaging](/articles/2026-paas-grpc-protobuf-rpc-compatibility-and-scaling/).*
