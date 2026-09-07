---
layout: article
title: MySQL-as-a-Service — Platform Requirements for Availability, Disaster Recovery & Key Metrics
permalink: /articles/2026-paas-mysql-requirements/
year: 2026
feature_area: Data Services PaaS · MySQL Requirements
summary: The mandatory bar for onboarding a MySQL offering onto a platform-as-a-service catalog — replication and failover topology, backup/PITR strategy, and the metrics both the platform team and applications must instrument.
---

# MySQL-as-a-Service — Platform Requirements

*Platform area: Data Services PaaS · MySQL · Status: reference specification*

## Why This Requirements Doc Exists

MySQL is the data service most likely to be treated as "just a database" long after it has become a system of record with real business consequences attached to an outage or a lost transaction. A platform-as-a-service layer has to be explicit about what topology and backup posture a given workload actually needs — a reporting replica has a very different bar than a table backing financial transactions — and enforce that bar at provisioning time rather than discovering the gap during an incident.

## Service Tiers

| Tier | Topology | Replication mode | Intended use |
|---|---|---|---|
| **Dev/Sandbox** | Single instance | None | Local/integration testing |
| **Standard** | 1 primary + 1–2 read replicas | Asynchronous | Read-heavy services, internal tools, reporting |
| **Critical** | 1 primary + 2 replicas (semi-sync or Group Replication) | Semi-synchronous / Group Replication | Transactional systems of record, anything backing a ledger, order, or compliance workflow |

## Availability Requirements

- **Semi-synchronous replication (or MySQL Group Replication) for Critical tier** — a committed write is acknowledged by at least one replica before the client receives a commit confirmation, bounding data loss on primary failure to a small, defined window rather than "whatever hadn't replicated yet" under pure async.
- **Automated failover via Orchestrator (or equivalent) + ProxySQL/MySQL Router** for both Standard and Critical tiers — manual failover is not an acceptable production posture at either tier; the difference between tiers is the acknowledgment mode, not whether failover is automated.
- **Read/write split enforced at the proxy layer**, not left to application code to get right — reduces the blast radius of an application team accidentally sending writes to a replica.
- **Replica lag SLO**: Standard tier replicas ≤5 seconds behind primary under normal load; Critical tier semi-sync replicas effectively at zero lag for the acknowledging replica (by construction), with any additional async replicas monitored the same as Standard tier.
- **`innodb_flush_log_at_trx_commit=1`** and `sync_binlog=1` on every primary above Dev tier — full durability on every commit, accepting the I/O cost, because "usually durable" is not a real guarantee for a system of record.
- **Availability targets**: Standard tier 99.9%, Critical tier 99.95%, measured as write-path availability (can the application commit a transaction) and read-path availability tracked separately, since a failed-over cluster often restores reads before writes.
- **Automated failover time budget**: under 30 seconds detection-to-promotion for Critical tier, including proxy re-routing so application connection pools don't need to be manually bounced.

## Disaster Recovery Requirements

- **Backup strategy layered, not single-method**: full physical backup (XtraBackup or equivalent) daily, plus continuous binary log (binlog) shipping to cross-region object storage — the binlog stream is what enables point-in-time recovery between full backups, not just restore-to-last-backup.
- **Cross-region replica** for Critical tier — a standing async replica in a second region that can be promoted to primary, distinct from the in-region HA replicas used for automated failover.
- **RPO / RTO targets**:

| Tier | RPO | RTO |
|---|---|---|
| Standard | ≤15 minutes (binlog shipping interval) | 1 hour (restore full backup + replay binlogs) |
| Critical | ≤5 seconds (semi-sync acknowledgment + near-continuous binlog shipping) | 15 minutes (promote cross-region replica) |

- **Point-in-time recovery (PITR)** must be validated, not just theoretically supported — the platform runs a scheduled restore-and-replay test (monthly for Critical tier) that actually recovers to an arbitrary timestamp and verifies row-level data against a checksum, catching binlog corruption or gaps before they're discovered during a real incident.
- **DR drill cadence**: full cross-region promotion drill twice a year for Critical-tier clusters, validating both the promotion mechanics and that application connection strings / service discovery correctly repoint to the new primary.

## Platform-Level Metrics (What the Platform Team Watches)

