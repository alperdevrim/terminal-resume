import { asSpanColor } from '../output'
import type {
  CertificationEntry,
  Contact,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  Profile,
  ProjectEntry,
  Resume,
  Skill,
  SkillCategories,
  Socials,
  TerminalConfig,
} from './types'

/**
 * Normalizes an arbitrary parsed-YAML value into a strict {@link Resume}.
 * Missing or malformed fields are dropped/defaulted rather than throwing,
 * since resume.yaml is hand-edited content and shouldn't be able to crash
 * the site.
 */
export function parseResume(raw: unknown): Resume {
  const root = asRecord(raw)
  return {
    profile: parseProfile(root.profile),
    experience: parseArray(root.experience, parseExperienceEntry),
    education: parseArray(root.education, parseEducationEntry),
    skills: parseSkills(root.skills),
    languages: parseArray(root.languages, parseLanguageEntry),
    projects: parseArray(root.projects, parseProjectEntry),
    certifications: parseArray(root.certifications, parseCertificationEntry),
    contact: parseContact(root.contact),
    socials: parseSocials(root.socials),
    terminal: parseTerminalConfig(root.terminal),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {}
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function asStringOrNull(value: unknown): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed.length > 0 ? trimmed : null
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

/** A 0-100 proficiency, or null when absent/unusable. Out-of-range values clamp. */
function asLevelOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(100, value))
}

function parseArray<T>(value: unknown, parseEntry: (entry: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return []
  const parsed: T[] = []
  for (const entry of value) {
    const result = parseEntry(entry)
    if (result !== null) parsed.push(result)
  }
  return parsed
}

function parseProfile(value: unknown): Profile {
  const r = asRecord(value)
  return {
    name: asString(r.name, 'Anonymous'),
    title: asString(r.title),
    location: asString(r.location),
    summary: asString(r.summary),
  }
}

function parseExperienceEntry(value: unknown): ExperienceEntry | null {
  if (!isRecord(value)) return null
  const company = asString(value.company)
  const position = asString(value.position)
  if (!company && !position) return null
  return {
    company,
    position,
    startDate: asString(value.start_date),
    endDate: asString(value.end_date, 'Present'),
    description: asStringArray(value.description),
    technologies: asStringArray(value.technologies),
    color: asSpanColor(value.color),
  }
}

function parseEducationEntry(value: unknown): EducationEntry | null {
  if (!isRecord(value)) return null
  const institution = asString(value.institution)
  const degree = asString(value.degree)
  if (!institution && !degree) return null
  return {
    institution,
    degree,
    startDate: asString(value.start_date),
    endDate: asString(value.end_date),
    details: asStringArray(value.details),
    color: asSpanColor(value.color),
  }
}

/**
 * A skill is either a bare string (`- Docker`) or a mapping that adds an
 * optional proficiency meter and accent (`- { name: Docker, level: 75 }`).
 * Both forms may be mixed freely within a category.
 */
function parseSkill(value: unknown): Skill | null {
  if (typeof value === 'string') {
    const name = value.trim()
    return name ? { name, level: null, color: null } : null
  }
  if (!isRecord(value)) return null
  const name = asString(value.name)
  if (!name) return null
  return { name, level: asLevelOrNull(value.level), color: asSpanColor(value.color) }
}

function parseSkills(value: unknown): SkillCategories {
  const r = asRecord(value)
  const result: SkillCategories = {}
  for (const [category, skills] of Object.entries(r)) {
    const parsed = parseArray(skills, parseSkill)
    if (parsed.length > 0) result[category] = parsed
  }
  return result
}

function parseLanguageEntry(value: unknown): LanguageEntry | null {
  if (typeof value === 'string') {
    const name = value.trim()
    return name ? { name, level: null, note: '', color: null } : null
  }
  if (!isRecord(value)) return null
  const name = asString(value.name)
  if (!name) return null
  return {
    name,
    level: asLevelOrNull(value.level),
    note: asString(value.note),
    color: asSpanColor(value.color),
  }
}

function parseProjectEntry(value: unknown): ProjectEntry | null {
  if (!isRecord(value)) return null
  const name = asString(value.name)
  if (!name) return null
  return {
    name,
    description: asString(value.description),
    technologies: asStringArray(value.technologies),
    url: asStringOrNull(value.url),
    color: asSpanColor(value.color),
  }
}

function parseCertificationEntry(value: unknown): CertificationEntry | null {
  if (!isRecord(value)) return null
  const name = asString(value.name)
  if (!name) return null
  return {
    name,
    issuer: asString(value.issuer),
    date: asString(value.date),
    color: asSpanColor(value.color),
  }
}

function parseContact(value: unknown): Contact {
  const r = asRecord(value)
  return {
    email: asString(r.email),
    phone: asStringOrNull(r.phone),
    website: asStringOrNull(r.website),
  }
}

function parseSocials(value: unknown): Socials {
  const r = asRecord(value)
  const result: Socials = {}
  for (const [platform, url] of Object.entries(r)) {
    if (typeof url === 'string' && url.length > 0) result[platform] = url
  }
  return result
}

function parseTerminalConfig(value: unknown): TerminalConfig {
  const r = asRecord(value)
  return {
    user: asStringOrNull(r.user),
    host: asStringOrNull(r.host),
    welcome: asStringOrNull(r.welcome),
    exitUrl: asStringOrNull(r.exit_url),
  }
}
