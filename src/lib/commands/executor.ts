import { commandSpan, errorSpan, text } from '../output'
import { tokenize } from './parser'
import { enabledCommands } from './enabled'
import { commands } from './registry'
import { suggestCommand } from './suggest'
import type { CommandContext, CommandResult } from './types'

/** Runs a raw input line against the command registry. Returns null for blank input. */
export function executeCommand(input: string, context: CommandContext): CommandResult | null {
  const [name, ...args] = tokenize(input)
  if (!name) return null

  const available = enabledCommands(context.resume, commands)
  const command = available.find((c) => c.name === name)
  if (command) return command.run(args, context)

  const suggestion = suggestCommand(
    name,
    available.map((c) => c.name),
  )

  return {
    kind: 'output',
    lines: [
      [errorSpan(`command not found: ${name}`)],
      suggestion
        ? [text('Did you mean '), commandSpan(`'${suggestion}'`), text('?')]
        : [text("Type 'help' to see available commands.")],
    ],
  }
}
