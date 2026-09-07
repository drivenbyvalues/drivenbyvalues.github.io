---
layout: article
title: Profiling a Team's Query Pattern and Choosing a Migration Path — A Step-by-Step Playbook
permalink: /articles/2026-paas-workload-profiling-migration-playbook/
year: 2026
feature_area: Data Services PaaS · Migration Playbook
summary: You can't safely migrate what you haven't profiled. A ten-step method for documenting how a team actually uses a data service, a reusable workload-profile template, and a menu of migration assistance models — from fully self-service to white-glove — matched to what that profile reveals.
---

# Profiling a Team's Query Pattern and Choosing a Migration Path

*Platform area: Data Services PaaS · Migration Playbook · Status: reference methodology*

## Why Profiling Comes Before Migrating

The [requirements framework](/articles/2026-paas-requirements-framework/) in this series treats "migration path" as its own set of requirements, not an afterthought. This piece is the missing middle step: before you can write a meaningful cutover plan for a given team, you need a documented, ground-truthed picture of how that team actually uses the service today. Skipping straight to "pick a migration strategy" is how migrations turn into incidents — the team that "just uses Redis as a cache" turns out to run a nightly batch job that does unbounded `SCAN` loops, and nobody finds out until the new cluster falls over on day one.

Two things go wrong when this step is skipped: the platform team either overbuilds a white-glove migration for a workload simple enough to self-serve, or underbuilds a self-service path for a workload with hidden complexity — hot keys, multi-key transactions, ordering guarantees — that only shows up under real production load.

## Part 1 — Step-by-Step: Documenting a Team's Query Pattern

### Step 1: Inventory the access surface

Enumerate every client, service account, and connection source touching the instance — not just the "owning" team's primary application. Shared credentials, forgotten cron jobs, and a second team that quietly started using the same cluster are the most common blind spots here. You cannot profile traffic you don't know exists.

### Step 2: Capture traffic passively, not exhaustively

Sample, don't firehose. A full command trace (e.g., an unthrottled `MONITOR` on Redis) can itself degrade the production instance you're trying to protect. Use built-in low-overhead sampling instead: slow-query logs, `performance_schema` digests (MySQL), consumer-group/topic describe output (Kafka), search slow logs (Elasticsearch), or a sampled percentage of traffic via a sidecar/proxy tap.

### Step 3: Classify by operation type and cost

Group observed operations by command/query shape and compute frequency and payload-size distribution for each. For key-value and search workloads: which commands dominate, and are any of them known-expensive patterns (unscoped scans, large aggregations, full-table operations)? For SQL: query digest grouped by shape, read/write ratio, and typical row counts touched per statement.

### Step 4: Identify hot keys, hot partitions, and skew

Uniform-looking average load can hide a single key, shard, or partition carrying a disproportionate share of traffic. This is the single most common reason a "correctly sized" migration target still falls over — the new topology was sized for the average, not the skew. Profile this explicitly; don't infer it from aggregate QPS.

### Step 5: Measure temporal patterns, not just averages

