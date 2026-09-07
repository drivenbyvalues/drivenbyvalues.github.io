---
layout: article
title: Redis Deep Dive — Command Compatibility for Migration, and Scaling Clusters Instead of Oversized Caches
permalink: /articles/2026-paas-redis-command-compatibility-and-scaling/
year: 2026
feature_area: Data Services PaaS · Redis Deep Dive
summary: A command-by-command migration-compatibility map for Redis — from trivial GET/SET to cluster-breaking multi-key ops and Lua scripts — plus a sizing method for scaling out with right-sized shards instead of provisioning ever-larger single-instance caches.
---

# Redis Deep Dive — Command Compatibility and Cluster Sizing

*Platform area: Data Services PaaS · Redis Deep Dive · Status: reference methodology*

This is the Redis-specific worked example of the [workload-profiling and migration-path playbook](/articles/2026-paas-workload-profiling-migration-playbook/): once you've captured a team's command mix (Step 3 of that playbook), this is how to turn it into a migration-readiness verdict, and how to size the target cluster so scaling means *more right-sized shards*, not *one ever-larger box*.

## Part 1 — Command Surface: What Migrates Trivially, and What Doesn't

Not every Redis command carries the same migration risk. The right way to read a team's command mix is by tier — each tier has a different compatibility story under Redis Cluster and a different remediation requirement before migration.

### Tier 1 — Trivial: single-key, stateless

`GET`, `SET`, `SETEX`/`PSETEX`, `INCR`/`DECR`, `EXPIRE`/`TTL`, `DEL`, `EXISTS`, `TYPE`

No compatibility concerns under any topology, including Redis Cluster's hash-slot sharding. Any migration model works cleanly — native replication-based cutover is almost always the right default here because there's nothing for the team to remediate first.

### Tier 2 — Single-key, structure-bearing

`HSET`/`HGETALL` (hashes), `LPUSH`/`RPUSH`/`LRANGE` (lists), `SADD`/`SMEMBERS` (sets), `ZADD`/`ZRANGE` (sorted sets), `GETRANGE`/`SETRANGE`, `APPEND`, bitmap operations

Still single-key, so still cluster-compatible with no remediation. The one thing to check: if a team plans to run **dual-write** (writing to old and new simultaneously during a transition window) rather than native replication, list and sorted-set operations are order-sensitive — the platform needs to guarantee identical mutation ordering to both targets, or the two copies will silently diverge. This is a reason to prefer native replication over dual-write wherever the migration path allows it.

### Tier 3 — Multi-key operations (the first real compatibility wall)

`MGET`, `MSET`, `SUNION`/`SINTER`/`SDIFF` across multiple keys, `RENAME`, `SORT ... BY ... GET`, multi-key `MULTI`/`EXEC` transactions

Under Redis Cluster, a multi-key operation only succeeds if every key involved hashes to the **same slot**. A team using `MGET user:1001:profile user:1001:settings` will get a `CROSSSLOT` error the moment they move from a single-instance or Sentinel deployment to Cluster mode, unless those keys are re-modeled with a **hash tag** — `{user:1001}:profile`, `{user:1001}:settings` — so the hashing algorithm only considers the `{user:1001}` portion and co-locates both keys on the same shard.

This is not something a migration tool can do transparently. It requires the team to update their key-naming scheme *before* migration, which makes it a required remediation item surfaced by Step 7 (anti-pattern detection) of the profiling playbook — never something discovered mid-cutover.

### Tier 4 — Scripting and optimistic transactions

`EVAL`/`EVALSHA` (Lua scripts), `WATCH`/`MULTI`/`EXEC` optimistic transactions

Same cross-slot restriction as Tier 3, with an added wrinkle: Lua scripts must declare every key they touch via the `KEYS[]` array (not compute key names inside the script), and all declared keys must hash to the same slot. A script that was written for a single-instance deployment and computes key names dynamically inside the Lua body will pass code review and fail silently or loudly under Cluster mode. This tier requires a source-code-level audit, not just a traffic capture — the compatibility linter from the profiling playbook should specifically flag `EVAL`/`EVALSHA` usage for manual review rather than trying to auto-verify it.

### Tier 5 — Pub/Sub and Streams

`PUBLISH`/`SUBSCRIBE`, `SPUBLISH`/`SSUBSCRIBE` (sharded pub/sub, Redis 7+), `XADD`/`XREAD`/`XREADGROUP` (Streams with consumer groups)

Plain `PUBLISH` in Cluster mode broadcasts to every node in the cluster, not just the node holding a given key — a team assuming node-local pub/sub behavior needs to know this changes under Cluster mode, and may want to migrate to sharded pub/sub (`SPUBLISH`) instead, which routes to a single shard the way they likely expect. For Streams, the stream itself is a single key (cluster-compatible), but **consumer group state** — group name, last-delivered ID, pending-entries list — is stored with that key, so migrating a stream between clusters requires exporting and replaying consumer-group state (`XINFO GROUPS`, then recreating groups at the matching offset) rather than assuming replication alone preserves it if you're moving between clusters rather than promoting a replica in place.

### Tier 6 — Administrative and dangerous commands

`KEYS`, `FLUSHALL`, `FLUSHDB`, `CONFIG SET`, `CLIENT KILL`, `DEBUG`, `SHUTDOWN`

These aren't a migration-compatibility problem — they're a standing platform-governance problem that migration should be used as a forcing function to fix. Disable or rename them via `rename-command`, or block them via ACLs, for every tenant above Dev tier, independent of migration timing. Finding these in a workload profile is a Tier-6 flag regardless of what else the profile shows.

