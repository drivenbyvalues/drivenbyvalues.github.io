---
layout: resume
title: Professional Timeline | Harish Raghavendra
---

<header class="header">
    <div class="header-content">
        <div class="profile-section">
            <div class="profile-info">
                <h1>Professional Journey</h1>
                <div class="title">20+ Years of Building Scalable Systems and Leading High-Performing Teams</div>
            </div>
        </div>
    </div>
</header>

<div class="timeline-page">
  <div class="timeline-container">
    <div class="timeline-nav">
      <h3>Career Milestones</h3>
      <ul>
        <li><a href="{{ '/2026-present/index.html' | relative_url }}" class="nav-link" data-domains="platform,ai"><i class="fas fa-code-branch"></i><span>2026-Present</span><small>Platform PM, GitHub</small></a></li>
        <li><a href="{{ '/2019-2026/index.html' | relative_url }}" class="nav-link" data-domains="grc,ai,platform"><i class="fas fa-shield-alt"></i><span>2019-2026</span><small>Data &amp; AI Governance</small></a></li>
        <li><a href="{{ '/2016-2019/index.html' | relative_url }}" class="nav-link" data-domains="platform,fintech"><i class="fas fa-network-wired"></i><span>2016-2019</span><small>Sr. Tech Program Manager</small></a></li>
        <li><a href="{{ '/2009-2016/index.html' | relative_url }}" class="nav-link" data-domains="platform,media"><i class="fas fa-tv"></i><span>2009-2016</span><small>Senior Engineering Manager</small></a></li>
        <li><a href="{{ '/2007-2009/index.html' | relative_url }}" class="nav-link" data-domains="fintech"><i class="fas fa-credit-card"></i><span>2007-2009</span><small>Technical Lead</small></a></li>
        <li><a href="{{ '/2005-2007/index.html' | relative_url }}" class="nav-link" data-domains="consulting,platform"><i class="fas fa-lightbulb"></i><span>2005-2007</span><small>Sr. Software Consultant</small></a></li>
        <li><a href="{{ '/2002-2005/index.html' | relative_url }}" class="nav-link" data-domains="research,ai"><i class="fas fa-flask"></i><span>2002-2005</span><small>Research Engineer</small></a></li>
      </ul>
    </div>
    
    <div class="timeline-content">
      <div class="timeline-filters" role="group" aria-label="Filter achievements by domain">
        <button class="filter-button is-active" data-domain="all" aria-pressed="true">All</button>
        <button class="filter-button" data-domain="grc" aria-pressed="false"><i class="fas fa-shield-alt"></i> GRC &amp; Risk</button>
        <button class="filter-button" data-domain="ai" aria-pressed="false"><i class="fas fa-brain"></i> AI &amp; Data</button>
        <button class="filter-button" data-domain="platform" aria-pressed="false"><i class="fas fa-layer-group"></i> Platform</button>
        <button class="filter-button" data-domain="fintech" aria-pressed="false"><i class="fas fa-credit-card"></i> FinTech</button>
      </div>

      <div class="timeline-highlight" data-domains="platform,ai">
        <div class="timeline-badges">
          <span class="domain-badge badge--platform"><i class="fas fa-layer-group"></i> Platform</span>
          <span class="domain-badge badge--ai"><i class="fas fa-brain"></i> AI</span>
        </div>
        <h2>Current Chapter</h2>
        <h3>Staff Product Manager, Data Platform, GitHub — since August 2026</h3>
        <p>After seven years building data, AI, and governance platforms at Visa, I'm bringing that same self-service, AI-native platform mindset to GitHub. <a href="/2026-present/">Read more →</a></p>
      </div>

      <div class="timeline-highlight" data-domains="grc,ai,platform">
        <div class="timeline-badges">
          <span class="domain-badge badge--grc"><i class="fas fa-shield-alt"></i> GRC</span>
          <span class="domain-badge badge--ai"><i class="fas fa-brain"></i> AI</span>
          <span class="domain-badge badge--platform"><i class="fas fa-layer-group"></i> Platform</span>
        </div>
        <h2>Previous Chapter (2019–2026)</h2>
        <h3>Director, Data &amp; AI Governance at Visa Inc.</h3>
        <p>Seven years building Parsec, Tusker, the NextGen Merchant Data Platform, and ViDA.AI — Visa's AI-driven GRC platform (30-50 agents, a multi-hundred-thousand-line codebase, several hundred APIs, dozens of features) spanning hundreds of billions of transactions and 100M-150M merchant locations. <a href="/2019-2026/">Read more →</a></p>
      </div>

      <div class="timeline-highlight" data-domains="platform,fintech,ai">
        <div class="timeline-badges">
          <span class="domain-badge badge--platform"><i class="fas fa-layer-group"></i> Platform</span>
          <span class="domain-badge badge--ai"><i class="fas fa-brain"></i> AI</span>
        </div>
        <h2>Key Achievements</h2>
        <ul>
          <li>Built Visa's Agentic AI GRC platform unlocking multi-million dollar revenue and cutting assessment time by roughly 80-95%.</li>
          <li>Defined the 3-year NextGen Merchant Data Platform strategy across Merchants, PayFacs, and Acquirers (100M-150M locations).</li>
          <li>Drove Visa's self-supported Core Hadoop 3.x distribution—saving tens of millions of dollars over 5 years.</li>
          <li>Led 2-year Hadoop in-place upgrade across 150-200 data apps, 75-100 clusters, and hundreds of PB.</li>
          <li>Scaled Hulu Live TV datastore for Super Bowl, GoT Finale, Winter Olympics, NCAA—Cassandra at 1M+ qps.</li>
        </ul>
      </div>

      <div class="timeline-highlight" data-domains="grc,ai,platform">
        <div class="timeline-badges">
          <span class="domain-badge badge--grc"><i class="fas fa-shield-alt"></i> GRC</span>
          <span class="domain-badge badge--ai"><i class="fas fa-brain"></i> AI</span>
          <span class="domain-badge badge--platform"><i class="fas fa-layer-group"></i> Platform</span>
        </div>
        <h2>GRC Platform — Technical Architecture</h2>
        <ul>
          <li><strong>A2A Multi-Agent Pipeline:</strong> Three-tier autonomous governance engine — roughly 15-20 stateless skills → several command agents → a few tiered workflows (Low Risk a few hours · Full Review roughly a business week · Escalated a few weeks) — with HMAC-SHA256 envelope signing, pg-boss durable job queuing, and a confidence-chain gate that blocks auto-approval below a high-confidence floor.</li>
          <li><strong>Claude AI / MCP Integration:</strong> First enterprise deployment of Anthropic's Model Context Protocol (MCP) — a handful of GRC tools discoverable natively by Claude Code and Claude Desktop. Supports an Anthropic SDK autonomous agent CLI and an MCP stdio server for natural-language governance orchestration end-to-end.</li>
          <li><strong>Agentic Runtime v2:</strong> Deterministic 4D risk-scoring engine (weighted across Operational, Reputational, Data Sensitivity, and Competitive dimensions) with several ordered policy gates and contradiction detection — fully decoupled from LLM inference for auditable, reproducible decisions.</li>
          <li><strong>Privacy &amp; Regulatory Automation:</strong> GDPR-native DPIA/LIA assessment skills (high-confidence floors), EU AI Act high-risk classification, and reversibility assessment automated via LLM — replacing weeks of manual legal review with sub-hour analysis.</li>
          <li><strong>Blockchain Audit Registry:</strong> GRCAuditRegistry on Polygon Amoy (Ethereum L2) — immutable, on-chain governance decisions with IPFS evidence anchoring and PolygonScan verification for regulatory submissions.</li>
          <li><strong>Workflow Canvas:</strong> Dual-mode visualization (trace + config) overlaying live execution data on the workflow DAG — domain-scoped skill toggling, threshold overrides, and LLM prompt management without any external chart library.</li>
          <li><strong>RAG Intelligence Layer:</strong> LangChain + Pinecone + OpenAI pipeline with pgvector semantic search — surfaces policy precedents and regulatory requirements during live conversational intake interviews.</li>
        </ul>
      </div>

      <div class="timeline-highlight" data-domains="ai,platform">
        <div class="timeline-badges">
          <span class="domain-badge badge--ai"><i class="fas fa-brain"></i> AI</span>
          <span class="domain-badge badge--platform"><i class="fas fa-layer-group"></i> Platform</span>
        </div>
        <h2>Personal Projects &amp; Open Innovations</h2>
        <ul>
          <li><strong><a href="https://namma-seva-customer-web-production.up.railway.app/" target="_blank" rel="noopener">NammaSeva →</a></strong> — Multi-tenant hyperlocal services marketplace for small-town India: voice/AI-assisted intake, vendor matching &amp; quoting, milestone-based job execution across customer, vendor, and town-operator apps. <a href="/articles/2026-namma-seva-hyperlocal-marketplace/">Writeup →</a> Stack: React Native/Expo, NestJS, PostgreSQL/PostGIS, BullMQ.</li>
          <li><strong><a href="https://manasa-vihara-retreat-production.up.railway.app/" target="_blank" rel="noopener">Manasa Vihara Retreat →</a></strong> — Boutique homestay and nature-retreat booking website in the Western Ghats, Karnataka, with property showcase, rooms, experiences, and an enquiry-driven booking flow. Stack: Next.js, React, Prisma, PostgreSQL.</li>
          <li><strong><a href="https://grc-portal-production.up.railway.app" target="_blank" rel="noopener">AI-Driven GRC Portal →</a></strong> — Production agentic governance platform with 30-50 agents, A2A multi-agent pipeline (roughly 15-20 skills → several commands → a few workflows), Claude MCP integration, and blockchain audit registry on Polygon Amoy. Stack: React/Vite, Node.js, TypeScript, PostgreSQL, Solidity.</li>
          <li><strong><a href="https://merchant-portal-production.up.railway.app/data-source-inventory" target="_blank" rel="noopener">Merchant Data Portal →</a></strong> — NextGen merchant data source inventory and management portal exploring MDP architecture concepts. Stack: React, TypeScript, REST APIs.</li>
          <li><strong><a href="https://codecollab-translate-poc-production.up.railway.app/" target="_blank" rel="noopener">CodeCollab Translate →</a></strong> — Real-time code collaboration PoC with AI-powered translation across programming languages. Stack: React, Node.js, WebSockets, LLM.</li>
          <li><strong><a href="https://my-yatra.up.railway.app/landing" target="_blank" rel="noopener">MyYaatra →</a></strong> — Personal life chronicle with AI insights, family tree, memories, career milestones, financial goals, and time capsules. Stack: React/Vite, TypeScript, AI/ML.</li>
        </ul>
      </div>

      <div class="timeline-highlight" data-domains="grc,ai,platform">
        <div class="timeline-badges">
          <span class="domain-badge badge--grc"><i class="fas fa-shield-alt"></i> GRC</span>
          <span class="domain-badge badge--ai"><i class="fas fa-brain"></i> AI</span>
        </div>
        <h2>Technical Leadership</h2>
        <ul>
          <li>Grew the Visa data platform team from a handful of engineers to 60-90+ across roughly 5 scrum teams, with attrition well below industry average.</li>
          <li>Owns dozens of big data products at hundreds of billions of transactions Visa-wide.</li>
          <li>Shipped a self-service agent-based API platform managing 10K-15K+ servers via 1,200-1,800 APIs (NodeJS/ReactJS); roughly a dozen teams onboarded.</li>
          <li>Multi-LLM orchestration across GPT-4.1, GPT-5, and Claude Sonnet 4.5 / 4.6 / Opus 4 in production GRC workflows.</li>
          <li>Cleared external audit of the Hadoop program with the Federal Reserve, FBA, and government agencies.</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
