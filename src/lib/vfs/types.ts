import type { OutputLine } from '../output'

export interface VfsFile {
  type: 'file'
  name: string
  content: OutputLine[]
}

export interface VfsDir {
  type: 'dir'
  name: string
  children: VfsNode[]
}

export type VfsNode = VfsFile | VfsDir

export function file(name: string, content: OutputLine[]): VfsFile {
  return { type: 'file', name, content }
}

export function dir(name: string, children: VfsNode[]): VfsDir {
  return { type: 'dir', name, children }
}
