---
layout: article
title: Knowledge Graph for Cross-Agent Context — Institutional Memory That Compounds
permalink: /articles/2025-knowledge-graph/
year: 2025
feature_area: GRC Platform · Knowledge Graph
summary: Every Agent Run reads from and writes to an organizational knowledge graph — departments, products, data categories, risk patterns, controls, and precedents — so each new assessment starts with the lessons of every previous one.
---

# Knowledge Graph for Cross-Agent Context

*Year shipped: 2025 · Platform area: Cross-agent memory · Status: production*

## The Problem with Stateless AI

A single assessment is a thin context. The model sees the form, the uploaded docs, maybe the policy library, and that's it. It doesn't know:

- That the HR department's last seven AI tools all surfaced bias risks.
- That this specific vendor failed a security review eight months ago for a reason directly relevant to the new ask.
- That the controls "regular bias audits" and "human-in-the-loop sign-off" worked in similar past cases.
- That a sibling assessment in the same product line was just escalated to deep dive.

Without that context, every assessment starts from zero. With it, the system gets smarter every week.

## The Graph

Two simple tables back the whole thing:

```
knowledge_nodes:
  id, type, content, embedding, metadata { source, confidence, lastVerified }

knowledge_edges:
  from, to, relationship, strength, last_observed_at
```

Node types in production:

- **policy** — atomic policy clauses with effective dates
- **control** — reusable mitigations (encryption-at-rest, bias audit, opt-out, retention cap, etc.)
- **risk** — recurring risk archetypes (re-identification, biased decisioning, vendor lock-in)
- **entity** — products, business units, departments, vendors, data categories, jurisdictions
- **precedent** — frozen snapshots of completed assessments with their decisions and rationale

Edge relationships: `implements`, `mitigates`, `conflicts_with`, `relates_to`, `precedent_of`, `produces_risk`, `applies_in`.

Every node has an embedding — semantic search across the whole graph in one query. Every edge has a `strength` and `last_observed_at` so weak/old links can be down-weighted.

## How AI Analysis Writes to the Graph

When the AI Analysis Agent runs on an assessment, it doesn't just emit findings — it deposits structured context:

```
Assessment: "Employee Performance AI Tool"
AI Analysis identifies:
  • Bias risks (in employee profiling)
  • Employee monitoring concerns

Writes to graph:
  + entity: HR department (or strengthens existing edge)
  + entity: Personal data → employee profiling category
  + risk: Bias in AI-driven HR decisions
  + edge: HR_department --produces_risk--> Bias_in_AI_HR (strength += 1, last_observed_at = now)
  + edge: Employee_Performance_AI --instance_of--> AI_HR_tool_archetype
```

Multiply that across thousands of assessments and the graph stops being trivia and starts being the organization's institutional memory.

## How the DPIA Agent Reads the Graph

When a new DPIA starts on "HR Chatbot for Leave Requests," the agent enriches its context **before** generation:

```
Knowledge Graph provides:
  • "HR dept produces bias risks a majority of the time it's involved (seen across several past cases)"
  • Suggested controls: "Regular bias audits (confidence: ~0.9)"
                      : "Human-in-the-loop sign-off (confidence: ~0.85)"
  • Related policies: GDPR Art. 35, Internal AI Ethics Policy §4.2
  • Precedent: a handful of similar HR-chatbot DPIAs from the past year — most approved with conditions, one deep-dive

Result: DPIA enriched with organizational patterns and proven controls
        before any LLM generation happens.
```

That enrichment goes into the prompt as structured grounding. The DPIA the agent writes is **conditioned on** the graph — not just on the assessment intake.

## What This Unlocks

**Institutional memory.** A reviewer who joined six months ago has access to every precedent the system has ever seen. The graph remembers what people leave.

**Pattern detection.** "HR dept produces bias risks a majority of the time it's involved" was never a hand-coded rule — it emerged from the edges. The Risk Automation Agent uses the same pattern to escalate before a reviewer has to find it.

**Semantic search across precedent.** When the Reviewer Agent needs "similar past assessments," it does a hybrid retrieve (vector + entity-graph expansion) on the precedent corpus. Different terminology doesn't break the lookup — `LLM` matches `large language model` matches `generative AI`.

**Contradiction detection.** Two policies that say different things about retention end up as a `conflicts_with` edge. The Policy Agent surfaces it for resolution before it becomes a regulator finding.

**Cross-reference analysis.** "This AI system is similar to three others we approved" is a graph traversal, not a memory exercise.

## Why This Architecture Scales

- **Pluralistic, not monolithic.** Multiple agents write to the graph; multiple agents read from it. No single owner. The graph is the bus.
- **Embedding + relational together.** Vector search for paraphrase robustness; graph traversal for explicit relationships. Each compensates for the other's blind spot.
- **Confidence-weighted, time-decayed.** Old, weakly-observed edges naturally fade. Recent, repeatedly-observed edges dominate. The graph stays current without a manual purge.
- **Auditable.** Every node and edge has a `source` and `last_verified` field. A regulator asking "how did the system know this?" gets a real answer.

## Responsible AI in a Graph

Three guardrails matter for regulated environments:

1. **No protected-attribute inference.** The graph stores observable characteristics (department, system, vendor, data category, region) — not inferred protected attributes. We don't write `inferred_demographic` edges, ever.
2. **Right-to-be-forgotten propagation.** Erasure requests delete the source nodes and any edges anchored to them, with a tombstone preserved for audit. The graph doesn't become a privacy back door.
3. **Human-in-the-loop on high-risk patterns.** When a graph-detected pattern would change a decision (escalate, auto-approve, change a control set), the change is surfaced to a reviewer with the pattern shown — not silently applied.

## Tech Stack

- **Storage** — PostgreSQL with `pgvector` for embeddings; relational tables for nodes/edges; JSONB for flexible metadata
- **Retrieval** — hybrid (vector + BM25 + graph expansion) with reranking
- **Writers** — every agent in the [agent suite](/articles/2025-agent-suite-architecture/)
- **Readers** — DPIA, LIA, Reviewer, Risk Automation, Green Zone, Prioritization agents

---

*Part of the AI-Driven GRC Platform — see [2025 in review](/2025/), [Agent Suite Architecture](/articles/2025-agent-suite-architecture/), [Multi-Provider LLM Infrastructure](/articles/2025-llm-infrastructure/), and the [agentic GRC architecture deep dive](/2026-deep-dive/).*
