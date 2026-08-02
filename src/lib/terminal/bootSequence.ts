import type { Resume } from '../resume/types'
import { buildUser } from './prompt'

/**
 * systemd-style boot units. Each renders as `[  OK  ] <message>` once it
 * settles — while pending it shows a scanning cursor in the brackets, the
 * way a real Linux boot does. The home mount follows whatever account the
 * prompt runs as, so no name is hardcoded here.
 */
export function getBootSteps(resume: Resume): string[] {
  return [
    `Mounted /home/${buildUser(resume)}`,
    'Started profile.service',
    'Started experience.service',
    'Started education.service',
    'Started skills.service',
    'Started projects.service',
    'Started certifications.service',
    'Started contact.service',
    'Started socials.service',
    'Reached target',
  ]
}

/** Six-column scanner frames shown between the brackets while a unit is starting. */
export const BOOT_PENDING_FRAMES = [' *    ', '  *   ', '   *  ', '    * ', '   *  ', '  *   ']

export const BOOT_OK = '  OK  '
