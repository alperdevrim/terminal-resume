import { describe, expect, it } from 'vitest'
import { tokenize } from './parser'

describe('tokenize', () => {
  it('splits on whitespace', () => {
    expect(tokenize('ls experience')).toEqual(['ls', 'experience'])
  })

  it('collapses repeated whitespace', () => {
    expect(tokenize('cat   contact')).toEqual(['cat', 'contact'])
  })

  it('trims leading and trailing whitespace', () => {
    expect(tokenize('  whoami  ')).toEqual(['whoami'])
  })

  it('returns an empty array for blank input', () => {
    expect(tokenize('')).toEqual([])
    expect(tokenize('   ')).toEqual([])
  })

  it('preserves case', () => {
    expect(tokenize('Help')).toEqual(['Help'])
  })
})
