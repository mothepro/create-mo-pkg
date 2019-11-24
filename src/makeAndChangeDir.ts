import { promisify } from 'util'
import { mkdir } from 'fs'

export let cwd: string

/** Makes and changes into a new directory. */
export const makekdir = async (dir: string) =>
  promisify(mkdir)(dir)

/** Makes and changes into a new directory. */
export default async (dir: string) =>
  makekdir(cwd = dir)
