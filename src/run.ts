import { promisify } from 'util'
import { exec } from 'child_process'
import { cwd } from './makeAndChangeDir'

/** Runs a command and returns the value from stdout. */
export default async (cmd: string, ...args: string[]) =>
  (await promisify(exec)(
    [cmd, ...args].join(' '),
    { cwd }
  )).stdout
