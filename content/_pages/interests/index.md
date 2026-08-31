---
layout: resume
title: Interests & Hobbies | Harish Raghavendra
permalink: /interests/
---

<header class="hero">
  <div class="hero-shell">
    <div class="hero-body">
      <p class="hero-kicker"><i class="fas fa-palette"></i> Interests &middot; Outside of Work</p>
      <h1 class="hero-title">A few things I build and practice outside platforms and governance</h1>
      <p class="hero-lede">
        Craft, rhythm, and a steady hand — the hobbies that keep the same "build something real, with your own
        hands" instinct alive outside of software.
      </p>
    </div>
  </div>
</header>

<section class="section section-articles">
  <div class="article-grid">
    <a class="article-card" href="{{ '/interests/mridangam/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-drum"></i> Carnatic Percussion</span>
      <h3 class="article-card__title">Mridangam</h3>
      <p class="article-card__lede">Classical South Indian percussion — cleared Junior and Senior grade examinations, ranked 3rd nationally in the All India Senior grade examination.</p>
      <span class="article-card__read">Read more <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/interests/pyrography/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-fire"></i> Wood Burning</span>
      <h3 class="article-card__title">Pyrography</h3>
      <p class="article-card__lede">Burning shaded, linear artwork into wood with a heated tool — a wall collection, a hand-painted carousel horse, and a few pieces shown off in an old Hulu profile photo.</p>
      <span class="article-card__read">Read more <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/interests/drawing/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-pencil-alt"></i> Art</span>
      <h3 class="article-card__title">Drawing</h3>
      <p class="article-card__lede">A few pieces on the way.</p>
      <span class="article-card__read">Read more <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/interests/photography/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-camera"></i> Landscape &amp; Travel</span>
      <h3 class="article-card__title">Photography</h3>
      <p class="article-card__lede">Shot on a Canon 6D (previously a 7D and a Rebel) with L-series glass &mdash; Yellowstone &amp; Grand Teton, the Himalayas, national parks, coastlines, and gardens across a decade of travel.</p>
      <span class="article-card__read">Read more <i class="fas fa-arrow-right"></i></span>
    </a>
    <a class="article-card" href="{{ '/interests/lego/' | relative_url }}">
      <span class="article-card__tag"><i class="fas fa-cubes"></i> Building</span>
      <h3 class="article-card__title">Lego Building</h3>
      <p class="article-card__lede">Grogu, the Razor Crest, an N-1 Starfighter, and a run of Marvel builds with my kids. Currently building a Bugatti.</p>
      <span class="article-card__read">Read more <i class="fas fa-arrow-right"></i></span>
    </a>
  </div>
</section>

<style>
.section-articles { padding-top: 1.5rem; }
.article-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

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

@media (max-width: 640px) {
  .article-card { padding: 1rem 1.1rem 1.15rem; }
  .article-card__title { font-size: 1rem; }
}
</style>
