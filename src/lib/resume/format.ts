import {
  commandSpan,
  dateSpan,
  dim,
  emptyLine,
  heading,
  line,
  type OutputLine,
  text,
  textLine,
  urlSpan,
} from '../output'
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  Resume,
} from './types'

function titleCase(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(' ')
}

/** Proper capitalization for platform names a generic titleCase would get wrong. */
const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  gitlab: 'GitLab',
  x: 'X',
  youtube: 'YouTube',
  devto: 'dev.to',
  stackoverflow: 'Stack Overflow',
}

function platformName(slug: string): string {
  return PLATFORM_DISPLAY_NAMES[slug.toLowerCase()] ?? titleCase(slug)
}

function joinSections(sections: OutputLine[][], emptyMessage: string): OutputLine[] {
  if (sections.length === 0) return [textLine(emptyMessage)]
  return sections.flatMap((section, index) =>
    index === 0 ? section : [emptyLine(), ...section],
  )
}

export function formatWhoami(resume: Resume): OutputLine[] {
  const { profile } = resume
  return [
    textLine(profile.name),
    textLine(profile.title),
    textLine(profile.location),
  ]
}

export function formatAbout(resume: Resume): OutputLine[] {
  const { profile } = resume
  return [
    [heading(profile.name)],
    [text(`${profile.title} · ${profile.location}`)],
    emptyLine(),
    textLine(profile.summary || 'No summary provided.'),
  ]
}

export function formatExperienceEntry(entry: ExperienceEntry): OutputLine[] {
  const lines: OutputLine[] = [
    [heading(`${entry.position} — ${entry.company}`)],
    [dateSpan(`${entry.startDate} – ${entry.endDate}`)],
  ]
  for (const item of entry.description) {
    lines.push([text(`  - ${item}`)])
  }
  if (entry.technologies.length > 0) {
    lines.push([dim(`Technologies: ${entry.technologies.join(', ')}`)])
  }
  return lines
}

export function formatExperience(resume: Resume): OutputLine[] {
  return joinSections(
    resume.experience.map(formatExperienceEntry),
    'No experience listed.',
  )
}

export function formatEducationEntry(entry: EducationEntry): OutputLine[] {
  const lines: OutputLine[] = [
    [heading(`${entry.degree} — ${entry.institution}`)],
    [dateSpan(`${entry.startDate} – ${entry.endDate}`)],
  ]
  for (const detail of entry.details) {
    lines.push([text(`  - ${detail}`)])
  }
  return lines
}

export function formatEducation(resume: Resume): OutputLine[] {
  return joinSections(
    resume.education.map(formatEducationEntry),
    'No education listed.',
  )
}

export function formatSkillCategory(category: string, skills: string[]): OutputLine[] {
  return [[heading(titleCase(category))], [text(`  ${skills.join(' · ')}`)]]
}

export function formatSkills(resume: Resume): OutputLine[] {
  const categories = Object.entries(resume.skills)
  return joinSections(
    categories.map(([category, skills]) => formatSkillCategory(category, skills)),
    'No skills listed.',
  )
}

export function formatProjectEntry(project: ProjectEntry): OutputLine[] {
  const lines: OutputLine[] = [[heading(project.name)]]
  if (project.description) lines.push(textLine(project.description))
  if (project.technologies.length > 0) {
    lines.push([dim(`Technologies: ${project.technologies.join(', ')}`)])
  }
  if (project.url) lines.push([urlSpan(project.url)])
  return lines
}

export function formatProjects(resume: Resume): OutputLine[] {
  return joinSections(resume.projects.map(formatProjectEntry), 'No projects listed.')
}

export function formatCertificationEntry(cert: CertificationEntry): OutputLine[] {
  return [[heading(cert.name)], [text(cert.issuer), dateSpan(` · ${cert.date}`)]]
}

export function formatCertifications(resume: Resume): OutputLine[] {
  return joinSections(
    resume.certifications.map(formatCertificationEntry),
    'No certifications listed.',
  )
}

export function formatContact(resume: Resume): OutputLine[] {
  const { contact } = resume
  const lines: OutputLine[] = [[heading('Contact')]]
  if (contact.email) {
    lines.push(line(text('Email:   '), urlSpan(contact.email, `mailto:${contact.email}`)))
  }
  if (contact.phone) lines.push(line(text('Phone:   '), text(contact.phone)))
  if (contact.website) lines.push(line(text('Website: '), urlSpan(contact.website)))
  if (lines.length === 1) lines.push(textLine('No contact information provided.'))
  return lines
}

export function formatSocials(resume: Resume): OutputLine[] {
  const entries = Object.entries(resume.socials)
  if (entries.length === 0) return [[heading('Socials')], textLine('No social links provided.')]
  return [
    [heading('Socials')],
    ...entries.map(([platform, url]) => line(text(`${platformName(platform)}: `), urlSpan(url))),
  ]
}

export interface CommandHelpEntry {
  name: string
  description: string
}

export function formatHelp(entries: CommandHelpEntry[]): OutputLine[] {
  const width = Math.max(...entries.map((entry) => entry.name.length))
  return [
    [heading('Available commands:')],
    emptyLine(),
    ...entries.map((entry) =>
      line(commandSpan(`  ${entry.name.padEnd(width)}`), text(`  ${entry.description}`)),
    ),
  ]
}
