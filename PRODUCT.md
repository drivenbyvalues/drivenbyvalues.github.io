# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
[Inferred — not confirmed by the user directly.] Primary users are recruiters, hiring managers, and professional
peers evaluating Harish Raghavendra for senior/staff product management roles (data platform, AI governance,
developer platforms). Secondary audience: personal network and collaborators reading the career timeline/articles
out of general interest.

## Product Purpose
A personal portfolio/resume site (drivenbyvalues.github.io) that presents Harish's career — currently Staff Product
Manager, Data Platform at GitHub (since Aug 2026), previously seven years leading Data & AI Governance at Visa — as
a credible, scannable case for senior technical product leadership. Success = a visitor quickly forms a strong
impression of scale, technical depth, and governance/trust judgment, and either downloads the resume or books a call.

## Positioning
Not a generic "PM portfolio template." The site's differentiated claim is depth at the intersection of large-scale
data platforms, AI/agentic systems, and governance/trust — backed by concrete metrics (agents shipped, transaction
volume, engineers led) rather than generic PM buzzwords.

## Operating Context
- Built with React + Vite, content authored as Markdown with front-matter in `content/`, compiled to
  `src/generated/content.json` via `scripts/generate-content.mjs`.
- Deployed to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) on push to `main`.
- Deep-linkable SPA: `scripts/create-deep-link-fallback.mjs` generates a real `index.html` per route so every route
  returns 200 directly (not just via client-side fallback).
- Content includes: homepage/hero, career timeline (2002–present, one page per era), articles, interests/galleries,
  downloadable resume (PDF + DOCX), skills/certifications pages.

## Capabilities and Constraints
- Must preserve all existing routes/content and the downloadable resume links.
- Any redesign must not break the GitHub Pages deep-link fallback mechanism.
- Site is static-generated; no backend/CMS — content changes are git commits.

## Brand Commitments
- Name/identity: "drivenbyvalues" — values-driven personal brand.
- No formal logo; hero uses a personal portrait photo.

## Evidence on Hand
- Career history, metrics, and story content already written in `content/` (real, not fabricated) — GRC platform
  metrics, Hadoop/Tusker/Parsec platform work, Hulu/Intuit/P&G history, education.
- Real resume PDFs/DOCX under `public/resumes/`.

## Product Principles
1. Lead with credible, specific evidence (numbers, named platforms) over generic claims.
2. Scannable first, narrative second — a recruiter skimming for 30 seconds should get the pitch.
3. Preserve factual content and site structure; visual changes should not alter career facts or add unverifiable claims.
4. Calm, confident, senior — not flashy or trend-chasing.

## Accessibility & Inclusion
No product-specific requirement established; follow standard web accessibility best practice (contrast, semantic
structure, keyboard/reduced-motion support) by default.
