#!/usr/bin/env node
import { strict } from 'yargs'
import { version, name, description } from './package.json'
import { runSync } from './src/run.js'
import go from './src/go'

const {
  _: [pkgName],
  author,
  username,
  type,
} = strict()
  .demandCommand()
  .version(version)
  .help()
  .usage(`${description}
  > ${name} <package-name> [options]
  > yarn create ${name.replace('create-', '')} <package-name> [options]`)
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
    choices: ['esm', 'lit-app']
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
      'importly' // create import maps
    )
    break
}

go({ pkgName, author, username, devDependencies, })
  .catch(console.error)
