/** Standard Levenshtein edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  const rows = a.length + 1
  const cols = b.length + 1
  const dp: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0))

  for (let i = 0; i < rows; i++) dp[i]![0] = i
  for (let j = 0; j < cols; j++) dp[0]![j] = j

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i]![j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1]![j - 1]!
          : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!)
    }
  }

  return dp[a.length]![b.length]!
}

/**
 * Finds the closest candidate to `input` for a "did you mean" suggestion,
 * or null if nothing is close enough to be a plausible typo.
 */
export function suggestCommand(input: string, candidates: string[]): string | null {
  let best: string | null = null
  let bestDistance = Infinity

  for (const candidate of candidates) {
    const distance = levenshtein(input, candidate)
    if (distance < bestDistance) {
      bestDistance = distance
      best = candidate
    }
  }

  if (best === null || bestDistance === 0) return null
  const threshold = Math.max(1, Math.ceil(Math.max(input.length, best.length) / 2))
  return bestDistance <= threshold ? best : null
}
