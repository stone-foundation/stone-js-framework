import { describe, it, expect } from 'vitest'
import {
  STONE_SNAPSHOT_ID,
  escapeSnapshotJson,
  serializeSnapshot,
  renderSnapshotScript,
  parseSnapshot
} from '../src/snapshot'

const LS = String.fromCharCode(0x2028) // U+2028 line separator
const PS = String.fromCharCode(0x2029) // U+2029 paragraph separator

describe('escapeSnapshotJson', () => {
  it('escapes </script> so it cannot close the host tag (XSS)', () => {
    const raw = JSON.stringify({ bio: '</script><script>alert(1)</script>' })
    const escaped = escapeSnapshotJson(raw)

    expect(escaped).not.toContain('</script>')
    expect(escaped).not.toContain('<script>')
    expect(escaped).toContain('\\u003C')
    // Still valid JSON that round-trips to the original value.
    expect(JSON.parse(escaped)).toEqual({ bio: '</script><script>alert(1)</script>' })
  })

  it('escapes line and paragraph separators (U+2028 / U+2029)', () => {
    const raw = JSON.stringify({ text: `a${LS}b${PS}c` })
    const escaped = escapeSnapshotJson(raw)

    expect(escaped).not.toContain(LS)
    expect(escaped).not.toContain(PS)
    expect(escaped).toContain('\\u2028')
    expect(escaped).toContain('\\u2029')
    expect(JSON.parse(escaped)).toEqual({ text: `a${LS}b${PS}c` })
  })

  it('escapes ampersands', () => {
    expect(escapeSnapshotJson('{"x":"a&b"}')).toBe('{"x":"a\\u0026b"}')
  })
})

describe('renderSnapshotScript', () => {
  it('produces an application/json script tag that cannot be broken out of', () => {
    const html = renderSnapshotScript({ user: '</script>' })

    expect(html).toContain(`id="${STONE_SNAPSHOT_ID}"`)
    expect(html).toContain('type="application/json"')
    // Exactly one closing tag — the payload's </script> did not create a second one.
    expect(html.match(/<\/script>/g)).toHaveLength(1)
  })

  it('accepts a pre-serialized JSON string and still escapes it', () => {
    const html = renderSnapshotScript('{"x":"</script>"}')
    expect(html.match(/<\/script>/g)).toHaveLength(1)
    expect(html).toContain('\\u003C/script')
  })

  it('escapes a hostile id', () => {
    const html = renderSnapshotScript({}, '"><img onerror=alert(1)>')
    expect(html).not.toContain('<img')
  })
})

describe('serializeSnapshot / parseSnapshot round-trip', () => {
  it('round-trips arbitrary values through escape + parse', () => {
    const value = { a: 1, b: 'x</script>y', c: ['<', '>', '&'], d: { nested: true } }
    expect(parseSnapshot(serializeSnapshot(value))).toEqual(value)
  })

  it('returns {} for empty or invalid input', () => {
    expect(parseSnapshot(null)).toEqual({})
    expect(parseSnapshot(undefined)).toEqual({})
    expect(parseSnapshot('')).toEqual({})
    expect(parseSnapshot('   ')).toEqual({})
    expect(parseSnapshot('{not json')).toEqual({})
  })

  it('serializes null/undefined as an empty object', () => {
    expect(serializeSnapshot(undefined)).toBe('{}')
    expect(serializeSnapshot(null)).toBe('{}')
  })
})
