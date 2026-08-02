/**
 * Structured output model shared by command formatters, the virtual
 * filesystem, and the terminal UI. Commands never return raw strings —
 * they return spans tagged with a `kind`, so the UI can apply
 * ANSI-inspired colors and make URLs clickable without re-parsing text.
 */
export type SpanKind =
  | 'default'
  | 'heading'
  | 'dim'
  | 'error'
  | 'success'
  | 'command'
  | 'dir'
  | 'date'
  | 'url'
  | 'bar'

/**
 * An optional accent applied on top of `kind`, mirroring the named colors a
 * real terminal palette exposes. Resume entries can opt into one via their
 * `color` field so sections aren't monochrome.
 */
export type SpanColor =
  | 'red'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'cyan'

const SPAN_COLORS: ReadonlySet<string> = new Set<SpanColor>([
  'red',
  'green',
  'yellow',
  'orange',
  'blue',
  'purple',
  'pink',
  'cyan',
])

/** Narrows arbitrary YAML input to a supported color, or null. */
export function asSpanColor(value: unknown): SpanColor | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return SPAN_COLORS.has(normalized) ? (normalized as SpanColor) : null
}

export interface OutputSpan {
  text: string
  kind?: SpanKind
  href?: string
  color?: SpanColor
}

export type OutputLine = OutputSpan[]

export function span(text: string, kind?: SpanKind, href?: string): OutputSpan {
  return { text, kind, href }
}

/** Returns a copy of `span` tinted with `color`; a null color is a no-op. */
export function tint(target: OutputSpan, color: SpanColor | null): OutputSpan {
  return color ? { ...target, color } : target
}

export const text = (value: string): OutputSpan => span(value)
export const heading = (value: string): OutputSpan => span(value, 'heading')
export const dim = (value: string): OutputSpan => span(value, 'dim')
export const errorSpan = (value: string): OutputSpan => span(value, 'error')
export const successSpan = (value: string): OutputSpan => span(value, 'success')
export const commandSpan = (value: string): OutputSpan => span(value, 'command')
export const dirSpan = (value: string): OutputSpan => span(value, 'dir')
export const dateSpan = (value: string): OutputSpan => span(value, 'date')
export const urlSpan = (value: string, href: string = value): OutputSpan => span(value, 'url', href)

export const barSpan = (value: string): OutputSpan => span(value, 'bar')

const BAR_WIDTH = 20

/**
 * Renders a 0–100 level as a fixed-width meter, e.g. `[██████░░░░]  60%`.
 * Out-of-range levels are clamped rather than rejected, matching the
 * parser's tolerate-don't-throw stance on bad YAML.
 */
export function levelBar(level: number, color: SpanColor | null = null): OutputSpan[] {
  const clamped = Math.max(0, Math.min(100, Math.round(level)))
  const filled = Math.round((clamped / 100) * BAR_WIDTH)
  return [
    dim('['),
    tint(barSpan('█'.repeat(filled)), color),
    dim('░'.repeat(BAR_WIDTH - filled)),
    dim(']'),
    text(` ${String(clamped).padStart(3)}%`),
  ]
}

export const line = (...spans: OutputSpan[]): OutputLine => spans
export const textLine = (value: string): OutputLine => [text(value)]
export const emptyLine = (): OutputLine => [text('')]
