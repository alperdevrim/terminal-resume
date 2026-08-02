import type { Resume } from '../resume/types'
import type { Command } from './types'

/**
 * Commands are opt-out: anything not explicitly set to `false` under
 * `terminal.commands` in resume.yaml stays available. That way adding a new
 * command to the registry doesn't require touching the YAML, while a
 * template user can switch off the ones they don't want.
 *
 * Every command can be disabled, `help` included — disabling it leaves
 * visitors with no way to discover the rest, which is the author's call to
 * make, not this function's.
 *
 * Takes the command list as an argument rather than importing the registry,
 * which would create a cycle (the registry's own `help` needs this).
 */
export function isCommandEnabled(resume: Resume, name: string): boolean {
  return resume.terminal.commands[name] !== false
}

/** Filters a command list down to what this resume.yaml leaves switched on. */
export function enabledCommands(resume: Resume, all: Command[]): Command[] {
  return all.filter((command) => isCommandEnabled(resume, command.name))
}
