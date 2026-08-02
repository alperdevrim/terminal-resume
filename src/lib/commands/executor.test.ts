import { describe, expect, it } from 'vitest'
import { parseResume } from '../resume/transform'
import { buildVfs } from '../vfs/buildVfs'
import { executeCommand } from './executor'
import type { CommandContext } from './types'

const resume = parseResume({
  profile: { name: 'Ada Lovelace', title: 'Engineer', location: 'Remote', summary: 'Summary.' },
  experience: [{ company: 'Acme Corp', position: 'Engineer', start_date: '2020', end_date: '2022' }],
  contact: { email: 'ada@example.com' },
})
const vfs = buildVfs(resume)

function makeContext(history: string[] = []): CommandContext {
  return { resume, vfs, history }
}

function flatten(lines: { text: string }[][]): string {
  return lines.map((line) => line.map((span) => span.text).join('')).join('\n')
}

describe('executeCommand', () => {
  it('returns null for blank input', () => {
    expect(executeCommand('', makeContext())).toBeNull()
    expect(executeCommand('   ', makeContext())).toBeNull()
  })

  it('runs whoami against resume data', () => {
    const result = executeCommand('whoami', makeContext())
    expect(result?.kind).toBe('output')
    if (result?.kind !== 'output') throw new Error('unreachable')
    expect(flatten(result.lines)).toContain('Ada Lovelace')
  })

  it('is case-sensitive: capitalized command names are not recognized', () => {
    const result = executeCommand('Whoami', makeContext())
    expect(result?.kind).toBe('output')
    if (result?.kind !== 'output') throw new Error('unreachable')
    expect(flatten(result.lines)).toContain('command not found: Whoami')
  })

  it('reports unknown commands and suggests a close match', () => {
    const result = executeCommand('experiance', makeContext())
    if (result?.kind !== 'output') throw new Error('unreachable')
    const text = flatten(result.lines)
    expect(text).toContain('command not found: experiance')
    expect(text).toContain("Did you mean 'experience'?")
  })

  it('reports unknown commands with no suggestion when nothing is close', () => {
    const result = executeCommand('kubernetes', makeContext())
    if (result?.kind !== 'output') throw new Error('unreachable')
    const text = flatten(result.lines)
    expect(text).toContain('command not found: kubernetes')
    expect(text).toContain("Type 'help' to see available commands.")
  })

  it('returns a clear result for the clear command', () => {
    expect(executeCommand('clear', makeContext())).toEqual({ kind: 'clear' })
  })

  it('runs ls against the virtual filesystem', () => {
    const result = executeCommand('ls', makeContext())
    if (result?.kind !== 'output') throw new Error('unreachable')
    expect(flatten(result.lines)).toContain('experience/')
  })

  it('runs cat against a vfs file', () => {
    const result = executeCommand('cat contact', makeContext())
    if (result?.kind !== 'output') throw new Error('unreachable')
    expect(flatten(result.lines)).toContain('ada@example.com')
  })

  it('reports history from context', () => {
    const result = executeCommand('history', makeContext(['whoami', 'ls']))
    if (result?.kind !== 'output') throw new Error('unreachable')
    const text = flatten(result.lines)
    expect(text).toContain('whoami')
    expect(text).toContain('ls')
  })
})
