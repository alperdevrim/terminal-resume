import { describe, expect, it } from 'vitest'
import { formatLanguages, formatSkillCategory } from './format'
import { parseResume } from './transform'

function textOf(lines: { text: string }[][]): string[] {
  return lines.map((line) => line.map((span) => span.text).join(''))
}

describe('skill parsing', () => {
  it('accepts bare strings and mappings in the same category', () => {
    const result = parseResume({
      skills: { cloud: ['AWS', { name: 'Kubernetes', level: 75, color: 'blue' }] },
    })
    expect(result.skills.cloud).toEqual([
      { name: 'AWS', level: null, color: null },
      { name: 'Kubernetes', level: 75, color: 'blue' },
    ])
  })

  it('clamps out-of-range levels and rejects unusable ones', () => {
    const result = parseResume({
      skills: {
        cloud: [
          { name: 'High', level: 250 },
          { name: 'Low', level: -40 },
          { name: 'Bogus', level: 'lots' },
        ],
      },
    })
    expect(result.skills.cloud.map((s) => s.level)).toEqual([100, 0, null])
  })

  it('ignores unknown color names rather than passing them through', () => {
    const result = parseResume({ skills: { cloud: [{ name: 'AWS', color: 'chartreuse' }] } })
    expect(result.skills.cloud[0].color).toBeNull()
  })
})

describe('formatSkillCategory', () => {
  it('renders a compact list when no skill declares a level', () => {
    const { skills } = parseResume({ skills: { cloud: ['AWS', 'GCP'] } })
    expect(textOf(formatSkillCategory('cloud', skills.cloud))).toEqual(['Cloud', '  AWS · GCP'])
  })

  it('switches to one row per skill once any level is present', () => {
    const { skills } = parseResume({
      skills: { cloud: ['AWS', { name: 'Kubernetes', level: 50 }] },
    })
    const rendered = textOf(formatSkillCategory('cloud', skills.cloud))
    expect(rendered).toHaveLength(3)
    expect(rendered[2]).toContain('50%')
    // The level-less skill still gets its own row, just without a meter.
    expect(rendered[1]).not.toContain('%')
  })

  it('draws the meter proportionally to the level', () => {
    const { skills } = parseResume({ skills: { cloud: [{ name: 'X', level: 100 }] } })
    expect(textOf(formatSkillCategory('cloud', skills.cloud))[1]).toContain('█'.repeat(20))
  })
})

describe('formatLanguages', () => {
  it('renders name, meter and note', () => {
    const resume = parseResume({
      languages: [{ name: 'Turkish', level: 100, note: 'Native' }],
    })
    const rendered = textOf(formatLanguages(resume))
    expect(rendered[0]).toBe('Languages')
    expect(rendered[1]).toContain('Turkish')
    expect(rendered[1]).toContain('100%')
    expect(rendered[1]).toContain('Native')
  })

  it('reports an empty section rather than rendering nothing', () => {
    expect(textOf(formatLanguages(parseResume({})))).toEqual([
      'Languages',
      'No languages listed.',
    ])
  })
})