Pull QPS over a full business cycle (at minimum one to two weeks, longer if there's a monthly or quarterly batch job in the mix) to capture seasonality, daily peak-to-average ratio, and burst sources — a nightly ETL job, an end-of-quarter reporting run, or automated/agent-driven traffic with its own independent rhythm. Capacity sizing driven by averages alone under-provisions for exactly the moments that matter.

### Step 6: Map consistency and latency expectations

This is invisible in raw traffic stats and has to be asked directly: does the team assume linearizable reads? Strict ordering (Kafka partition-level guarantees)? Multi-key transactional atomicity? A tolerance for eventual consistency on reads from a replica? These assumptions determine which target topologies are even viable candidates — they aren't a detail to fill in after the topology is chosen.

### Step 7: Flag platform-incompatible anti-patterns

Look specifically for patterns that break on common target topologies: unscoped `KEYS`/`FLUSHALL`, multi-key operations that assume co-location (breaks under hash-slot sharding unless hash-tagged), long-lived idle connections at a scale that will exhaust a smaller connection pool, client libraries with no cluster-awareness or retry support, and unbounded scan loops with no pagination discipline. Each one found here becomes a remediation item the team needs to close *before* migration, not a surprise discovered during cutover.

### Step 8: Map the downstream dependency chain

Document what breaks, and how visibly, if this instance degrades or becomes unavailable. This is the direct input to tiering from the requirements framework — blast radius, not traffic volume, is what should decide whether a workload is Standard or Critical.

### Step 9: Produce a standard Workload Profile per team

Consolidate Steps 1–8 into one document per team, in a fixed format so profiles are comparable across the whole fleet:

| Field | Captured value |
|---|---|
| Team / service | |
| Proposed tier (Standard / Critical) | |
| Access surface (clients, service accounts) | |
| Dominant operations (top 5 by frequency) | |
| Read : write ratio | |
| Peak QPS / average QPS (peak-to-average ratio) | |
| Key/partition/shard skew | ("even" or "hot: \<description\>") |
| Consistency & ordering requirements | |
| Anti-patterns found | (list, each with a remediation owner) |
| Downstream dependents | (list, each with its own blast-radius note) |
| Recommended migration path | (from Part 2 below) |

### Step 10: Validate the profile with the team

A traffic capture is ground truth for the window it covers — nothing more. Review the draft profile directly with the team that owns the workload; they're the only ones who know about the monthly batch job that didn't run during your two-week capture window, or the disaster-recovery test that's scheduled for next quarter and will double connection counts for an hour. Treat this as a required sign-off step, not a courtesy.

## Part 2 — A Menu of Migration Assistance Models

Not every workload needs the same kind of help, and not every team needs the platform team standing over their shoulder. Once a workload is profiled, match it to one (or a sequence) of these models rather than defaulting every migration to the same playbook:

| Model | What it is | Best fit |
|---|---|---|
| **Self-service assessment + one-click cutover** | An automated tool reads the workload profile and recommends target tier/topology; the team triggers the migration themselves | Low skew, no anti-patterns, standard consistency needs, low-to-medium criticality |
| **Native replication-based live cutover** | New platform attached as a replica of the old system (where protocols are compatible — e.g., a Redis replica, a MySQL replica, Kafka MirrorMaker); let it catch up, then promote | Any workload where source and target speak the same replication protocol — usually the lowest-risk, shortest-downtime option available |
| **Shadow / mirrored-traffic validation** | Production traffic is mirrored to the new platform in read-only shadow mode; outputs and latency are compared against the old system with zero production risk, before any real cutover | Workloads with non-trivial consistency requirements or hot-key skew, where you want proof the new topology behaves correctly before committing |
| **Dual-write / dual-read transition window** | The application writes to both old and new systems for a bounded window, then reads gradually shift over | Cases where native replication isn't available (e.g., a major version jump with an incompatible replication protocol, or a genuine platform change) |
| **Proxy/sidecar transparent redirection** | A proxy in front of the service (query router, service mesh sidecar) can shift a percentage of traffic between old and new backends without any application code change | Teams that need a slow, reversible, percentage-based canary rather than an all-or-nothing cutover |
| **Blue-green cutover** | A complete new environment is stood up in parallel; traffic switches atomically via DNS or service discovery, with the old environment kept warm as an instant rollback | Workloads where a short, well-tested maintenance window is acceptable and a clean rollback matters more than a gradual ramp |
| **Strangler-fig incremental migration** | Rather than moving the whole workload at once, migrate one query type or data domain at a time, running old and new side by side until every domain has moved | Workloads with genuinely mixed complexity — some low-risk read paths and some high-risk transactional paths within the same service |
| **Guided office hours / migration clinics** | Scheduled, recurring platform-team support sessions — heavier than self-service, lighter than a dedicated engineer | Medium-complexity workloads where a team can self-serve most of the migration but needs expert review at specific decision points |
| **White-glove concierge migration** | A dedicated platform engineer pairs with the team end-to-end: custom load testing, staged traffic shift, a rehearsed rollback plan | High-skew, high-criticality, or anti-pattern-heavy workloads — the profile itself should be the trigger for this tier, not team seniority or how loudly they ask |
| **Pre-migration compatibility linter** | An automated scan of a team's query/command patterns against known target-platform incompatibilities, run before migration planning even starts | Every workload, as a gating step — this is Step 7 above turned into a repeatable, automated check rather than a one-time manual review |

## Choosing the Path: Let the Profile Decide

The workload profile from Part 1 should drive the choice, not team preference or platform-team convenience:

- **Clean profile, low criticality** → self-service assessment tool + native replication-based cutover, no human from the platform team required beyond exception handling.
- **Clean profile, high criticality** → native replication-based cutover, but gated behind shadow-traffic validation and a scheduled (not ad hoc) cutover window.
- **Anti-patterns found, any criticality** → compatibility-linter remediation first, then re-profile, before any migration model is selected — migrating a workload with known-incompatible patterns just relocates the incident.
- **High skew or non-trivial consistency requirements** → shadow validation is close to mandatory regardless of tier; the risk isn't availability during cutover, it's silent correctness drift that a simple "did it fail over" check won't catch.
- **Mixed complexity within one workload** → strangler-fig, so the low-risk 80% of the workload isn't held hostage to the review cycle the high-risk 20% actually needs.
- **High skew, high criticality, and multiple downstream dependents** → white-glove, full stop. This is exactly the combination the profiling step exists to surface early, rather than discovering it mid-migration.

---

*Part of the Data Services PaaS requirements series — see the [requirements framework](/articles/2026-paas-requirements-framework/) this playbook extends, and the worked examples of Steps 3 and 7 applied to a real operation surface for [Redis](/articles/2026-paas-redis-command-compatibility-and-scaling/), [Kafka](/articles/2026-paas-kafka-api-compatibility-and-scaling/), [Elasticsearch](/articles/2026-paas-elasticsearch-operation-compatibility-and-scaling/), [MySQL](/articles/2026-paas-mysql-query-compatibility-and-scaling/), and [gRPC/Protobuf Messaging](/articles/2026-paas-grpc-protobuf-rpc-compatibility-and-scaling/).*