.timeline-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.timeline-page h1 {
  color: var(--color-text);
  margin-bottom: 10px;
}

.timeline-page .subtitle {
  color: var(--color-text-muted);
  font-size: 1.2em;
  margin-bottom: 30px;
  display: block;
}

.timeline-container {
  display: flex;
  gap: 30px;
  margin-top: 30px;
}

.timeline-nav {
  width: 280px;
  flex-shrink: 0;
}

.timeline-nav h3 {
  color: var(--color-text);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 10px;
  margin-top: 0;
}

.timeline-nav ul {
  list-style: none;
  padding: 0;
  margin: 15px 0 0 0;
}

.timeline-nav li {
  margin-bottom: 10px;
}

.timeline-nav .nav-link {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 12px 16px;
  color: var(--color-accent);
  text-decoration: none;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: background-color 0.2s, transform 0.2s, border-color 0.2s;
}

.timeline-nav .nav-link i {
  font-size: 1.1rem;
  color: var(--color-text);
}

.timeline-nav .nav-link span {
  font-weight: 600;
  color: var(--color-text);
}

.timeline-nav .nav-link small {
  color: var(--color-text-subtle);
  font-size: 0.8rem;
}

.timeline-nav .nav-link:hover {
  background-color: var(--color-surface-2);
  color: var(--color-accent-strong);
  border-color: rgba(52, 152, 219, 0.25);
  transform: translateY(-1px);
}

