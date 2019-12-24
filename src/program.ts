import { name, author, username, type, description, scoped, log } from './args'
import run from './run'
import makeAndChangeDir, { makekdir } from './makeAndChangeDir'
import jsonReplacer from './jsonReplacer'
import writeToFile from './writeToFile'
import readSampleFile from './readSampleFile'
import captialCase from './captialCase'
import samplePackageJson from '../sample/_package.json'
import sampleTsConfigJson from '../sample/_tsconfig.json'
import sampleTsEsmConfigJson from '../sample/_tsconfig.esm.json'

// The NPM scripts and dependencies that can be used based on the type of package being created
const dependencies: string[] = [],
  devDependencies = [
    'typescript',
    'np', // for publishing
  ]

let scripts: { [target: string]: string } = {
  build: 'tsc',

  pretest: 'npm run build',
  test: 'mocha -r should -r should-sinon dist/npm/test/*.js',

  prerelease: 'npm run build',
  release: 'np',
}

switch (type) {
  case 'cli':
    scripts = {
      ...scripts,

      prestart: 'npm run build',
      start: 'node ./dist/npm/index.js',
    }
    devDependencies.push(
      '@types/node',
      '@types/yargs',
    )
    dependencies.push('yargs')
    break

  case 'lit-app':
    devDependencies.push(
      // '@open-wc/testing', // need to remove shouldjs
      'replace'
    )
    dependencies.push('lit-element')
  // fallthru

  case 'esm-demo': // Has demo or is an app
    scripts = {
      ...scripts,

      // import maps
      // TODO find a cross-platform friendly import map generator
      importmap: 'importly --host unpkg < package.json > demo/import-map.json',
      'win:importmap': 'type package.json | importly --host unpkg > demo/import-map.json',

      // Conversion for Prod/Dev HTML for demo
      'html:dev:real': `replace 'dev-only type="dev-only-' 'dev-only type="' demo/index.html`,
      'html:dev:shim': `replace 'dev-only type="' 'dev-only type="dev-only-' demo/index.html`,

      'html:prod:real': `replace 'prod-only type="prod-only-' 'prod-only type="' demo/index.html`,
      'html:prod:shim': `replace 'prod-only type="' 'prod-only type="prod-only-' demo/index.html`,

      // Deploy demo in branch, always when releasing a new version
      predeploy: 'npm run build:esm && npm run html:dev:shim && npm run html:prod:real',
      postdeploy: 'npm run html:dev:real && npm run html:prod:shim',
      deploy: 'gh-pages -d demo -v *.ts',

      prerelease: 'npm run build:npm && npm run deploy',
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
      build: 'npm run build:npm && npm run build:esm',

      pretest: 'npm run build:npm',
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

let called = false
export default async function () {
  if (called)
    return
  called = true

  await makeAndChangeDir(name)
  log('Made new folder', name)

  await writeToFile('index.ts', type == 'cli' ? '' : '// Remember to append ".js" for relative imports')

  await writeToFile('package.json', jsonReplacer(samplePackageJson, {
    name: scoped ? `@${username}/${name}` : name,
    author,
    description,
    repository: `https://github.com/${username}/${name}`,
    publishConfig: scoped ? { access: 'public' } : undefined,
    bin: type == 'cli' ? 'dist/npm/index.js' : undefined,
    scripts,
  }))
  log('Generated package.json')

  await writeToFile('LICENSE', (await readSampleFile('LICENSE'))
    .replace(/\[yyyy\]/g, new Date().getFullYear().toString())
    .replace(/\[name of copyright owner\]/g, author))
  log('Added Apache2 License')

  await writeToFile('tsconfig.json', jsonReplacer(sampleTsConfigJson, {
    lib: type == 'lit-app' || type == 'esm-demo'
      ? ['es2019', 'dom']
      : ['es2019'],
  }))
  if (type == 'lit-app' || type == 'esm-demo' || type == 'esm')
    await writeToFile('tsconfig.esm.json', JSON.stringify(sampleTsEsmConfigJson, null, 2))
  log('Added tsconfig.json')

  await writeToFile('.gitignore', await readSampleFile('gitignore'))
  log('Added .gitignore')

  await writeToFile('README.md', (await readSampleFile('README.md'))
    .replace(/_SCOPE_/g, scoped ? `@${username}/` : '')
    .replace(/_NAME_/g, name)
    .replace(/_DESC_/g, description)
    .replace(/_NICENAME_/g, captialCase(name)))
  log('Added README')

  if (type == 'lit-app' || type == 'esm-demo') {
    await makekdir(`${name}/demo`)
    await writeToFile('demo/index.html', (await readSampleFile('demo.html'))
      .replace(/_SCOPE_/g, scoped ? `@${username}/` : '')
      .replace(/_NAME_/g, name)
      .replace(/_DESC_/g, description)
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
}
