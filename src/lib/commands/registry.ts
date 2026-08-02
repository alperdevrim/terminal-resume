import { dim, dirSpan, errorSpan, line, text, textLine, type OutputLine } from '../output'
import {
  formatAbout,
  formatCertifications,
  formatContact,
  formatEducation,
  formatExperience,
  formatHelp,
  formatProjects,
  formatSkills,
  formatSocials,
  formatWhoami,
} from '../resume/format'
import { resolvePath } from '../vfs/resolvePath'
import type { Command, CommandContext, CommandResult } from './types'

function output(lines: OutputLine[]): CommandResult {
  return { kind: 'output', lines }
}

function errorOutput(message: string): CommandResult {
  return output([[errorSpan(message)]])
}

function formatHistory(history: string[]): OutputLine[] {
  if (history.length === 0) return [textLine('No commands in history yet.')]
  return history.map((cmd, index) => line(dim(`  ${String(index + 1).padStart(3)}  `), text(cmd)))
}

function runLs(args: string[], context: CommandContext): CommandResult {
  const path = args[0] ?? ''
  const node = resolvePath(context.vfs, path)
  if (!node) return errorOutput(`ls: cannot access '${path}': No such file or directory`)
  if (node.type === 'file') return output([textLine(node.name)])
  return output(
    node.children.map((child) =>
      child.type === 'dir' ? [dirSpan(`${child.name}/`)] : [text(child.name)],
    ),
  )
}

function runCat(args: string[], context: CommandContext): CommandResult {
  const path = args[0]
  if (!path) return errorOutput('cat: missing operand')
  const node = resolvePath(context.vfs, path)
  if (!node) return errorOutput(`cat: ${path}: No such file or directory`)
  if (node.type === 'dir') return errorOutput(`cat: ${path}: Is a directory`)
  return output(node.content)
}

/**
 * The full set of commands the terminal understands. `help`'s entry closes
 * over this array, so it must be populated via push (not a literal) —
 * by the time any command actually runs, the module has finished
 * initializing and the array is complete.
 */
export const commands: Command[] = []

commands.push(
  {
    name: 'help',
    description: 'Show available commands',
    run: () => output(formatHelp(commands.map((c) => ({ name: c.name, description: c.description })))),
  },
  { name: 'about', description: 'About me', run: (_args, ctx) => output(formatAbout(ctx.resume)) },
  {
    name: 'experience',
    description: 'Work experience',
    run: (_args, ctx) => output(formatExperience(ctx.resume)),
  },
  {
    name: 'education',
    description: 'Education',
    run: (_args, ctx) => output(formatEducation(ctx.resume)),
  },
  { name: 'skills', description: 'Technical skills', run: (_args, ctx) => output(formatSkills(ctx.resume)) },
  { name: 'projects', description: 'Projects', run: (_args, ctx) => output(formatProjects(ctx.resume)) },
  {
    name: 'certifications',
    description: 'Certifications',
    run: (_args, ctx) => output(formatCertifications(ctx.resume)),
  },
  {
    name: 'contact',
    description: 'Contact information',
    run: (_args, ctx) => output(formatContact(ctx.resume)),
  },
  { name: 'socials', description: 'Social links', run: (_args, ctx) => output(formatSocials(ctx.resume)) },
  { name: 'clear', description: 'Clear terminal', run: () => ({ kind: 'clear' }) },
  { name: 'whoami', description: 'Print current user', run: (_args, ctx) => output(formatWhoami(ctx.resume)) },
  {
    name: 'history',
    description: 'Show command history',
    run: (_args, ctx) => output(formatHistory(ctx.history)),
  },
  { name: 'ls', description: 'List directory contents', run: runLs },
  { name: 'cat', description: 'Print file contents', run: runCat },
)
