import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { executeCommand } from '../lib/commands/executor'
import { enabledCommands } from '../lib/commands/enabled'
import { commands } from '../lib/commands/registry'
import type { CommandContext } from '../lib/commands/types'
import { dim, emptyLine, line, type OutputLine, successSpan, text, textLine } from '../lib/output'
import { resume } from '../lib/resume/loadResume'
import { autocomplete } from '../lib/terminal/autocomplete'
import { BOOT_OK, BOOT_PENDING_FRAMES, getBootSteps } from '../lib/terminal/bootSequence'
import { CommandHistory } from '../lib/terminal/history'
import { loginBanner } from '../lib/terminal/loginBanner'
import { buildWelcome } from '../lib/terminal/motd'
import { buildPrompt } from '../lib/terminal/prompt'
import { completePath } from '../lib/vfs/completePath'
import { buildVfs } from '../lib/vfs/buildVfs'
import { OutputLineView } from './OutputLineView'

const vfs = buildVfs(resume)
// Disabled commands must not surface in Tab completion either.
const commandNames = enabledCommands(resume, commands).map((c) => c.name)
const promptString = buildPrompt(resume)
const welcomeMessage = buildWelcome(resume)

const SCANNER_INTERVAL_MS = 70
const UNIT_SETTLE_MIN_MS = 160
const UNIT_SETTLE_JITTER_MS = 260
const WELCOME_TYPE_MS = 28
const MOTD_LINE_PAUSE_MS = 320
const MOTD_LINES = [welcomeMessage, "Type 'help' to see available commands."]

const bootUnitLine = (message: string, state: 'pending' | 'ok', frame = 0): OutputLine =>
  state === 'ok'
    ? line(dim('['), successSpan(BOOT_OK), dim('] '), text(message))
    : line(dim('['), dim(BOOT_PENDING_FRAMES[frame % BOOT_PENDING_FRAMES.length]!), dim('] '), text(message))

interface PromptEntry {
  id: number
  kind: 'prompt'
  command: string
}

interface OutputEntry {
  id: number
  kind: 'output'
  lines: OutputLine[]
}

type ScreenEntry = PromptEntry | OutputEntry

