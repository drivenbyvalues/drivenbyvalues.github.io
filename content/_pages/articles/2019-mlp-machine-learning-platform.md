---
layout: article
title: MLP — A Self-Service Machine Learning Platform for Notebooks, GPUs, and Kubernetes
permalink: /articles/2019-mlp-machine-learning-platform/
year: 2019
feature_area: Data Platform Engineering · ML Infrastructure
summary: A fully managed, multi-tenant PaaS for model building — Kubernetes-hosted GPU infrastructure, notebook-as-a-service, and standardized environments — that replaced fragmented, single-server data science tooling and cut a flagship fraud-scoring model's training time from multi-day to well under an hour.
---

# MLP — A Self-Service Machine Learning Platform for Notebooks, GPUs, and Kubernetes

*Year shipped: 2019 · Platform area: ML Infrastructure · Status: production*

## Why It Existed

Machine learning at a large payments network runs on genuinely rich transaction data — fraud detection, behavior analysis, anomaly detection — but the infrastructure data scientists actually had to work with was fragmented and couldn't scale. Model work was spread across SAS, R, and a scatter of specialty environments with no consistent tooling. Most models were built on bespoke, single-server setups lacking even basic ETL prep, scheduling, or resource management, which meant long build/train/test cycles and a lot of data-scientist time spent waiting rather than iterating. Heavy reliance on commercial tooling (SAS and its modeling add-ons chief among them) drove licensing cost and blocked the team from picking up open-source advances. Onboarding to an environment and to the data it needed was notoriously slow, which pushed people toward workarounds that quietly broke governance. And there was no shared visibility into who had already built what — models, features, and datasets weren't discoverable, so work got repeated.

The sharpest version of the problem showed up in the platform's flagship use case: an advanced-authorization fraud-scoring model whose rebuild cycle took roughly one to two months of data preparation and about a week of training *per iteration* on legacy single-threaded modeling infrastructure — and even after all that, only a handful of candidate models could be tried per rebuild project.

## What We Built

**MLP** was a fully managed, multi-tenant Platform-as-a-Service for building, training, and validating models — the deliberate offline counterpart to a separate real-time inference platform that handled production scoring. Models were developed and validated in MLP, then published downstream for live inference; MLP never took on real-time serving itself.

Core capabilities, in order of what shipped first:

- **Notebook-as-a-Service** — the primary data-scientist interface, running Jupyter and parameterized notebooks (via Papermill) on CPU or GPU, reaching Limited Availability mid-2019 and General Availability that fall.
- **A Kubernetes-hosted, multi-tenant GPU infrastructure layer** (internally called Pharos) — replacing loosely connected, chronically under-utilized specialty servers with an elastic, scale-out compute pool, run on the same "consolidate and match demand" principle as public cloud.
- **Standardized Python Environments** — curated, versioned Conda environments (CPU and GPU variants) bundling hundreds of packages — NumPy, pandas, scikit-learn, XGBoost, TensorFlow, PyTorch, Keras, and more — solving version drift and inconsistent CUDA versions across a fleet of specialty servers that had each drifted its own way.
- **A workflow manager** built on Apache Airflow, for scheduling notebook, Python, and SAS jobs as real pipelines instead of ad hoc scripts.
- **A model/experiment tracker** (an MLflow-based "Model DB") capturing full model lineage — metadata, parameters, data — by design, for compliance review and reuse rather than as an afterthought.
- **Distributed, GPU-accelerated model training**, most visibly through replacing a legacy single-threaded modeling engine with distributed XGBoost for the platform's highest-stakes fraud-scoring workload.

```
        ┌───────────────────────────────────────────────┐
        │        Data Scientist Interface                 │
        │  Notebook-as-a-Service (Jupyter) · CLI · SDK     │
        └───────────────────────┬───────────────────────┘
                                 │
        ┌───────────────────────▼───────────────────────┐
        │        Workflow Manager (Airflow-based)          │
        │  schedules notebook / Python / SAS pipelines     │
        └───────────────────────┬───────────────────────┘
                                 │
        ┌───────────────────────▼───────────────────────┐
        │     Resource Management — Docker + Kubernetes     │
        │            (multi-tenant CPU/GPU pool)            │
        └───────────────────────┬───────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
┌──────────────┐        ┌───────────────────┐       ┌──────────────────┐
│ Model / Exp.   │        │ Standardized Python │       │  Data Lake         │
│ Tracker (lineage)│      │ Environments (Conda)│       │  (Hive/Spark/Trino)│
└──────────────┘        └───────────────────┘       └──────────────────┘
                                 │
                       ┌─────────▼─────────┐
                       │ Real-Time Scoring   │
                       │ Platform (downstream)│
                       └─────────────────────┘
```

## Results That Mattered

The clearest before/after came from the flagship fraud-scoring model rebuild, once it moved onto MLP's Spark-based data prep and distributed XGBoost training: data-prep time fell from roughly two months to days, and training time fell from about a week to well under an hour per iteration. Benchmarked against the legacy modeling engine, distributed XGBoost on MLP showed roughly an order-of-magnitude speedup on a single core, a couple-hundred-fold speedup on a single 24-core server, several-hundred-fold speedup distributed across a small server cluster, and multiple orders of magnitude on a single GPU — with the usual caveat that distributed scaling has real overhead at small server counts and pays off more at larger ones. That speedup is what took the rebuild process from a handful of candidate models per cycle toward being able to try dozens to hundreds within weeks, not months.

