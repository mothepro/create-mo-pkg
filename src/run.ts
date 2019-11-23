import { promisify } from 'util'
import { exec, execSync } from 'child_process'
import { cwd } from './makeAndChangeDir'

/** Runs a syncronously command and returns the value from stdout. */
export const runSync = (cmd: string, ...args: string[]) =>
  execSync(
    [cmd, ...args].join(' '),
    { cwd }
  ).toString().trim()

/** Runs a command and returns the value from stdout. */
export default async (cmd: string, ...args: string[]) =>
  (await promisify(exec)(
    [cmd, ...args].join(' '),
    { cwd }
  )).stdout
