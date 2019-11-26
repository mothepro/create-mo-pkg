import { promisify } from 'util'
import { readFile } from 'fs'
import { join } from 'path'

/** Read a file in the sample folder. */
export default async (filename: string) =>
  promisify(readFile)(
    // The sample directory (relative to THIS file).
    join(__dirname, '..', 'sample', filename),
    { encoding: 'utf-8' }
  )

