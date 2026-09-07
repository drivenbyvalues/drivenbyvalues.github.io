---
layout: resume
title: Articles | Harish Raghavendra
permalink: /articles/
---

<header class="hero">
  <div class="hero-shell">
    <div class="hero-body">
      <p class="hero-kicker"><i class="fas fa-feather-alt"></i> Articles · Deep Dives</p>
      <h1 class="hero-title">AI-Driven GRC, multi-agent system design, and responsible AI in regulated industries</h1>
      <p class="hero-lede">
        Long-form writeups of features, architectures, and patterns I designed and shipped on the AI-Driven GRC Platform.
        Each article covers <strong>why it was needed</strong>, <strong>how it works under the hood</strong>, and the
        <strong>responsible-AI controls</strong> that make it production-grade in a regulated environment.
      </p>
      <div class="hero-metrics">
        {% include components/metric-card.html value="27" label="long-form deep dives" %}
        {% include components/metric-card.html value="16+" label="AI agents covered" %}
        {% include components/metric-card.html value="4" label="LLM providers integrated" %}
      </div>
    </div>
  </div>
</header>

<section class="section section-articles">
  <div class="section-header">
    <h2 class="section-title">Perspectives</h2>
    <p class="section-subtitle">Opinion and policy commentary — outside the GRC platform work, on where I think broader industry and investment strategy is heading.</p>
  </div>
  <div class="article-grid">
    <a class="article-card" href="{{ '/articles/2026-americas-single-bet/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-globe-asia"></i> Industrial Policy</span>
      <h3 class="article-card__title">America's Single Bet vs. China's Many — The Case for a New GI Bill Moment</h3>
      <p class="article-card__lede">A Unitree robot's backflip is the small story. The bigger one: China diversifying across robotics, energy, EVs, rare earths, debt leverage, education, and infrastructure while American capital concentrates on one AI bet — and what a 2026 GI Bill could do about it.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
  </div>
</section>

<section class="section section-articles">
  <div class="section-header">
    <h2 class="section-title">Personal Projects</h2>
    <p class="section-subtitle">Built and deployed outside of Visa, as learning vehicles and proof-of-concept platforms.</p>
  </div>
  <div class="article-grid">
    <a class="article-card" href="{{ '/articles/2026-namma-seva-hyperlocal-marketplace/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-store"></i> Hyperlocal Marketplace</span>
      <h3 class="article-card__title">NammaSeva — Connecting Rural and Small-Town India to Trusted Local Service Providers</h3>
      <p class="article-card__lede">A four-party platform — Customer, Pro, Town Administrator, and a cross-town Platform Admin layer — where each locality runs and incentivizes its own local economy while a central layer aggregates visibility across all of them: voice/AI intake, vendor matching &amp; quoting, milestone-based execution, and an AI Goal Planner matching ideas to real government subsidies.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-healthspan-ai-longevity-dashboard/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-heart-pulse"></i> Longevity Tracking</span>
      <h3 class="article-card__title">HealthSpan AI — A Personal Longevity Dashboard Built on a Deterministic Health Model</h3>
      <p class="article-card__lede">A household health dashboard that runs a deterministic, publicly-anchored longevity model over your workouts, biometrics, and nutrition, then uses AI strictly to explain the numbers and parse messy inputs — never to compute them.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-myyaatra-memory-platform/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-scroll"></i> Memory Preservation</span>
      <h3 class="article-card__title">MyYaatra — A Platform to Document a Life So It Can Be Passed Down</h3>
      <p class="article-card__lede">A structured memory and life-journey platform — guided oral-history interviews, AI-generated narratives, and family collaboration — built to turn scattered memories into something a future generation could actually read.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
  </div>
</section>

