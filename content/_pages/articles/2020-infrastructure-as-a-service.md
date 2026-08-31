---
layout: article
title: Infrastructure-as-a-Service — Automating the Foundational Layer Under Every Data Platform Service
permalink: /articles/2020-infrastructure-as-a-service/
year: 2020
feature_area: Platform Engineering · Infrastructure Automation
summary: The container platform, storage, CI/CD, and on-demand database and data-movement services that sat underneath every other self-service product on the data platform — the unglamorous automation layer that made everything above it possible.
---

# Infrastructure-as-a-Service — Automating the Foundational Layer Under Every Data Platform Service

*Year shipped: 2020 · Platform area: Infrastructure Automation · Status: production*

## Why It Existed

Every self-service product on a data platform — a PaaS portal, a streaming service, an analytics workspace — ultimately runs on the same handful of foundational primitives: compute, storage, CI/CD, and a database to put data in. At a large payments technology company's data platform organization, those primitives were still largely manual. The HDFS NameNode was under stress from a large number of small files, and directory-level permission errors caused MapReduce jobs to fail mid-run because access control lived at a costly, coarse-grained metastore layer. There was no way to identify cold data and free up HDFS space for hot data. Teams needed isolated environments with different installed software but had no containerized way to provide that without risking production workloads on shared edge nodes. And business teams that wanted to bring their own analytics tools — feature-engineering libraries, custom R environments, fraud-analytics tooling — had no governed onboarding path onto the data lake at all.

Two adjacent problems sat right next to this one. Spinning up an ad-hoc analytical database for a data-mart use case was a slow, heavily manual process on the existing DB2 clusters. And moving data between systems — Hive to DB2, HDFS to GPFS — meant every team hand-rolling its own Sqoop, Flume, FTP, or shell-script pipeline from scratch.

I worked on the infrastructure automation layer that addressed all three: containerizing the platform's compute and edge-node footprint, standing up on-demand database provisioning, and building a self-service data-movement service — all as products in their own right, and all as building blocks the rest of the platform, including [Parsec](/articles/2020-parsec-self-service-paas-portal/), built on top of.

## What It Does

**Container platform and core infrastructure services.** We built a Kubernetes-orchestrated container platform providing compute resource management, access control, load-balancing infrastructure, and persistent-volume storage — the substrate for containerizing edge-node environments so teams could get an isolated, standard Hadoop base image instead of a hand-maintained, snowflake edge node. Alongside it: a self-service metrics/monitoring/logging stack (Grafana, Prometheus, Alertmanager, Elasticsearch) layered onto the existing enterprise monitoring tooling; a CI/CD pipeline built on Jenkins with a plan to standardize source control and add security scanning across every platform team; a storage roadmap to move GPFS off SAN and add proper quota management; and a formal **Bring-Your-Own-Software** process so teams could get governed data-lake access for third-party tools instead of installing them ungoverned.

**Database-as-a-Service.** Rather than making every team go through the full manual DB2 provisioning process for an analytical data mart, we built a middle-layer application — hosted on the Parsec portal — to provision, monitor, and manage on-demand DB2 instances, deliberately scoped into three tiers: small, no-HA development data marts; limited-duration (30–120 day) production data marts sized for ad-hoc reporting and analytics; and longer-duration, fully-featured marts for genuine operational use. Users reached their instances via edge-node CLIs or standard database tools over JDBC/ODBC, with a fast ingest path pulling data directly from the Hadoop analytics cluster.

**Data Transfer Service.** A self-service way to move data between designated sources and sinks — Hive to DB2, Hive to Hive, HDFS to GPFS — without every team hand-building its own pipeline. It leaned on predefined Apache NiFi templates for simple, ad-hoc transfers (scheduled through an Airflow-based scheduler for anything recurring), plus a "NiFi-as-a-Service" track for engineering teams that needed a fully dedicated, bring-your-own-hardware NiFi cluster with its own Schema Registry and ZooKeeper. The typical flow: log into the portal, pick an environment, choose a template, define source and target, schedule it once or on a recurring basis, and monitor or manage it from the UI — no shell scripts required. We weighed NiFi's tradeoffs deliberately: strong for guaranteed delivery, backpressure handling, and data lineage, but explicitly not a fit for large bulk transfers or compute-heavy ETL with joins and enrichment — so we scoped the service to the problems it was actually good at.

