---
layout: article
title: NammaSeva — Connecting Rural and Small-Town India to Trusted Local Service Providers
date: 2026-08-02
category: Personal Project
permalink: /articles/2026-namma-seva-hyperlocal-marketplace/
tags:
  - Hyperlocal Marketplace
  - Multi-Tenant SaaS
  - AI Voice Intake
  - Subsidy Discovery
  - NestJS
  - React Native
  - PostgreSQL
---

# NammaSeva — Connecting Rural and Small-Town India to Trusted Local Service Providers

## Executive Summary

NammaSeva ("Namma" = "our" in Kannada) is a town-branded marketplace and project-planning platform for home and small-business services — plumbing, electrical, roofing, carpentry, painting — built for towns that the big services marketplaces skip. It's a personal project, not a Visa product: a full multi-tenant system built end to end around four distinct parties — the **customer**, the **Pro** (vendor), the **town administrator**, and a **platform admin** layer that aggregates across every town — from phone-OTP auth through AI-assisted intake, vendor matching and quoting, to milestone-based job execution and cross-town oversight.

## The Problem

In a smaller Indian town, a home repair usually starts with a phone call to whoever the customer knows, or a walk down the market street asking around. There's no shared language for scope ("what exactly needs fixing?"), no way to compare quotes apples-to-apples, and no record of what was agreed once work starts. Vendors, in turn, spend as much time chasing vague leads as doing paid work. The result is friction on both sides and no trust layer connecting them.

Urban Company and similar platforms solved this for large metros, but that model — centralized inventory, city-wide vendor pools, English-first UX — doesn't translate to a town where the addressable market is a few thousand households, the vendors are a handful of known local operators, and customers think and speak in Kannada first.

## The Product Insight

The missing piece isn't another vendor directory — towns already have informal ones (word of mouth, WhatsApp groups). What's missing is a **standardized Project Packet**, created *before* any vendor is contacted: a structured, unambiguous description of the work — scope, category, location, urgency, photos — that every vendor bidding on it reads the same way. Standardize the ask, and quote comparison, fair pricing, and accountability all become possible.

NammaSeva builds that packet through a conversational, voice-first intake (Kannada or English), lets qualified local vendors respond with structured quotes against the *same* scope, and carries the job through execution as a shared milestone plan both sides can see.

## What's Actually Built

This isn't a mockup — it's four working applications talking to a shared backend, deployed and running.

### Customer app (React Native / Expo Router)

A town-branded app — hero photo, colors, and language pulled per-tenant from the backend, not hardcoded. The flow: phone number → OTP → a compact single-screen login (language toggle, phone entry, and OTP verification all on one screen — no unnecessary navigation) → icon-first service catalog → intake, either typed or **spoken**. A voice recording is transcribed, translated if needed, and run through an AI extraction step that pre-fills the structured template fields with a confidence score per field — low-confidence fields get a follow-up question instead of a guess. Once the packet clears a readiness threshold, it locks as an immutable scope document. From there the customer reviews quotes from invited vendors (not raw price — a normalized comparison), accepts one, and tracks the job through a milestone timeline with photo evidence, optional per-milestone confirmation, and change-order approval if scope shifts mid-job.

### Vendor app (Vite + React)

Vendors self-register — services offered, coverage radius, portfolio photos — and go through a town operator's approval workflow (approve, request changes, reject, suspend, reactivate, each with a decision-history trail). Once approved, a vendor sees an invitation inbox ranked by a real match score (eligibility + weighted fit against the job, not just "first come"), builds a quote with real line items (labor, materials, travel, disposal, tax — not a flat number), and executes accepted jobs through the same milestone plan the customer sees: propose the plan, upload evidence per milestone, propose a change order if something changes, mark ready for completion.

### Town Admin console (Vite + React)

The operator's control room for one town: a health dashboard (active projects, vendor coverage by category, rate-card completeness), a vendor verification queue, service-template authoring, an intake-session review tool for correcting an AI-extracted answer before it reaches a vendor, rate-card management, and a **Town Pack** — the entire town's configuration (branding, categories, rate cards, hero imagery) as a single clonable unit, so a second town can be bootstrapped from an existing one's archetype instead of built from scratch.

### Platform Admin console (Vite + React)

The fourth party, and the one that turns a set of independent towns into a network: a cross-tenant console, gated behind its own `PLATFORM_ADMIN` role, with no per-town branding of its own. Its **Command Center** is the one screen in the app wired to live production data today — every active town in one table (state, district, active projects, vendor count, completed jobs), a running total across the whole network, a directory of every user and which town(s) they hold a role in, and the ability to create a new town by cloning an existing one's Town Pack directly from the platform level, not just from inside a single town's console. Around that live core sits a much larger set of screens — geography and rollout-lifecycle tracking by state, per-town government-program enrollment, commerce and fee reconciliation across towns, launch blueprints and readiness gates, trust/reputation and security auditing — each wired to a real backend endpoint but still labeled "preview" in the UI until the data behind it is trusted as production-grade. It's the layer built to answer "how is the whole network doing," not just "how is this one town doing."

## The "Town Pack" Model

One core platform, many branded deployments. Every tenant is a town — its own language mix, catalog, rate cards, hero photography, and primary color — resolved at runtime from the backend, not baked into the build. The pilot town is **Namma Sirsi** (Sirsi, Uttara Kannada, Karnataka); the clone mechanism exists specifically so the next town isn't a rewrite. Tenant isolation is enforced with **Postgres row-level security**, not just an application-layer `WHERE tenant_id = ?` — every tenant-scoped query runs inside a transaction with the tenant ID set as a session variable, so isolation holds even against a bug in the query itself.

