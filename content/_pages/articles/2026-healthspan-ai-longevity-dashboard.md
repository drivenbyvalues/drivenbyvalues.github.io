---
layout: article
title: HealthSpan AI — A Personal Longevity Dashboard Built on a Deterministic Health Model
date: 2026-08-19
category: Personal Project
permalink: /articles/2026-healthspan-ai-longevity-dashboard/
tags:
  - Longevity Tracking
  - Health Data
  - Deterministic Modeling
  - AI Vision
  - React
  - PostgreSQL
---

# HealthSpan AI — A Personal Longevity Dashboard Built on a Deterministic Health Model

## Executive Summary

HealthSpan AI is a household health dashboard built to answer one question most fitness and health apps don't: given everything I'm actually doing — workouts, sleep, blood pressure, labs, what I eat — how is that moving my life expectancy, and in which direction? It aggregates exercise, biometrics, and nutrition into a single household system, runs a deterministic longevity model over the combined data, and uses AI on top of that — not instead of it — to explain the numbers, parse messy inputs like food and lab photos, and generate a preventive plan. It's a personal project, live and in daily use for my own household today, soft-launching toward a wider audience via a public waitlist.

## The Problem

Health data is scattered by design: a workout app has your training load, a lab portal has your bloodwork, a food log has your meals, and a wearable has your sleep and resting heart rate — none of them talk to each other, and none of them tell you what any of it actually means for your long-term health. You end up with a wall of metrics and no verdict. Most "AI health" products try to solve this by asking a language model to reason over your numbers directly, which means the one thing you actually want — a trustworthy answer — is exactly the thing an LLM is worst positioned to give you.

## The Product Insight

The fix is to split the system in two and never let the two halves blur. A small, fully deterministic model — no AI, no network call, just arithmetic over your numbers — computes the actual years-of-life impact of where you stand on nine health levers. AI is then layered strictly on top of that output to narrate it, prioritize it, and personalize the tone, with an explicit system-prompt instruction never to invent or adjust a number, only to explain the one it's given.

That split shows up most clearly in `healthTwin.ts`, a dependency-free module with no database, API, or OpenAI imports — which means the exact same longevity model runs server-side to compute your baseline and client-side to power instant what-if sliders ("what happens to my number if I add two workouts a week?") with zero network round-trips. Each of the nine levers — exercise, sleep, resting heart rate, systolic blood pressure, BMI, fiber, sugar, stress, cardio fitness — is anchored to a public reference point (WHO exercise guidelines, WHO BMI bands, SSA period life tables), with trend modifiers that compare your current value against where you were weeks ago, capped so no single lever can swing the estimate wildly. The model is documented, deliberately, as not a medical or actuarial instrument — it's a consistent, explainable proxy, not a diagnosis.

## What's Actually Built

Three data pillars feed the model, plus the Health Twin layer itself and a set of cross-cutting AI features on top.

**Exercise.** Workout logging with AI screenshot parsing for imported workout data, sport-specific logging, history, and reports, plus real import tooling — an Apple Health XML importer and an Excel workout importer, both run as CLI scripts, with a backfill utility for estimating missing historical data.

**Biometrics.** Lab reports and health metrics with AI-assisted lab parsing — PDF text extraction first, with a vision-model fallback for scanned or image-based reports — trend charts, and wearable sync: Oura Ring via OAuth, Google account linking, and a webhook endpoint that ingests Apple Health push updates directly.

**Nutrition.** Food logging with AI photo analysis (snap a plate, get a nutrition estimate) and free-text description analysis, tracked against configurable nutrition targets.

**Health Twin.** The lever model surfaced as its own dashboard page, letting you see which of the nine levers is costing or gaining you the most projected years, and simulate changes before you make them.

**Cross-cutting AI.** A dashboard risk assessment and an on-demand "deep health report" that synthesizes all three pillars into a structured summary; an Insights Feed that looks for cross-pillar correlations (does poor sleep show up in your next day's workouts?); and an auto-generated preventive plan. All of these call GPT-4o with a strict JSON schema response format rather than free-text parsing, so the output is structurally reliable even when the content is AI-generated.

**Household and account.** Multi-user household support with a lightweight local login for family members, an optional passkey (WebAuthn) login path, configurable dashboard modules so each household can toggle which pillars they actually want to see, an admin panel with an audit log, and a simple Coaching Cycles record for tracking paid human-coach engagements — no AI involved there, just clean bookkeeping.

## Under the Hood

- **Frontend**: React 18 + Vite + Tailwind + Recharts, built as an installable PWA.
- **Backend**: Express + PostgreSQL on Railway, with 30 raw-SQL migrations applied on startup — deliberately not an ORM-heavy stack; the model layer stays close to SQL.
- **AI**: OpenAI GPT-4o for both vision (food and lab photos) and text (insights, reports, plan generation, Health Twin narrative), always through structured, schema-validated JSON responses.
- **Auth**: Local household PIN login with bcrypt hashing and lockout protection, optional WebAuthn/passkey support, Google OAuth for wearable account linking.
- **File handling**: Multer for uploads, `pdfjs-dist` for lab PDF text extraction, `exceljs` for workout imports.
- **Observability**: Sentry on both the Express backend and the React frontend.
- **Testing**: Vitest, covering the core longevity model, workout type mapping, sport types, and the vision/report pipelines — still early-stage coverage, not yet comprehensive.

## Where It Stands

This isn't a mockup — it's a mature, working system in daily household use, with 30 shipped database migrations, roughly two dozen frontend pages, and about seventeen backend route groups. A public landing page and waitlist signup are live as the project moves from personal use toward a wider soft launch. A documented roadmap exists for what's next — genetic analysis integration, continuous glucose monitoring, AI meal planning, a biological age calculator, and a handful of other longevity-adjacent features — but none of that is built yet; the current system is deliberately scoped to the three pillars plus the Health Twin.

## Why It Matters

The instinct behind HealthSpan AI is the same one I keep coming back to across personal projects: AI is best used as a layer on top of something trustworthy, not as the thing computing the trustworthy part itself. A life-expectancy estimate you can actually believe has to come from transparent arithmetic over cited, public health references — AI's job is to read that number back to you in a way that's useful, prioritized, and specific to your data, not to guess at the number itself. It's also a proving ground for a pattern that shows up in my professional work too: keep the deterministic core auditable, and spend the AI budget on explanation and personalization instead of computation.

---

*Personal project, independent of my work at Visa. Live: [healthspan-ai.up.railway.app](https://healthspan-ai.up.railway.app/) — currently a household tool with a public waitlist for early access.*
