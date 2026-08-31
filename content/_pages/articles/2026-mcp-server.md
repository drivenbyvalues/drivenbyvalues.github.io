---
layout: article
title: MCP Server — Natural Language to Structured Assessments
permalink: /articles/2026-mcp-server/
year: 2026
feature_area: GRC Platform · Model Context Protocol
summary: A Model Context Protocol (MCP) server that turns free-form natural language descriptions into fully structured, validated, JWT-authenticated assessments — with provenance, confidence scores, and reviewer overrides preserved end-to-end.
---

# MCP Server — From Natural Language to a Filed Assessment

*Year shipped: 2026 · Platform area: MCP integration · Status: production*

## Why MCP

Most users don't want to fill a 20-page form. They want to describe what they're building and have the assessment come together around them. The Model Context Protocol (MCP) is the right surface for that — any MCP-aware client (Claude Desktop, an internal copilot, an IDE extension) can speak to the platform without bespoke integration work.

The MCP server is the conversational entry point to the GRC platform. Talk through the product. The server turns words into a structured, schema-valid, audit-ready assessment record on the backend.

## What the Server Does

- **Natural language → structured assessment.** Free-form input is parsed into the platform's typed assessment schema with all required fields populated.
- **Backend integration.** The structured payload is submitted to the GRC backend through the same authenticated APIs the web UI uses; no shadow path.
- **Metadata enrichment.** The submission carries AI-generated insights, per-field confidence scores, and reasoning text.
- **Authentication.** Every call is JWT-authenticated; the user identity flows from the MCP client through to the backend audit log.
- **Provenance.** Every populated field records its source phrase from the original input, the prompt version that mapped it, and the confidence the model attached to it.

## Conversation Shape

```
User: "We're shipping a customer-support chatbot built on Claude Sonnet,
       hosted in our EU region for European customers only. It will read
       past tickets but never generate decisions on its own — it just
       drafts replies for agents to review."

MCP Server (Intake Agent + Language Interpreter):
  → identifies: GenAI use, customer-support domain, EU residency,
                Claude Sonnet model, augmentation pattern (not autonomous),
                training-on-historical-tickets data flow.

  → maps to assessment schema:
     • use_case: "GenAI for customer support agent assistance"
     • ai_category: "GenAI"
     • model_provider: "Anthropic" / model: "Claude Sonnet"
     • data_residency: ["EU"]
     • data_subjects: ["customers (EU)"]
     • automated_decisioning: false
     • training_data: ["historical support tickets"]

  → confidence: roughly 0.9 overall;
                automated_decisioning around 0.85
                (flagged for reviewer confirmation).

  → submits to GRC backend; assessment created;
    triage agent routes appropriately.

  → returns: assessment_id, list of fields,
    any low-confidence items needing human confirmation.
```

The user types one paragraph; the platform gets a real, complete record.

## Architecture

```
[MCP Client]                              [GRC Platform]
 Claude Desktop / IDE / Internal copilot
        │
        │  MCP tool call (JWT)
        ▼
 ┌────────────────────────────┐
 │ MCP Server                 │
 │  • tool: create_assessment │
 │  • tool: explain_field     │
 │  • tool: list_templates    │
 └─────────┬──────────────────┘
           │
           ▼
 ┌────────────────────────────┐
 │ Language Interpreter Agent │  ←── Multi-Provider LLM Infrastructure
 │  - parses NL input          │      (one source of truth)
 │  - extracts entities        │
 │  - maps to schema           │
 │  - emits confidence per fld │
 └─────────┬──────────────────┘
           │
           ▼
 ┌────────────────────────────┐
 │ Validation + Mapping       │
 │  - required fields gate     │
 │  - cross-field consistency  │
 │  - schema constraint check  │
 └─────────┬──────────────────┘
           │
           ▼
 ┌────────────────────────────┐
 │ GRC Backend API (JWT)      │
 │  - same endpoints as the UI │
 │  - audit log + provenance   │
 └────────────────────────────┘
```

## What Makes It Production-Grade

**Bounded LLM scope.** The LLM extracts and maps. It does not decide which assessment template to use — that's a deterministic match against template metadata. It does not decide whether to submit — the validation gate does. It does not decide auto-approval — the [Risk Automation Agent](/articles/2025-agent-suite-architecture/) does. The MCP server is a smart input layer, not a decision layer.

**Validation gates before submission.** Required fields must be present. Cross-field consistency rules fire (e.g., "model type implies required AI governance questions"). Low-confidence fields are flagged, not silently submitted. The MCP returns a structured "needs human confirmation" payload that the client can render as a confirmation dialog.

**Provenance at field level.** For every populated field, the record includes:

```
{
  "field": "data_subjects",
  "value": ["customers (EU)"],
  "source_phrase": "European customers only",
  "prompt_version": "intake.nl_extract.v17",
  "confidence": 0.9,
  "ai_suggested": true,
  "human_edited": false
}
```

When a reviewer or regulator asks "where did this answer come from?" — every field has a real answer.

**JWT-bound identity.** The MCP client authenticates the user; the JWT flows through the server to the backend; every audit log entry shows the human, not "MCP server." No service-account anonymity.

**Confidence shown to users.** The MCP response includes per-field confidence so clients can show users what the system is unsure about. Manual override is always available — and overrides are recorded with the same provenance shape.

**Graceful errors.** Connection failures, auth errors, and incomplete extraction each return a structured error type the client can react to. Nothing fails silently.

## Why This Matters for Regulated Industries

- **Same surface, same controls.** MCP submissions go through the exact same APIs as the web UI. Every control (authN, authZ, audit logging, sensitive-data redaction, residency) applies. No shadow path.
- **Identity flows end-to-end.** Regulators expect the human to be on the audit trail, not a service account.
- **Confidence is part of the record.** Auto-populated fields are tagged with their confidence and accept/override history. "The AI said so" is never the explanation; the human sign-off + the confidence + the prompt version are.
- **Replay-able.** Re-running a past assessment with the original prompt version and the original input produces the same structured payload. Auditors can reproduce.

## Best Practices When Integrating

For MCP clients consuming this server:

- **Provide clear descriptions.** Extraction quality tracks input clarity; the server doesn't paper over vague intent.
- **Show confidence scores.** Especially on low-confidence fields. Don't auto-submit on the user's behalf.
- **Allow manual overrides.** Always. Capture them as edits with the same provenance shape.
- **Validate responses.** Verify the structured payload before submitting downstream actions.
- **Handle errors gracefully.** Connection refused, auth error, incomplete extraction — each has a recovery path.

## Tech Stack

- **Protocol** — Model Context Protocol over JSON-RPC
- **Runtime** — Node.js + TypeScript MCP server
- **Auth** — JWT with same identity service as the web UI
- **AI** — routed through the platform's [Multi-Provider LLM Infrastructure](/articles/2025-llm-infrastructure/)
- **Backend** — same GRC APIs the web UI consumes; no parallel data path

---

*Part of the AI-Driven GRC Platform — see [2026 in review](/2026/), [Grounded Review Summaries](/articles/2026-grounded-review-summaries/), and the [agentic GRC architecture deep dive](/2026-deep-dive/).*
