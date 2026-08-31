---
layout: article
title: Secure Data Services — Application-Level Tokenization for Sensitive Payment Data at Scale
permalink: /articles/2019-secure-data-services/
year: 2019
feature_area: Data Platform Engineering · Security & Privacy
summary: An application-level encryption and tokenization framework that replaced clear-text card and personal data across a multi-petabyte data lake with an irreversible-looking "proxy" value — closing the field-level encryption gap left by OS- and database-level encryption alone.
---

# Secure Data Services — Application-Level Tokenization for Sensitive Payment Data at Scale

*Year shipped: 2019 · Platform area: Security & Privacy · Status: production rollout (FY20)*

## Why It Existed

A bank-card payments network's internal data platform sat on a Hadoop-and-warehouse data lake holding primary account numbers (PANs) and other personal data — accessible in usable form to anyone with legitimate access to the platform itself. Encryption at rest existed at the operating-system level and the database level, but nothing protected the data at the field level once someone with platform access actually queried it. That gap was a real risk: "legitimate access to the platform" and "should be able to read this cardholder's PAN" are not the same permission, and the architecture didn't distinguish between them.

An executive-level security mandate set the bar: encrypt sensitive data at rest with real access controls, restrict decryption to cases that are strictly necessary and approved at a senior level, and build toward two tiers of protected retention — encrypted-but-reversible now, irreversibly de-identified later. A parallel privacy program (GDPR-driven, then extended for CCPA) depended on this same encryption layer to do jurisdiction-aware data-subject request handling, PI-flow scanning, and retention correctly.

## What It Does

The core idea is a tokenization pattern: every PAN is replaced with a **PAN Proxy** — a deterministic, application-level ciphertext produced through a shared framework, so the same input PAN always yields the same proxy value everywhere it appears. That determinism matters: systems that only ever need to join or aggregate on account identity, not read the actual card number, never need the real PAN at all, and nothing downstream has to decrypt-then-re-encrypt as data moves between systems.

The design rules were explicit and are worth stating because they generalize to any tokenization system:

- The proxy must map 1:1 to the real value — no collisions, and a reverse lookup must exist for the narrow cases that need it.
- The proxy must never be joinable against outside data, must never be shared externally, and must be visually distinguishable from a real PAN at a glance.
- The real value and its proxy must never live in the same data store.
- The same infrastructure protects other sensitive personal fields, not just PANs.
- Exposure of cryptographic key material — and of the sensitive values themselves — to calling applications is minimized by design.

On top of the base tokenize/detokenize operation, the service supported batch operations, account-range queries that still worked even when a range was split across systems, and pattern-style range queries (equivalent to SQL `LIKE '412345%'`) directly against tokenized values — the kind of capability that's easy to lose when you naively encrypt a field and hard to get back afterward.

## Two Consumption Modes

**Local mode.** The cryptographic library runs embedded on the calling application's own host. The application authenticates to an internal key-management service, pulls encryption keys, expands them to working keys held in memory (the base keys themselves are purged after that), and refreshes them on a schedule. This mode is explicitly **disallowed on general-purpose shared compute clusters** — too many co-tenants, too much blast radius if a host is compromised — and permitted only on a short list of security-reviewed, dedicated nodes.

**Remote mode.** For applications outside the trusted network boundary, or wherever local mode's risk profile isn't acceptable, the calling application instead authenticates to a gateway and calls a web service API. The crypto operation happens inside the service; the caller never touches key material at all.

## Architecture

