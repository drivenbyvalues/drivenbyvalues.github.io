---
layout: article
title: gRPC/Protobuf Messaging-as-a-Service — Platform Requirements for Availability, Disaster Recovery & Key Metrics
permalink: /articles/2026-paas-grpc-protobuf-requirements/
year: 2026
feature_area: Data Services PaaS · gRPC/Protobuf Requirements
summary: The mandatory bar for onboarding a Protobuf-based service-to-service messaging platform (gRPC over a service mesh) — schema/compatibility governance, mesh-level availability mechanics, and the metrics both the platform team and calling applications must instrument.
---

# gRPC/Protobuf Messaging-as-a-Service — Platform Requirements

*Platform area: Data Services PaaS · gRPC/Protobuf · Status: reference specification*

## Why This Requirements Doc Exists

Protobuf's biggest platform risk isn't the wire format — it's schema drift silently breaking service-to-service calls at runtime, because Protobuf's wire compatibility rules are permissive enough to let a well-intentioned field rename or type change compile cleanly and fail in production. A gRPC/Protobuf messaging platform has to combine two things most teams handle separately: mesh-level availability engineering (retries, deadlines, circuit breaking) for the RPC transport, and schema governance (a registry with enforced compatibility rules) for the payloads riding on top of it. This doc covers both, because an availability incident and a schema-compatibility incident look identical to a caller — a request that fails.

## Service Tiers

| Tier | Mesh policy | Schema governance | Intended use |
|---|---|---|---|
| **Dev/Sandbox** | Direct service-to-service, no mesh | Advisory lint only | Local/integration testing |
| **Standard** | Sidecar mesh (mTLS, retries, timeouts) | CI-enforced backward compatibility | Internal service-to-service RPC |
| **Critical** | Sidecar mesh + circuit breaking + retry budgets | CI-enforced backward *and* forward compatibility, versioned registry | Payment/transaction paths, anything with a downstream SLA commitment |

## Availability Requirements

