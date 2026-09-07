---
layout: article
title: Elasticsearch Deep Dive — Operation Compatibility for Migration, and Scaling Clusters Instead of Oversized Nodes
permalink: /articles/2026-paas-elasticsearch-operation-compatibility-and-scaling/
year: 2026
feature_area: Data Services PaaS · Elasticsearch Deep Dive
summary: An operation-by-operation migration-compatibility map for Elasticsearch — from single-document GETs to compacted-state-breaking mapping explosions — plus a shard-sizing method for scaling out instead of provisioning ever-larger single nodes with oversized JVM heaps.
---

# Elasticsearch Deep Dive — Operation Compatibility and Cluster Sizing

*Platform area: Data Services PaaS · Elasticsearch Deep Dive · Status: reference methodology*

This is the Elasticsearch-specific worked example of the [workload-profiling and migration-path playbook](/articles/2026-paas-workload-profiling-migration-playbook/), applying the same tiering method used for [Redis's command surface](/articles/2026-paas-redis-command-compatibility-and-scaling/) to Elasticsearch's operation surface.

## Part 1 — Operation Surface: What Migrates Cleanly, and What Doesn't

### Tier 1 — Trivial: single-document operations

`GET /index/_doc/id`, single-document index/update/delete

No compatibility concerns. Any migration model works — snapshot/restore, cross-cluster replication (CCR), or `_reindex` all handle this cleanly. The one thing to verify: the index's **mappings, analyzers, and settings** move with the data, not just the documents. Migrating documents while leaving behind a custom analyzer or synonym file is the most common way a "successful" migration quietly breaks search relevance without breaking availability.

### Tier 2 — Query DSL on a single index

`match`, `term`, `bool` queries against one index

Cluster-portable as long as Tier 1's mapping/analyzer dependency is satisfied. Migrate index templates and settings as a unit with the index itself, and re-verify query relevance post-migration, not just query success — a query that returns `200 OK` with different-scored or fewer results is a silent regression, not a clean migration.

### Tier 3 — Bulk operations and Scroll/Point-in-Time exports

`_bulk`, `_search?scroll`, Point-in-Time (PIT) API

Scroll and PIT contexts are tied to the cluster that opened them and do not survive a cutover — any in-flight scroll must complete (or be explicitly reissued against the new cluster) rather than assumed to resume transparently. For large `_bulk` migrations, throttle write rate against the target cluster's indexing capacity; a bulk migration run at full speed against a freshly stood-up cluster is a common self-inflicted saturation event.

### Tier 4 — Cross-index operations

Aliases, multi-index search over index patterns/wildcards, `_reindex` with a remote source

`_reindex` from a remote cluster is the built-in migration primitive for version gaps too large for a direct snapshot restore or CCR (e.g., a multi-major-version jump). It's synchronous and resumable but not instantaneous — size the migration window to the actual reindex throughput measured against the source cluster, not to the target's capacity alone, since the read load lands on the *source*.

### Tier 5 — Expensive aggregations

High-cardinality `terms` aggregations, `cardinality`, percentile and scripted aggregations

These are frequently the actual driver of node CPU and heap pressure, not raw indexing — profile them separately from indexing throughput. A workload profile that only measures indexing rate will systematically under-provision a cluster whose real cost center is query-time aggregation.

### Tier 6 — Administrative and dangerous

`_flush`, `_forcemerge` on live indices, settings changes requiring close/reopen, cluster reroute commands, unconstrained dynamic mapping (mapping explosion from unbounded field counts)

Govern these the same way as Redis's Tier 6 — gate or block on the platform, independent of migration timing. Mapping explosion in particular deserves a standing field-count limit per index; it degrades cluster-state size and master-node performance long before anyone notices via search latency.

### Turning the Operation Mix Into a Migration Verdict

| Operation mix found | Migration readiness | Required action |
|---|---|---|
| Tier 1–2 only | Ready as-is | Snapshot/restore or CCR, migrating mappings/analyzers with the data |
| Tier 3 present at scale | Ready with throttling | Rate-limit bulk/reindex writes against the target's measured capacity; reissue scrolls post-cutover |
| Tier 4 present (large version gap) | Ready via `_reindex`-from-remote | Size the migration window to source-side read throughput, not target capacity |
| Tier 5 present | Needs separate capacity profiling | Profile aggregation cost independently of indexing rate before sizing the target |
| Tier 6 present | Governance issue, not a migration one | Field-count limits and command gating, tracked independently of migration timeline |

## Part 2 — Scale Out With Right-Sized Shards, Not a Bigger Node

### The JVM heap ceiling makes "just add RAM" a dead end

Elasticsearch's JVM heap should stay under roughly 30–32GB regardless of how much RAM the node has, because of the compressed-ordinary-object-pointers (compressed oops) boundary in the JVM — cross it and per-object memory overhead jumps, giving *less* usable heap on a bigger allocation, not more. And heap should never exceed about half the node's RAM, since the other half is what the OS page cache uses to keep segment files fast to read. The practical result: past a certain node size, more RAM stops translating into more effective capacity at all. Horizontal scale-out, not a bigger single node, is the only lever left once you hit that ceiling.

### Size to the shard, not the node

- **Target shard size**: roughly 10–50GB per shard as a starting range — small enough that a shard relocates quickly during rebalancing or recovery, large enough that per-shard overhead (open file handles, translog, cluster-state entries) doesn't dominate.
- **Two failure modes, not one**: too few, oversized shards concentrate all indexing/query traffic for an index onto a small number of nodes (a hot-spotting pattern); too many, tiny shards multiply cluster-state size and per-shard overhead, degrading the master node's ability to manage the cluster at all. Neither extreme is "safe by default" — both need active sizing.

```
shard_count = max(
  ceil(total_index_size / shard_size_ceiling),
  ceil(peak_query_or_index_rate / per_shard_throughput_ceiling)
)
```

### Use rollover, not one ever-growing index

For time-series or continuously-growing data, use Index Lifecycle Management (ILM) with a rollover alias to create a new index (and new shards) once the current one crosses a size or age threshold, rather than letting one index and its shard count grow without bound. This turns "the index got too big" into a scheduled, automatic event instead of an emergency resharding project.

### Tier storage instead of uniformly provisioning for the hottest data

Hot-warm-cold architecture puts recent, high-query-volume indices on fast local storage and ages older indices onto cheaper, denser storage automatically via ILM — so the whole cluster isn't provisioned as if every index were still hot. This is a capacity lever as much as a cost one: undersized hot-tier capacity relative to actual query concentration is one of the most common root causes of search-latency incidents.

### Growth response, in order

1. **Audit mapping and field-count bloat** — is cluster-state size growing from unused or accidental fields rather than genuine data growth?
2. **Audit refresh interval** — an overly aggressive refresh interval (near-real-time search set too aggressively for a workload that doesn't need it) multiplies segment-merge overhead without a proportional benefit.
3. **Roll over and add shards** — via ILM, not a manual one-off resize.
4. **Add nodes** — only once shard count and tiering are already right-sized; adding nodes to compensate for a single oversized, under-sharded index just moves the hot spot, it doesn't fix it.

### Enforce sizing as policy

Cap maximum heap size and maximum shard size as provisioning constraints on the platform, and require dedicated (non-data) master-eligible nodes above Dev tier. This forces the "many right-sized shards on right-sized nodes" pattern by default, rather than depending on every team to rediscover the compressed-oops ceiling the hard way.

---

*Part of the Data Services PaaS requirements series — see the [requirements framework](/articles/2026-paas-requirements-framework/), the [workload-profiling and migration-path playbook](/articles/2026-paas-workload-profiling-migration-playbook/), the base [Elasticsearch requirements spec](/articles/2026-paas-elasticsearch-requirements/), and the companion deep dives for [Redis](/articles/2026-paas-redis-command-compatibility-and-scaling/), [Kafka](/articles/2026-paas-kafka-api-compatibility-and-scaling/), [MySQL](/articles/2026-paas-mysql-query-compatibility-and-scaling/), and [gRPC/Protobuf Messaging](/articles/2026-paas-grpc-protobuf-rpc-compatibility-and-scaling/).*
