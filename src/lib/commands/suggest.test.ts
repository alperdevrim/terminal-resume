import { describe, expect, it } from 'vitest'
import { levenshtein, suggestCommand } from './suggest'

describe('levenshtein', () => {
  it('is 0 for identical strings', () => {
    expect(levenshtein('help', 'help')).toBe(0)
  })

  it('counts a single substitution', () => {
    expect(levenshtein('cat', 'bat')).toBe(1)
  })

  it('counts insertions/deletions', () => {
    expect(levenshtein('ls', 'lsd')).toBe(1)
    expect(levenshtein('lsd', 'ls')).toBe(1)
  })
})

describe('suggestCommand', () => {
  const candidates = ['help', 'about', 'experience', 'education', 'skills', 'ls', 'cat']

  it('suggests the closest command for a typo', () => {
    expect(suggestCommand('experiance', candidates)).toBe('experience')
  })

  it('suggests for a one-character-off command', () => {
    expect(suggestCommand('hlep', candidates)).toBe('help')
  })

  it('returns null for a completely unrelated input', () => {
    expect(suggestCommand('kubernetes', candidates)).toBeNull()
  })

  it('returns null for an exact match', () => {
    expect(suggestCommand('help', candidates)).toBeNull()
  })
})
