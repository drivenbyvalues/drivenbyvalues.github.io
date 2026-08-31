---
layout: article
title: Presto to Trino — Low-Latency Interactive SQL Over a Multi-Petabyte Data Lake
permalink: /articles/2020-presto-trino-interactive-query/
year: 2020
feature_area: Data Platform Engineering · Query Infrastructure
summary: How a low-latency Presto (later Trino) query engine was layered onto a multi-petabyte, self-supported Hadoop distribution to cut interactive query wait times, and rode out the project's rebrand from Presto to Trino without disrupting hundreds of active users.
---

# Presto to Trino — Low-Latency Interactive SQL Over a Multi-Petabyte Data Lake

*Year shipped: 2020 · Platform area: Query Infrastructure · Status: production*

## Why It Existed

Hive on MapReduce and Tez was good at what it was built for — large-scale batch ETL over a multi-petabyte data lake — and bad at the thing analysts actually wanted minute-to-minute: quick, in-and-out interactive queries. On our flagship analytical cluster, interactive query wait times ran 12–25% of total execution time, a persistent drag on analyst productivity that showed up in every platform survey we ran.

The vendor-supplied answer, Hive LLAP, came bundled with the same commercial Hadoop distribution we were already working to replace (see the [Tusker](/articles/2021-tusker-core-big-data-distribution/) rebuild). We wanted the interactive-query layer to be open-source and vendor-independent too, so we stood up **Presto** as a dedicated, low-latency query service — what we internally branded the Low Latency Analytical Cluster — running alongside the core distribution rather than inside it.

## What It Does

Presto (and later its community rename, Trino) gave the platform an in-memory, multi-threaded, distributed SQL execution engine with:

- **Broad connectivity** — a pluggable connector model reaching Hive-backed data, relational sources, and NoSQL stores through one SQL surface, rather than a query language locked to a single storage engine.
- **Real ANSI SQL** — a meaningful upgrade over HiveQL's dialect quirks, and immediately compatible with existing BI tooling (Tableau, MicroStrategy, JDBC/ODBC-based tools) without adapter work.
- **A client library across languages** — Python, Go, Node.js, R — which mattered beyond ad hoc analytics: it's the same query surface the [ML platform](/articles/2019-mlp-machine-learning-platform/) used to pull training data straight out of the lake.
- **LDAP/Kerberos-backed auth over HTTPS**, so the interactive layer inherited the same identity model as the rest of the platform rather than bolting on its own.

By the time the engine had matured into what we were calling Trino, it was carrying 500-800+ active users, 300,000-500,000+ monthly queries and extracts, high (99%+) service availability, and 90th/95th-percentile query response times under a minute — served off a roughly 40-60 node highly-available cluster supporting multiple downstream Hadoop clusters.

```
                    ┌──────────────────────────┐
                    │   BI Tools / Notebooks /  │
                    │   ML Platform / CLI        │
                    └─────────────┬─────────────┘
                                  │ JDBC / ODBC / CLI (LDAP+Kerberos)
                    ┌─────────────▼─────────────┐
                    │   Presto / Trino Cluster    │
                    │  (Low Latency Analytical    │
                    │      Cluster — LLAC)        │
                    │  ~40-60 nodes · HA · in-memory│
                    │  multi-threaded execution    │
                    └─────────────┬─────────────┘
                                  │ SPI connectors
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
 ┌─────────────┐         ┌───────────────┐         ┌─────────────────┐
 │  Hive / HDFS  │         │  RDBMS sources  │         │  NoSQL (Cassandra)│
 │  (Tusker core) │         │                 │         │                    │
 └─────────────┘         └───────────────┘         └─────────────────┘
```

## Presto to Trino: Riding Out a Project Rename

Partway through this engine's life, the open-source Presto project itself renamed to Trino — a community fork/rebrand rather than a technical rewrite, but one that still needed to be absorbed cleanly by a production service carrying hundreds of active analysts and downstream integrations. We treated it as a routine version upgrade rather than a migration: capacity was doubled ahead of the cutover, the engine was upgraded through several intermediate versions with Hive-views support added along the way, and the switch to the Trino name landed on the most stable version available at that point — with no interruption to the query surface analysts and downstream systems were already depending on.

The one real risk we tracked closely was Hive LLAP sunset: as the older Hive LLAP workloads were retired in favor of Presto/Trino, we had to identify the (reportedly small) set of use cases still depending on LLAP-specific behavior and plan their migration path explicitly, rather than assuming a drop-in replacement for every workload.

## Key Decisions

- **Stand up Presto as a dedicated service rather than route interactive queries through Hive LLAP.** Caching behavior was the deciding factor in engine comparisons — Presto, Spark's RDD/persistent-memory caching, and Hive LLAP's own caching were evaluated side by side, and a separate low-latency engine won out over trying to tune LLAP further.
- **Treat the Presto-to-Trino rename as a version bump, not a re-platform.** Capacity doubling before the cutover and staged version upgrades meant the rebrand was invisible to end users.
- **Give the query engine its own client libraries across languages** rather than treating it as a SQL-only analyst tool — this is what let the ML platform reuse the same query surface for training-data extraction instead of building a separate data-access path.
- **Explicitly scope the LLAP migration risk** instead of assuming universal compatibility, and track the small set of workloads needing special handling as a named risk item through the cutover.

## Why This Matters

Interactive query latency is one of those problems that looks like a performance tuning exercise and is actually an adoption problem: if analysts wait minutes for a quick query, they stop trusting the platform for exploratory work and route around it. Cutting wait times from double-digit percentages of execution time down toward single digits, on a self-supported and vendor-independent engine, meant the platform could keep growing its analyst base without growing its license bill in lockstep — and meant that when the underlying open-source project rebranded, the platform absorbed it as routine maintenance rather than a disruptive migration project.

## Tech Stack

- **Query engine** — Presto, later Trino (community rename of the same open-source project)
- **Connectivity** — SPI-based connector model (Hive, RDBMS, Cassandra), JDBC/ODBC, CLI
- **Auth** — LDAP/Kerberos over HTTPS
- **Client libraries** — Python, Go, Node.js, R
- **Underlying data platform** — the self-supported [Tusker](/articles/2021-tusker-core-big-data-distribution/) Hadoop distribution
- **Downstream consumers** — BI tools (Tableau, MicroStrategy), and the [ML platform's](/articles/2019-mlp-machine-learning-platform/) training-data pipeline

---

*Part of a broader data-platform engineering portfolio — see also [Tusker](/articles/2021-tusker-core-big-data-distribution/) and [MLP](/articles/2019-mlp-machine-learning-platform/).*
