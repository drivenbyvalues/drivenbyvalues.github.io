---
layout: article
title: Intelligent Assignment Engine — Matching Assessments to the Right Reviewer
permalink: /articles/2025-intelligent-assignment/
year: 2025
feature_area: GRC Platform · Routing
summary: Auto-assigns each governance assessment to the best reviewer using a weighted blend of skill match and workload, with full explainability.
---

# Intelligent Assignment Engine

*Year shipped: 2025 · Platform area: GRC core routing · Status: production*

## The Problem

Before this engine, every incoming assessment landed in a shared queue and a coordinator manually picked a reviewer. That worked at low volume — and broke as the platform scaled to thousands of assessments across products, business units, regions, and review types (Privacy, AI/ML, Affiliates, Competition, IP).

Three failure modes kept showing up:

- **Mismatched expertise** — an AI/ML model card review going to a reviewer strongest in vendor privacy; the resulting questions missed the point and slowed the cycle by days.
- **Reviewer overload** — the same handful of senior reviewers absorbed the hardest items because routing was reputation-driven, not data-driven.
- **No auditability** — when a review took too long or went sideways, "why did *this* person own it?" had no answer.

## Rationale

Assignment is the first decision in the review lifecycle. Get it wrong and every subsequent step costs more — clarification rounds, re-routes, executive escalations. The bet was that a small, explainable scoring function could outperform manual routing while distributing load fairly.

We deliberately did **not** reach for a learned model first. The signals we needed (product, business unit, AI category, data sensitivity, reviewer skill profile, current workload) are structured and observable. A transparent rule + weight design lets reviewers and managers tune behavior without an ML retraining loop, and lets auditors see exactly why an item went where it did.

## How It Works

Every assessment is tagged at intake with: `product`, `business_unit`, `region`, `review_type`, `ai_category` (none / classical ML / GenAI / agentic), and `data_sensitivity`. Every reviewer has a **skill profile** — strength scores per review type, product family, and AI category — plus current workload state.

```
score(reviewer, assessment) =
    α · skill_fit(reviewer, assessment)        // 0–1, weighted vector match
  + β · domain_fit(reviewer.product, asmt.product)
  + γ · region_fit(reviewer.region, asmt.region)
  − δ · workload_penalty(reviewer.open_items, reviewer.capacity)
  − ε · recency_penalty(reviewer.last_assigned_at)
  + ζ · familiarity_bonus(reviewer, asmt.requester_team)
```

The top-K reviewers are returned with a reason string per candidate ("strong AI/ML profile, 2 open items vs capacity 6, last assigned 4h ago"). The coordinator can accept the top pick or override — overrides feed back as training signal for weight tuning.

## Top Skill vs. Workload Balance

This is the central trade-off. A pure skill-fit policy concentrates work on a few stars and burns them out. A pure load-balanced policy treats reviewers as interchangeable and tanks quality.

The engine exposes **two configurable knobs** per review type:

- `skill_floor` — the minimum acceptable skill_fit; candidates below it are filtered out *before* load balancing applies. This protects quality.
- `workload_weight (δ)` — how aggressively to spread load among candidates that clear the floor.

For high-stakes review types (e.g., AI agentic reviews, affiliate data sharing) we set a high `skill_floor` and a moderate `workload_weight` — quality first, load balanced within the qualified pool. For high-volume low-risk types (e.g., standard vendor renewals) we lower the floor and raise the workload weight — fairness first.

## Benefits

- **Time-to-first-touch** dropped sharply once routing stopped sitting in a coordinator's inbox — most assessments get an owner within minutes of intake.
- **Reviewer satisfaction** improved because work matches their skill profile, and load is visibly fair.
- **Audit defensibility** — every assignment carries the score breakdown and reason string. "Why this reviewer?" is a SQL query, not an interview.
- **Tunable, not opaque** — leadership can dial the policy per review type without code changes.

## What's Next

- Learn the weights from accepted-vs-overridden assignments (offline regression, no live model).
- Add **swap suggestions** when a reviewer's load spikes mid-cycle.
- Cross-team rotations to prevent skill-profile fossilization in any single reviewer.

---

*Part of the AI-Driven GRC Platform — see [2025 in review](/2025/) and the [agentic GRC architecture deep dive](/2026-deep-dive/).*
