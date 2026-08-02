/**
 * Shell-style command history: Arrow Up walks back through past entries,
 * Arrow Down walks forward again, and typing something new resets the
 * browsing cursor to "after the end" (an empty draft).
 */
export class CommandHistory {
  private entries: string[] = []
  private cursor = 0

  push(command: string): void {
    if (command.trim().length === 0) return
    this.entries.push(command)
    this.cursor = this.entries.length
  }

  /** Moves the cursor back one entry and returns it, or undefined at the oldest entry. */
  prev(): string | undefined {
    if (this.entries.length === 0) return undefined
    this.cursor = Math.max(0, this.cursor - 1)
    return this.entries[this.cursor]
  }

  /** Moves the cursor forward one entry; returns '' once past the newest entry. */
  next(): string | undefined {
    if (this.entries.length === 0) return undefined
    if (this.cursor >= this.entries.length - 1) {
      this.cursor = this.entries.length
      return ''
    }
    this.cursor += 1
    return this.entries[this.cursor]
  }

  /** Resets the browsing cursor to just past the newest entry. */
  resetCursor(): void {
    this.cursor = this.entries.length
  }

  toArray(): string[] {
    return [...this.entries]
  }
}
