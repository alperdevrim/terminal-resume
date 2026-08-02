/** Splits a raw input line into command + argument tokens on whitespace. */
export function tokenize(input: string): string[] {
  return input.trim().split(/\s+/).filter(Boolean)
}
