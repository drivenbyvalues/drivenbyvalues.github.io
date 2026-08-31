---
layout: article
title: Grounded Review Summaries — RAG with Citations You Can Trust
permalink: /articles/2026-grounded-review-summaries/
year: 2026
feature_area: GRC Platform · Retrieval & Generation
summary: Every sub-review summary is generated from retrieved evidence and cited at the claim level, with a verifier agent re-checking citations before a human ever sees them.
---

# Grounded Review Summaries for Sub-Reviews

*Year shipped: 2026 · Platform area: RAG + claim verification · Status: production*

## The Problem

A single assessment in our platform spawns several sub-reviews — Privacy, AI/ML, Affiliates, Competition, IP, Information Security. Each sub-review reads through dozens of documents (intake form, vendor attestations, architecture diagrams, prior assessments, policy guidance, model cards, code references). Reviewers were spending the majority of their cycle just reading and re-reading.

LLM summaries seemed obvious — but a hallucinated GRC summary is worse than no summary at all. A confident-sounding line that misrepresents a control or invents a data flow can survive multiple reviews and end up in a regulator-facing artifact. Trust isn't a nice-to-have here; without citation-grade accuracy, generation is a liability.

## Rationale

Three non-negotiable properties for any generated summary:

1. **Every claim cites its source.** No claim, no citation, no print.
2. **Citations are verified to support the claim.** The model cited it doesn't mean the chunk says it.
3. **Confidence is exposed.** Low-confidence claims are flagged and routed to a human, not buried in prose.

Hit those three and reviewers stop re-reading and start adjudicating — the actual judgment work humans should do.

## What We Ground Against

The retrieval corpus per assessment includes:

- **Intake artifacts** — the assessment form, requester narrative, scope declarations.
- **Evidence** — uploaded documents (PDFs, slides, design docs), linked code/config references, vendor attestations and certifications (SOC 2, ISO 27001, PCI), prior decisions on this product or vendor.
- **Policy corpus** — Data Use Policy, Responsible AI guidance, regional regulatory guidance (GDPR, CCPA, DPDP, EU AI Act), internal control library.
- **Precedent corpus** — claims, decisions, and decision traces from prior assessments, scoped by product family and review type.
- **Knowledge graph** — entities (products, vendors, data categories, controls) and their relationships, used for entity-aware retrieval.

## How RAG Works Here

```
ingest        →  chunk (semantic, ~512 tokens, with structural overlap)
              →  embed (per-corpus model choice; policy uses one tuned for legal text)
              →  store (vector index + BM25 keyword index + entity index)

query (per claim being generated)
              →  hybrid retrieve (vector + BM25 + entity-graph expansion)
              →  rerank (cross-encoder, top 8 → top 3)
              →  return chunks with stable IDs

generate (per sub-review section)
              →  prompt the model with retrieved chunks + claim template
              →  enforce citation: every sentence must reference at least one chunk_id
              →  emit Claim objects: {statement, polarity, confidence, evidence_ids}

verify        →  Verifier agent re-reads each cited chunk and answers:
                 "does this chunk actually support this exact statement?"
              →  if no, the claim is dropped or flagged low-confidence
              →  if contradiction is found in the corpus, polarity flips to raises_concern
```

The reviewer sees a structured summary where every sentence is linked to its evidence chunk, and low-confidence sentences are visually separated as "needs human verification."

## How We Make It Accurate

Accuracy isn't a single trick — it's stacked guardrails:

- **Hybrid retrieval beats pure vector** for GRC content. Policy clauses share a lot of vocabulary; BM25 catches the exact phrasing reviewers care about, vector catches paraphrase.
- **Per-corpus embeddings.** Policy text and engineering docs don't share a vector space well — different embedding choices per corpus measurably improved recall on held-out queries.
- **Reranking with cross-encoders** to push the most claim-relevant chunk to the top before generation.
- **Citation enforcement at decode time** — the prompt and the post-processor both reject any sentence without a chunk reference.
- **Verifier agent as a second reader.** It treats the citation as a hypothesis and the chunk as evidence, then answers entails / contradicts / neutral. A claim survives only when its citation entails it.
- **Polarity and confidence are first-class.** Low-confidence and contradicted claims surface to the reviewer instead of getting smoothed into the summary.
- **Evaluation harness.** A held-out set of historical assessments with reviewer-validated summaries is used to regression-test changes to chunking, retrieval, generation, or verification.

## Benefits

- **Reading time drops dramatically** — reviewers triage the structured summary instead of reading the whole evidence pack.
- **Hallucinations don't reach reviewers** — the verifier filters them before they're shown.
- **Audit trails are first-class** — regulators can replay the chain from claim → citation → source chunk.
- **Cross-review consistency** — the same evidence yields the same claims across Privacy, AI, Competition, etc., reducing contradictions between sub-reviews.

## What's Next

- **Counter-evidence retrieval** — actively search for chunks that *contradict* a candidate claim, not just support it.
- **Reviewer feedback as gold labels** — every reviewer correction becomes a labeled training pair for evaluation.
- **Multi-document reasoning** — claims that require synthesizing across two or more sources, with all sources cited.

---

*Part of the AI-Driven GRC Platform — see [2026 in review](/2026/) and the [agentic GRC architecture deep dive](/2026-deep-dive/).*