## Architecture

```
                 ┌─────────────────────────────┐
                 │   Self-service portal (Parsec)│
                 └───────────────┬─────────────┘
                                 │
        ┌────────────────────────┼─────────────────────────┐
        ▼                        ▼                         ▼
 ┌─────────────┐         ┌───────────────┐         ┌───────────────┐
 │ Container    │         │ Database-as-a- │         │ Data Transfer  │
 │ platform     │         │ Service         │         │ Service        │
 │ (Kubernetes) │         │ (DB2 instances) │         │ (NiFi + Airflow│
 │              │         │                 │         │  scheduling)   │
 └──────┬──────┘         └───────┬───────┘         └───────┬───────┘
        │                        │                          │
        ▼                        ▼                          ▼
  Edge-node containers     Ad-hoc DB2 instances       Hive ⇄ DB2 ⇄ HDFS ⇄ GPFS
  (standard base image)    (dev / limited / long-lived)   transfers, scheduled
                                 ▲
                                 │ fast ingest
                          Hadoop analytics cluster
```

## Key Decisions

- **Size- and duration-capping Database-as-a-Service** instead of building a general-purpose managed database offering. Development marts got no HA/DR; production marts were capped at 30–120 days. That narrowed the platform's blast radius and kept it firmly in "analytical, not operational" territory.
- **DB2, not a newer distributed SQL engine, as the DBaaS backend.** We ran a separate evaluation of CockroachDB as a possible replacement for an existing low-latency query engine, but that was a distinct initiative aimed at a different problem — millions of low-latency point lookups — not the foundation for on-demand data marts.
- **NiFi for the data-transfer service**, accepting its known limits (no resource isolation between concurrent transfers on shared clusters, a poor fit for large bulk or compute-heavy ETL) in exchange for GUI-based flow authoring, guaranteed delivery, and built-in data lineage — the right trade for the ad-hoc, analyst-facing use cases the service targeted.
- **Containerizing edge nodes on Kubernetes** instead of continuing to maintain dedicated, hand-configured edge servers — trading some up-front platform investment for long-term resiliency and easier monitoring.
- **A formal Bring-Your-Own-Software onboarding path**, rather than continuing to let teams install external tools ad hoc — more process, but a controlled way to grant third-party tools real access to the data lake.

## Why This Matters

None of this is glamorous work — a container platform, a scoped-down database provisioner, a data-movement UI. But it's the layer everything else depends on. The Kafka-as-a-Service platform, the PaaS portal itself, every analytics workspace — all of it ultimately needs compute, storage, CI/CD, a place to put structured data, and a way to move data between systems. Building those as governed, self-service products instead of one-off scripts is what let the rest of the platform scale without a linear increase in the infrastructure team's headcount. It's also a good example of scoping discipline: we didn't try to make Database-as-a-Service a full production database platform, and we didn't try to make the data-transfer service a general ETL tool. Deliberately narrow scope is what made both shippable.

## Tech Stack

- **Container platform** — Kubernetes, with access control via Dex/OAuth2-proxy-style ingress
- **Monitoring** — Grafana, Prometheus, Alertmanager, Elasticsearch
- **CI/CD** — Jenkins
- **Database** — DB2, provisioned on dedicated hardware with local SSDs
- **Data movement** — Apache NiFi (including a dedicated NiFi-as-a-Service track), Apache Airflow for scheduling
- **Platform integration** — self-service UI and administration hosted on the [Parsec](/articles/2020-parsec-self-service-paas-portal/) portal

---

*Part of a self-service data platform engineering series — see [Parsec](/articles/2020-parsec-self-service-paas-portal/) and [Kafka-as-a-Service](/articles/2020-kafka-as-a-service/).*
