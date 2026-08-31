---
layout: article
title: MyYaatra — A Platform to Document a Life So It Can Be Passed Down
date: 2026-08-19
category: Personal Project
permalink: /articles/2026-myyaatra-memory-platform/
tags:
  - Memory Preservation
  - Family History
  - Oral History
  - AI Agents
  - Prisma
  - Node.js
---

# MyYaatra — A Platform to Document a Life So It Can Be Passed Down

## Executive Summary

MyYaatra ("yaatra" = "journey" in Sanskrit and most Indian languages) is a personal platform for documenting a life in enough structure and depth that it can actually be handed down — not a scrapbook of photos, but a working record of memories, relationships, career, health, and life events, with AI used specifically to turn scattered inputs (a voice recording, a photo, a decade of old social posts) into something a grandchild could read and understand. It started as a UI-only prototype and has since been rebuilt into a full-stack system: React/TypeScript frontend, Node/Express backend, PostgreSQL via Prisma, real-time collaboration, and five different AI agents doing specific, narrow jobs rather than one general assistant doing everything.

## The Problem

Most of what makes up a life never gets written down. It lives in a parent's memory, in a WhatsApp voice note, in old photo albums nobody's scanned, in stories that get told once at a family dinner and never again. By the time someone thinks to ask "what was it actually like," the person who could answer often can't anymore. The tools that exist for this — photo backup apps, generic journaling apps, ancestry sites — each capture one slice (photos, or genealogy, or text) and none of them turn raw material into a story someone two generations later would actually want to read.

## The Product Insight

Documentation only survives generational handoff if it's *structured* and *narrated*, not just archived. A pile of undated photos and a family tree with names and dates on it aren't the same thing as a story. MyYaatra's approach is to capture memories with real metadata (who, when, where, what domain of life it touches) and then use several narrow AI agents — not one do-everything assistant — to turn that structured material into something readable: a guided interview that extracts a life story one question at a time, a story generator that can turn a date range of memories into a chosen narrative tone, and a set of analysis agents that find patterns across everything a person has logged.

Each agent has a heuristic fallback when no AI key is configured, so the underlying data model and app don't depend on an external API being available — the AI layer enhances the record, it isn't required to create one.

## What's Actually Built

**Family Interview.** A structured oral-history flow for each family member: a question bank organized by category — childhood, family, career, relationships, life wisdom, milestones — with answers captured by voice recording. On completion, an AI step generates a bio summary and extracts discrete life events from the interview, so one conversation becomes both a readable narrative and structured data.

**StoryTeller.** Turns a date range of logged memories into a written story in one of five tones — reflective, celebratory, nostalgic, journalistic, or poetic — that can be edited, downloaded, or shared. This is the piece that most directly answers "so what do I actually hand down" — a document, not a database export.

**TimeCapsule.** Memories can be sealed and set to reveal later, and an "On This Day" view surfaces past memories, career milestones, and family life events on their anniversaries.

**AI agents beyond the interview and story generator.** A sentiment analysis agent, a pattern-detection agent that looks across time, location, social context, financial activity, emotional tone, and general activity for recurring patterns, a recommendation engine, a predictive-events agent, and a photo analysis agent (using vision AI) that generates descriptions, titles, mood, and detects people and objects in uploaded photos — all backed by Claude, with heuristic fallbacks when no API key is present.

**Capture and import.** Voice recordings are stored as audio clips; photos and other media upload to object storage. Beyond manual entry, the platform can import from Google and Outlook calendars and from social platforms — Facebook, Instagram, Twitter, LinkedIn, YouTube — pulling in external posts and events as memories, with hashtag extraction.

**Real-time collaboration.** Family members can co-edit a memory together in real time over Socket.io, with per-memory presence so you can see who else is looking at or editing the same entry.

**Life-domain tracking beyond memories.** The data model goes well past a memory feed — family tree and relationships, career history, education, health, and financials (accounts, investments, assets, goals, with an AI financial advisor added most recently), plus calendar and location-visit tracking — all modeled as first-class records, not freeform notes, so a life ends up documented across every domain that actually defines one, not just the moments someone thought to photograph.

## Under the Hood

- **Frontend**: React 18 + TypeScript + Vite + Tailwind, with a Three.js-powered "LifeMap" visualization and Socket.io client for live collaboration.
- **Backend**: Node/Express + TypeScript, Prisma ORM over PostgreSQL — 48 Prisma models covering memories, family, career, education, health, and financials.
- **Auth**: JWT with refresh tokens.
- **AI**: Claude API across five specialized agents (sentiment, pattern detection, recommendations, predictive events, photo analysis), each with a heuristic fallback so the app degrades gracefully without an API key.
- **Storage**: AWS S3 for voice recordings, photos, and other media.
- **Validation**: Zod schemas across the API boundary.
- **Real-time**: Socket.io server for collaborative editing and presence.
- **Deploy**: Railway, frontend and backend as separate services.

## Where It Stands

MyYaatra started as a UI-only prototype (built with Magic Patterns, no backend behind it) and has since been rebuilt from the ground up into the full-stack system described above — real auth, a real database, real AI agents, real object storage. It's under active development rather than publicly launched: the core memory, interview, storytelling, and life-domain tracking features are backend-wired and working; a few pieces are still catching up, including Google Photos import (currently UI-only) and parts of the financials module pending additional data modeling.

## Why It Matters

The thing I keep learning building this alongside NammaSeva and HealthSpan AI is that AI is most valuable as a narrow, specific tool applied to a well-structured record — not as a general chat layer bolted on top of an unstructured pile of data. A memory platform's real job is making sure the *structure* survives (who, when, what domain of life, what it connects to), because that's what makes the AI layer on top actually useful decades later, when the person answering follow-up questions in an interview isn't around to ask anymore.

---

*Personal project, independent of my work at Visa. Started as a UI prototype, now a full-stack platform in active development. Live: [my-yatra.up.railway.app](https://my-yatra.up.railway.app/).*
