---
layout: article
title: The Agent Suite — A Governance Operating System for Assessments
permalink: /articles/2025-agent-suite-architecture/
year: 2025
feature_area: GRC Platform · Multi-Agent System Design
summary: Seven coordinated agents (Intake, Triage, Risk Automation, Green Zone, Reviewer, Policy, Prioritization) operate on a shared governance vocabulary with explicit feedback loops — designed to behave as a coherent system, not a bag of tools.
---

# The Agent Suite — A Governance Operating System for Assessments

*Year shipped: 2025 · Platform area: Multi-agent orchestration · Status: production*

## Why a Suite, Not a Bag of Tools

Most "AI in GRC" deployments ship a chat assistant or a single classifier and call it a day. That breaks at scale because governance has more than one decision: structure the intake, triage the evidence, decide automation vs. escalation, route the work, surface domain risks, refresh policies as the world changes. Each one is its own AI problem with its own failure modes.

The bet I made: design these as a **suite** — seven agents that share a common data model, a common signal bus, and explicit hand-offs. The system value is in the coordination, not in any individual agent.

## The Seven Agents

| Agent | Role | Primary Output |
|---|---|---|
| **Intake Agent** | Captures and structures the initial assessment, dynamic questionnaires, AI coaching | Structured assessment + initial complexity/risk signals |
| **Triage Agent** | Joint analysis of form + uploaded documents (PPT/PDF/DOCX) | Triage summary, signals, recommended workflow |
| **Risk Automation Agent** | Applies scoring rubric → low/high risk decisions | Auto-approval (low risk), escalation (high risk), or grey-zone routing |
| **Green Zone Agent** | Maps assessments to reusable governance envelopes authored by stewards | Zone fit score + conditions + escalation when out-of-zone |
| **Reviewer Agent** | Domain-aware co-pilot for human reviewers (data, AI, privacy) | Pre-filled fields + structured markdown notes |
| **Policy Agent** | Continuously diffs external regulations against internal policies | Detected deltas, suggested redlines, impacted owners |
| **Prioritization Agent** | Multi-dimensional scoring of the queue (risk × urgency × impact × complexity) | Ranked work for human reviewers |

## Shared Governance Vocabulary

Every agent speaks the same language. Signals are first-class typed values, not free-text:

- **Risk score** — multi-dimensional rubric (operational, reputational, data sensitivity, competitive).
- **Complexity** — drives template depth and triage path.
- **Data categories** — taxonomy aligned to internal Data Use Policy and regulatory frameworks (GDPR Art. 9 special categories, GLBA NPI, HIPAA PHI, etc.).
- **Green zone assignment** — pointer to a steward-authored governance envelope.
- **Policy obligations** — atomic obligations with effective dates and applicability conditions.
- **Triage outcome** — fast-track, standard review, deep dive, escalate.
- **Priority score + tier** — tier_1 through tier_4 with capacity-aware ranking.

This vocabulary is the contract. An Intake Agent change doesn't break the Reviewer Agent because both agree on what `data_sensitivity = "high"` means.

## Explicit Feedback Loops

A static governance system rots. The suite is wired with feedback so it improves with use:

- **Policy → Templates** — a Policy Agent delta updates intake templates and triage expectations automatically. New regulator guidance becomes new questions on the next assessment.
- **Reviewer findings → Risk thresholds** — when reviewers consistently override an auto-approval, the Risk Automation Agent's threshold or rule gets flagged for tuning.
- **Reviewer findings → Green zones** — repeated escalations of the same archetype seed a new Green Zone proposal for stewards to review.
- **Prioritization analytics → Policy gaps** — patterns in escalations surface where new policy or new green zones are needed.

These loops make the suite **adaptive and self-improving** without giving up control — every loop ends in a human decision (steward, reviewer, owner).

## Architecture

```
[User Channels]
  • Web forms and workflows
  • Chat / MCP interfaces
  • Document uploads
        │
        ▼
[Intake Agent]   ── dynamic assessments, AI coaching, complexity/risk signals
        │
        ▼
[Triage Agent]   ── joint form + document analysis, triage summary
        │
        ▼
[Risk & Routing Layer]
  • Risk Automation (low/high decisions)
  • Green Zone (envelope mapping)
  • Prioritization (multi-factor queue)
        │
        ▼
[Reviewer Layer]
  • Reviewer Agent (pre-fill + markdown notes)
  • Domain-specific queues (privacy, security, AI governance, legal)
        │
        ▼
[Policy & Learning Layer]
  • Policy Agent (external delta detection)
  • Updates templates, thresholds, rules
        │
        ▼
[Core GRC Platform]
  • Shared data model, event bus
  • Workflow engine, task management
  • Audit logging, analytics
```

## What Makes This System Design Scale

- **Modular but coordinated.** Each agent can be deployed, configured, or replaced independently. The shared schema and event bus mean adding an eighth agent doesn't require rewiring the other seven.
- **Bounded LLM scope per agent.** LLMs do scoring, parsing, drafting; deterministic layers make the actual workflow decisions. This pattern repeats across every agent — not one place where the LLM is in charge.
- **Stateful Agent Runs.** Every assessment travels as a stateful Agent Run with an event-sourced log. Re-running, re-scoring, and replay are first-class.
- **Audit by construction.** Every signal carries provenance — which agent produced it, which prompt version, which evidence chunks supported it. Regulators can trace any decision end-to-end.

## Responsible AI in a Regulated Industry

Financial services governance can't tolerate "the AI decided." The suite is designed so AI **assists** and humans (or deterministic policy) **decide**:

- The Risk Automation Agent has hard exclusions that no prompt can override (children's data, automated decisioning, regulated AI use cases).
- The Green Zone Agent only proposes a zone — a steward approves.
- The Reviewer Agent generates pre-fills clearly tagged AI-suggested vs. human-edited; the audit trail records every accept/modify/reject.
- The Policy Agent surfaces deltas; no policy update lands without the policy owner's explicit accept.

The pattern travels: this same suite shape works for any regulated industry where AI assistance must operate inside a hard policy boundary — payments, healthcare, banking, critical infrastructure, public sector.

## What the Inventor's System-Level Role Looked Like

- Defined the role and responsibility of each agent in the lifecycle.
- Designed the shared schemas, signals, and events that let the agents exchange meaning.
- Specified the feedback loops and the propagation rules between agents.
- Configured prompts, thresholds, and templates so agents operate consistently across deployments.

The invention isn't any one agent. The invention is the orchestration and shared design that makes the suite behave as a coherent governance operating system.

---

*Part of the AI-Driven GRC Platform — see [2025 in review](/2025/), [Multi-Provider LLM Infrastructure](/articles/2025-llm-infrastructure/), [Knowledge Graph for Cross-Agent Context](/articles/2025-knowledge-graph/), and the [agentic GRC architecture deep dive](/2026-deep-dive/).*
