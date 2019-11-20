import { promisify } from 'util'
import { mkdir, writeFile, readFile } from 'fs'
import { exec } from 'child_process'
import { join } from 'path'

const execAsync = promisify(exec),
  mkdirAsync = promisify(mkdir),
  writeFileAsync = promisify(writeFile),
  readFileAsync = promisify(readFile)

let cwd: string

/** Makes and changes into a new directory. */
export const makeAndChange = async (dir: string) =>
  await mkdirAsync(cwd = dir)

/** Runs a command and returns the value from stdout. */
export const run = async (cmd: string, ...args: string[]) =>
  (await execAsync([cmd, ...args].join(' '), { cwd })).stdout

/** Write a file to the new package. */
export const writeToFile = async (filename: string, contents: string) =>
  await writeFileAsync(join(cwd, filename), contents)

/** Read a file in the sample folder. */
export const readSampleFile = async (filename: string) =>
  await readFileAsync(join('sample', filename), { encoding: 'utf-8' })

export const capitalCase = (str: string) =>
  str
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.substr(0, 1).toUpperCase() + word.substr(1))
    .join(' ')

/** Formats a JSONable value and replaces */
export const jsonReplacer = (json: any, map: { [replacementKey: string]: any }) =>
  JSON.stringify(
    json,
    (key: string, value: any) =>
      typeof map[key] != 'undefined'
        ? map[key]
        : value,
    2)

/** Ends the process if the expression is falsy */
export function assert(expression: any, str = `Didn't expect ${expression} to be false.`) {
  if (!expression) {
    console.error(str)
    process.exit(1)
  }
  return expression
}
