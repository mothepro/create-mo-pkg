import { promisify } from 'util'
import { mkdir } from 'fs'
import { exec } from 'child_process'

const execAsync = promisify(exec),
  mkdirAsync = promisify(mkdir)

let cwd: string

/** Makes and changes into a new directory. */
export async function makeAndChange(dir: string) {
  cwd = dir
  await mkdirAsync(cwd)
}

/** Runs a command and returns the value from stdout. */
export const run = async (cmd: string, ...args: string[]) =>
  (await execAsync([cmd, ...args].join(' '), {cwd})).stdout


/** Ends the process if the expression is falsy */
export function assert(expression: any, str = `Didn't expect ${expression} to be false.`) {
  if (!expression) {
    console.error(str)
    process.exit(1)
  }
}
