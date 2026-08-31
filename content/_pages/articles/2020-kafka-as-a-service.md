---
layout: article
title: Kafka-as-a-Service — Consolidating Dozens of Siloed Clusters into a Self-Service Streaming Platform
permalink: /articles/2020-kafka-as-a-service/
year: 2020
feature_area: Platform Engineering · Streaming Infrastructure
summary: An internal Kafka-as-a-Service platform, built on the open-source Confluent distribution instead of vendor-licensed Kafka, that turned 15-25+ independently-run clusters into a self-service, "bring your own machines" streaming platform with automated provisioning, security, and operations.
---

# Kafka-as-a-Service — Consolidating Dozens of Siloed Clusters into a Self-Service Streaming Platform

*Year shipped: 2020 · Platform area: Streaming Infrastructure · Status: production*

## Why It Existed

By the time we scoped this project, demand for streaming data processing across a large payments technology company's engineering organization was high and growing fast — and Kafka was the obvious industry choice. The problem was how each team got there. Roughly a dozen or so different technology teams had independently gone through the same process: pick a Kafka distribution, size and stand up a cluster, wire up security, and figure out on-call support — on their own, with no shared playbook. By the time we wrote the business case, that had produced 15-25+ clusters across those teams, non-standard configurations, high per-cluster maintenance cost, and a continued dependency on vendor-licensed Kafka (bundled with the Hadoop distribution the company was already paying for) that was expensive and limited on the streaming side. No team had deep in-house Kafka expertise, because no team had ever needed to own the whole lifecycle before.

We set out to build Kafka-as-a-Service (KaaS): a platform that automates provisioning, health monitoring, service lifecycle, failover, and security for Kafka clusters, so application teams could spend their time building streaming applications instead of running Kafka.

## What It Does

KaaS was deliberately **not** a shared, multi-tenant Kafka cluster. It runs on a "bring your own machines" model — application and infrastructure teams provide the hardware, and KaaS automates and standardizes everything on top of it: provisioning, configuration, security hardening, monitoring, and lifecycle operations, all through a self-service UI hosted on the [Parsec](/articles/2020-parsec-self-service-paas-portal/) platform portal.

The platform is built on the **open-source Confluent Kafka distribution** rather than the vendor-supported distribution bundled with our Hadoop stack — a deliberate choice to reduce vendor lock-in, build in-house Kafka expertise, and avoid enterprise licensing costs, projected at a meaningful six-figure sum annually in cost avoidance across the clusters we expected to migrate.

Core capabilities at general availability:

- **Automated provisioning** of a certified Kafka stack — Apache Kafka, Kafka Connect (with an HDFS connector), Schema Registry, KStreams, REST Proxy, Mirror Maker 2.0, and ZooKeeper — deployed via Chef with automated SSL certificate generation and rolling upgrades with little to no downtime.
- **Cluster and topic management** — provisioning, configuration management, topic CRUD, and quota management from the self-service UI.
- **Security** — ACLs, Kerberos and SASL authentication, mutual TLS between broker and client, encryption in transit, and role-based access built on directory groups (a deliberate, lighter-weight stand-in while a full attribute-based access-control layer matured).
- **Operational visibility** — health metrics, a monitoring dashboard, and alerting integrated with the company's existing operations tooling.
- **Resilient client libraries** for cluster federation and failover.

We shipped it in stages: a limited-availability release in February 2020 for early feedback from the operations team running it, a second limited release in the spring adding cluster/config/topic management, and general availability in July 2020 with Mirror Maker operationalized, ACLs, automated security patching, and centralized log integration.

## Architecture

```
   ┌───────────────────────────────────────────┐
   │        Self-service portal (Parsec)         │
   │  provisioning · topics · config · monitoring │
   └───────────────────────┬─────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │   KaaS control     │
                  │   plane / API      │
                  └────────┬─────────┘
         ┌─────────────────┼──────────────────┐
         ▼                 ▼                  ▼
  ┌─────────────┐   ┌─────────────┐    ┌─────────────┐
  │  Broker      │   │  Connect /   │    │  Schema      │
  │  cluster     │◀─▶│  KStreams /  │◀──▶│  Registry /  │
  │ (customer HW)│   │  REST Proxy  │    │  ZooKeeper   │
  └─────────────┘   └─────────────┘    └─────────────┘
         │
         ▼
  Mirror Maker 2.0 (cross-cluster replication / DR)
```

## Key Decisions

- **Confluent (open source) over vendor-licensed Kafka.** This traded a support contract for the responsibility of building in-house Kafka expertise — a risk we flagged explicitly, since hotfixes for community-reported issues could lag without a vendor SLA behind them.
- **Bring-your-own-machines, not a managed shared cluster.** KaaS owned the automation and lifecycle tooling; consuming teams owned hardware procurement and capacity planning. That kept the platform team's scope bounded to software, not fleet sizing.
- **Centralizing L3/L4 engineering support in-house** rather than continuing to lean on vendor support, funded as its own dedicated line item alongside the core platform build.
- **Directory-group-based access control as an interim step**, rather than waiting for a full role-based access-control layer to be ready before shipping — a pragmatic security posture that we were explicit about revisiting.
- **Iterative security hardening.** Encryption scope (which clusters needed transparent data encryption vs. which didn't), keytab-naming conventions, and centralized log-shipping enforcement were all still being negotiated close to the GA date — security was treated as a continuously evolving control set, not a one-time gate.

## Why This Matters

The FY20 targets were concrete: onboard roughly ten applications onto centrally-managed KaaS clusters (against a baseline of 15-25+ applications spread across 10-20+ ad-hoc clusters), cut cluster provisioning time from an average of several weeks down to about a day once hardware was available, and avoid a meaningful six-figure sum annually in licensing cost by moving off the vendor Kafka distribution.

By the following year, the platform had grown to roughly 20-30 production and 70-100 non-production cluster instances, including multiple Tier-0 production clusters — one alone handling up to several thousand transactions per second and tens of terabytes of data a week. What started as a single provisioning tool grew into a full operating model: distribution and provisioning, ongoing cluster management, security, and observability, each staffed and run as a distinct discipline rather than bolted on after the fact.

The deeper lesson was architectural, not just operational: standardizing on one certified distribution, one security model, and one provisioning path let a small central team support an ever-growing number of application teams without their headcount or ours scaling linearly with cluster count.

## Tech Stack

- **Streaming** — Apache Kafka (Confluent distribution), Kafka Connect, Schema Registry, KStreams, REST Proxy, Mirror Maker 2.0, ZooKeeper
- **Security** — Kerberos, SASL, mutual TLS, ACLs, directory-group-based RBAC
- **Provisioning/config** — Chef, automated certificate lifecycle management
- **Platform integration** — hosted as a self-service app on the [Parsec](/articles/2020-parsec-self-service-paas-portal/) portal
- **Monitoring** — health/alerting dashboards integrated with the platform's existing operations tooling

---

*Part of a self-service data platform engineering series — see [Parsec](/articles/2020-parsec-self-service-paas-portal/) and [Infrastructure-as-a-Service](/articles/2020-infrastructure-as-a-service/).*
