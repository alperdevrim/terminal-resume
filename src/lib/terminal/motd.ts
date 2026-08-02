import type { Resume } from '../resume/types'

const DEFAULT_WELCOME = "Welcome to {name}'s interactive resume."
const DEFAULT_WELCOME_NO_NAME = 'Welcome to this interactive resume.'

/**
 * Builds the welcome line printed once the boot sequence finishes.
 * `terminal.welcome` in resume.yaml overrides the default; `{name}` is
 * substituted with `profile.name` wherever it appears, so a template user
 * can write their own copy without hardcoding their name twice.
 */
export function buildWelcome(resume: Resume): string {
  const name = resume.profile.name
  const custom = resume.terminal.welcome

  if (!custom) {
    return name ? DEFAULT_WELCOME.replace('{name}', name) : DEFAULT_WELCOME_NO_NAME
  }
  return custom.replace(/\{name\}/g, name)
}
