const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const pad2 = (value: number): string => String(value).padStart(2, '0')

/** Formats a date the way `last`/login banners do: `Sun Aug  2 03:22:41`. */
export function formatLoginTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, ' ')
  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
  return `${DAYS[date.getDay()]} ${MONTHS[date.getMonth()]} ${day} ${time}`
}

/** The `Last login: ...` line a real shell prints when a session opens. */
export function loginBanner(date: Date, tty = 'ttys001'): string {
  return `Last login: ${formatLoginTime(date)} on ${tty}`
}
