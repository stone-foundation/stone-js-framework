# Stone.js Roadmap

Stone.js is currently in **public beta (0.8.x)**. This document describes the path to a stable 1.0 release and the directions we are exploring beyond it.

**How to read this roadmap:**

- Milestones are defined by **exit criteria, not dates**. A milestone ships when its criteria are met.
- The only public time window is for 1.0: we are **targeting early 2027**.
- Every roadmap item is (or will become) a real GitHub issue, tracked on the public [Stone.js Roadmap project board](https://github.com/orgs/stone-foundation/projects/3).
- All `@stone-js/*` packages are versioned together (lockstep). During the beta, fixes and new modules ship continuously as patch releases.

Want to influence this roadmap? Open a thread in [GitHub Discussions](https://github.com/stone-foundation/stone-js-framework/discussions) (Ideas / RFC), or pick up a [`good first issue`](https://github.com/stone-foundation/stone-js-framework/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

---

## Route to 1.0

### 0.8.x · Beta consolidation (in progress)

Goal: complete the module catalogue and harden the developer experience with real-world feedback.

- [ ] Remaining first-party modules:
  - `@stone-js/rate-limit`: edge-friendly request throttling
  - `@stone-js/notifications`: multi-channel notifications (email, SMS, push, in-app)
  - `@stone-js/mcp`: MCP as a native application ability, exposing your domain to AI agents through your application's own routes (dev-time tooling already exists with `@stone-js/mcp-dev`)
- [ ] Full parity between the declarative (decorators) and imperative (`define*`) APIs across every module
- [ ] CLI scaffolding aligned with the full module catalogue
- [ ] Official starters using `@stone-js/testing` end to end
- [ ] A documentation page for every published package on [stonejs.dev](https://stonejs.dev)
- [ ] Onboard a first group of pilot users building real applications, and turn every reported friction into a tracked issue

**We are actively looking for pilot users.** If you want to build something real with Stone.js and get direct support from the maintainer, say hello in Discussions.

### 0.9.0 · API freeze

0.9.0 means one thing: **the public API surface stops moving until 1.0**, except for removals already marked as deprecated.

- [ ] All intended breaking changes are done before this release (this is the last window)
- [ ] Pilot feedback on the public API is integrated, or explicitly declined and documented
- [ ] A written stability policy: what counts as public API (documented exports, `stone.*` blueprint keys, adapter contracts) and how semver applies to it
- [ ] Full review of every public export, with deprecations marked `@deprecated` and a replacement documented

### 1.0.0-rc · Release candidate

A hardening period of a few weeks. Bug fixes only; every feature moves to post-1.0.

- [ ] Documentation freeze and full review, including a migration guide from 0.8/0.9
- [ ] Platform matrix validated with real deployments: Node 20/22/24, AWS Lambda, Azure Functions, GCP Cloud Functions, Alibaba FC, Tencent SCF, WinterCG edge runtimes, browser, CLI
- [ ] `SECURITY.md` and a responsible disclosure process
- [ ] Zero known dependency vulnerabilities, quality gate green

### 1.0.0 · General availability (targeted early 2027)

- [ ] Published stability contract: what semver covers, supported versions, release cadence
- [ ] Lightweight governance: how contributors become triagers, reviewers, and maintainers
- [ ] Launch announcement and a signature demo: the same domain running on Node, serverless, edge, and the browser, and exposed to AI agents

---

## Beyond 1.0

These are directions, not commitments, and they carry no dates. They live on the **Next / Later** columns of the project board.

### Next

- **Public benchmarks**: a reproducible benchmark suite measuring Stone.js against itself across every supported target: the same domain deployed everywhere, tracking cold start, TTFB, latency percentiles, memory, and bundle size over releases
- **Starter catalogue**: a registry-driven catalogue of official and community starters, open to third-party submissions by PR
- **Observability**: OTLP and Prometheus exporters on top of `@stone-js/telemetry`
- **Scheduling**: cron-style background scheduling module
- **Agent-native, deepened**: richer dev-time tooling around `@stone-js/mcp-dev` and deeper patterns for agent-driven applications

### Later

- Adapters for additional runtimes and platforms as they emerge
- A third-party module ecosystem, surfaced through the documentation site
- Additional view engines on top of `@stone-js/use-view`, driven by demand
- Additional drivers for queue, cache, and realtime (hosted providers)
- ORM integrations via providers (there will be no first-party ORM, by design)
- A long-term support policy after 1.0, based on adoption

---

## Community & adoption

Building the framework is half the work. This track covers how Stone.js grows as a project, on the same Now / Next / Later horizons.

**Now**

- Pilot user program: a first group of builders shipping real applications with direct maintainer support
- Community channels: GitHub Discussions (Q&A, Ideas / RFC, Show and tell) and Discord
- A curated [`good first issue`](https://github.com/stone-foundation/stone-js-framework/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) backlog for new contributors

**Next**

- Learning resources: guided tutorials, cloud-native architecture recipes on the blog, video walkthroughs
- Contributor ladder: a documented path from first pull request to triager, reviewer, and maintainer
- Production showcases: real applications built with Stone.js, documented as case studies
- Talks and workshops: conferences, meetups, and developer communities

**Later**

- A dedicated core team around the project
- Training programs for teams adopting Stone.js
- Enterprise adoption support: long-term support policy, upgrade guarantees, priority security process
- Regional communities and local meetups

---

## History

- **2026-07**: 0.8.x beta published: 45+ packages, cloud adapters for AWS, Azure, GCP, Alibaba, Tencent and edge runtimes, realtime, i18n, validation, auth, and the [stonejs.dev](https://stonejs.dev) documentation site.
