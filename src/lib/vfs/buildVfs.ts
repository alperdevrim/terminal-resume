import {
  formatAbout,
  formatCertifications,
  formatContact,
  formatEducation,
  formatExperienceEntry,
  formatLanguages,
  formatProjectEntry,
  formatSkillCategory,
  formatSocials,
} from '../resume/format'
import type { Resume } from '../resume/types'
import { dir, file, type VfsDir } from './types'

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'entry'
}

/** Appends -2, -3, ... to `base` until it no longer collides with `used`. */
function uniqueSlug(base: string, used: Set<string>): string {
  let candidate = base
  let suffix = 2
  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  used.add(candidate)
  return candidate
}

/** Builds the browsable `ls`/`cat` filesystem tree from resume data. */
export function buildVfs(resume: Resume): VfsDir {
  const usedExperienceSlugs = new Set<string>()
  const experienceDir = dir(
    'experience',
    resume.experience.map((entry) =>
      file(
        uniqueSlug(slugify(entry.company || entry.position), usedExperienceSlugs),
        formatExperienceEntry(entry),
      ),
    ),
  )

  const skillsDir = dir(
    'skills',
    Object.entries(resume.skills).map(([category, skills]) =>
      file(slugify(category), formatSkillCategory(category, skills)),
    ),
  )

  const usedProjectSlugs = new Set<string>()
  const projectsDir = dir(
    'projects',
    resume.projects.map((project) =>
      file(uniqueSlug(slugify(project.name), usedProjectSlugs), formatProjectEntry(project)),
    ),
  )

  return dir('~', [
    file('about', formatAbout(resume)),
    experienceDir,
    file('education', formatEducation(resume)),
    skillsDir,
    file('languages', formatLanguages(resume)),
    projectsDir,
    file('certifications', formatCertifications(resume)),
    file('contact', formatContact(resume)),
    file('socials', formatSocials(resume)),
  ])
}