<section class="section section-articles">
  <div class="section-header">
    <h2 class="section-title">Data Platform Engineering · 2019–2023</h2>
    <p class="section-subtitle">Self-service PaaS, big-data compute/storage, streaming infrastructure, ML platforms, and field-level security — built for a global payments network's internal data platform organization.</p>
  </div>
  <div class="article-grid">
    <a class="article-card" href="{{ '/articles/2020-parsec-self-service-paas-portal/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-layer-group"></i> Self-Service Platform</span>
      <h3 class="article-card__title">Parsec — A Self-Service PaaS Portal for a Multi-Petabyte Data Platform</h3>
      <p class="article-card__lede">A self-service PaaS controller framework that turned ad-hoc, manually-managed big-data infrastructure into a fleet of 9,000+ automated agents, cutting onboarding time by roughly 400x and becoming the shared portal every other platform service was built on.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2021-tusker-core-big-data-distribution/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-database"></i> Distributed Systems</span>
      <h3 class="article-card__title">Tusker — Building a Self-Supported, Open-Source Core Hadoop Distribution</h3>
      <p class="article-card__lede">How a payments network's data platform organization replaced a vendor-supplied Hadoop distribution with a self-built, self-patched, open-source core — and the crises (data-center power, NameNode scaling, a COVID-era hiring ramp) that shaped how it actually got built.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2020-presto-trino-interactive-query/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-bolt"></i> Query Infrastructure</span>
      <h3 class="article-card__title">Presto to Trino — Low-Latency Interactive SQL Over a Multi-Petabyte Data Lake</h3>
      <p class="article-card__lede">How a low-latency Presto (later Trino) query engine was layered onto a multi-petabyte, self-supported Hadoop distribution to cut interactive query wait times, and rode out the project's rebrand from Presto to Trino without disrupting hundreds of active users.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2020-kafka-as-a-service/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-stream"></i> Streaming Infrastructure</span>
      <h3 class="article-card__title">Kafka-as-a-Service — Consolidating Dozens of Siloed Clusters into a Self-Service Streaming Platform</h3>
      <p class="article-card__lede">An internal Kafka-as-a-Service platform, built on the open-source Confluent distribution instead of vendor-licensed Kafka, that turned 20+ independently-run clusters into a self-service, "bring your own machines" streaming platform with automated provisioning, security, and operations.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2020-spark-as-a-service/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-microchip"></i> Compute Infrastructure</span>
      <h3 class="article-card__title">Spark-as-a-Service — Decoupling Compute from Storage on a Multi-Petabyte Data Lake</h3>
      <p class="article-card__lede">A Kubernetes-based Spark compute platform that disaggregated compute from storage on a multi-petabyte Hadoop data lake — letting users spin up Spark environments on demand and reach across multiple Kerberized HDFS clusters without copying data.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2020-infrastructure-as-a-service/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-server"></i> Infrastructure Automation</span>
      <h3 class="article-card__title">Infrastructure-as-a-Service — Automating the Foundational Layer Under Every Data Platform Service</h3>
      <p class="article-card__lede">The container platform, storage, CI/CD, and on-demand database and data-movement services that sat underneath every other self-service product on the data platform — the unglamorous automation layer that made everything above it possible.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2019-mlp-machine-learning-platform/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-brain"></i> ML Infrastructure</span>
      <h3 class="article-card__title">MLP — A Self-Service Machine Learning Platform for Notebooks, GPUs, and Kubernetes</h3>
      <p class="article-card__lede">A fully managed, multi-tenant PaaS for model building — Kubernetes-hosted GPU infrastructure, notebook-as-a-service, and standardized environments — that replaced fragmented, single-server data science tooling and cut a flagship fraud-scoring model's training time from 8 days to 30 minutes.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2019-secure-data-services/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-shield-alt"></i> Security & Privacy</span>
      <h3 class="article-card__title">Secure Data Services — Application-Level Tokenization for Sensitive Payment Data at Scale</h3>
      <p class="article-card__lede">An application-level encryption and tokenization framework that replaced clear-text card and personal data across a multi-petabyte data lake with an irreversible-looking "proxy" value — closing the field-level encryption gap left by OS- and database-level encryption alone.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2023-merchant-data-platform-entity-model/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-project-diagram"></i> Entity Modeling</span>
      <h3 class="article-card__title">Reimagining a Global Merchant Data Platform — From a Fixed Hierarchy to a Flexible Entity Graph</h3>
      <p class="article-card__lede">How a global payments network's merchant data platform moved from a rigid three-level Store/Brand/Enterprise hierarchy to a flexible, n-level entity model — adding new participant types, region-first administration, and near-real-time ingestion.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
  </div>
</section>

