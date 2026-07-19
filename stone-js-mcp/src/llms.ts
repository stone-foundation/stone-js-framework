import { knowledgeBase } from './knowledge'
import { KnowledgeBase } from './declarations'

/**
 * Generates the concise `llms.txt` index (the emerging standard: a short, link-friendly Markdown
 * map an agent can read in one shot). Serve it at `/llms.txt` from the docs site.
 *
 * @param base - The knowledge base (defaults to the built-in one).
 * @returns The `llms.txt` content.
 */
export function generateLlmsTxt (base: KnowledgeBase = knowledgeBase): string {
  const concepts = base.concepts.map((c) => `- **${c.title}**: ${c.summary}`).join('\n')
  const modules = base.modules.map((m) => `- \`${m.package}\` (${m.tier}): ${m.summary}`).join('\n')

  return `# ${base.name}

> ${base.tagline} (v${base.version})

## Core concepts

${concepts}

## Modules

${modules}
`
}

/**
 * Generates the fuller `llms-full.txt` (adds best-practices and known gaps) — the complete brief
 * for an agent building with Stone.js.
 *
 * @param base - The knowledge base (defaults to the built-in one).
 * @returns The `llms-full.txt` content.
 */
export function generateLlmsFullTxt (base: KnowledgeBase = knowledgeBase): string {
  const bestPractices = base.bestPractices.map((b) => `- ${b.rule}\n  - Why: ${b.why}`).join('\n')
  const gaps = base.gaps.map((g) => `- **${g.name}** (${g.status}): ${g.note}`).join('\n')

  return `${generateLlmsTxt(base)}
## Best practices

${bestPractices}

## Known gaps (what to reach for a third party or the roadmap)

${gaps}
`
}
