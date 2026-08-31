---
layout: article
title: Tusker — Building a Self-Supported, Open-Source Core Hadoop Distribution
permalink: /articles/2021-tusker-core-big-data-distribution/
year: 2021
feature_area: Data Platform Engineering · Distributed Systems
summary: How a payments network's data platform organization replaced a vendor-supplied Hadoop distribution with a self-built, self-patched, open-source core — and the crises (data-center power, NameNode scaling, a COVID-era hiring ramp) that shaped how it actually got built.
---

# Tusker — Building a Self-Supported, Open-Source Core Hadoop Distribution

*Work started: 2020 · Shipped: 2021 · Platform area: Data Platform Engineering · Status: production*

## Why It Existed

By 2020, the data platform I worked on hosted roughly 150-200 applications across 75-100 Hadoop clusters, all running on a commercial Hortonworks HDP distribution whose vendor support was heading toward end-of-life. The clusters had grown to several thousand nodes carrying well over 100PB of data, serving thousands of analytical users running tens of thousands of jobs a day. Interactive query wait times ran roughly 10–30% of total execution time. Onboarding a new user took one to two weeks and a chain of manual access tickets. Governance was reactive — problems were found after the fact, not prevented.

The strategic question underneath all of it: keep riding a vendor's Hadoop distribution and its release cadence, or take ownership of the distribution itself. I led the initiative that chose the second path — building **Tusker**, a lean, self-supported, open-source-first Hadoop distribution (Hadoop, Hive, Tez, Zookeeper, Ranger, Spark-on-YARN) to directly replace the commercial HDP stack, plus a companion cluster manager built on Apache Ambari for operations and observability.

## What We Built

Tusker had two halves:

- **The Tusker Hadoop Distribution** — an in-house-built, patched Apache Hadoop/Hive/Tez/Zookeeper/Ranger/Spark runtime, built and security-scanned through the same CI/CD pipeline as any other internal software, hosted in an internal artifact registry, and deployed as a first-class "Hadoop/Hive Cluster as a Service" — start, stop, configure, rolling-restart, and rolling-upgrade of individual services, all self-service.
- **The Tusker Cluster Manager** — a single-pane-of-glass operations and monitoring layer, backed by a Common Metrics Collector Framework surfacing availability/performance/reliability metrics from every core service (HDFS, YARN, Hive, Zookeeper, Presto, Spark, and more) onto operational dashboards.

Around the distribution, a broader modernization wave replaced most of the remaining commercial components with open-source equivalents on a published timeline — Oozie to Apache Airflow, Hive LLAP to Presto, HBase to ScyllaDB, Flume/Sqoop to NiFi — driven by the same rationale: remove license cost, remove vendor-forced migration timing, and get upstream fixes on our own schedule instead of the vendor's.

```
                     ┌─────────────────────────────┐
                     │   Ecosystem Platform Services │
                     │  Presto/Trino · Workflow Svc  │
                     │  Kafka-as-a-Service · KVS-aaS │
                     └───────────────┬─────────────┘
                                     │ runs on top of
                     ┌───────────────▼─────────────┐
                     │     Tusker Cluster Manager    │
                     │  (Ambari-based ops console)   │
                     │  health · jobs · queues ·     │
                     │  metrics · self-service admin │
                     └───────────────┬─────────────┘
                                     │ manages
                     ┌───────────────▼─────────────┐
                     │   Tusker Hadoop Distribution  │
                     │  HDFS · YARN · Hive/Tez        │
                     │  Zookeeper · Ranger · Spark    │
                     │  (self-built, self-patched,    │
                     │   upstream Apache OSS)         │
                     └────────────────────────────────┘
```

## Execution: Three Crises That Shaped the Build

The roadmap is the easy part to write down. What actually decided the project's outcome were three moments where the plan met reality.

**Build vs. adopt, on the cluster manager.** We initially planned to build a custom cluster manager from scratch — installation, configuration, monitoring, the works. After weighing stability, available open-source committer capacity, and integration risk, we changed course and adopted Apache Ambari instead, which at the time had gone quiet in the Apache Attic and needed reviving as an active project. That single decision cut roughly six to nine months off the delivery timeline and avoided an estimated four to six months of sunk cost a from-scratch manager would have cost. The lesson carried forward into later projects: ship the smallest valuable slice first, rather than building every "nice to have" in parallel before anything ships.

**A data-center power crisis that delayed a dependent project by two years.** Disaggregating Spark compute from Hadoop storage — a deliberate architectural move — meant provisioning a large number of additional cores, on the order of 800-1,200 nodes, for a compute-only Spark cluster. That drew several megawatts a day. The data center we were operating in had a comparably limited total capacity. There was no way to just requisition more racks; we had to resize the plan to what the building could actually power. We started with a much smaller initial batch — a few thousand vcores across a few dozen nodes — and spent the next one to two years building out dedicated capacity in parallel. The direct consequence was that full Spark adoption slipped by about two years against the original plan. The lasting fix wasn't technical — it was organizational: we instituted twice-yearly proactive data-center capacity planning and a standing biweekly capacity-triage call between operations and platform engineering, so the next scaling wall would be visible a year out instead of discovered at provisioning time.

