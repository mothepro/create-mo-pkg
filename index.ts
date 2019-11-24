#!/usr/bin/env node
import { strict } from 'yargs'
import { version, name as thisPkgName, description } from './package.json'
import { runSync } from './src/run.js'
import go from './src/go'

const {
  _: [name],
  author,
  username,
  type,
  verbose,
  scoped,
} = strict()
  .demandCommand()
  .version(version)
  .help()
  .usage(`${description}
  Usage: yarn create ${thisPkgName.replace('create-', '')} <package-name> [options]`)
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
  .option('type', {
    alias: 't',
    description: 'The type of package being made',
    defaultDescription: 'An ES Module without a demo',
    default: 'esm',
    choices: ['esm', 'lit-app'] // TODO add support of CLI
  })
  .option('verbose', {
    alias: 'v',
    description: 'Whether to output status of package creation',
    default: false,
    type: 'boolean',
  })
  .option('scoped', {
    alias: 's',
    description: 'Whether to package is scoped for the given user',
    default: false,
    type: 'boolean',
  })
    .argv

// Add the dependencies based on the type of package being created
const devDependencies = [
  'typescript',
  'np', // for publishing
]

switch (type) {
  case 'esm':
    devDependencies.push(
      '@types/mocha',
      'mocha',

      'should', // includes types now :)
      'should-sinon',

      '@types/should-sinon',
      'sinon',
    )
    break

  case 'lit-app':
    devDependencies.push(
      // 'es-module-shims', // not needed since we just hardcode the unpkg usage in the HMTL
      'importly', // create import maps
      'lit-element',
    )
    break
}

go({ name, author, username, devDependencies, verbose, scoped })
  .catch(console.error)