- **Multi-replica services behind the mesh** — minimum 3 replicas per service for Standard tier, spread across AZs, with mesh-level health checking (active + passive) removing unhealthy endpoints from the load-balancing pool within the health-check interval.
- **Deadline propagation is mandatory, not optional**: every RPC call sets an explicit deadline, and that deadline is propagated to downstream calls so a slow leaf service can't hold resources indefinitely up the call chain. A service without a deadline on outbound calls is not eligible for the Standard/Critical tier.
- **Retry budgets, not unbounded retries**: retries are capped (e.g., 10% of a service's request volume can be retries) so that a struggling downstream service doesn't get retried into a full outage by every upstream caller simultaneously — a classic retry-storm failure mode.
- **Circuit breaking** at the mesh layer (e.g., Envoy outlier detection) ejects an endpoint after a consecutive-failure threshold and re-probes it on a backoff schedule, required for Critical tier.
- **Control plane HA**: the mesh control plane (Istio control plane, Consul, etc.) itself runs with no single point of failure — a control-plane outage must not immediately break existing data-plane traffic (data plane should fail static/last-known-good, not fail closed).
- **Availability targets**: Standard tier 99.9% per-method success rate, Critical tier 99.95%, measured server-side (excludes client-side network issues outside the mesh's control) and separately client-side (what the caller actually experienced, including mesh overhead).

## Disaster Recovery Requirements

- **Multi-region service mesh with regional failover**: Critical-tier services deploy active-active or active-passive across at least two regions, with the mesh's traffic-management layer able to shift traffic away from an unhealthy region within the RTO window below.
- **Schema Registry (Buf Schema Registry or equivalent) replication** across regions — a region failing over must retain access to the full schema history, or every service in that region loses the ability to validate or generate stubs correctly.
- **Config/control-plane state backup**: mesh routing rules, retry policies, and circuit-breaker configs are version-controlled and re-deployable via CI/CD, not hand-configured — DR for the control plane is "redeploy from source," not "restore a backup."
- **RPO / RTO targets**:

| Tier | RPO | RTO |
|---|---|---|
| Standard | N/A (RPC is not a data store; recovery = service redeploy) | 30 minutes (redeploy + mesh reconfiguration) |
| Critical | N/A | 5 minutes (automated regional traffic shift, pre-provisioned standby capacity) |

- **DR drill cadence**: regional traffic-shift drill quarterly for Critical-tier services, explicitly testing that deadline/retry budgets behave correctly under the added cross-region latency — a retry policy tuned for in-region latency can cause a retry storm the moment traffic shifts to a farther region.

## Platform-Level Metrics (What the Platform Team Watches)

| Metric | Why it matters | Alert threshold |
|---|---|---|
| Request success rate per method (gRPC status codes) | Top-line health signal, per-method rather than per-service — a single hot method can be failing while the service average looks fine | <99.9% (Standard) / <99.95% (Critical) sustained |
| p50/p95/p99 latency per RPC method | Detects degradation before it trips availability thresholds | Threshold per method SLA |
| Connection/channel pool health (active vs. idle connections, connection churn) | Excess channel churn indicates client misconfiguration or mesh instability | Sustained high churn rate |
| TLS handshake failure rate | mTLS misconfiguration or cert rotation issues, often the first sign of a mesh upgrade gone wrong | Any sustained nonzero rate |
| Circuit breaker trip rate (per service) | Frequency of a downstream being ejected — early warning of a degrading dependency | Any sustained trip rate |
| Retry rate vs. retry budget consumption | Approaching budget exhaustion signals a downstream problem about to become a caller-visible outage | >70% of budget consumed |
| Schema registry validation failure rate (CI-time) | Compatibility violations caught before merge — the primary defense against schema-drift incidents | Any failure blocks merge (not a runtime alert, a CI gate) |
| Deployment version skew (schema version distribution across live traffic) | Detects lingering old-schema clients/servers after a rollout that should have completed | Nonzero skew beyond the expected rollout window |

## Application-Facing Metrics (What Consuming Teams Must Instrument)

| Metric | Why it matters | Target |
|---|---|---|
| `DEADLINE_EXCEEDED` rate (client-side) | Distinguishes "my deadline was too tight" from "the downstream is actually slow" — needs to be tracked separately from generic errors | <0.1% of calls |
| Retry budget consumption (client-side view) | Confirms the client's own retry policy isn't the thing pushing a struggling downstream over the edge | Tracked per client, capped per platform policy |
| Circuit breaker state transitions (as observed by the caller) | A caller seeing frequent open/close cycles on a dependency should treat that dependency as degraded even if its own error rate looks tolerable | Any sustained flapping |
| Unknown-field / schema-mismatch counters (application-level, via generated code introspection where available) | Protobuf's forward-compatible unknown-field handling can silently drop data a newer schema expects — worth surfacing rather than assuming "it just works" | Any nonzero rate on a Critical-tier contract |
| Backward-compatibility violation count (CI, per-repo) | Leading indicator tracked by the *calling* team's own CI, not just the platform's central registry — catches violations in code paths the central registry doesn't see (e.g., internal-only messages) | Zero on merge to main |

## Key Decisions

- **Deadline propagation and retry budgets are enforced at the mesh sidecar, not left to individual service implementations.** Relying on every team to correctly implement backoff-with-jitter is how retry storms happen; enforcing it in the shared sidecar makes the safe behavior the default.
- **Schema compatibility is a CI gate, not a runtime check.** By the time an incompatible schema change reaches production, the cost of the incident is already far higher than the cost of blocking the merge.
- **Backward *and* forward compatibility for Critical tier**, not just backward. Rolling deployments mean old and new service versions run simultaneously; forward compatibility (old code tolerating new-schema messages) is what keeps that window safe.
- **The mesh control plane must degrade to "last known good" on its own failure**, not fail closed — a control-plane outage should never be the thing that takes down otherwise-healthy service-to-service traffic.

## Tech Stack / Reference Implementation

- **RPC framework** — gRPC over HTTP/2, Protobuf3 message definitions
- **Service mesh** — Istio or Linkerd (Envoy/sidecar-based), mTLS between services
- **Schema governance** — Buf Schema Registry (or Confluent Schema Registry for Protobuf-over-Kafka contracts), CI-enforced `buf breaking` checks
- **Observability** — OpenTelemetry tracing/metrics through the mesh sidecar, Prometheus/Grafana for aggregate dashboards

---

*Part of the Data Services PaaS requirements series — see the [RPC-compatibility and scaling deep dive](/articles/2026-paas-grpc-protobuf-rpc-compatibility-and-scaling/) for this service, the [requirements framework](/articles/2026-paas-requirements-framework/) this spec applies, plus [Redis](/articles/2026-paas-redis-requirements/), [Kafka](/articles/2026-paas-kafka-requirements/), [Elasticsearch](/articles/2026-paas-elasticsearch-requirements/), and [MySQL](/articles/2026-paas-mysql-requirements/).*
