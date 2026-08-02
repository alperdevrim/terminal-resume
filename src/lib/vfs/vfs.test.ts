import { describe, expect, it } from 'vitest'
import { parseResume } from '../resume/transform'
import { buildVfs } from './buildVfs'
import { resolvePath } from './resolvePath'

const resume = parseResume({
  profile: { name: 'Ada', title: 'Engineer', location: 'Remote', summary: 'Summary.' },
  experience: [
    { company: 'Acme Corp', position: 'Engineer', start_date: '2020', end_date: '2022' },
    { company: 'Acme Corp', position: 'Senior Engineer', start_date: '2022', end_date: 'Present' },
  ],
  skills: { cloud: ['AWS'], containers: ['Docker'] },
  projects: [{ name: 'Cool Project', url: 'https://example.com' }],
  contact: { email: 'ada@example.com' },
})

describe('buildVfs', () => {
  it('lists top-level entries matching the spec-shaped filesystem', () => {
    const root = buildVfs(resume)
    expect(root.children.map((c) => c.name)).toEqual([
      'about',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
      'contact',
      'socials',
    ])
  })

  it('slugifies experience entries and disambiguates collisions', () => {
    const root = buildVfs(resume)
    const experience = root.children.find((c) => c.name === 'experience')
    expect(experience?.type).toBe('dir')
    if (experience?.type !== 'dir') throw new Error('unreachable')
    expect(experience.children.map((c) => c.name)).toEqual(['acme-corp', 'acme-corp-2'])
  })

  it('builds one file per skill category', () => {
    const root = buildVfs(resume)
    const skills = root.children.find((c) => c.name === 'skills')
    if (skills?.type !== 'dir') throw new Error('unreachable')
    expect(skills.children.map((c) => c.name)).toEqual(['cloud', 'containers'])
  })
})

describe('resolvePath', () => {
  const root = buildVfs(resume)

  it('resolves the root for an empty path', () => {
    expect(resolvePath(root, '')).toBe(root)
  })

  it('resolves a top-level file', () => {
    const node = resolvePath(root, 'about')
    expect(node?.type).toBe('file')
    expect(node?.name).toBe('about')
  })

  it('resolves a nested file inside a directory', () => {
    const node = resolvePath(root, 'experience/acme-corp')
    expect(node?.type).toBe('file')
  })

  it('ignores leading/trailing slashes', () => {
    expect(resolvePath(root, '/about/')).not.toBeNull()
  })

  it('is case-sensitive', () => {
    expect(resolvePath(root, 'About')).toBeNull()
  })

  it('returns null for a path that does not exist', () => {
    expect(resolvePath(root, 'nope')).toBeNull()
  })

  it('returns null when traversing through a file as if it were a directory', () => {
    expect(resolvePath(root, 'about/nested')).toBeNull()
  })
})
