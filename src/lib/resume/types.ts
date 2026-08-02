import type { SpanColor } from '../output'

export interface Profile {
  name: string
  title: string
  location: string
  summary: string
}

export interface ExperienceEntry {
  company: string
  position: string
  startDate: string
  endDate: string
  description: string[]
  technologies: string[]
  color: SpanColor | null
}

export interface EducationEntry {
  institution: string
  degree: string
  startDate: string
  endDate: string
  details: string[]
  color: SpanColor | null
}

/**
 * A single skill. `level` is an optional 0–100 proficiency that renders as a
 * meter; leave it null and the skill is listed as a plain name.
 */
export interface Skill {
  name: string
  level: number | null
  color: SpanColor | null
}

/** Category name (e.g. "cloud") -> list of skills in that category. */
export type SkillCategories = Record<string, Skill[]>

/** A spoken language, with the same optional meter as skills. */
export interface LanguageEntry {
  name: string
  level: number | null
  note: string
  color: SpanColor | null
}

export interface ProjectEntry {
  name: string
  description: string
  technologies: string[]
  url: string | null
  color: SpanColor | null
}

export interface CertificationEntry {
  name: string
  issuer: string
  date: string
  color: SpanColor | null
}

export interface Contact {
  email: string
  phone: string | null
  website: string | null
}

/** Platform name (e.g. "github") -> profile URL. */
export type Socials = Record<string, string>

/**
 * Terminal chrome that isn't resume content: the `user@host` shown in the
 * `user@host:~$` prompt and the welcome line printed once the boot sequence
 * finishes. Any field may be left unset (null) to fall back to a default —
 * see `buildPrompt` and `buildWelcome`.
 */
export interface TerminalConfig {
  user: string | null
  host: string | null
  welcome: string | null
  /** Where the `exit` command sends visitors; null disables the redirect. */
  exitUrl: string | null
  /** Per-command on/off switches. Absent means enabled. */
  commands: Record<string, boolean>
}

export interface Resume {
  profile: Profile
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: SkillCategories
  languages: LanguageEntry[]
  projects: ProjectEntry[]
  certifications: CertificationEntry[]
  contact: Contact
  socials: Socials
  terminal: TerminalConfig
}
