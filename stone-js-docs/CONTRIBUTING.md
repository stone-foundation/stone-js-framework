
# Contributing to the Stone.js Documentation

Contributions are **highly welcome** and will be **fully credited**.

Whether you're fixing a typo, improving clarity, adding examples, or writing a new page, thank you for helping make the Stone.js documentation easier for everyone to learn.

Please read this guide before submitting issues or pull requests.

## Our Philosophy

Stone.js is built around the idea of clarity, context, and continuity. That applies to our docs too.

We’re not just writing markdown, we’re designing a learning experience.  
Our goal is to help readers understand concepts quickly, with clean examples and context-aware explanations.

## Etiquette

This is an open-source, community-driven project. Please be respectful and constructive in all interactions.

- Be kind and clear in communication.
- Assume good intent and work collaboratively.
- If your PR is not accepted, don’t take it personally, every decision is made to protect the consistency and quality of the docs.

Maintainers donate their time to review contributions. Let's make it pleasant for everyone.

## Contribution Types

You can contribute by:

- Fixing typos or grammar issues
- Improving wording or clarity
- Adding examples or code snippets
- Creating new documentation pages
- Reorganizing sections for better flow
- Improving formatting or navigation
- Suggesting better ways to explain a concept

## Before You Submit

Before opening an issue or PR:

- Check if the issue or improvement already exists.
- Review the [Documentation Master Plan](https://github.com/stone-foundation/stone-js-docs) to understand the structure and tone.
- Make sure your contribution fits into the existing structure (Intro → Feature → Registration → Best Practices → Summary).

## Writing Guidelines

- Keep the tone **clear, concise, and a bit witty** when appropriate.
- Favor **active voice** and simple phrasing.
- Use **code examples sparingly** and only when they add clarity.
- Avoid redundant explanations, documentation should be informative, not verbose.
- Use Stone.js terminology consistently (e.g. "Continuum Architecture", not just “framework”).

## PR Guidelines

- **One PR per feature or fix**, small and focused is best.
- Always follow the structure of the documentation page you are editing.
- Link new pages or sections in the appropriate sidebar or index if applicable.
- Use [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) messages:
  - `docs(router): improve redirect example`
  - `docs(error-handler): fix typo in summary`

## Commit Message Format

Follow this structure:

```

docs(<scope>): <description>

\[optional body]

```

Examples:

```

docs(pages): add head section documentation
docs(service-provider): fix grammar in best practices

```

## What Not to Include

- No tests, builds, or code logic in this repo.
- Do not include runtime code examples unless they are minimal and context-relevant.
- Don’t push generated files like `dist/` or `node_modules/`.

## Tools We Use

- [Hope Theme](https://theme-hope.vuejs.press)
- [VuePress](https://vuepress.vuejs.org/)
- [pnpm](https://pnpm.io/)
- [Husky](https://typicode.github.io/husky/#/)
- [Release Please](https://github.com/googleapis/release-please-action)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Automation

All PRs are automatically:

- Checked for build errors (`vuepress build`)
- Tracked via semantic versioning using `release-please`

## Licensing

By contributing, you agree that your contributions will be licensed under the same license as the rest of the documentation project.

**Thanks again for contributing to Stone.js documentation.**  
Let’s build the clearest, most developer-friendly docs in the galaxy.

**Happy writing!**