---
layout: article
title: Reimagining a Global Merchant Data Platform — From a Fixed Hierarchy to a Flexible Entity Graph
permalink: /articles/2023-merchant-data-platform-entity-model/
year: 2023
feature_area: Data Platform Engineering · Entity Modeling & Data Governance
summary: How a global payments network's merchant data platform moved from a rigid three-level Store/Brand/Enterprise hierarchy to a flexible, n-level entity model — adding new participant types, region-first administration, and near-real-time ingestion — to keep pace with a payments ecosystem that had outgrown its original data model.
---

# Reimagining a Global Merchant Data Platform — From a Fixed Hierarchy to a Flexible Entity Graph

*Work started: 2023 · Platform area: Data Platform Engineering · Status: architecture and phased rollout*

## Why It Existed

A large payments network maintains a centralized repository of merchant information — who accepts electronic payments, where, under what business structure — that dozens of downstream products depend on: risk scoring, loyalty and rewards, tax compliance monitoring, fraud detection, spend analytics, and more. The repository I worked on had been built around a fixed three-level hierarchy: **Store → Brand → Enterprise**. That model matched the payments ecosystem of a decade earlier, but it had started showing real strain:

- **The hierarchy couldn't represent how merchants actually operate today.** Payment facilitators, aggregators, and sponsored merchants don't fit cleanly into "store under a brand under an enterprise" — they're intermediaries with their own relationships to the merchants they sponsor, and the old schema had no first-class place for them.
- **Administration was centralized, but the data wasn't.** A single central team managed the whole repository, even though every country and region had its own local nuance, local data sources, and local expertise that never made it into the platform.
- **Bringing in a new data source meant a code change**, not a configuration change — which meant every new 3rd-party integration was slow.
- **The pipeline was batch, not real-time.** Associating a brand-new merchant transaction signature with the correct brand and location took long enough to be a real product limitation.
- **There was no visibility into data quality.** Nothing told a downstream consumer how complete or trustworthy a given merchant's record actually was.

## What We Built

The redesign — internally the "Next Gen" platform — rests on four ideas that reinforce each other:

**A flexible, n-level entity model instead of a fixed hierarchy.** Rather than patching the three-level Store/Brand/Enterprise schema yet again, we replaced it with an expandable entity graph: a schema that can represent an arbitrary number of levels and relationship types. Multiple brands roll up correctly under one enterprise, and new participant types — payment facilitators, aggregators, sponsored merchants — get modeled as first-class entities with explicit relationships to the merchants they sponsor, not bolted onto the side of the old hierarchy.

**Region-first, federated administration.** Instead of one centrally-run repository, three tiers of administration inherit configuration downward: a Global Admin owns global schema and data sources; a Regional Admin owns region-specific schema, sources, and attributes; a Country Admin owns country-specific schema, local data-source onboarding, and local data-quality scorecards. A country can ingest and use its own local data without waiting on a central team, while regional and global consistency is preserved through inheritance rather than central gatekeeping. The rollout piloted this model with a dedicated regional data mart before generalizing it.

**Self-service 3rd-party data ingestion, with built-in quality scoring.** Onboarding a new data source became a configurable pipeline instead of a code change, and every source's contribution now carries a transparent quality score — surfaced as both a merchant-level completeness score and a source-level trust score. Instead of a binary gate on whether a source is "good enough," consumers can see exactly how complete and how trustworthy a given record is and make their own call.

**A move from batch to near-real-time ingestion.** The pipeline that associates a new transaction signature with the correct merchant brand and location moved from a batch cadence to streaming, directly targeting the lag that had become a real product constraint.

## Architecture

