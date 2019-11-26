#!/usr/bin/env node
import { strict } from 'yargs'
import { version, name as thisPkgName, description as thisPkgDescription } from './package.json'
import samplePackageJson from './sample/_package.json'
import sampleTsConfigJson from './sample/_tsconfig.json'
import sampleTsEsmConfigJson from './sample/_tsconfig.esm.json'
import run, { runSync } from './src/run'
import makeAndChangeDir, { makekdir } from './src/makeAndChangeDir'
import jsonReplacer from './src/jsonReplacer'
import writeToFile from './src/writeToFile'
import readSampleFile from './src/readSampleFile'
import captialCase from './src/captialCase'

const {
  _: [name],
  author,
  username,
  type,
  verbose,
  description,
  scoped,
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
    alias: 'desc',
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
    .argv

// The NPM scripts and dependencies that can be used based on the type of package being created
const log = (...strs: string[]) => verbose && console.log(...strs),
  dependencies: string[] = [],
  devDependencies = [
    'typescript',
    'np', // for publishing
  ]

let scripts: object = {
  'build': 'tsc',

  'pretest': 'npm run build',
  'test': 'mocha -r should -r should-sinon dist/test/*.js',

  'prerelease': 'npm run build',
  'release': 'np',
}

switch (type) {
  case 'cli':
    devDependencies.push(
      '@types/node',
      '@types/yargs',
    )
    dependencies.push('yargs')
    break
  
  case 'lit-app':
    dependencies.push('lit-element')
    // fallthru

  case 'esm-demo': // Has demo or is an app
    scripts = {
      ...scripts,

      // import maps
      'map:dev': 'importly --host node_modules < package.json > dist/demo/import-map.json',
      'map:prod': 'importly --host unpkg < package.json > dist/demo/import-map.json',

      // copy HTML before building ES module
      'prebuild:esm': 'copy demo/index.html dist',

      // Building demo for prod and local
      'build:esm:dev': 'npm run map:dev && npm run build:esm',
      'build:esm:prod': 'npm run map:prod && npm run build:esm',

      // Deploy demo in branch, always when releasing a new version
      'predeploy': 'npm run build:prod',
      'deploy': 'gh-pages -d dist/demo',
      'prerelease': 'npm run build:npm && npm run deploy',
    }

    devDependencies.push(
      // 'es-module-shims', // not needed since we just hardcode the unpkg usage in the HMTL
      'importly', // import map generation
      'gh-pages', // push project on github pages
    )
    // fallthru

  case 'esm':
    scripts = {
      ...scripts,

      // Build JS files
      'build:npm': 'tsc',
      'build:esm': 'tsc -p tsconfig.esm.json',
      'build': 'npm run build:npm && npm run build:esm',

      'pretest': 'npm run build:npm',
    }

    devDependencies.push(
      '@types/mocha',
      'mocha',

      'should', // includes types now :)
      'should-sinon',

      '@types/should-sinon',
      'sinon',
    )
    break
}

(async function () { // Because top level await isn't allowed
  await makeAndChangeDir(name)
  log('Made new folder', name)

  await writeToFile('package.json', jsonReplacer(samplePackageJson, {
    name: scoped ? `@${username}/${name}` : name,
    author,
    description,
    repository: `https://github.com/${username}/${name}`,
    publishConfig: scoped ? { "access": "public" } : undefined,
    scripts,
  }))
  log('Generated package.json')

  await writeToFile('LICENSE', (await readSampleFile('LICENSE'))
    .replace(/\[yyyy\]/g, new Date().getFullYear().toString())
    .replace(/\[name of copyright owner\]/g, author))
  log('Added Apache2 License')

  await writeToFile('tsconfig.json', jsonReplacer(sampleTsConfigJson, {
    lib: ['es2019', type == 'lit-app' || type == 'esm-demo' ? 'dom' : undefined],
    bin: type == 'cli' ? 'dist/npm/index.js' : undefined,
  }))
  log('Added tsconfig.json')

  await writeToFile('.gitignore', await readSampleFile('.gitignore'))
  log('Added .gitignore')

  await writeToFile('README.md', (await readSampleFile('README.md'))
    .replace(/_NAME_/g, name)
    .replace(/_DESC_/g, description)
    .replace(/_NICENAME_/g, captialCase(name)))
  log('Added README')

  if (type == 'lit-app' || type == 'esm-demo') {
    await writeToFile('tsconfig.esm.json', JSON.stringify(sampleTsEsmConfigJson, null, 2))
    await makekdir(`${name}/demo`)
    await writeToFile('demo/index.html', (await readSampleFile('demo.html'))
      .replace(/_NICENAME_/g, captialCase(name)))
    log('Added demo')
  }

  await run('git', 'init')
  await run('git', 'remote', 'add', 'origin', `https://github.com/${username}/${name}.git`)
  log('Initialized Git repo')

  log('Adding dependencies', ...devDependencies, ...dependencies)
  await run('yarn', 'add', '-D', ...devDependencies)
  await run('yarn', 'add', ...dependencies)
  log('Added dependencies')

  await run('git', 'add', '.')
  await run('git', 'commit', '-m', '"Init Commit!"')
  log(`Successfully created ${name}`)
})().catch(console.error)