| Metric | Why it matters | Alert threshold |
|---|---|---|
| Replication lag (`Seconds_Behind_Master` / semi-sync ack latency) | Direct input to RPO and to read-replica staleness | Standard: >5s sustained; Critical: any semi-sync ack timeout |
| `Threads_connected` vs. `max_connections` | Connection exhaustion is one of the most common self-inflicted outages | >80% sustained |
| InnoDB buffer pool hit ratio | Falling hit ratio means increasing disk I/O and degrading latency, often before it's visible anywhere else | <95% sustained |
| Slow query count / rate | Leading indicator of query-plan regressions or missing indexes before they cause a full outage | Sustained increase over baseline |
| Row lock wait time / deadlock count | Contention building up under load, a precursor to timeout cascades | Sustained increase over baseline |
| Disk I/O utilization and free space | MySQL degrades badly, then stops entirely, when disk fills | >85% disk usage sustained |
| Backup job success/duration | A "backup" that silently stopped succeeding weeks ago is not a backup | Any failed job; duration drift beyond baseline |
| Binlog shipping lag (to DR region) | Direct input to cross-region RPO | Threshold per tier RPO target |

## Application-Facing Metrics (What Consuming Teams Must Instrument)

| Metric | Why it matters | Target |
|---|---|---|
| Query latency (p50/p95/p99) as observed by the client | Captures connection-pool and network overhead the server-side view misses | Documented per query pattern/SLA |
| Connection pool exhaustion / wait time | Often the first visible symptom of either a database problem or an application-side connection leak | <80% pool utilization sustained |
| Deadlock/lock-timeout rate (application-observed) | Confirms whether contention is actually reaching end users, versus just showing up in server metrics | Tracked per critical transaction path |
| Failover-induced error spike duration | Measures the *actual* customer-facing impact of an automated failover, separate from the platform's internal detection-to-promotion time | Bounded to the platform's failover time budget plus client reconnect time |
| Read/write split correctness (writes-to-replica error count) | Confirms the proxy-enforced split is actually working from the application's point of view, not just configured | Zero |
| Stale-read incidents on read replicas | For Standard-tier async replicas, applications reading recently-written data from a replica need to know their own tolerance, not assume immediate consistency | Documented per consumer, validated against measured replica lag |

## Key Decisions

- **Semi-sync (or Group Replication), not pure async, is the line between Standard and Critical tier.** This is the single biggest lever on RPO, and it's a deliberate trade against write latency — Critical-tier teams are told explicitly that they're paying that cost.
- **Full durability settings (`innodb_flush_log_at_trx_commit=1`, `sync_binlog=1`) are platform defaults above Dev tier**, not tunables teams can quietly relax for performance — the same reasoning as Redis's AOF default: durability should be opt-out with a documented waiver, not opt-in.
- **PITR is drilled, not assumed.** A binlog stream that "should" support point-in-time recovery but has never actually been replayed in a test is an unverified claim, and the platform doesn't rely on unverified claims for its DR posture.
- **Read/write splitting lives at the proxy, not in application code**, because it's the kind of correctness property that's easy to get right once centrally and easy to get subtly wrong dozens of times if left to every consuming team.

## Tech Stack / Reference Implementation

- **Engine** — MySQL 8.x (InnoDB), or MySQL-compatible (Percona Server, Aurora MySQL) depending on platform posture
- **HA/failover** — Orchestrator + ProxySQL, or MySQL Group Replication with MySQL Router
- **Backup** — Percona XtraBackup (physical, daily) + continuous binlog shipping to cross-region object storage
- **Observability** — `mysqld_exporter` → Prometheus → Grafana, plus client-side OpenTelemetry instrumentation

---

*Part of the Data Services PaaS requirements series — see the [query-compatibility and scaling deep dive](/articles/2026-paas-mysql-query-compatibility-and-scaling/) for this service, the [requirements framework](/articles/2026-paas-requirements-framework/) this spec applies, plus [Redis](/articles/2026-paas-redis-requirements/), [Kafka](/articles/2026-paas-kafka-requirements/), [Elasticsearch](/articles/2026-paas-elasticsearch-requirements/), and [gRPC/Protobuf Messaging](/articles/2026-paas-grpc-protobuf-requirements/).*
