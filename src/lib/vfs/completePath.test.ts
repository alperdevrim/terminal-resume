import { describe, expect, it } from 'vitest'
import { parseResume } from '../resume/transform'
import { buildVfs } from './buildVfs'
import { completePath } from './completePath'

const root = buildVfs(
  parseResume({
    experience: [{ company: 'Acme Corp', position: 'Engineer' }],
    skills: { cloud: ['AWS'] },
  }),
)

describe('completePath', () => {
  it('completes a top-level prefix, marking directories', () => {
    expect(completePath(root, 'exp')).toEqual(['experience/'])
  })

  it('completes a nested prefix inside a directory', () => {
    expect(completePath(root, 'experience/ac')).toEqual(['experience/acme-corp'])
  })

  it('returns all children for an empty prefix at root', () => {
    expect(completePath(root, '')).toEqual(
      expect.arrayContaining(['about', 'experience/', 'skills/']),
    )
  })

  it('returns nothing for a prefix inside a non-existent directory', () => {
    expect(completePath(root, 'nope/ac')).toEqual([])
  })

  it('returns nothing when the prefix matches no entries', () => {
    expect(completePath(root, 'zzz')).toEqual([])
  })
})