Adoption grew from roughly 100 users and data scientists in an early snapshot to somewhere in the 250-350 range of onboarded users tracked on a dashboard within about six months, spread across the fraud/risk, cybersecurity, research, and broader data science teams using the platform. By the following year, onboarded users had roughly doubled again toward the high hundreds, with hundreds of active monthly data scientists running thousands of ML jobs a month. User sentiment tracked upward year over year on the platform's internal customer survey — positive sentiment and net (positive-minus-negative) scores both improved release over release, and the following year's survey showed a jump from the mid-50s/60s percent positive into the 70s percent positive, with the net score climbing meaningfully.

Real user feedback, not just aspirational metrics, showed up too: praise for a responsive, agile platform team and a solid interface, alongside concrete friction — per-user compute/memory limits that bit on large datasets, occasional kernel crashes on big file reads, no Scala support, and friction connecting external IDEs. That friction fed directly into the next year's roadmap.

## What Came Next

The following year's platform review showed the roadmap items maturing into named, shipping components: a **Feature Engineering Service** (an early preview of the long-planned feature store, starting with scalar and aggregate feature types), a **Batch Scoring Service**, and a **Real-Time Simulator** for validating model behavior against live data before it ever reached production. The platform had by then become the shared foundation underneath more than a dozen internal production AI/ML systems spanning fraud prevention, authorization, and settlement — with one fraud-decisioning system alone running roughly two dozen live models sourced from it. The forward-looking focus areas — flexible cloud-and-edge deployment, model and feature discovery ("search and reuse" for models the way you'd search documents), cross-domain model reuse, a formal responsible-AI framework, and support for encrypted data — were the natural next layer once the basic "build, train, track, and ship a model" loop was solid.

## Key Decisions

- **Split offline model-building from online real-time scoring as two separate platforms**, deliberately, rather than building one system to do both — MLP explicitly excluded real-time inference responsibilities from its own scope.
- **Kubernetes and containers over dedicated specialty servers**, modeled on public-cloud elasticity principles, to fix chronic under-utilization of GPU/CPU hardware that had been assigned to individuals rather than pooled.
- **Open-source-first tooling throughout** — Kubernetes, Airflow, XGBoost, TensorFlow — specifically to cut the vendor licensing footprint and stop blocking data scientists from open-source advances.
- **Replace a proprietary, single-threaded modeling engine with distributed, GPU-capable XGBoost** for the highest-value fraud-scoring workload — the single decision with the clearest, most measurable payoff (the multiple-orders-of-magnitude GPU speedup figure above).
- **Two parallel production deployment paths** (one via a portable model-interchange format into a legacy scoring system, one via native integration into the real-time platform) rather than forcing every team onto one deployment mechanism — a pragmatic accommodation of the reality that more than one production scoring system already existed.
- **Standardized, versioned Conda environments instead of per-server manual installs** — accepting periodic "jumbo release" upgrades as the tradeoff for eliminating version drift and inconsistent CUDA versions across the GPU fleet.
- **Left some infrastructure decisions explicitly open** rather than forcing a premature choice — a distributed storage layer to replace the platform's original GPFS-based storage was flagged as an unresolved problem rather than quietly patched over.

## Why This Matters

A machine learning platform for a payments network lives or dies on a narrow set of questions: can a data scientist go from idea to trained model without waiting weeks for infrastructure, can every model's lineage be reconstructed for a compliance review, and can the platform's flagship fraud model iterate fast enough to keep up with adversaries who iterate constantly. MLP's answer to all three was to make the infrastructure disappear — standardized environments so nobody debugged CUDA versions, a workflow manager so pipelines were reproducible instead of ad hoc, and lineage capture built into the platform rather than bolted on after an audit request. The fraud-model results (multi-day to well under an hour, a handful of candidates to dozens-to-hundreds) are the headline number, but the adoption curve — from roughly 100 users to the high hundreds within about eighteen months, with improving satisfaction scores the whole way — is the real evidence that the platform solved a problem people actually had, not just the one the roadmap said they had.

## Tech Stack

- **Compute** — Kubernetes-hosted multi-tenant GPU/CPU infrastructure (internally "Pharos"), Docker
- **Interface** — Jupyter-based Notebook-as-a-Service, parameterized via Papermill, plus CLI and SDK
- **Workflow** — Apache Airflow-based scheduler for notebook/Python/SAS pipelines
- **ML/DL frameworks** — TensorFlow, PyTorch, XGBoost, H2O, scikit-learn, Keras, R
- **Environments** — curated, versioned Conda environments (CPU/GPU variants, CUDA-matched)
- **Experiment tracking** — MLflow-based model/experiment lineage tracker
- **Data access** — the platform's Hive/Spark/[Trino](/articles/2020-presto-trino-interactive-query/) data lake, running on the [Tusker](/articles/2021-tusker-core-big-data-distribution/) Hadoop distribution
- **Deployment targets** — a portable model-interchange format into a legacy scoring system, plus native integration into the real-time inference platform

---

*Part of a broader data-platform engineering portfolio — see also [Tusker](/articles/2021-tusker-core-big-data-distribution/) and [Presto to Trino](/articles/2020-presto-trino-interactive-query/).*
