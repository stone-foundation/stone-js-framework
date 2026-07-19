import { getConcept, searchKnowledge, knowledgeBase } from '../src/knowledge'
import { generateLlmsTxt, generateLlmsFullTxt } from '../src/llms'

describe('knowledge base', () => {
  it('has concepts, modules, best-practices and gaps', () => {
    expect(knowledgeBase.concepts.length).toBeGreaterThan(5)
    expect(knowledgeBase.modules.some((m) => m.package === '@stone-js/core')).toBe(true)
    expect(knowledgeBase.bestPractices.length).toBeGreaterThan(0)
    expect(knowledgeBase.gaps.some((g) => g.name === 'ORM')).toBe(true)
  })

  it('getConcept finds a concept (case-insensitive) or returns undefined', () => {
    expect(getConcept('CONTINUUM')?.title).toBe('Continuum Architecture')
    expect(getConcept('nope')).toBeUndefined()
  })

  it('searchKnowledge matches across kinds and returns [] for an empty query', () => {
    expect(searchKnowledge('')).toEqual([])
    const results = searchKnowledge('edge')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.kind === 'module')).toBe(true)

    const kinds = new Set(searchKnowledge('stone').map((r) => r.kind))
    expect(kinds.size).toBeGreaterThan(1)
  })

  it('matches concepts, best-practices and gaps too', () => {
    expect(searchKnowledge('continuum').some((r) => r.kind === 'concept')).toBe(true)
    expect(searchKnowledge('experimentalDecorators').some((r) => r.kind === 'best-practice')).toBe(true)
    expect(searchKnowledge('ORM').some((r) => r.kind === 'gap')).toBe(true)
  })
})

describe('llms.txt generators', () => {
  it('generateLlmsTxt lists the title, concepts and modules', () => {
    const txt = generateLlmsTxt()
    expect(txt).toContain('# Stone.js')
    expect(txt).toContain('Continuum Architecture')
    expect(txt).toContain('@stone-js/core')
  })

  it('generateLlmsFullTxt adds best-practices and gaps', () => {
    const txt = generateLlmsFullTxt()
    expect(txt).toContain('## Best practices')
    expect(txt).toContain('## Known gaps')
    expect(txt).toContain('experimentalDecorators')
  })
})
