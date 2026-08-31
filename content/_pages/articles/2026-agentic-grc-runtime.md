---
layout: article
title: Agentic GRC Runtime Architecture
date: 2026-06-15
category: Architecture
permalink: /articles/2026-agentic-grc-runtime/
tags:
  - GRC
  - Agentic AI
  - Event Sourcing
  - Risk Scoring
  - Decision Traces
---

# Agentic GRC Runtime: Event-Sourced Compliance Automation

## Executive Summary

The Agentic GRC Runtime represents a paradigm shift in Governance, Risk, and Compliance automation by combining event-sourced workflow orchestration with deterministic risk scoring and explainable AI decision traces. This architecture enables organizations to automate compliance assessments while maintaining full auditability, reproducibility, and human oversight.

## Problem Statement

Traditional GRC platforms suffer from three critical limitations:

1. **Black-box decision making** - Risk scores and compliance decisions lack explainable traces
2. **Non-deterministic outcomes** - AI-based assessments produce different results for identical inputs
3. **Incomplete audit trails** - Workflow state changes are not fully captured for regulatory scrutiny

These limitations prevent adoption in highly regulated industries where auditability and reproducibility are non-negotiable.

## Solution Architecture

### Event-Sourced Run Management

The runtime implements event sourcing as the foundation for state management:

```typescript
// Every action creates an immutable event
await runStateManager.appendEvent(runId, 'StepStarted', {
  step: 'RetrieveEvidence',
  timestamp: new Date(),
  actor: 'system',
  metadata: { source: 'automated' }
});

// State is reconstructed from events
const events = await runStateManager.getEvents(runId);
const currentState = reconstructState(events);
```

**Benefits:**
- Complete audit trail of every state transition
- Point-in-time state reconstruction for investigations
- Event replay for debugging and compliance verification
- Temporal queries (what was the state at time T?)

### Deterministic Risk Scoring Engine

Risk scoring uses pure functions with fixed weights to ensure reproducibility:

```typescript
const weights = {
  operational: 0.3,
  reputational: 0.25,
  data_sensitivity: 0.25,
  competitive: 0.2
};

const score = (dimension, inputs) => {
  // Deterministic algorithm, no ML/AI
  return calculateScore(inputs);
};
```

**Key characteristics:**
- Fixed weight aggregation ensures consistent results
- No stochastic ML models in risk calculation
- Policy gates trigger at exact thresholds
- Full mathematical traceability from inputs to scores

### Golden Path Workflow

The workflow follows a deterministic 11-step sequence with conditional loops:

```
intake → scope → retrieve_evidence → extract_claims → map_controls
      → score_risk → verify → [conflict_resolution] → decide → act → publish
```

**Conditional logic:**
- `verify` loops back to `retrieve_evidence` if evidence is missing
- `conflict_resolution` escalates to human review if contradictions found
- `decide` uses policy gates to determine routing (auto-approve, human review, needs evidence)

### Policy-Gated Decision Engine

Decisions are gated by configurable policy rules:

```typescript
const gates = [
  {
    name: 'dpia_required',
    threshold: 7.0,
    dimension: 'data_sensitivity',
    condition: 'score >= threshold',
    severity: 'high'
  },
  {
    name: 'human_review_required',
    condition: 'contradiction_found',
    severity: 'medium'
  }
];
```

**Decision outcomes:**
- `Approve` - Low risk, no gates triggered, coverage roughly ≥75-85%
- `ApproveWithConditions` - Medium risk with specific conditions
- `EscalateToHuman` - High risk, contradictions, or multiple gates
- `NeedsEvidence` - Coverage below roughly 40-50% or no evidence found

## Technical Implementation

### Database Schema

```sql
-- Core event-sourced tables
CREATE TABLE runs (
  id UUID PRIMARY KEY,
  org_id VARCHAR(255) NOT NULL,
  assessment_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_step VARCHAR(100) NOT NULL,
  state JSONB NOT NULL,
  policy_snapshot JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE run_events (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Risk and decision tables
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES runs(id),
  control_id VARCHAR(255),
  polarity VARCHAR(20),
  evidence_sources JSONB,
  confidence DECIMAL(3,2)
);

CREATE TABLE run_risk_profiles (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES runs(id),
  overall_risk VARCHAR(20),
  overall_score DECIMAL(4,2),
  rubric_scores JSONB,
  gates_triggered JSONB
);
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/runs` | Create a new workflow run |
| GET | `/api/runs` | List runs (filter by status, workflowType) |
| GET | `/api/runs/:id` | Get run details + state |
| GET | `/api/runs/:id/events` | Get event log for a run |
| GET | `/api/runs/:id/state` | Get current state snapshot |
| POST | `/api/runs/:id/advance` | Advance to next workflow step |
| POST | `/api/runs/:id/resume` | Resume a failed run |
| POST | `/api/runs/:id/cancel` | Cancel a run |

