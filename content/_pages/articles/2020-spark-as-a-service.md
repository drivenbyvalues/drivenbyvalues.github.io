---
layout: article
title: Spark-as-a-Service — Decoupling Compute from Storage on a Multi-Petabyte Data Lake
permalink: /articles/2020-spark-as-a-service/
year: 2020
feature_area: Platform Engineering · Compute Infrastructure
summary: A Kubernetes-based Spark compute platform that disaggregated compute from storage on a multi-petabyte Hadoop data lake — letting users spin up Spark environments on demand and reach across multiple Kerberized HDFS clusters without copying data.
---

# Spark-as-a-Service — Decoupling Compute from Storage on a Multi-Petabyte Data Lake

*Year shipped: 2020 · Platform area: Compute Infrastructure · Status: production, scaled through FY22*

## Why It Existed

At a large payments technology company's internal data platform, Spark compute was welded to specific Hadoop clusters. Each analytics cluster ran its own YARN compute layer bolted directly onto its own storage nodes. That coupling produced a familiar set of scars:

- **Duplicate data everywhere.** If your compute lived on Cluster A but the data you needed sat on Cluster B, the only fix was to copy the data. Datasets multiplied with no purpose beyond working around cluster boundaries.
- **Wildly unbalanced utilization.** One cluster ran compute-and-memory-heavy while a neighboring cluster sat storage-heavy with roughly half its compute idle — and the two weren't even interchangeable as disaster-recovery targets for each other, because the storage and compute layers were fused.
- **A submit-and-pray user experience.** Jobs went in through terminal/edge nodes. Spark's parameter surface is large enough that users routinely just copied an existing job and tweaked it rather than learning the tuning knobs — so duplicate jobs piled up alongside duplicate data.
- **No single pane of glass.** There was no central place to see what was running, which meant the same support ticket got filed, independently, against three different clusters.
- **A vendor-distribution ceiling.** The clusters ran on a commercial Hadoop distribution capped at an old Spark minor version, creating real pressure to modernize and to reduce license spend tied to that distribution.

The user base was already meaningful — several hundred ad hoc users at the time, with a credible path to many hundreds more within a year — and growing faster than the coupled architecture could gracefully serve.

## What It Does

The core move is disaggregation: **Spark compute stops living inside the Hadoop cluster and instead runs as its own tier on Kubernetes**, reaching across multiple Kerberized HDFS clusters over the network instead of requiring data to be copied in first.

Concretely, the platform lets a user:

- Spin up a Spark environment on demand from a self-service portal — no more multi-week manual cluster provisioning.
- Submit and schedule jobs through several entry points: the portal itself, edge nodes, an Airflow-based orchestrator, or a notebook environment.
- Monitor and debug running jobs from the same portal, with full API access for anything that can be automated.
- Have that same Spark image reach Kerberized HDFS on more than one cluster concurrently — the data doesn't move, the compute does.

Authentication threads through all of it without asking the user to juggle credentials per cluster: the user authenticates once via single sign-on into the portal; a token-based call reaches the Spark compute service; that service proxies into Kerberos-secured HDFS using a delegation token; the job itself lands on Kubernetes under its own service credentials. Data that was already encrypted at rest stays encrypted through that whole path unless a specific job has a legitimate, separately-gated need to decrypt.

## Architecture

