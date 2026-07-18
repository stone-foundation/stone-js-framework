# Security Policy

Thank you for helping keep Stone.js and its users safe. This policy covers **all** `@stone-js/*`
packages in this monorepo.

## Supported Versions

We actively maintain and patch the latest stable release line.

| Version   | Status                             |
| --------- | ---------------------------------- |
| `0.8.x`   | ✅ Actively maintained             |
| `< 0.8.0` | ⚠️ Pre-release, no guaranteed patches |

Please upgrade to the latest release before reporting an issue when possible.

## Reporting a Vulnerability

**Report privately — never open a public issue for a security problem.**

- Email: **security@stonejs.dev**
- Subject: `Security Issue: [short description]`
- Include: a description, reproduction steps, affected packages/versions, and (optionally) a
  suggested fix.

We aim to acknowledge reports within 72 hours and to provide a remediation timeline after triage.
Please give us a reasonable window to release a fix before any public disclosure.

## Scope

In scope: all published `@stone-js/*` packages (kernel, adapters, router, http-core, view layers,
CLI). Out of scope: example apps, documentation site content, and third-party dependencies (report
those upstream, but do tell us so we can pin/patch).