<section class="section section-articles">
  <div class="section-header">
    <h2 class="section-title">Foundations · 2025</h2>
    <p class="section-subtitle">The platform's coordination model, AI infrastructure, and cross-agent memory.</p>
  </div>
  <div class="article-grid">
    <a class="article-card" href="{{ '/articles/2025-agent-suite-architecture/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-layer-group"></i> System Design</span>
      <h3 class="article-card__title">The Agent Suite — A Governance Operating System</h3>
      <p class="article-card__lede">Seven coordinated agents (Intake, Triage, Risk Automation, Green Zone, Reviewer, Policy, Prioritization) on a shared vocabulary with explicit feedback loops — designed as a coherent system, not a bag of tools.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2025-llm-infrastructure/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-network-wired"></i> AI Infrastructure</span>
      <h3 class="article-card__title">Multi-Provider LLM Infrastructure for 16+ Agents</h3>
      <p class="article-card__lede">A single LLMAuthService routes 16+ specialized agents across OpenAI, Anthropic, Gemini, and Azure OpenAI with automatic fallback, database-backed prompt versioning, and built-in cost telemetry.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2025-knowledge-graph/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-project-diagram"></i> Cross-Agent Memory</span>
      <h3 class="article-card__title">Knowledge Graph — Institutional Memory That Compounds</h3>
      <p class="article-card__lede">Every Agent Run reads from and writes to an organizational graph of departments, products, data categories, risks, controls, and precedents — so each new assessment starts with the lessons of every previous one.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2025-intelligent-assignment/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-route"></i> Routing</span>
      <h3 class="article-card__title">Intelligent Assignment Engine</h3>
      <p class="article-card__lede">Auto-routes each assessment to the best reviewer using a transparent score that blends product, business unit, and skill fit with workload — with configurable knobs to tune the quality-vs-fairness trade-off per review type.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2025-continuous-auto-prioritization/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-stream"></i> Risk Engine</span>
      <h3 class="article-card__title">Continuous Auto-Prioritization</h3>
      <p class="article-card__lede">Re-scores every open assessment whenever its facts change (new evidence, scope mutation, contradicted claim, deadline shift), with hysteresis bands and cool-downs to avoid priority whiplash.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2025-travel-insights-ai/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-plane"></i> Analytics Platform</span>
      <h3 class="article-card__title">Travel Insights AI Platform — Analytics Dashboard for Airline Intelligence</h3>
      <p class="article-card__lede">Comprehensive analytics dashboard with React and TypeScript providing real-time insights into airline performance, route analytics, business metrics, and AI-powered travel trend analysis.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
  </div>
</section>

<section class="section section-articles">
  <div class="section-header">
    <h2 class="section-title">Advanced Capabilities · 2026</h2>
    <p class="section-subtitle">Grounded RAG, MCP, responsible-AI patterns, schema transformation, and privacy reviews.</p>
  </div>
  <div class="article-grid">
    <a class="article-card" href="{{ '/articles/2026-grounded-review-summaries/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-link"></i> RAG · Citations</span>
      <h3 class="article-card__title">Grounded Review Summaries — RAG with Citations You Can Trust</h3>
      <p class="article-card__lede">Every sub-review summary is generated from retrieved evidence with citations on every claim. Hybrid retrieval (vector + BM25 + entity graph) feeds a Verifier agent that re-checks each citation actually entails the claim before a human ever sees it.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-mcp-server/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-plug"></i> MCP · Protocol</span>
      <h3 class="article-card__title">MCP Server — Natural Language to Structured Assessments</h3>
      <p class="article-card__lede">A Model Context Protocol server that turns free-form descriptions into fully structured, JWT-authenticated assessments — with provenance, per-field confidence, and reviewer overrides preserved end-to-end.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-green-zone-agent/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-shield-alt"></i> Responsible AI</span>
      <h3 class="article-card__title">Green Zone Agent — Reusable Governance Envelopes</h3>
      <p class="article-card__lede">Stewards author pre-approved boundaries; the agent maps each assessment to its best-fit zone, surfaces conditions, and escalates anything that crosses a hard exclusion. Bounded autonomy for responsible AI.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-template-transformation/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-random"></i> Schema Transformation</span>
      <h3 class="article-card__title">AI-Assisted Template Transformation — Five-Strategy Mapping</h3>
      <p class="article-card__lede">Five complementary matching strategies (exact, pattern, semantic, contextual, AI-inferred) with weighted confidence aggregation, dual backend/frontend AI failover for 99.9% availability, and adaptive learning that gets sharper with every transformation.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-dpia-lia-reviews/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-balance-scale"></i> Privacy Reviews</span>
      <h3 class="article-card__title">DPIA & LIA Reviews — Defensible Privacy Artifacts at Speed</h3>
      <p class="article-card__lede">AI-assisted Data Protection Impact Assessments (GDPR Art. 35) and Legitimate Interest Assessments (Art. 6(1)(f)) — pre-filled from intake and evidence with citations, validated by counsel, audit-ready by default.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-agentic-grc-runtime/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-cogs"></i> Event Sourcing</span>
      <h3 class="article-card__title">Agentic GRC Runtime — Event-Sourced Compliance Automation</h3>
      <p class="article-card__lede">Event-sourced workflow orchestration with deterministic risk scoring and explainable decision traces for auditability and reproducibility in regulated environments.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-agentic-workflow-orchestration/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-sitemap"></i> Workflow Orchestration</span>
      <h3 class="article-card__title">Agentic Workflow Orchestration — Multi-Input Assessment Processing</h3>
      <p class="article-card__lede">Unified intake and decision routing framework supporting manual forms, JSON uploads, and API submissions with policy-gated decision routing and real-time workflow visibility.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-grc-document-rag-pipeline/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-database"></i> Vector Architecture</span>
      <h3 class="article-card__title">GRC Document RAG Pipeline — Three-Tier Vector Architecture</h3>
      <p class="article-card__lede">Document ingestion and retrieval system with PostgreSQL pgvector, OpenAI embeddings, and three-tier access control for explainable AI with full auditability.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-grc-portal-platform/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-shield-alt"></i> Platform</span>
      <h3 class="article-card__title">GRC Assessment Platform — Comprehensive Compliance Management</h3>
      <p class="article-card__lede">Centralized solution for managing governance, risk, and compliance activities with role-based interfaces, automated risk scoring, and AI-powered insights.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-grc-smart-rag/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-brain"></i> Smart Retrieval</span>
      <h3 class="article-card__title">GRC Smart RAG — Intelligent Document Selection for Context-Aware Q&A</h3>
      <p class="article-card__lede">Lightweight RAG system using GPT-4o-mini for intelligent document selection before context retrieval, providing accurate answers with clear attribution.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
  </div>
