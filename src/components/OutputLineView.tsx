import type { OutputLine, OutputSpan } from '../lib/output'

/** `kind` sets the base style; an optional `color` accent layers on top. */
function classNameFor(span: OutputSpan): string {
  const classes = ['term-span']
  if (span.kind) classes.push(`term-${span.kind}`)
  if (span.color) classes.push(`term-color-${span.color}`)
  return classes.join(' ')
}

export function OutputLineView({ line }: { line: OutputLine }) {
  if (line.length === 0) return <div className="term-line" />

  return (
    <div className="term-line">
      {line.map((span, index) =>
        span.kind === 'url' && span.href ? (
          <a
            key={index}
            href={span.href}
            target="_blank"
            rel="noopener noreferrer"
            className="term-span term-url"
          >
            {span.text}
          </a>
        ) : (
          <span key={index} className={classNameFor(span)}>
            {span.text}
          </span>
        ),
      )}
    </div>
  )
}
