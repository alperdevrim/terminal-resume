import type { Resume } from '../resume/types'

function slugifyName(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? ''
  return firstWord.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Builds the `user@host:~$` prompt shown before each command line.
 * `terminal.user`/`terminal.host` in resume.yaml override the defaults —
 * a slug of `profile.name` for `user`, `"resume"` for `host` — so e.g.
 * `terminal: { user: root, host: example }` renders `root@example:~$`.
 */
export function buildPrompt(resume: Resume): string {
  const host = resume.terminal.host || 'resume'
  return `${buildUser(resume)}@${host}:~$`
}

/**
 * The account name the session runs as — `terminal.user`, else a slug of
 * `profile.name`. Shared by the prompt and the boot sequence's home mount so
 * the two can never disagree.
 */
export function buildUser(resume: Resume): string {
  return resume.terminal.user || slugifyName(resume.profile.name) || 'guest'
}