</section>

<section class="section section-articles">
  <div class="section-header">
    <h2 class="section-title">Data Services PaaS · 2026</h2>
    <p class="section-subtitle">Platform-as-a-service requirements specs for the data services a platform team is most often asked to run centrally — availability tiers, disaster-recovery targets, and the metrics both the platform team and consuming applications need to instrument.</p>
  </div>
  <div class="article-grid">
    <a class="article-card article-card--featured" href="{{ '/articles/2026-paas-requirements-framework/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-map"></i> Framework</span>
      <h3 class="article-card__title">From Monolith to PaaS — A PM's Framework for Writing Platform Requirements</h3>
      <p class="article-card__lede">The method behind the five specs below: audit before you specify, tier by blast radius, write every requirement as testable, and treat the migration path as its own set of requirements.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card article-card--featured" href="{{ '/articles/2026-paas-workload-profiling-migration-playbook/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-magnifying-glass-chart"></i> Migration Playbook</span>
      <h3 class="article-card__title">Profiling a Team's Query Pattern and Choosing a Migration Path</h3>
      <p class="article-card__lede">A ten-step method for documenting how a team actually uses a service — hot keys, skew, consistency assumptions, anti-patterns — plus a menu of migration assistance models from self-service to white-glove, matched to what the profile reveals.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-paas-redis-requirements/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-bolt"></i> Cache / In-Memory</span>
      <h3 class="article-card__title">Redis-as-a-Service — Platform Requirements</h3>
      <p class="article-card__lede">Sentinel vs. Cluster tiering, persistence as an availability decision, RPO/RTO by tier, and the cache-hit and fallback-path metrics application teams have to own themselves.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-paas-redis-command-compatibility-and-scaling/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-code-branch"></i> Redis Deep Dive</span>
      <h3 class="article-card__title">Redis — Command Compatibility for Migration & Scaling Clusters, Not Caches</h3>
      <p class="article-card__lede">A command-by-command migration-readiness map (GET/SET vs. multi-key ops vs. Lua scripts vs. pub/sub), plus a sizing method for growing via more right-sized shards instead of ever-bigger single-instance caches.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-paas-kafka-requirements/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-stream"></i> Streaming</span>
      <h3 class="article-card__title">Kafka-as-a-Service — Platform Requirements</h3>
      <p class="article-card__lede">Replication factor and ISR requirements, unclean-leader-election policy, MirrorMaker2 cross-region DR, and the consumer-lag metrics that matter more than any broker-side dashboard.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-paas-kafka-api-compatibility-and-scaling/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-code-branch"></i> Kafka Deep Dive</span>
      <h3 class="article-card__title">Kafka — API Compatibility for Migration & Scaling Past a Broker's Ceiling</h3>
      <p class="article-card__lede">Why transactional producers and compacted topics don't transparently follow a cluster migration, plus a partition/broker sizing method that avoids both under- and over-partitioning.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-paas-elasticsearch-requirements/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-search"></i> Search</span>
      <h3 class="article-card__title">Elasticsearch-as-a-Service — Platform Requirements</h3>
      <p class="article-card__lede">Dedicated master quorum, hot-warm tiering, snapshot/CCR-based DR, and why search indices are best treated as rebuildable projections rather than a system of record.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-paas-elasticsearch-operation-compatibility-and-scaling/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-code-branch"></i> Elasticsearch Deep Dive</span>
      <h3 class="article-card__title">Elasticsearch — Operation Compatibility & Scaling Past the JVM Heap Ceiling</h3>
      <p class="article-card__lede">A migration-readiness map from single-document GETs to mapping explosions, plus why a bigger node stops helping past the ~30GB compressed-oops heap boundary.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-paas-grpc-protobuf-requirements/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-plug"></i> Service Mesh / RPC</span>
      <h3 class="article-card__title">gRPC/Protobuf Messaging-as-a-Service — Platform Requirements</h3>
      <p class="article-card__lede">Deadline propagation, retry budgets, and circuit breaking at the mesh layer, paired with CI-enforced schema-compatibility gates so a field rename can't silently break a caller in production.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-paas-grpc-protobuf-rpc-compatibility-and-scaling/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-code-branch"></i> gRPC Deep Dive</span>
      <h3 class="article-card__title">gRPC/Protobuf — RPC Compatibility & Scaling Past One Instance</h3>
      <p class="article-card__lede">Why an in-flight stream can't be cut over mid-connection, and a replica-sizing method built on connection/stream ceilings and client-side multiplexing instead of a bigger instance.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-paas-mysql-requirements/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-database"></i> Relational Database</span>
      <h3 class="article-card__title">MySQL-as-a-Service — Platform Requirements</h3>
      <p class="article-card__lede">Semi-sync replication as the line between Standard and Critical tiers, layered backup + binlog PITR, and why point-in-time recovery has to be drilled, not just assumed to work.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/articles/2026-paas-mysql-query-compatibility-and-scaling/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-code-branch"></i> MySQL Deep Dive</span>
      <h3 class="article-card__title">MySQL — Query Compatibility & Scaling Beyond a Single Primary</h3>
      <p class="article-card__lede">A migration-readiness map from single-row CRUD to isolation-level-sensitive transactions, plus the escalation ladder from read replicas to functional partitioning to horizontal sharding.</p>
      <span class="article-card__read">Read article <i class="fas fa-arrow-right"></i></span>
    </a>
  </div>
</section>

<section class="section section-articles">
  <div class="section-header">
    <h2 class="section-title">Architecture Deep Dive</h2>
    <p class="section-subtitle">The full architectural narrative behind the agentic GRC platform.</p>
  </div>
  <div class="article-grid article-grid--single">
    <a class="article-card article-card--featured" href="{{ '/articles/2026-deep-dive/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-book-open"></i> Long Read</span>
      <h3 class="article-card__title">Reimagining GRC — From Static Compliance to Intelligent Risk Orchestration</h3>
      <p class="article-card__lede">Agent Runs, multi-dimensional rubrics, evidence-driven Claims with polarity, dynamic workflows, knowledge-graph context, and explainable Decision Traces — the full architectural narrative.</p>
      <span class="article-card__read">Read deep dive <i class="fas fa-arrow-right"></i></span>
    </a>
  </div>
</section>

<style>
.section-articles { padding-top: 1.5rem; }
.section-articles .section-header { margin-bottom: 1.25rem; }
.article-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
.article-grid--single { grid-template-columns: 1fr; }

.article-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: var(--color-surface-card);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.35rem 1.35rem;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  position: relative;
}
.article-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-strong);
}

