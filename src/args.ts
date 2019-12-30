import { strict } from 'yargs'
import { version, name as thisPkgName, description as thisPkgDescription } from '../package.json'
import { runSync } from './run'
import captialCase from './captialCase'

const {
  _: [name],
  author,
  username,
  type,
  verbose,
  description,
  scoped,
  tests,
} = strict()
  .demandCommand()
  .version(version)
  .help()
  .usage(`${thisPkgDescription}
  Usage: yarn create ${thisPkgName.replace('create-', '')} <package-name> [options]
  `.trim())
  .option('verbose', {
    alias: 'v',
    description: 'Whether to output status of package creation',
    default: false,
    type: 'boolean',
  })
  .option('author', {
    alias: 'a',
    type: 'string',
    description: 'The name of the package\'s author',
    defaultDescription: 'Config value in Yarn\'s \'init-author-name\'',
    default: runSync('yarn', 'config', 'get', 'init-author-name'),
    demandOption: true,
  })
  .option('username', {
    alias: 'u',
    type: 'string',
    description: 'The Github username of the package\'s author',
    defaultDescription: 'Config value in Yarn\'s \'init-author-username\'',
    default: runSync('yarn', 'config', 'get', 'init-author-username'),
    demandOption: true,
  })
  .option('description', {
    alias: ['d', 'desc'],
    type: 'string',
    description: 'Description for the new package',
    default: '',
  })
  .option('type', {
    alias: 't',
    description: 'The type of package being made',
    defaultDescription: 'An ES Module without a demo',
    default: 'esm',
    choices: ['esm', 'esm-demo', 'lit-app', 'cli']
  })
  .option('scoped', {
    alias: 's',
    description: 'Whether to package is scoped for the given user',
    default: false,
    type: 'boolean',
  })
  .option('tests', {
    description: 'Whether include tests (Should always be done)',
    default: true,
    type: 'boolean',
  })
    .argv


export { name, author, username, type, description, scoped, tests }

/** Log, if requested */
export const log = verbose
  ? (...strs: string[]) => verbose && console.log(...strs)
  : () => { }

/** Update string to use template replacements */
export const templates = (str: string) => str
  .replace(/_YEAR_/g, new Date().getFullYear().toString())
  .replace(/_AUTHOR_/g, author)
  .replace(/_SCOPE_/g, scoped ? `@${username}/` : '')
  .replace(/_NAME_/g, name)
  .replace(/_DESC_/g, description)
  .replace(/_NICENAME_/g, captialCase(name))
