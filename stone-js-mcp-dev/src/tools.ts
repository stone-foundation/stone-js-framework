import { generateLlmsFullTxt } from './llms'
import { McpToolDef, ReportToolsOptions } from './declarations'
import { getConcept, knowledgeBase, searchKnowledge } from './knowledge'

/**
 * The Stone.js framework-knowledge tools served by `stone mcp`. They are registered on the MCP
 * server automatically; point your coding agent at it and it can query the framework in real time
 * (concepts, modules, best-practices, gaps) instead of scanning every package.
 */
export const stoneMcpTools: McpToolDef[] = [
  {
    name: 'stone_search',
    description: 'Search the Stone.js knowledge base (concepts, modules, best-practices, gaps).',
    handler: (args) => searchKnowledge(String(args.query ?? ''))
  },
  {
    name: 'stone_concept',
    description: 'Explain a core Stone.js concept by id (omit id to list them all).',
    handler: (args) => {
      const id = String(args.id ?? '')
      if (id.length === 0) { return knowledgeBase.concepts.map((c) => ({ id: c.id, title: c.title })) }
      return getConcept(id) ?? { error: `Unknown concept: ${id}` }
    }
  },
  {
    name: 'stone_modules',
    description: 'List the Stone.js ecosystem modules and what each does.',
    handler: () => knowledgeBase.modules
  },
  {
    name: 'stone_best_practices',
    description: 'List Stone.js conventions and anti-patterns, each with its rationale.',
    handler: () => knowledgeBase.bestPractices
  },
  {
    name: 'stone_gaps',
    description: 'List what Stone.js does not (yet) provide, and what to reach for instead.',
    handler: () => knowledgeBase.gaps
  },
  {
    name: 'stone_brief',
    description: 'Return the full agent brief (llms-full.txt): concepts, modules, best-practices, gaps.',
    handler: () => generateLlmsFullTxt()
  }
]

/**
 * Creates tools that let an agent (or the developer through it) report a bug or request a feature
 * as a real GitHub issue, straight from the dev loop.
 *
 * @param options - The GitHub token and target repository.
 * @returns The report tools.
 */
export function createReportTools (options: ReportToolsOptions): McpToolDef[] {
  const doFetch = options.fetch ?? fetch

  const openIssue = async (title: string, body: string, label: string): Promise<unknown> => {
    const response = await doFetch(`https://api.github.com/repos/${options.repo}/issues`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${options.token}`,
        accept: 'application/vnd.github+json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ title, body, labels: [label] })
    })

    if (!response.ok) {
      return { error: `GitHub API error: ${response.status}` }
    }

    const issue = await response.json() as { number?: number, html_url?: string }
    return { number: issue.number, url: issue.html_url }
  }

  return [
    {
      name: 'stone_report_bug',
      description: 'Open a bug report as a GitHub issue on the Stone.js repository.',
      handler: async (args) => await openIssue(String(args.title ?? 'Bug report'), String(args.body ?? ''), 'bug')
    },
    {
      name: 'stone_request_feature',
      description: 'Open a feature request as a GitHub issue on the Stone.js repository.',
      handler: async (args) => await openIssue(String(args.title ?? 'Feature request'), String(args.body ?? ''), 'enhancement')
    }
  ]
}