.timeline-nav .nav-link.nav-link--dimmed {
  opacity: 0.45;
}

.timeline-nav .nav-link.nav-link--active {
  background-color: rgba(52, 152, 219, 0.08);
  border-color: rgba(52, 152, 219, 0.35);
}

.timeline-content {
  flex-grow: 1;
}

.timeline-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.filter-button {
  border: 1px solid rgba(52, 152, 219, 0.4);
  background: var(--color-surface-card);
  color: var(--color-text);
  border-radius: 999px;
  padding: 0.55rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s, color 0.2s, transform 0.2s;
}

.filter-button i {
  color: var(--color-accent);
}

.filter-button:hover {
  transform: translateY(-1px);
}

.filter-button.is-active {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}

.filter-button.is-active i {
  color: var(--color-text-inverse);
}

.timeline-highlight {
  background: var(--color-surface-card);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
  border-left: 4px solid var(--color-accent);
}

.timeline-highlight h2 {
  color: var(--color-text);
  margin-top: 0;
  font-size: 1.5em;
}

.timeline-highlight h3 {
  color: var(--color-accent);
  margin: 10px 0;
  font-size: 1.2em;
}

.timeline-highlight p {
  line-height: 1.6;
  color: var(--color-text-muted);
}

.timeline-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.domain-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  background: rgba(52, 152, 219, 0.12);
}