### Turning the Command Mix Into a Migration Verdict

| Command mix found | Migration readiness | Required action |
|---|---|---|
| Tier 1–2 only | Ready as-is | Native replication-based cutover, minimal review |
| Tier 3–4 present | Blocked until remediated | Hash-tag key remodeling (Tier 3) and/or Lua `KEYS[]` audit (Tier 4), then shadow-validate before cutover |
| Tier 5 present | Ready with a sign-off | Confirm pub/sub fan-out semantics with the team; write a consumer-group offset migration runbook for Streams |
| Tier 6 present | Governance issue, not a migration one | ACL/rename-command remediation, tracked independently of the migration timeline |

## Part 2 — Scale Out With Right-Sized Shards, Not a Bigger Cache

The instinct when a cache is running hot is to give it more memory and more CPU. For Redis, that instinct is usually wrong, because of one fact repeated from the [Redis requirements spec](/articles/2026-paas-redis-requirements/): **command execution is single-threaded**. A bigger box gives a single Redis process more RAM to hold data in, but not more throughput to serve it — and an oversized single instance also means a bigger blast radius per failure and a slower `BGSAVE` fork (copy-on-write overhead scales with dataset size).

### Size to the working set, not to "just in case"

Start from the workload profile: actual key count, average and p99 value size, and TTL distribution. Provision for the real working set plus a defined headroom margin (e.g., 20–30%) — not an arbitrary multiple "to be safe," which is exactly how a platform ends up with hugely over-provisioned single instances that still can't use most of their own CPU.

### Compute shard count from two ceilings, and take the larger

Define two per-shard ceilings independently, from real benchmarking against the platform's actual command mix (an `HGETALL` on a large hash costs very differently than a `GET`):

- **Memory ceiling per shard** — e.g., 25–50GB of effective data, leaving headroom for replication buffers and `BGSAVE` copy-on-write overhead.
- **Throughput ceiling per shard** — measured ops/sec at the point where p99 command latency starts to degrade, for this platform's actual command mix.

```
shard_count = max(
  ceil(total_dataset_size / per_shard_memory_ceiling),
  ceil(peak_qps / per_shard_throughput_ceiling)
)
```

Sizing off only one dimension is a common mistake — a memory-light, request-heavy workload (many small keys, very high QPS) needs shard count driven by the throughput ceiling, not the memory one, and vice versa for a memory-heavy, low-QPS workload.

### Prefer many smaller shards over few giant ones

Horizontal scale-out is the actual fix for the single-thread ceiling — more shards means more Redis processes, each with its own thread, actually using more of the host's (or fleet's) available cores. Smaller shards also fail smaller: losing one of sixteen shards degrades a slice of the keyspace, not the whole cache. And a smaller per-shard dataset means a faster, cheaper `BGSAVE` fork.

### Growth is a resharding trigger, not a resize trigger

When memory or CPU pressure rises, the default response should not be "give this instance more RAM." Work through, in order:

1. **Audit TTLs and eviction policy** — is stale data accumulating because keys were never given an expiry, rather than the platform genuinely needing more capacity?
2. **Audit value size** — is the team storing large blobs that belong in object storage, using Redis as a database instead of a cache? This is a data-modeling problem, not a capacity one.
3. **Reshard** — add shards (Redis Cluster supports live slot migration via `CLUSTER SETSLOT`/`MIGRATE`, with client libraries handling `MOVED`/`ASK` redirects) rather than resizing an existing shard upward. This is the mechanism that keeps the "many right-sized shards" pattern true as the platform grows, instead of quietly reverting to "a few big boxes" one resize at a time.

### Scale reads and writes independently

Add **read replicas** to absorb read QPS growth without touching shard count — valid only where the workload profile (Step 6 of the profiling playbook) shows the team tolerates the replica's staleness window. Only add **shards** when write throughput or memory is the actual bottleneck. Conflating the two is how platforms end up over-provisioning writes to solve what was really a read-scaling problem.

### Isolate by domain before you isolate by hash slot

For a platform serving many unrelated teams, consider separate Redis Clusters per major data domain or tenant group rather than one mega-cluster with thousands of hash slots serving everything. This caps blast radius per domain and prevents one team's traffic spike from degrading an unrelated team's shard neighbors — the multi-tenancy isolation requirement from the [requirements framework](/articles/2026-paas-requirements-framework/) applied concretely to Redis.

### Enforce sizing as policy, not as guidance

The most reliable way to keep "many right-sized shards" true over time is to make it a **provisioning constraint**, not a recommendation: cap the maximum memory size a single Redis node can be provisioned at on the platform. A team that needs more capacity than that ceiling is, by construction, routed into resharding rather than into requesting a bigger box — which is exactly the guardrail that prevents a single-threaded process from ever being handed a SKU it structurally cannot use.

---

*Part of the Data Services PaaS requirements series — see the [requirements framework](/articles/2026-paas-requirements-framework/), the [workload-profiling and migration-path playbook](/articles/2026-paas-workload-profiling-migration-playbook/) this deep dive applies, and the base [Redis requirements spec](/articles/2026-paas-redis-requirements/). The same command-tiering and right-sizing method is applied to the rest of the fleet in the companion deep dives for [Kafka](/articles/2026-paas-kafka-api-compatibility-and-scaling/), [Elasticsearch](/articles/2026-paas-elasticsearch-operation-compatibility-and-scaling/), [MySQL](/articles/2026-paas-mysql-query-compatibility-and-scaling/), and [gRPC/Protobuf Messaging](/articles/2026-paas-grpc-protobuf-rpc-compatibility-and-scaling/).*