```
        [Self-Service Portal]                    [Job Submission Paths]
         SSO login, job UI                  Edge node · Workflow orchestrator
                │                                    · Notebook environment
                │  create env / submit job                   │
                ▼                                             │
   ┌────────────────────────────────────────────────────┐    │
   │         Kubernetes Compute Layer                    │◄───┘
   │  • Namespaces + node pools per tenant                │
   │  • Batch scheduler: queues, weights, quotas          │
   │  • Spark-only compute, no local storage              │
   └───────────────────┬──────────────────────────────────┘
                        │ REST job submission (Livy)
                        ▼
   ┌────────────────────────────────────────────────────┐
   │           Spark Execution (2.4.x / 3.0)             │
   │  reaches multiple Kerberized HDFS clusters directly  │
   └───────┬───────────────────┬───────────────────┬─────┘
           ▼                   ▼                   ▼
     [HDFS Cluster A]    [HDFS Cluster B]    [HDFS Cluster C]
     (delegation-token authenticated, no data copy required)

   ┌────────────────────────────────────────────────────┐
   │  Monitoring / Metering                               │
   │  JMX metrics → Prometheus → Grafana                  │
   │  Per-queue vCore/memory accounting                   │
   │  Spark History Server (post-hoc debug per tenant)    │
   │  Synthetic end-to-end health-check jobs               │
   └────────────────────────────────────────────────────┘
```

## Key Decisions

**Kubernetes over another coupled YARN deployment.** The whole point was to stop tying compute to a specific cluster's storage. Kubernetes gave multitenancy primitives (namespaces, node pools, quota-bound queues) that a per-cluster YARN layer couldn't.

**Open-source Spark over the vendor-bundled version.** Staying on the commercial distribution's bundled Spark meant staying capped at an old minor version and paying distribution licensing tied to it. Moving to open-source Spark (2.4.6 and 3.0) was an explicit, budget-line decision to cut that cost and remove the version ceiling.

**A dedicated batch scheduler for YARN-grade queue semantics.** Plain Kubernetes scheduling doesn't have YARN's hierarchical queues, ACLs, weighted fairness, or job pre-emption out of the box. An advanced scheduler layer was added specifically to close that gap — multitenancy without giving up the resource-fairness guarantees teams already relied on.

**The UI-first tradeoff was made with eyes open.** Moving users off ad hoc shell scripting onto a portal-driven workflow was a real regression for power users who had built tooling around the old model — that cost was named explicitly in the design rather than glossed over, alongside a frank internal admission that UI engineering was a skill gap the team had to grow into.

**GPU-accelerated Spark was evaluated, not adopted.** A vendor pitch for unmodified-code GPU acceleration of Spark SQL/DataFrame/ML workloads showed compelling benchmark numbers. It's included here as a live example of technology evaluation that stayed an evaluation — the honest answer, sourced from the record, is that no internal adoption decision followed.

## Why This Matters

Disaggregating compute from storage is now a familiar pattern in cloud data platforms, but doing it inside an on-prem, multi-petabyte, Kerberized Hadoop estate — with hard SLAs, existing encryption-at-rest requirements, and a large existing user base mid-migration — is a different order of problem than standing up a greenfield cloud-native stack. The payoff compounds: cluster onboarding that used to take months collapses to on-demand; a job that used to require a support ticket runs itself; and the compute layer becomes a platform other services build on rather than a resource each team has to individually provision. In the platform's next iteration, this same compute layer became the substrate for a broader unified batch/stream/query processing vision — and, notably, for the encryption and de-identification jobs described in the companion piece on Secure Data Services below.

## Tech Stack

- **Compute** — Apache Spark 2.4.x / 3.0 on Kubernetes
- **Scheduling** — Kubernetes-native batch scheduler with queue/quota semantics, later an advanced scheduler for YARN-parity fairness and pre-emption
- **Job submission** — Apache Livy (REST), portal UI, workflow orchestrator, notebook integration
- **Storage** — Kerberized HDFS across multiple independent clusters, accessed without data duplication
- **Auth** — SSO at the portal, Kerberos delegation tokens into HDFS, service credentials into Kubernetes
- **Observability** — JMX metrics → Prometheus → Grafana, per-tenant history server, synthetic health-check jobs

---

*Part of a series on the as-a-service compute and data platform built for a global payments network — see [Secure Data Services](/articles/2019-secure-data-services/) for how the same data platform protected sensitive payment data at the field level, including encryption workloads that ultimately ran on this compute layer.*
