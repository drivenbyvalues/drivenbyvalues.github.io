---
layout: article
title: Multi-Provider LLM Infrastructure — One Source of Truth Across a Fleet of AI Agents
permalink: /articles/2025-llm-infrastructure/
year: 2025
feature_area: GRC Platform · LLM Infrastructure
summary: A single LLMAuthService routes a dozen-plus specialized agents across OpenAI, Anthropic, Gemini, and Azure OpenAI with automatic provider fallback, database-backed prompt configurations, and cost telemetry built in.
---

# Multi-Provider LLM Infrastructure

*Year shipped: 2025 · Platform area: AI infrastructure · Status: production*

## The Problem with "Just Call OpenAI"

Most AI features ship with the LLM call hardcoded. That breaks the moment you need to:

- Swap providers when one has an outage, a price change, or a capability gap.
- Compare model behavior on the same prompt across vendors.
- Track per-agent and per-tenant cost at any granularity finer than a monthly invoice.
- Update a prompt without redeploying code.
- Ship a growing roster of agents and have any hope of running them in production without each one drifting on its own.

The platform solves this with a single, centralized LLM service — one source of truth for every model call in the system.

## Architecture — One Service, Many Providers

```
┌──────────────────── Agents (a dozen-plus) ────────────────────┐
│  Intake · Triage · Reviewer · Risk · Green Zone ·    │
│  Policy · Prioritization · DPIA · LIA · Template ·    │
│  Transformation · Patent ... etc.                     │
└────────────────────────┬─────────────────────────────┘
                         │
                  ┌──────▼──────┐
                  │ LLMAuthService│   single chokepoint
                  └──────┬──────┘
            ┌────────────┼────────────┬────────────┐
            ▼            ▼            ▼            ▼
       ┌────────┐  ┌─────────┐  ┌────────┐  ┌──────────┐
       │ OpenAI │  │ Anthropic│ │ Gemini │  │ Azure    │
       │ GPT-5  │  │ Claude   │  │ Pro    │  │ OpenAI   │
       │ o3/o4  │  │ Sonnet   │  │ Flash  │  │ (regional│
       │ 4.1    │  │ 3.7/4.0  │  │        │  │  failover│
       └────────┘  │ 4.5      │  └────────┘  └──────────┘
                   └─────────┘
```

## What the Centralized Service Buys You

**Provider flexibility.** The agent says "summarize this evidence with 0.2 temperature, max 800 tokens, JSON output." The service decides which provider serves it. Switching from GPT-4.1 to Claude Sonnet 4.5 for the Reviewer Agent is a config change, not a redeploy.

**Automatic fallback.** Every call has a fallback chain. Provider primary fails → secondary picks up → tertiary as last resort. The agent layer never sees the failure unless every provider in the chain is down. Production availability is a property of the infrastructure, not of every individual agent.

**Unified interface.** Agents code against one shape. Streaming, function-calling, structured output, vision — same call shape regardless of provider. New providers (DeepSeek, Mistral, on-prem models) plug in behind the same surface.

**Cost telemetry built in.** Every call is metered with model, agent, tenant, prompt-version, input tokens, output tokens, and inferred dollar cost. The cost dashboard isn't a separate project — it's a SQL query on the call ledger.

**Hot-reloadable prompts.** Prompts live in the `prompt_configurations` table with full version history. Updating a prompt is an INSERT — no deploy, no agent restart. Roll back by pointing the agent at the previous version. A/B compare two versions live.

## Database-Backed Prompt Configurations

```sql
CREATE TABLE prompt_configurations (
  id              UUID PRIMARY KEY,
  agent_key       TEXT NOT NULL,        -- e.g., 'reviewer.privacy.prefill'
  version         INT  NOT NULL,
  prompt_template TEXT NOT NULL,        -- with {{variable}} substitution
  output_schema   JSONB,                -- enforced via function-calling / JSON mode
  model_hint      TEXT,                 -- preferred model class
  parameters      JSONB,                -- temperature, max_tokens, etc.
  is_active       BOOLEAN DEFAULT FALSE,
  author          TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  notes           TEXT
);

CREATE UNIQUE INDEX one_active_per_agent
  ON prompt_configurations(agent_key) WHERE is_active = TRUE;
```

