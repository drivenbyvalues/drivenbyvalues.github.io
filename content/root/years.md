---
layout: resume
title: Years (1998-2026)
---

<div class="years-page">
    <h1>Years Overview</h1>
    <p>Select a year to view details about that year's activities and achievements.</p>
    <div class="years-grid">
        {% assign years = "2026,2025,2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010,2009,2008,2007,2006,2005,2004,2003,2002,2001,2000,1999,1998" | split: "," %}
        {% for year in years %}
            <a href="{{ '/' | append: year | append: '/' | relative_url }}" class="year-card">
                <div class="year-number">{{ year }}</div>
                <div class="year-preview">
                    {% assign year_page = site.pages | where: 'path', '_pages/years/' | append: year | append: '.md' | first %}
                    {% if year_page and year_page.subtitle %}
                        <div class="year-subtitle">{{ year_page.subtitle }}</div>
                    {% endif %}
                </div>
            </a>
        {% endfor %}
    </div>
</div>
