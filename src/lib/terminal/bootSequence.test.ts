import { describe, expect, it } from 'vitest'
import { parseResume } from '../resume/transform'
import { getBootSteps } from './bootSequence'

describe('getBootSteps', () => {
  it('mounts the home directory of terminal.user', () => {
    const resume = parseResume({ terminal: { user: 'root' } })
    expect(getBootSteps(resume)[0]).toBe('Mounted /home/root')
  })

  it('falls back to a slug of profile.name when terminal.user is unset', () => {
    const resume = parseResume({ profile: { name: 'Ada Lovelace' } })
    expect(getBootSteps(resume)[0]).toBe('Mounted /home/ada')
  })

  it('ends on the boot target', () => {
    const steps = getBootSteps(parseResume({}))
    expect(steps.at(-1)).toBe('Reached target')
  })
})
