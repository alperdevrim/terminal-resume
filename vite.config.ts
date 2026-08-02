import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import yaml from 'js-yaml'
import type { Plugin } from 'vite'

/**
 * Parses `.yaml`/`.yml` imports into plain JS objects at build/dev-transform
 * time, so the browser bundle only ever contains JSON, never a YAML parser.
 */
function yamlPlugin(): Plugin {
  return {
    name: 'yaml-to-json',
    transform(code, id) {
      if (!id.endsWith('.yaml') && !id.endsWith('.yml')) return
      const data = yaml.load(code)
      return {
        code: `export default ${JSON.stringify(data)}`,
        map: null,
      }
    },
  }
}

/**
 * Fills the %SEO_*% placeholders in index.html from resume.yaml. Reads the
 * profile loosely (rather than importing the app's strict `parseResume`)
 * so this config file — built under Node's stricter module resolution —
 * doesn't need to share a TS program with the app source.
 */
function seoHtmlPlugin(): Plugin {
  return {
    name: 'seo-html',
    transformIndexHtml(html) {
      const raw = yaml.load(readFileSync('./src/data/resume.yaml', 'utf-8')) as
        | { profile?: { name?: string; title?: string; summary?: string } }
        | undefined
      const profile = raw?.profile ?? {}
      const name = profile.name?.trim() || 'Anonymous'
      const title = [name, profile.title?.trim()].filter(Boolean).join(' — ')
      const description = profile.summary?.trim() || `${name}'s interactive terminal resume.`

      return html.replaceAll('%SEO_TITLE%', title).replaceAll('%SEO_DESCRIPTION%', description)
    },
  }
}

export default defineConfig({
  plugins: [react(), yamlPlugin(), seoHtmlPlugin()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
