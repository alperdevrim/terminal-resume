import type { VfsDir, VfsNode } from './types'

/**
 * Resolves a slash-separated path against the vfs tree. Matching is
 * case-sensitive, like a real filesystem. Leading/trailing/duplicate
 * slashes and a bare `.` segment are ignored; an empty path resolves to
 * `root` itself.
 */
export function resolvePath(root: VfsDir, path: string): VfsNode | null {
  const segments = path
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0 && segment !== '.')

  let current: VfsNode = root
  for (const segment of segments) {
    if (current.type !== 'dir') return null
    const next: VfsNode | undefined = current.children.find((child) => child.name === segment)
    if (!next) return null
    current = next
  }
  return current
}
