import { describe, expect, it } from 'vitest'
import { parseResume } from '../resume/transform'
import { buildWelcome } from './motd'

describe('buildWelcome', () => {
  it('defaults to the stock message with profile.name interpolated', () => {
    const resume = parseResume({ profile: { name: 'John' } })
    expect(buildWelcome(resume)).toBe("Welcome to John's interactive resume.")
  })

  it('lets terminal.welcome override the message', () => {
    const resume = parseResume({
      profile: { name: 'John' },
      terminal: { welcome: 'Hey there.' },
    })
    expect(buildWelcome(resume)).toBe('Hey there.')
  })

  it('substitutes {name} in a custom message, every occurrence', () => {
    const resume = parseResume({
      profile: { name: 'Ada Lovelace' },
      terminal: { welcome: '{name}? Yes, {name}.' },
    })
    expect(buildWelcome(resume)).toBe('Ada Lovelace? Yes, Ada Lovelace.')
  })

  it('falls back to a name-free message when profile.name is blank', () => {
    const resume = parseResume({ profile: { name: '' } })
    expect(buildWelcome(resume)).toBe('Welcome to this interactive resume.')
  })

  it('treats a blank terminal.welcome as unset', () => {
    const resume = parseResume({
      profile: { name: 'John' },
      terminal: { welcome: '   ' },
    })
    expect(buildWelcome(resume)).toBe("Welcome to John's interactive resume.")
  })
})