**An HDFS NameNode scaling crisis on a live, business-critical cluster.** One of our flagship analytical clusters — on the order of 90,000-130,000 vCores of compute — crept toward roughly 1.5-2.5 million tables and 200,000-270,000 schemas. The NameNode holds all filesystem metadata in memory and is a single point of failure; at that scale, instability there wasn't an abstract risk, it threatened fraud detection, authorization, and dispute-processing workloads running on the same platform. We addressed it two ways at once: adopting the Zing JDK alongside Ambari to raise the practical ceiling on object counts the NameNode could hold, and rolling out a small-files compaction strategy that merged fragments into files of 512MB or larger after each job run, attacking the object-count growth at the source rather than only the symptom.

**A hiring ramp through a difficult market.** The initiative started as a small founding team with executive sponsorship and a growth plan to roughly 25-35 engineers in year one, 45-60 in year two, and 65-90 in year three. COVID-era hiring conditions delayed that ramp by three to six months, and at one point the project's internal status moved from green through yellow to red before a deliberate recovery — adjusted scope, adjusted timeline, and renewed leadership backing — brought it back. The levers that worked: splitting hiring unevenly between two geographies to reach a labor market where the specific Java/Hadoop skill set was more abundant, building working proofs-of-concept with the existing team while hiring caught up rather than waiting, bringing in contract staff through hiring events to bridge the gap, and pre-writing detailed technical requirements so new hires could start contributing immediately instead of spending their first weeks discovering scope. The team ultimately scaled to several scrum teams within a year and to 60-90+ people — engineers, tech leads, open-source committers, QA, and architects — with several senior engineers growing into Technical Lead and Engineering Manager roles through the buildout.

Visibility on the initiative reached CEO/CTO level given its scale and its position underneath fraud, authorization, and dispute infrastructure. I ran a weekly project status and roadblock review, and during the highest-intensity early phase, a recurring late-night sync bridging two continents' working hours to keep the distributed engineering teams aligned on technical direction. Execution scaled from a single track to a handful of parallel tracks, each owned by a tech lead reporting consolidated status up through chief architects.

## Key Decisions

- **Build a self-supported distribution instead of adopting the vendor's next-generation offering.** Trading short-term build cost for long-term control of the roadmap, the licensing bill, and the upgrade timeline.
- **Adopt Ambari instead of building a cluster manager from scratch.** A pragmatic call that materially compressed the delivery timeline — the single highest-leverage decision in the project.
- **Per-cluster migration technique chosen by risk, not by preference.** A parallel-cluster-and-cutover approach for most clusters; an in-place upgrade for the one cluster where HDFS encryption and data-copy complexity made cutover riskier than upgrading live.
- **Deliberately deprioritized HA/DR hardware for one cluster** in a given year — worth roughly $10M-$25M in deferred infrastructure spend — to free capacity for a higher-priority compliance-driven initiative elsewhere on the platform, an explicit tradeoff made and owned rather than an oversight.
- **A storage-scaling technology bake-off** (Apache Ozone against several commercial alternatives) favored an in-place, open-source-collaborative migration path over "rip and replace," even though no single winner was locked in during the period this covers.
- **YARN over Kubernetes for compute scheduling, for the time being.** YARN delivered roughly 75-85% data locality out of the box; a Kubernetes-based model would have needed an additional caching layer to approach the same locality and bandwidth characteristics — a real cost that had to be weighed against Kubernetes's other advantages.

## Why This Matters

A payments network's data platform sits directly underneath fraud detection, authorization, and dispute processing — it cannot fail quietly, and it cannot wait years for a vendor's roadmap to catch up to the business's needs. Owning the distribution end-to-end meant the platform organization controlled its own upgrade cadence, absorbed security patches on its own timeline (dozens of critical patches were folded into one distribution refresh alone), and could push a major version jump — with Tez promoted to the default execution engine over MapReduce — when the business needed it, not when a vendor shipped it. The project also stood up an internal Apache mirror across several upstream projects, letting the team merge its own changes with incoming open-source commits and contribute fixes back upstream, closing the loop between "self-supported" and "isolated."

None of the technical wins would have landed without the organizational ones: knowing when to buy time by adopting existing open source instead of building, knowing how to resize a plan against a real physical constraint like data-center power instead of pretending it away, and knowing how to keep hiring and morale intact through a genuinely bad labor market. Cluster deployment time fell from several weeks toward about a week through automation; core-service availability moved from the mid-90s% toward a 99%+ target — but those numbers were downstream of the harder calls above.

## Tech Stack

- **Core distribution** — Apache Hadoop, Hive, Tez, Zookeeper, Ranger, Spark-on-YARN
- **Cluster management** — Apache Ambari (revived and adopted rather than built in-house)
- **Storage** — HDFS with ViewFS-based namespace federation; Apache Ozone evaluated as a next-generation storage layer alongside several commercial alternatives
- **Monitoring** — a custom Common Metrics Collector Framework layered on native JMX metrics, surfaced through Prometheus dashboards
- **JVM** — Zing JDK, adopted specifically to raise NameNode object-count ceilings
- **CI/CD & supply chain** — internal build pipeline with security scanning, internal artifact registry, upstream Apache mirroring across several projects

---

*Part of a broader data-platform engineering portfolio — see also [Presto to Trino](/articles/2020-presto-trino-interactive-query/) and [MLP](/articles/2019-mlp-machine-learning-platform/).*