.article-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  background: var(--color-accent-soft);
  color: var(--color-accent-strong);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.7rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
}
.article-card__tag i { font-size: 0.78rem; }

.article-card__title {
  color: var(--color-text);
  font-size: 1.05rem;
  line-height: 1.35;
  letter-spacing: -0.01em;
  font-weight: 700;
  margin: 0.1rem 0 0;
}

.article-card__lede {
  color: var(--color-text-muted);
  font-size: 0.94rem;
  line-height: 1.55;
  margin: 0;
}

.article-card__read {
  margin-top: 0.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-accent);
  font-weight: 600;
  font-size: 0.88rem;
}
.article-card:hover .article-card__read { color: var(--color-accent-strong); }
.article-card:hover .article-card__read i { transform: translateX(2px); }
.article-card__read i { transition: transform 0.15s ease; }

.article-card--featured {
  background: linear-gradient(180deg, var(--color-surface-card) 0%, rgba(124, 58, 237, 0.04) 100%);
  border-color: rgba(124, 58, 237, 0.20);
}
.article-card--featured .article-card__tag {
  background: rgba(124, 58, 237, 0.12);
  color: #5b21b6;
}
.article-card--featured .article-card__read { color: var(--color-violet); }

@media (max-width: 640px) {
  .article-card { padding: 1rem 1.1rem 1.15rem; }
  .article-card__title { font-size: 1rem; }
}
</style>
