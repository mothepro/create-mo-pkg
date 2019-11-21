import { promisify } from 'util'
import { mkdir } from 'fs'

export let cwd: string

/** Makes and changes into a new directory. */
export default async (dir: string) =>
  promisify(mkdir)(
    cwd = dir
  )
