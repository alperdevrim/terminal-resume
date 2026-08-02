import { describe, expect, it } from 'vitest'
import { formatLoginTime, loginBanner } from './loginBanner'

describe('formatLoginTime', () => {
  it('formats in the shell login style', () => {
    expect(formatLoginTime(new Date(2026, 7, 2, 3, 22, 41))).toBe('Sun Aug  2 03:22:41')
  })

  it('space-pads single-digit days and zero-pads the time', () => {
    expect(formatLoginTime(new Date(2026, 0, 9, 9, 5, 7))).toBe('Fri Jan  9 09:05:07')
  })

  it('does not pad two-digit days', () => {
    expect(formatLoginTime(new Date(2026, 11, 25, 23, 59, 59))).toBe('Fri Dec 25 23:59:59')
  })
})

describe('loginBanner', () => {
  it('renders the Last login line with a default tty', () => {
    expect(loginBanner(new Date(2026, 7, 2, 3, 22, 41))).toBe(
      'Last login: Sun Aug  2 03:22:41 on ttys001',
    )
  })

  it('accepts a custom tty', () => {
    expect(loginBanner(new Date(2026, 7, 2, 3, 22, 41), 'ttys004')).toContain('on ttys004')
  })
})
