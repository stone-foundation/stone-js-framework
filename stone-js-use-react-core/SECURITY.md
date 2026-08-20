# Security Policy

Thank you for your interest in the security of Stone.js. We take the security of our framework and its users seriously. 
This document outlines the process for reporting vulnerabilities and our commitment to secure development.

## Supported Versions

We actively maintain and patch the latest stable release of Stone.js and its core packages.

| Version   | Status                             |
| --------- | ---------------------------------- |
| `1.x`     | ✅ Actively maintained             |
| `< 1.0.0` | ⚠️ Legacy, no guaranteed patches   |

If you're using an older version and encounter a security issue, we encourage you to upgrade to the latest release.

## Reporting a Vulnerability

If you discover a security vulnerability in Stone.js or any of its official packages, **please report it responsibly and privately**.

### How to report

- Email: **security@stonejs.dev**
- Subject: `Security Issue: [Your short description]`
- Include:
  - A detailed description of the vulnerability
  - Steps to reproduce (if applicable)
  - A suggested fix or patch (optional but appreciated)
  - Affected versions and environments

We will respond within **5 working days** and aim to provide a fix or mitigation within **30 days**, depending on severity.

## Our Commitment

We commit to:

- Promptly investigate and validate reports
- Keep reporters informed of the resolution progress
- Publicly disclose confirmed vulnerabilities **after a fix is available**, with appropriate credit (unless anonymity is requested)
- Maintain secure coding standards and regular dependency audits using:
  - [GitHub CodeQL](https://codeql.github.com/)
  - [Dependabot](https://github.com/dependabot)

## Disclosure Policy

We follow a **coordinated disclosure** policy:

- Vulnerabilities are not published until a fix is available.
- CVE identifiers will be requested when applicable.
- Security-related changes are clearly documented in release notes and changelogs.

## Acknowledgements

We deeply appreciate the responsible security researchers and users who help keep Stone.js secure.

If you’d like to contribute to security audits, penetration testing, or analysis of Stone.js internals, feel free to reach out via [security@stonejs.dev](mailto:security@stonejs.dev).

## Thank You

Security is a shared responsibility, thank you for helping make Stone.js safer for everyone.

— The Stone.js Team