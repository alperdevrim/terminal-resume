import { resolvePath } from './resolvePath'
import type { VfsDir } from './types'

/**
 * Returns full-path completion candidates for a partial `ls`/`cat` path
 * argument, e.g. `completePath(root, "exp")` -> `["experience/"]`,
 * `completePath(root, "experience/ac")` -> `["experience/acme-corp"]`.
 * Directories are suffixed with `/`.
 */
export function completePath(root: VfsDir, partial: string): string[] {
  const lastSlash = partial.lastIndexOf('/')
  const dirPart = lastSlash === -1 ? '' : partial.slice(0, lastSlash)
  const prefix = lastSlash === -1 ? partial : partial.slice(lastSlash + 1)

  const dirNode = dirPart ? resolvePath(root, dirPart) : root
  if (!dirNode || dirNode.type !== 'dir') return []

  return dirNode.children
    .filter((child) => child.name.startsWith(prefix))
    .map((child) => {
      const name = child.type === 'dir' ? `${child.name}/` : child.name
      return dirPart ? `${dirPart}/${name}` : name
    })
}
