import type { OutputLine } from '../lib/output'

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
          <span key={index} className={span.kind ? `term-span term-${span.kind}` : 'term-span'}>
            {span.text}
          </span>
        ),
      )}
    </div>
  )
}
