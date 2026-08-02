export interface AutocompleteContext {
  commandNames: string[]
  completePath: (partial: string) => string[]
}

export interface AutocompleteResult {
  /** The input line after applying the completion (unchanged if nothing matched). */
  value: string
  /** All candidates that matched the token being completed. */
  matches: string[]
}

const PATH_AWARE_COMMANDS = new Set(['ls', 'cat'])

function longestCommonPrefix(values: string[]): string {
  if (values.length === 0) return ''
  return values.reduce((acc, value) => {
    let i = 0
    while (i < acc.length && i < value.length && acc[i] === value[i]) i++
    return acc.slice(0, i)
  })
}

/**
 * Tab-completes the token currently being typed: the command name for the
 * first token, or a vfs path for `ls`/`cat` arguments. A single match
 * completes fully; multiple matches complete to their longest common
 * prefix and are all returned in `matches` (so the caller can print them,
 * mirroring a shell's double-tab listing).
 */
export function autocomplete(input: string, context: AutocompleteContext): AutocompleteResult {
  const tokens = input.split(' ')

  if (tokens.length <= 1) {
    const prefix = tokens[0] ?? ''
    const matches = context.commandNames.filter((name) => name.startsWith(prefix)).sort()
    return complete(matches, prefix, '')
  }

  const command = tokens[0]!
  if (!PATH_AWARE_COMMANDS.has(command)) return { value: input, matches: [] }

  const currentToken = tokens[tokens.length - 1] ?? ''
  const matches = context.completePath(currentToken).sort()
  return complete(matches, currentToken, `${tokens.slice(0, -1).join(' ')} `)
}

function complete(matches: string[], currentToken: string, prefixToKeep: string): AutocompleteResult {
  if (matches.length === 0) return { value: prefixToKeep + currentToken, matches: [] }
  const completedToken = matches.length === 1 ? matches[0]! : longestCommonPrefix(matches)
  return { value: prefixToKeep + completedToken, matches }
}
