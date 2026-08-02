import { describe, expect, it } from 'vitest'
import { autocomplete } from './autocomplete'

const commandNames = ['about', 'cat', 'certifications', 'clear', 'contact', 'ls']

function fakeCompletePath(entries: Record<string, string[]>) {
  return (partial: string): string[] => entries[partial] ?? []
}

describe('autocomplete', () => {
  it('completes a unique command prefix', () => {
    const result = autocomplete('abo', { commandNames, completePath: fakeCompletePath({}) })
    expect(result.value).toBe('about')
    expect(result.matches).toEqual(['about'])
  })

  it('completes an ambiguous command prefix to the longest common prefix', () => {
    const result = autocomplete('c', { commandNames, completePath: fakeCompletePath({}) })
    expect(result.value).toBe('c')
    expect(result.matches.sort()).toEqual(['cat', 'certifications', 'clear', 'contact'])
  })

  it('leaves input unchanged when nothing matches', () => {
    const result = autocomplete('zz', { commandNames, completePath: fakeCompletePath({}) })
    expect(result.value).toBe('zz')
    expect(result.matches).toEqual([])
  })

  it('completes a path argument for ls', () => {
    const completePath = fakeCompletePath({ exp: ['experience/'] })
    const result = autocomplete('ls exp', { commandNames, completePath })
    expect(result.value).toBe('ls experience/')
  })

  it('completes a path argument for cat', () => {
    const completePath = fakeCompletePath({ cont: ['contact'] })
    const result = autocomplete('cat cont', { commandNames, completePath })
    expect(result.value).toBe('cat contact')
  })

  it('does not attempt path completion for non-path-aware commands', () => {
    const result = autocomplete('about ext', { commandNames, completePath: fakeCompletePath({}) })
    expect(result.value).toBe('about ext')
    expect(result.matches).toEqual([])
  })
})
