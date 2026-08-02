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

export interface OutputSpan {
  text: string
  kind?: SpanKind
  href?: string
}

export type OutputLine = OutputSpan[]

export function span(text: string, kind?: SpanKind, href?: string): OutputSpan {
  return { text, kind, href }
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

export const line = (...spans: OutputSpan[]): OutputLine => spans
export const textLine = (value: string): OutputLine => [text(value)]
export const emptyLine = (): OutputLine => [text('')]
