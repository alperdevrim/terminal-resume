import { describe, expect, it } from 'vitest'
import { parseResume } from '../resume/transform'
import { buildVfs } from '../vfs/buildVfs'
import { enabledCommands, isCommandEnabled } from './enabled'
import { executeCommand } from './executor'
import { commands } from './registry'

function flatten(lines: { text: string }[][]): string {
  return lines.map((line) => line.map((span) => span.text).join('')).join('\n')
}

function contextFor(toggles: Record<string, boolean>) {
  const resume = parseResume({
    profile: { name: 'Ada' },
    contact: { email: 'ada@example.com' },
    terminal: { commands: toggles },
  })
  return { resume, vfs: buildVfs(resume), history: [] }
}

describe('command toggles', () => {
  it('leaves commands enabled when the config says nothing', () => {
    const resume = parseResume({})
    expect(isCommandEnabled(resume, 'skills')).toBe(true)
    expect(enabledCommands(resume, commands)).toHaveLength(commands.length)
  })

  it('disables a command set to false', () => {
    const resume = parseResume({ terminal: { commands: { skills: false } } })
    expect(isCommandEnabled(resume, 'skills')).toBe(false)
    expect(enabledCommands(resume, commands).map((c) => c.name)).not.toContain('skills')
  })

  it('refuses to disable help, which would strand the user', () => {
    const resume = parseResume({ terminal: { commands: { help: false } } })
    expect(isCommandEnabled(resume, 'help')).toBe(true)
  })

  it('reports a disabled command as not found rather than running it', () => {
    const result = executeCommand('skills', contextFor({ skills: false }))
    if (result?.kind !== 'output') throw new Error('unreachable')
    expect(flatten(result.lines)).toContain('command not found: skills')
  })

  it('still runs commands left enabled', () => {
    const result = executeCommand('contact', contextFor({ skills: false }))
    if (result?.kind !== 'output') throw new Error('unreachable')
    expect(flatten(result.lines)).toContain('ada@example.com')
  })

  it('omits disabled commands from help output', () => {
    const result = executeCommand('help', contextFor({ skills: false }))
    if (result?.kind !== 'output') throw new Error('unreachable')
    const text = flatten(result.lines)
    expect(text).not.toContain('skills')
    expect(text).toContain('contact')
  })

  it('does not suggest a disabled command for a typo', () => {
    const result = executeCommand('skils', contextFor({ skills: false }))
    if (result?.kind !== 'output') throw new Error('unreachable')
    expect(flatten(result.lines)).not.toContain("Did you mean 'skills'")
  })
})