What this enables in production:

- **Versioning without code.** A prompt engineer ships a new Reviewer prompt by inserting a new row and flipping `is_active`. Code never changes.
- **Replay with the original prompt.** Every Agent Run records the `prompt_configuration_id` it used. Replaying or auditing an old assessment uses the exact prompt that ran at the time — not whatever's current.
- **Per-tenant prompts.** Same agent, different prompt for a region with stricter regulatory expectations.
- **Per-tier prompts.** Cheaper, faster prompt for tier_3/tier_4 work; richer reasoning prompt for tier_1.

## The Agent Fleet in Production

Grouped by responsibility:

- **Assessment & Analysis** — Intake, Triage, Risk Automation, Prioritization
- **Privacy & Compliance** — DPIA, LIA, Privacy Reviewer, Data Use, Policy
- **Review & Assistance** — Reviewer (data, AI, privacy), Markdown summarizer, Pre-fill
- **Integration & Processing** — Document parser, Template Transformer, MCP server, Knowledge graph writer

Each agent has its own prompt configuration, its own preferred model, and its own evaluation harness. They all share the LLMAuthService.

## Multi-LLM Routing — Cost vs. Quality

Not every call needs the strongest model. The routing policy I shipped:

| Workload | Primary | Fallback | Why |
|---|---|---|---|
| Reviewer pre-fill (tier_1, regulatory critical) | Claude Sonnet 4.5 | GPT-5 | Strongest reasoning + citation discipline |
| Triage summary | GPT-4.1 | Claude Sonnet 4 | Balanced cost/quality, fast |
| Low-risk auto-approve narrative | Gemini Flash | GPT-4.1 | Speed-priced for high volume |
| Policy delta classification | Claude Sonnet 4.5 | GPT-5 | Long-context, legal text fluency |
| Template transformation | GPT-4.1 with Anthropic fallback | — | JSON mode reliability |
| Patent / DPIA drafting | Claude Sonnet 4.5 | GPT-5 | Long-form structured output |

The dial moves over time as models change. Because routing is config, the dial is a one-line PR, not a quarter-long migration.

## Observability and Governance

- **Per-call telemetry** — model, prompt-version, agent, tenant, latency, tokens in/out, cost, retry/fallback events.
- **Tracing** — OpenTelemetry spans per call linked to the parent Agent Run, so a single assessment's full LLM activity is one trace.
- **Cost guardrails** — per-tenant and per-agent budgets; alerts before overruns; automatic downshift to cheaper models when a tenant approaches threshold.
- **Sensitive-data scrub** — prompts are sanitized through a regex + classifier pipeline before leaving the boundary; the original input is preserved in our DB but not sent to the provider when sensitivity is high.
- **PII residency** — by configuration, certain tenants only route to in-region Azure OpenAI deployments; no cross-region call can occur.

## Why This Matters for Regulated Industries

In regulated environments — payments, healthcare, banking, critical infrastructure — the LLM call boundary is also a compliance boundary. Centralizing it means:

- One place to enforce data-handling policy (PII residency, sensitive-data scrub, BYOK).
- One place to record provenance (which model, which prompt, which version touched this regulated decision).
- One place to swap providers when geopolitics or compliance posture changes.
- One audit log to hand to an examiner.

You can't ship "AI in production" responsibly in a regulated environment without this layer. Building it once and reusing it across a dozen-plus agents is the leverage.

## Tech Stack

- **Backend** — Node.js + TypeScript, Express, TypeORM, PostgreSQL with pgvector
- **LLM providers** — OpenAI, Anthropic Claude, Google Gemini, Azure OpenAI (extensible)
- **Storage** — `prompt_configurations` table for prompts; call ledger for telemetry; Agent Run state in JSONB
- **Deployment** — Visa Kubernetes for production; Railway-hosted reference deployment

---

*Part of the AI-Driven GRC Platform — see [2025 in review](/2025/), [Agent Suite Architecture](/articles/2025-agent-suite-architecture/), and the [agentic GRC architecture deep dive](/2026-deep-dive/).*
