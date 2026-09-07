---
layout: article
title: MySQL Deep Dive — Query Compatibility for Migration, and Scaling Beyond a Single Primary
permalink: /articles/2026-paas-mysql-query-compatibility-and-scaling/
year: 2026
feature_area: Data Services PaaS · MySQL Deep Dive
summary: A query-by-query migration-compatibility map for MySQL — from single-row CRUD to isolation-level-breaking multi-table transactions — plus a scaling ladder for growing beyond a single writable primary instead of endlessly resizing it.
---

# MySQL Deep Dive — Query Compatibility and Scaling Beyond a Single Primary

*Platform area: Data Services PaaS · MySQL Deep Dive · Status: reference methodology*

This is the MySQL-specific worked example of the [workload-profiling and migration-path playbook](/articles/2026-paas-workload-profiling-migration-playbook/), applying the same tiering method used for [Redis](/articles/2026-paas-redis-command-compatibility-and-scaling/) and [Elasticsearch](/articles/2026-paas-elasticsearch-operation-compatibility-and-scaling/) to MySQL's query surface.

## Part 1 — Query Surface: What Migrates Cleanly, and What Doesn't

### Tier 1 — Trivial: single-row CRUD by primary key

`SELECT`/`INSERT`/`UPDATE`/`DELETE` by primary key

No compatibility concerns across any replication topology. Native async or semi-sync replication handles cutover cleanly — this tier is why "just add a replica and promote it" works for most straightforward migrations.

### Tier 2 — Single-table filtered/ranged queries

`SELECT` with `WHERE`/`ORDER BY` using a secondary index

Generally fine, but the query *plan* may not carry over identically across a version jump (5.7 → 8.0) or an engine-flavor change (stock MySQL → Aurora MySQL) — the optimizer's cost model differs. Re-run `EXPLAIN` on the target before and after cutover for the workload's top queries; a query that used an index on the source and switches to a full scan on the target is a silent latency regression, not a migration failure you'd otherwise notice.

### Tier 3 — Multi-table joins and multi-statement transactions

Multi-table `JOIN`, `BEGIN`/`COMMIT` transactions spanning multiple statements

The compatibility risk here isn't syntax — it's **isolation-level and locking behavior**. A transaction that behaved correctly under the source's default isolation level (commonly `REPEATABLE READ` with gap locking in InnoDB) can deadlock differently, or acquire different lock ranges, on a target with a different default or a different storage-engine tuning. Validate isolation-level parity explicitly, and confirm no in-flight transaction is expected to span the actual cutover window.

### Tier 4 — Stored procedures, triggers, views, generated columns

Server-side logic tied to `DEFINER` semantics and privilege requirements

This is MySQL's version of Redis's Lua-script wall: some managed/cloud MySQL flavors restrict or disallow features that require `SUPER` privilege, restrict certain `DEFINER` semantics, or handle triggers differently. Every stored procedure, trigger, and view has to be audited against the *target's* specific compatibility matrix before migration — this cannot be inferred from traffic capture alone, because the incompatibility is in the DDL, not the query traffic.

### Tier 5 — Long-running batch queries and schema changes

Full-table scans, reporting queries, and — the highest-risk item in this tier — unindexed `ALTER TABLE` on a large table

A raw `ALTER TABLE` on a multi-million-row table can lock or badly degrade a primary for an extended window. Both pre- and post-migration, schema changes on tables above a defined size threshold should go through online schema-change tooling (`gh-ost`, `pt-online-schema-change`) rather than a direct DDL statement — this is a standing platform requirement, not just a migration-day concern.

### Tier 6 — Administrative and dangerous

`FLUSH TABLES WITH READ LOCK`, `SET GLOBAL`, direct replication-topology commands, filesystem-level access

Governance-gated, not tenant-self-service — same posture as Redis's and Elasticsearch's Tier 6.

### Turning the Query Mix Into a Migration Verdict

