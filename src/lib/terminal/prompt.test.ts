import { describe, expect, it } from 'vitest'
import { parseResume } from '../resume/transform'
import { buildPrompt } from './prompt'

describe('buildPrompt', () => {
  it('derives user from profile.name and defaults host to "resume"', () => {
    const resume = parseResume({ profile: { name: 'John' } })
    expect(buildPrompt(resume)).toBe('john@resume:~$')
  })

  it('uses only the first word of a multi-word name', () => {
    const resume = parseResume({ profile: { name: 'Ada Lovelace' } })
    expect(buildPrompt(resume)).toBe('ada@resume:~$')
  })

  it('lets terminal.user/host override the defaults', () => {
    const resume = parseResume({
      profile: { name: 'John' },
      terminal: { user: 'root', host: 'example' },
    })
    expect(buildPrompt(resume)).toBe('root@example:~$')
  })

  it('defaults to "anonymous" when profile.name is absent (parseProfile default)', () => {
    const resume = parseResume({})
    expect(buildPrompt(resume)).toBe('anonymous@resume:~$')
  })

  it('falls back to "guest" when the name has no alphanumeric characters', () => {
    const resume = parseResume({ profile: { name: '!!!' } })
    expect(buildPrompt(resume)).toBe('guest@resume:~$')
  })
})
