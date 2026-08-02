import { beforeEach, describe, expect, it } from 'vitest'
import { CommandHistory } from './history'

describe('CommandHistory', () => {
  let history: CommandHistory

  beforeEach(() => {
    history = new CommandHistory()
  })

  it('returns undefined from prev/next when empty', () => {
    expect(history.prev()).toBeUndefined()
    expect(history.next()).toBeUndefined()
  })

  it('ignores blank entries', () => {
    history.push('   ')
    history.push('')
    expect(history.toArray()).toEqual([])
  })

  it('walks backward through entries with prev', () => {
    history.push('help')
    history.push('about')
    history.push('skills')
    expect(history.prev()).toBe('skills')
    expect(history.prev()).toBe('about')
    expect(history.prev()).toBe('help')
  })

  it('stops at the oldest entry', () => {
    history.push('help')
    history.push('about')
    history.prev()
    history.prev()
    expect(history.prev()).toBe('help')
  })

  it('walks forward through entries with next, ending on an empty draft', () => {
    history.push('help')
    history.push('about')
    history.prev()
    history.prev()
    expect(history.next()).toBe('about')
    expect(history.next()).toBe('')
  })

  it('resets the cursor to the end after pushing a new command', () => {
    history.push('help')
    history.push('about')
    history.prev()
    history.prev()
    history.push('skills')
    expect(history.prev()).toBe('skills')
  })
})
