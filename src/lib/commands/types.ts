import type { OutputLine } from '../output'
import type { Resume } from '../resume/types'
import type { VfsDir } from '../vfs/types'

export interface CommandContext {
  resume: Resume
  vfs: VfsDir
  /** Previously entered commands, oldest first, not including the one currently running. */
  history: string[]
}

export type CommandResult = { kind: 'output'; lines: OutputLine[] } | { kind: 'clear' }

export interface Command {
  name: string
  description: string
  run: (args: string[], context: CommandContext) => CommandResult
}
