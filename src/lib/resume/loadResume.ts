import rawResume from '../../data/resume.yaml'
import { parseResume } from './transform'

/** The site's resume data, parsed once at module load from resume.yaml. */
export const resume = parseResume(rawResume)