export function Terminal() {
  const [entries, setEntries] = useState<ScreenEntry[]>([])
  const [inputValue, setInputValue] = useState('')
  const [caretPos, setCaretPos] = useState(0)
  const [focused, setFocused] = useState(false)
  const [booted, setBooted] = useState(false)
  const [size, setSize] = useState<{ cols: number; rows: number } | null>(null)

  const nextId = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const historyRef = useRef(new CommandHistory())
  const prefersReducedMotion = usePrefersReducedMotion()

  const makeId = () => {
    nextId.current += 1
    return nextId.current
  }

  useEffect(() => {
    const steps = getBootSteps(resume)
    const sessionEntry: ScreenEntry = {
      id: makeId(),
      kind: 'output',
      lines: [[dim(loginBanner(new Date()))], emptyLine()],
    }
    const motdEntry = (): ScreenEntry => ({
      id: makeId(),
      kind: 'output',
      lines: [
        emptyLine(),
        textLine(welcomeMessage),
        emptyLine(),
        textLine("Type 'help' to see available commands."),
      ],
    })

    if (prefersReducedMotion) {
      setEntries([
        sessionEntry,
        ...steps.map((step): ScreenEntry => ({
          id: makeId(),
          kind: 'output',
          lines: [bootUnitLine(step, 'ok')],
        })),
        motdEntry(),
      ])
      setBooted(true)
      return
    }

    setEntries([sessionEntry])

    let cancelled = false
    let index = 0
    let timeoutId: ReturnType<typeof setTimeout>

    const updateEntry = (entryId: number, lines: OutputLine[]) => {
      setEntries((prev) =>
        prev.map((entry): ScreenEntry =>
          entry.id === entryId && entry.kind === 'output' ? { ...entry, lines } : entry,
        ),
      )
    }

    // Types each MOTD line out one character at a time, pausing between
    // lines, then hands control to the user.
    const typeMotd = () => {
      const entryId = makeId()
      setEntries((prev) => [...prev, { id: entryId, kind: 'output', lines: [emptyLine()] }])

      let lineIndex = 0
      let typed = 0

      const tick = () => {
        if (cancelled) return
        const current = MOTD_LINES[lineIndex]!
        typed += 1

        // Re-render every line each tick: the finished ones in full, the
        // current one truncated to however much has been "typed" so far.
        const lines: OutputLine[] = [emptyLine()]
        for (let i = 0; i < lineIndex; i += 1) {
          lines.push(textLine(MOTD_LINES[i]!), emptyLine())
        }
        lines.push(textLine(current.slice(0, typed)))
        updateEntry(entryId, lines)

        if (typed < current.length) {
          timeoutId = setTimeout(tick, WELCOME_TYPE_MS)
          return
        }

        lineIndex += 1
        typed = 0
        if (lineIndex >= MOTD_LINES.length) {
          setBooted(true)
          return
        }
        timeoutId = setTimeout(tick, MOTD_LINE_PAUSE_MS)
      }
      timeoutId = setTimeout(tick, 260)
    }

    const runStep = () => {
      if (cancelled) return
      if (index >= steps.length) {
        typeMotd()
        return
      }

      const step = steps[index]!
      const entryId = makeId()
      setEntries((prev) => [
        ...prev,
        { id: entryId, kind: 'output', lines: [bootUnitLine(step, 'pending')] },
      ])

      // Scan the asterisk back and forth until the unit "settles", so each
      // line spends a slightly different amount of time pending.
      const settleAt = Date.now() + UNIT_SETTLE_MIN_MS + Math.random() * UNIT_SETTLE_JITTER_MS
      let frame = 0

      const tick = () => {
        if (cancelled) return
        if (Date.now() < settleAt) {
          frame += 1
          updateEntry(entryId, [bootUnitLine(step, 'pending', frame)])
          timeoutId = setTimeout(tick, SCANNER_INTERVAL_MS)
          return
        }
        updateEntry(entryId, [bootUnitLine(step, 'ok')])
        index += 1
        timeoutId = setTimeout(runStep, 80)
      }

      timeoutId = setTimeout(tick, SCANNER_INTERVAL_MS)
    }

    timeoutId = setTimeout(runStep, 400)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries])

  useEffect(() => {
    if (booted) inputRef.current?.focus()
  }, [booted])

  // Report the real character grid in the title bar, the way a terminal
  // emulator does while you resize its window.
  useEffect(() => {
    const body = scrollRef.current
    const probe = measureRef.current
    if (!body || !probe) return

    const measure = () => {
      const charWidth = probe.getBoundingClientRect().width
      const styles = getComputedStyle(body)
      const lineHeight = Number.parseFloat(styles.lineHeight)
      if (!charWidth || !Number.isFinite(lineHeight) || !lineHeight) return

      const innerWidth =
        body.clientWidth - Number.parseFloat(styles.paddingLeft) - Number.parseFloat(styles.paddingRight)
      const innerHeight =
        body.clientHeight - Number.parseFloat(styles.paddingTop) - Number.parseFloat(styles.paddingBottom)

      setSize({
        cols: Math.max(1, Math.floor(innerWidth / charWidth)),
        rows: Math.max(1, Math.floor(innerHeight / lineHeight)),
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(body)
    return () => observer.disconnect()
  }, [])

  function syncCaret(element: HTMLInputElement) {
    setCaretPos(element.selectionStart ?? element.value.length)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const command = inputValue
    historyRef.current.push(command)

    const context: CommandContext = { resume, vfs, history: historyRef.current.toArray() }
    const result = executeCommand(command, context)

    setEntries((prev) => {
      const withPrompt: ScreenEntry[] = [...prev, { id: makeId(), kind: 'prompt', command }]
      if (result === null) return withPrompt
      if (result.kind === 'clear') return []
      return [...withPrompt, { id: makeId(), kind: 'output', lines: result.lines }]
    })
    setInputValue('')
    setCaretPos(0)

    // Deferred so the echoed `logout` line paints before the page unloads.
    if (result?.kind === 'navigate') {
      window.setTimeout(() => {
        window.location.href = result.url
      }, 350)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Tab') {
      event.preventDefault()
      const result = autocomplete(inputValue, {
        commandNames,
        completePath: (partial) => completePath(vfs, partial),
      })
      setInputValue(result.value)
      setCaretPos(result.value.length)
      if (result.matches.length > 1) {
        setEntries((prev) => [
          ...prev,
          { id: makeId(), kind: 'output', lines: [[dim(result.matches.join('  '))]] },
        ])
      }
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const value = historyRef.current.prev()
      if (value !== undefined) {
        setInputValue(value)
        setCaretPos(value.length)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const value = historyRef.current.next()
      if (value !== undefined) {
        setInputValue(value)
        setCaretPos(value.length)
      }
      return
    }

    if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault()
      setEntries([])
    }
  }

  function handleContainerMouseUp() {
    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) return
    inputRef.current?.focus()
  }

  const cursorChar = inputValue[caretPos] ?? ' '

  return (
    <div className="terminal" onMouseUp={handleContainerMouseUp}>
      <div className="terminal-header">
        <span className="term-dot" aria-hidden="true" />
        <span className="terminal-title">
          {promptString.replace(/:~\$$/, '')}: ~{size ? ` — ${size.cols}×${size.rows}` : ''}
        </span>
      </div>
      <div className="terminal-body" ref={scrollRef} role="log" aria-live="polite">
        <span className="term-measure" ref={measureRef} aria-hidden="true">
          0
        </span>
        {entries.map((entry) =>
          entry.kind === 'prompt' ? (
            <div className="term-line" key={entry.id}>
              <span className="term-span term-prompt">{promptString}</span>{' '}
              <span className="term-span">{entry.command}</span>
            </div>
          ) : (
            <div key={entry.id}>
              {entry.lines.map((line, index) => (
                <OutputLineView line={line} key={index} />
              ))}
            </div>
          ),
        )}
        {booted && (
          <form className="term-line term-input-line" onSubmit={handleSubmit}>
            <label className="term-span term-prompt" htmlFor="terminal-input">
              {promptString}
            </label>
            <span className="term-field">
              <span className="term-echo" aria-hidden="true">
                {inputValue.slice(0, caretPos)}
                <span className={focused ? 'term-cursor' : 'term-cursor term-cursor-idle'}>
                  {cursorChar}
                </span>
                {inputValue.slice(caretPos + 1)}
              </span>
              <input
                id="terminal-input"
                ref={inputRef}
                className="term-input"
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value)
                  syncCaret(event.target)
                }}
                onSelect={(event) => syncCaret(event.currentTarget)}
                onFocus={(event) => {
                  setFocused(true)
                  syncCaret(event.currentTarget)
                }}
                onBlur={() => setFocused(false)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Terminal command input"
              />
            </span>
          </form>
        )}
      </div>
    </div>
  )
}