### Technology Stack

- **Runtime:** Node.js 18+, TypeScript, Express
- **Database:** PostgreSQL 14+ with TypeORM
- **AI Skills:** OpenAI GPT-4o-mini for agent skills
- **Authentication:** JWT with organization scoping
- **Security:** Helmet, CORS, rate limiting

## Key Innovations

### 1. Policy Snapshot at Submission

Policies are captured when a Run is created, ensuring consistency even if policies change later:

```typescript
const policySnapshot = await getCurrentPolicySnapshot();
const run = await createRun({
  initialState,
  policySnapshot  // Frozen at submission time
});
```

**Benefits:**
- Reproducible assessments regardless of policy changes
- Audit trail shows which policies were applied
- Enables historical analysis of policy impact

### 2. Multi-Rubric Risk Scoring

Risk is scored across four dimensions with configurable weights:

- **Operational Risk** (30%) - Implementation complexity, operational impact
- **Reputational Risk** (25%) - Brand impact, customer trust
- **Data Sensitivity** (25%) - PII, financial data, regulated information
- **Competitive Risk** (20%) - Market position, IP concerns

Each dimension is scored independently, then aggregated with fixed weights.

### 3. Explainable Decision Traces

Every decision includes a complete trace:

```json
{
  "decision": "EscalateToHuman",
  "reasoning": {
    "riskScore": 7.8,
    "gatesTriggered": [
      {
        "gate": "dpia_required",
        "actual": 8.5,
        "threshold": 7.0
      }
    ],
    "contradictions": [
      {
        "control": "SOC2_Access_Control",
        "claim1": "Compliant",
        "claim2": "Non-compliant",
        "evidence": ["doc1.pdf", "doc2.pdf"]
      }
    ]
  }
}
```

### 4. Human-in-the-Loop Workflows

The system defaults to human review for safety:

- High risk assessments always escalate
- Contradictions trigger manual review
- Insufficient evidence requires human input
- Policy gate failures block automation

## Performance Characteristics

### Event Sourcing Optimization

- Event storage optimized for append-only operations
- Snapshot strategy for long-running runs (roughly every 40-60 events)
- Event replay for state reconstruction
- Efficient temporal queries with indexes

### Risk Calculation Performance

- Caching of policy snapshots
- Pre-computed risk weights
- Efficient aggregation algorithms
- Sub-200ms API response times

### Scalability

- Horizontal scaling with multiple instances
- Database connection pooling
- Read replicas for query-heavy operations
- Queue-based task processing (optional)

## Security Implementation

### Authentication & Authorization

- JWT tokens with organization scoping
- Role-based access control (admin, reviewer, datasteward, submitter)
- Resource-based permissions
- API rate limiting

### Data Protection

- Sensitive data encryption at rest
- Audit logging for all state changes
- Data retention policies
- GDPR compliance considerations

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│  Instance 1     │      │  Instance 2     │
│  (Node.js)     │      │  (Node.js)     │
└───────┬────────┘      └────────┬────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   PostgreSQL Primary    │
        │   (Event Store + State) │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   PostgreSQL Read Replicas│
        └─────────────────────────┘
```

## Success Metrics

### Functional Requirements
- ✅ Event-sourced run management with complete audit trail
- ✅ Deterministic risk scoring with reproducible results
- ✅ Explainable decision traces for regulatory scrutiny
- ✅ Human-in-the-loop workflows for safety
- ✅ Policy-gated decision engine

### Non-Functional Requirements
- ✅ API response time < 200ms
- ✅ 99%+ uptime
- ✅ Data consistency across event replay
- ✅ Audit trail completeness
- ✅ Scalable architecture

## Future Enhancements

### Phase 2: Knowledge Graph Integration
- Subgraph retrieval for prior case analysis
- Entity relationship mapping
- Pattern recognition across assessments

### Phase 3: Advanced AI Skills
- Evidence synthesis from multiple sources
- Contradiction resolution suggestions
- Risk mitigation recommendations

### Phase 4: Analytics & Insights
- Trend analysis across assessments
- Policy effectiveness measurement
- Risk prediction models

## Conclusion

The Agentic GRC Runtime demonstrates that compliance automation can be both powerful and auditable. By combining event sourcing, deterministic algorithms, and explainable AI, organizations can achieve the efficiency of automation while maintaining the rigor required for regulatory compliance.

This architecture serves as a blueprint for building AI-powered systems in regulated industries where black-box decisions are unacceptable and full explainability is mandatory.
