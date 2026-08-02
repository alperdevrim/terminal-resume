import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'
import { describe, expect, it } from 'vitest'
import { parseResume } from './transform'

describe('parseResume', () => {
  it('returns fully-defaulted empty resume for non-object input', () => {
    expect(parseResume(null)).toEqual({
      profile: { name: 'Anonymous', title: '', location: '', summary: '' },
      experience: [],
      education: [],
      skills: {},
      projects: [],
      certifications: [],
      contact: { email: '', phone: null, website: null },
      socials: {},
      terminal: { user: null, host: null, welcome: null },
    })
  })

  it('returns fully-defaulted empty resume for a scalar/array/undefined input', () => {
    for (const input of [undefined, 'not an object', 42, ['a', 'b']]) {
      expect(parseResume(input).profile.name).toBe('Anonymous')
      expect(parseResume(input).experience).toEqual([])
    }
  })

  it('parses a well-formed profile', () => {
    const result = parseResume({
      profile: { name: 'Ada', title: 'Engineer', location: 'Remote', summary: 'Builds things.' },
    })
    expect(result.profile).toEqual({
      name: 'Ada',
      title: 'Engineer',
      location: 'Remote',
      summary: 'Builds things.',
    })
  })

  it('drops experience entries missing both company and position', () => {
    const result = parseResume({
      experience: [
        { company: 'Acme', position: 'Engineer', start_date: '2020', end_date: '2022' },
        { description: ['orphaned entry with no company/position'] },
        { company: '', position: '' },
      ],
    })
    expect(result.experience).toHaveLength(1)
    expect(result.experience[0]).toEqual({
      company: 'Acme',
      position: 'Engineer',
      startDate: '2020',
      endDate: '2022',
      description: [],
      technologies: [],
    })
  })

  it('defaults a missing end_date to "Present"', () => {
    const result = parseResume({
      experience: [{ company: 'Acme', position: 'Engineer', start_date: '2020' }],
    })
    expect(result.experience[0].endDate).toBe('Present')
  })

  it('filters non-string entries out of string-array fields', () => {
    const result = parseResume({
      experience: [
        {
          company: 'Acme',
          position: 'Engineer',
          description: ['ok', 42, null, 'also ok'],
          technologies: ['TS', {}, 'Go'],
        },
      ],
    })
    expect(result.experience[0].description).toEqual(['ok', 'also ok'])
    expect(result.experience[0].technologies).toEqual(['TS', 'Go'])
  })

  it('drops skill categories that resolve to an empty list', () => {
    const result = parseResume({
      skills: { cloud: ['AWS'], empty: [], malformed: 'not-an-array' },
    })
    expect(result.skills).toEqual({ cloud: ['AWS'] })
  })

  it('drops projects without a name and preserves a null url', () => {
    const result = parseResume({
      projects: [
        { name: 'Has Url', url: 'https://example.com' },
        { name: 'No Url', url: null },
        { description: 'missing a name' },
      ],
    })
    expect(result.projects).toHaveLength(2)
    expect(result.projects[1].url).toBeNull()
  })

  it('parses contact, defaulting absent phone/website to null', () => {
    const result = parseResume({ contact: { email: 'a@b.com' } })
    expect(result.contact).toEqual({ email: 'a@b.com', phone: null, website: null })
  })

  it('only keeps string values in socials', () => {
    const result = parseResume({
      socials: { github: 'https://github.com/x', broken: 42 },
    })
    expect(result.socials).toEqual({ github: 'https://github.com/x' })
  })

  it('parses terminal overrides, defaulting absent ones to null', () => {
    expect(
      parseResume({ terminal: { user: 'root', host: 'example', welcome: 'Hi.' } }).terminal,
    ).toEqual({
      user: 'root',
      host: 'example',
      welcome: 'Hi.',
    })
    expect(parseResume({ terminal: { user: 'root' } }).terminal).toEqual({
      user: 'root',
      host: null,
      welcome: null,
    })
    expect(parseResume({}).terminal).toEqual({ user: null, host: null, welcome: null })
  })

  it('successfully parses the real resume.yaml shipped with the site', () => {
    const yamlPath = fileURLToPath(new URL('../../data/resume.yaml', import.meta.url))
    const raw = yaml.load(readFileSync(yamlPath, 'utf-8'))
    const result = parseResume(raw)

    expect(result.profile.name).not.toBe('')
    expect(result.experience.length).toBeGreaterThan(0)
    expect(result.contact.email).toContain('@')
  })
})