```
                 ┌────────────────────────────┐
   Local Mode    │  Application (embedded lib) │
   ───────────►  │  - pulls keys from KMS      │
   (dedicated,   │  - keys expanded in-memory   │
   reviewed      │  - keys purged/refreshed     │
   nodes only)   └──────────────┬──────────────┘
                                 │
   Remote Mode    ┌──────────────────────────────┐
   ───────────►   │  Secure Data Web Service      │
   (general apps, │  - auth via mutual TLS/allow- │
   outside trust  │    listing at the gateway     │
   boundary)      │  - performs crypto op remotely│
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                 ┌────────────────────────────┐
                 │   Tokenization Engine        │
                 │   AES-256, deterministic     │
                 │   PAN ⇄ PAN Proxy             │
                 └───────┬───────────┬──────────┘
                         │           │
                         ▼           ▼
              ┌────────────────┐  ┌─────────────────────┐
              │ Secure Data     │  │  Async Messaging      │
              │ Repository      │  │  → access-log store    │
              │ (never stores   │  │  (audit trail)          │
              │  plaintext)     │  └─────────────────────┘
              └────────────────┘

                 ┌────────────────────────────┐
                 │  Key Management Service      │
                 │  issues/rotates DEKs,        │
                 │  backed by an HSM             │
                 └────────────────────────────┘
```

## Key Decisions

**Application-level tokenization as an explicit third layer.** OS-level and database-level encryption at rest were already in place; this added a field-level layer on top rather than assuming infrastructure encryption was sufficient. Defense in depth, deliberately layered.

**Local mode banned on shared clusters, by policy.** Rather than trust every application equally, the design drew a hard line: general-purpose shared compute never gets local key material, full stop, with narrow, individually security-reviewed exceptions. Remote mode — no key material ever leaving the service — was the default for everything else.

**Key rotation was event-driven, not scheduled.** At petabyte scale, routinely re-encrypting the entire lake on a calendar cadence wasn't operationally realistic. Rotation was instead triggered by a compromised key, a confirmed breach, or a hardware migration — a pragmatic, explicitly-acknowledged tradeoff against textbook periodic-rotation guidance.

**Reversible tokenization now; irreversible de-identification deferred.** Rather than try to solve both "protect it" and "eventually make it unrecoverable" at once, the team shipped the reversible tokenization layer first and scoped irreversible de-identification as a follow-on effort coordinated with the separate data-retention program.

**A shift in regulatory posture changed the authentication model.** Moving from a "processor" self-conception to a "business/controller" one under evolving US privacy law changed what counted as adequate identity verification for a data-subject request — pushing toward direct verification of the individual rather than leaning on an intermediary relationship.

**Bought the privacy case-management front end; kept evaluating build-vs-buy on identity verification.** A commercial privacy-rights-request platform was purchased rather than built in-house for the request-handling front end, while the harder, more bespoke problem — verifying that a data-subject requester really is who they claim to be — stayed under active build-vs-buy evaluation.

## Why This Matters

Tokenization-of-sensitive-fields, key custody behind an HSM, and a hard local-vs-remote consumption boundary are standard patterns in any environment handling regulated payment or personal data at scale — they show up under different names in PCI DSS-adjacent architectures industry-wide. What's harder to get right, and what this project had to actually work through, is the operational reality behind the pattern: what happens to "rotate your keys periodically" when your dataset is measured in petabytes; how you keep range and pattern queries usable on data that's now encrypted; and how a shift in a company's own regulatory self-classification cascades into a concrete change in how you verify a human being on the other end of a privacy request. Those are the details that separate a tokenization diagram from a tokenization system that survives an audit.

## Tech Stack

- **Cryptography** — AES-256 (CBC mode), deterministic tokenization, URL-safe Base64 ciphertext
- **Key management** — dedicated key-management service backed by a hardware security module (HSM)
- **Storage** — HBase-backed token repository (never plaintext), async audit logging to HDFS
- **Messaging** — Kafka for asynchronous log/index writes
- **Auth** — mutual TLS / IP allow-listing at the remote-mode gateway
- **Privacy tooling** — commercial data-subject-request case management, integrated with an internal rules engine for jurisdiction-specific handling

---

*Part of a series on the as-a-service compute and data platform built for a global payments network — see [Spark-as-a-Service](/articles/2020-spark-as-a-service/) for the compute platform that this encryption and de-identification work later ran on as first-class batch workloads.*