.domain-badge i {
  font-size: 0.95rem;
}

.badge--grc {
  background: rgba(46, 204, 113, 0.18);
  color: #1e7a46;
}

.badge--ai {
  background: rgba(155, 89, 182, 0.18);
  color: #6c2d89;
}

.badge--platform {
  background: rgba(52, 152, 219, 0.18);
  color: #1f4b6d;
}

.badge--fintech {
  background: rgba(241, 196, 15, 0.22);
  color: #9a7505;
}

.timeline-highlight ul {
  padding-left: 20px;
}

.timeline-highlight li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.timeline-highlight.is-hidden {
  display: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .timeline-container {
    flex-direction: column;
  }
  
  .timeline-nav {
    width: 100%;
    margin-bottom: 30px;
  }
  
  .timeline-nav ul {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .timeline-nav li {
    flex: 1 1 calc(50% - 10px);
    margin-bottom: 10px;
  }
  
  .timeline-nav .nav-link {
    padding: 12px;
    font-size: 0.9em;
  }
  
  .timeline-nav .nav-link span {
    font-size: 1rem;
  }
  
  .timeline-nav .nav-link small {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .timeline-nav li {
    flex: 1 1 100%;
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function () {
  const filterButtons = document.querySelectorAll('.filter-button');
  const highlights = document.querySelectorAll('.timeline-highlight');
  const navLinks = document.querySelectorAll('.timeline-nav .nav-link');

  function normalizeDomains(value) {
    return (value || '')
      .split(',')
      .map(function (item) { return item.trim(); })
      .filter(Boolean);
  }

  function applyFilter(targetDomain) {
    highlights.forEach(function (card) {
      const domains = normalizeDomains(card.dataset.domains);
      const match = targetDomain === 'all' || domains.includes(targetDomain);
      card.classList.toggle('is-hidden', !match);
    });

    navLinks.forEach(function (link) {
      const domains = normalizeDomains(link.dataset.domains);
      const match = targetDomain === 'all' || domains.includes(targetDomain);
      link.classList.toggle('nav-link--dimmed', !match);
      if (targetDomain === 'all') {
        link.classList.remove('nav-link--active');
      } else {
        link.classList.toggle('nav-link--active', match);
      }
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const domain = button.dataset.domain;
      filterButtons.forEach(function (btn) {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');
      applyFilter(domain);
    });
  });

  applyFilter('all');
});
</script>