```
                    ┌─────────────────────────────┐
                    │   Global Admin               │
                    │  global schema · global      │
                    │  data sources · global        │
                    │  scorecards                   │
                    └──────────────┬───────────────┘
                                   │ inherits down
                    ┌──────────────▼───────────────┐
                    │   Regional Admin              │
                    │  region schema/sources/       │
                    │  attributes · region scorecard │
                    └──────────────┬───────────────┘
                                   │ inherits down
                    ┌──────────────▼───────────────┐
                    │   Country Admin                │
                    │  country schema · local 3rd-   │
                    │  party ingestion · local       │
                    │  scorecards                    │
                    └──────────────┬───────────────┘
                                   │ feeds
       ┌───────────────────────────▼───────────────────────────┐
       │            Flexible Entity Model (n-level)              │
       │  Enterprise ── Brand ── Brand ── ...                     │
       │       │                                                  │
       │       ├── PayFac ── Sponsored Merchant                   │
       │       ├── Aggregator ── Merchant                         │
       │       └── Store / Location                               │
       └───────────────────────────┬───────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                     ▼
     ┌────────────────┐  ┌──────────────────┐  ┌────────────────────┐
     │ 3rd-Party Data  │  │ Near-Real-Time    │  │ Geo-Location        │
     │ Ingestion +      │  │ Streaming Pipeline│  │ Services (address   │
     │ Quality Scoring  │  │ (signature→brand) │  │ standardization)     │
     └────────────────┘  └──────────────────┘  └────────────────────┘
```

## Key Decisions

**Replace the hierarchy instead of patching it again.** The fixed three-level model had already been patched repeatedly to squeeze in new participant types. At some point another patch costs more than a proper redesign — we made that call explicitly rather than deferring it another cycle.

**Score data instead of gatekeeping it.** A binary "is this source good enough" check is simpler to build but hides information a consumer actually needs. Surfacing a transparent completeness/trust score costs more to build and explain, but it lets every downstream product make its own risk-appropriate decision instead of inheriting an opaque platform-level cutoff.

**Federate administration, but inherit configuration rather than duplicate it.** Fully centralized administration doesn't scale to local nuance; fully independent regional silos lose consistency. Configuration inheritance (global → regional → country) was the middle path, piloted with one regional data mart before generalizing.

**Buy vs. build resolved per component, not as a platform-wide stance.** Some pieces reused existing open-source and in-house components; others were purpose-built. Treating this as a single build-everything or buy-everything decision would have been the wrong level of granularity for a platform this broad.

**Phase the investment across independently-scoped focus areas** (ingestion & scoring, the entity model itself, the admin tiers, geolocation services, observability) rather than one monolithic rebuild — each area independently estimated and staffed, so a slip in one track doesn't stall the others.

## Why This Matters

A merchant data platform is infrastructure, not a product in its own right — its job is to make dozens of *other* products (risk scoring, loyalty programs, tax compliance, fraud detection, spend analytics) correct and current. That makes its data model a compounding liability if it's wrong: every product built on top of a rigid hierarchy inherits that rigidity, and every new participant type the ecosystem invents (payment facilitators and aggregators didn't always work the way they do today) becomes a schema fight instead of a config change. Modeling entities and their relationships explicitly — rather than assuming a fixed shape up front — is the same lesson distributed-systems and data-modeling work keeps re-teaching: model the relationships, not just the records, and leave room for the shape of the domain to keep changing after you ship.

## Tech Stack

- **Data modeling** — flexible, relationship-aware entity schema (n-level, replacing a fixed 3-level hierarchy)
- **Administration** — tiered, config-inheriting admin model (Country → Regional → Global), with a schema-steward role for global schema evolution
- **Ingestion** — self-service 3rd-party pipeline creation with per-source and per-record quality scoring
- **Processing** — migration from batch to near-real-time streaming for signature-to-entity association
- **Geolocation** — address standardization service, scaling coverage across dozens of countries
- **Deployment model** — federated regional/country data marts under a global schema, piloted regionally before generalizing

---

*Part of a series on data platform engineering for a global payments network — see [Kafka-as-a-Service](/articles/2020-kafka-as-a-service/) and [Infrastructure-as-a-Service](/articles/2020-infrastructure-as-a-service/) for the streaming and automation layers this kind of platform is typically built on.*
