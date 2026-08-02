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
}

export interface EducationEntry {
  institution: string
  degree: string
  startDate: string
  endDate: string
  details: string[]
}

/** Category name (e.g. "cloud") -> list of skills in that category. */
export type SkillCategories = Record<string, string[]>

export interface ProjectEntry {
  name: string
  description: string
  technologies: string[]
  url: string | null
}

export interface CertificationEntry {
  name: string
  issuer: string
  date: string
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
}

export interface Resume {
  profile: Profile
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: SkillCategories
  projects: ProjectEntry[]
  certifications: CertificationEntry[]
  contact: Contact
  socials: Socials
  terminal: TerminalConfig
}