## Four Parties, One Decentralized System

Put the four apps together and the shape of the system is closer to decentralized commerce with a central view than to a single centralized marketplace. Each **town administrator** runs their own local economy — its own vendor pool, its own rate cards, its own government-scheme curation — without waiting on a central team to configure it for them; the Town Pack clone mechanism means a new town's operator can stand up their own local marketplace and business-incentive catalog in an afternoon, not a quarter. **Customers** and **Pros** transact entirely within that local context — a job in Sirsi never touches a vendor or price band from another town. Nothing about how one town runs its incentives or vendor rules is dictated top-down.

The **platform admin** layer doesn't run the local economies — it aggregates them. It's the one place that can see every town's active projects, vendor supply, and completed jobs side by side, provision a new town, and (as the surrounding "preview" screens fill in with real data) roll up which government programs each locality has adopted and how commerce is flowing across the whole network. That's the federal-to-local relationship in miniature: local administrators create and incentivize new economic activity in their own region on their own terms, and a central layer aggregates visibility across all of them without owning the transactions underneath. The Goal Planner's subsidy discovery, below, is the piece that puts real incentive data into that local layer in the first place.

## Goal Planner — From an Open-Ended Idea to a Fundable Plan

The marketplace solves "I know what I need, connect me to someone who can do it." A second, later feature solves a different problem entirely: "I have an idea but no idea where to start, or what help I qualify for." A customer types something open-ended — "I want to start beekeeping" — and a goal-decomposition step (OpenAI, routed through the platform's model-routing service) breaks it into an ordered set of concrete steps. Each step is then independently re-validated server-side against the town's *live* vendor catalog: a step only gets a real "Pro" match if a matching vendor category genuinely exists in that town; otherwise it gets AI-written DIY guidance instead of a fabricated referral.

Layered on top is a subsidy-discovery module: town operators can curate `SubsidyProgram` records (benefit type — percentage, fixed amount, loan subvention, or unstructured — plus a review status), and a customer's plan is checked against them. On a first-time miss, the system falls back to a live web search with grounded LLM extraction to find a plausible government or local scheme, persists it, and shows it to the customer immediately — but badged "unverified" until a town admin reviews and approves it through the admin console. Every step in a finished plan comes back enriched with a cost estimate (reusing the same town price-band mechanism the marketplace uses for quotes) and any applicable subsidies, rolled up into a plan-level total. It's the same trust-flywheel instinct as the marketplace — standardize the ask, verify before you show it as fact — applied to civic and economic opportunity instead of service matching.

This piece is newer than the rest of the platform and has known rough edges: the live web-search fallback needs an API key configured to do anything beyond a stubbed provider, the free-text goal description doesn't yet flow into the intake handoff, and there's no operator "refresh from web" action yet — all next on the list.

## Under the Hood

- **API**: NestJS modular monolith — one module per domain (auth, tenants, catalog, intake, vendors, matching, quotes, jobs, notifications) — REST, not GraphQL, kept boring on purpose.
- **Data**: PostgreSQL + PostGIS (coverage-radius geo queries), row-level security for multi-tenancy, TypeORM migrations.
- **Async work**: BullMQ for invitation batching and expiry — the platform's first real background-queue processor, decoupled from the request/response path.
- **AI**: a **Model Routing Service** resolves each AI capability (voice transcription, translation, requirements extraction) to a primary model + fallback chain with a per-candidate circuit breaker — editable by a town operator without a deploy, and swappable to a deterministic "fake" provider in tests and local dev so nothing calls a real LLM by accident in CI.
- **Storage**: presigned uploads to an S3-compatible bucket for photos, portfolio images, and per-town hero art.
- **Frontend**: Expo Router (customer, universal web/iOS/Android) and Vite + React (vendor, town-admin, platform-admin), sharing design tokens and a typed API client package across all four.
- **Deploy**: Railway, with CI on GitHub Actions running lint, typecheck, build, migrations against a real Postgres service container, and the full test suite before anything reaches `main`.

## Where It Stands

Phases 1 through 5 are complete and working end to end: service catalog and text/voice intake, AI-assisted requirements extraction, vendor onboarding and approval, matching and quoting, and milestone-based job execution with change orders and completion confirmation. Reviews and reputation (Phase 6) — the last piece of the trust loop — isn't built yet. The platform admin console is the newest surface: its Command Center (cross-town metrics, town creation, user roster) is live on production data, while its governance, commerce, geography, and trust screens are wired to real endpoints but still marked as preview until enough town-level activity exists to trust the numbers.

## Why It Matters

This is the same instinct behind the "trust flywheel" thesis: standardize the ask once, and everything downstream — fair quotes, accountable execution, a vendor's earned reputation — gets easier to build correctly. It's also a personal proving ground for patterns I use professionally at larger scale: strict tenant isolation, AI steps with confidence-tiered human fallback instead of blind automation, and admin-editable configuration instead of another deploy for every tuning change.

---

*Personal project, independent of my work at Visa. Live apps: [customer](https://namma-seva-customer-web-production.up.railway.app/) · [vendor](https://namma-seva-vendor-web-production.up.railway.app/) · [town admin](https://namma-seva-town-admin-production.up.railway.app/) · [platform admin](https://namma-seva-platform-admin-production.up.railway.app/).*
