import { promisify } from 'util'
import { writeFile } from 'fs'
import { join } from 'path'
import { cwd } from './makeAndChangeDir'

/** Write a file to the new package. */
export default async (filename: string, contents: string) =>
  promisify(writeFile)(
    join(cwd, filename),
    contents
  )
