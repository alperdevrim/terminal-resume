import { resume } from '../lib/resume/loadResume'

/**
 * Real, semantic markup describing the resume for search engines and
 * screen readers. Visually hidden — the terminal is the actual UI — but
 * present in the DOM so the site is more than an empty canvas to crawlers.
 */
export function SeoContent() {
  return (
    <section className="sr-only">
      <h1>
        {resume.profile.name} — {resume.profile.title}
      </h1>
      <p>
        {resume.profile.location ? `${resume.profile.location}. ` : ''}
        {resume.profile.summary}
      </p>

      {resume.experience.length > 0 && (
        <>
          <h2>Experience</h2>
          <ul>
            {resume.experience.map((entry) => (
              <li key={`${entry.company}-${entry.position}`}>
                {entry.position} at {entry.company} ({entry.startDate}–{entry.endDate})
              </li>
            ))}
          </ul>
        </>
      )}

      {Object.keys(resume.skills).length > 0 && (
        <>
          <h2>Skills</h2>
          <ul>
            {Object.entries(resume.skills).map(([category, skills]) => (
              <li key={category}>
                {category}: {skills.join(', ')}
              </li>
            ))}
          </ul>
        </>
      )}

      {resume.contact.email && (
        <>
          <h2>Contact</h2>
          <p>{resume.contact.email}</p>
        </>
      )}
    </section>
  )
}