| Query mix found | Migration readiness | Required action |
|---|---|---|
| Tier 1–2 only | Ready as-is | Native replica-promote cutover; re-run `EXPLAIN` on top queries against the target |
| Tier 3 present | Ready with isolation-level validation | Confirm isolation-level and locking parity before cutover; no transaction may span the cutover window |
| Tier 4 present | Blocked until audited | Line-by-line compatibility check of every stored procedure/trigger/view against the target flavor |
| Tier 5 present (large-table DDL) | Ready with tooling | Route through online schema-change tooling; never a raw `ALTER TABLE` on a large table |
| Tier 6 present | Governance issue, not a migration one | Access restricted independent of migration timeline |

## Part 2 — Scale Beyond a Single Writable Primary

### The single-writer ceiling is real, even though MySQL is multi-threaded

Unlike Redis, MySQL genuinely uses multiple threads — but every write still serializes through one logical write path per primary (the InnoDB redo log and binlog). Past a certain point, giving the primary more CPU and RAM stops translating into more write throughput, because the bottleneck has shifted to log-flush and commit serialization, not available compute. Read capacity scales further with vertical growth than write capacity does — which is exactly why the two need separate scaling strategies.

### Scale reads first — it's the cheapest lever

Add read replicas behind a proxy (ProxySQL, MySQL Router) with read/write splitting enforced at the proxy layer, not left to application code. For a read-heavy workload, this alone removes most of the pressure driving a "we need a bigger primary" request — check this lever before reaching for anything structural.

### Scale writes with functional partitioning before horizontal sharding

When write volume is the actual bottleneck (not read volume masquerading as one), the next lever is **functional partitioning** — splitting unrelated tables or business domains onto separate primary instances — before reaching for full horizontal sharding. It's a smaller architectural change, and it's often enough on its own.

### Horizontal sharding is the last lever, and it has a real compatibility cost

Sharding by key (application-level, or via a sharding layer like Vitess) is what you reach for once write volume genuinely exceeds a single primary's ceiling even after read-offload and functional partitioning. It requires choosing a shard key up front (commonly a tenant or customer ID), and it carries the same structural cost as Redis's cross-slot restriction: **Tier 3 multi-table joins and transactions across shard boundaries stop working transparently.** Any workload with cross-shard-key joins needs those queries redesigned — denormalized, pre-joined, or resolved at the application layer — before sharding, not discovered as a production incident after.

### Growth response, in order

1. **Audit query efficiency** — missing indexes and N+1 query patterns are the most common root cause mistaken for "we've outgrown this instance."
2. **Audit connection pool sizing** — connection exhaustion looks like a capacity problem and is usually a configuration one.
3. **Add read replicas** — for read-heavy pressure.
4. **Functional partitioning** — split unrelated domains onto separate primaries.
5. **Horizontal sharding** — only once the above are exhausted and write volume is the confirmed bottleneck.

### Enforce sizing as policy

Cap the maximum primary instance size the platform will provision, so the escalation ladder above is the actual path teams take under growth pressure, rather than an unbounded, ever-larger single primary that eventually hits the write-serialization ceiling anyway — just later, and with a much larger blast radius when it does.

---

*Part of the Data Services PaaS requirements series — see the [requirements framework](/articles/2026-paas-requirements-framework/), the [workload-profiling and migration-path playbook](/articles/2026-paas-workload-profiling-migration-playbook/), the base [MySQL requirements spec](/articles/2026-paas-mysql-requirements/), and the companion deep dives for [Redis](/articles/2026-paas-redis-command-compatibility-and-scaling/), [Elasticsearch](/articles/2026-paas-elasticsearch-operation-compatibility-and-scaling/), [Kafka](/articles/2026-paas-kafka-api-compatibility-and-scaling/), and [gRPC/Protobuf Messaging](/articles/2026-paas-grpc-protobuf-rpc-compatibility-and-scaling/).*
