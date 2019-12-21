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
import sampleBabelRc from '../sample/babel.json'

// The NPM scripts and dependencies that can be used based on the type of package being created
const dependencies: string[] = [],
  devDependencies = [
    'typescript',
    'np', // for publishing
  ]

let scripts: object = {
  build: 'tsc',
  postinstall: 'npm run build',

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
      '@open-wc/testing',
      'replace'
    )
    dependencies.push('lit-element')
  // fallthru

  case 'esm-demo': // Has demo or is an app
    scripts = {
      ...scripts,
      
      start: "es-dev-server --file-extensions .ts --babel --node-resolve --watch --app-index demo/index.html --root demo --open",

      // import maps
      // TODO find a cross-platform friendly import map generator
      "importmap": "importly --host unpkg < package.json > demo/import-map.prod.json",
      "win:importmap": "type package.json | importly --host unpkg > demo/import-map.prod.json",

      // Conversion for Prod/Dev HTML for demo
      "html:removedev": "replace 'type=\"module\"' 'type=\"module-dev-only\"' demo/index.html",
      "html:removedev:undo": "replace 'type=\"module-dev-only\"' 'type=\"module\"' demo/index.html",
      "html:addprod": "replace 'type=\"module-prod-only\"' 'type=\"module\"' demo/index.html",
      "html:addprod:undo": "replace 'type=\"module\"' 'type=\"module-prod-only\"' demo/index.html",
      
      // Deploy demo in branch, always when releasing a new version
      predeploy: "npm run html:removedev && npm run html:addprod && npm run build:esm",
      postdeploy: "npm run html:addprod:undo && npm run html:removedev:undo",
      deploy: 'gh-pages -d dist/demo -v *.ts',

      prerelease: 'npm run build:npm && npm run deploy',
    }

    devDependencies.push(
      // 'es-module-shims', // not needed since we just hardcode the unpkg usage in the HMTL
      'es-dev-server', // local demo
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

  await writeToFile('package.json', jsonReplacer(samplePackageJson, {
    name: scoped ? `@${username}/${name}` : name,
    author,
    description,
    repository: `https://github.com/${username}/${name}`,
    publishConfig: scoped ? { "access": "public" } : undefined,
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
    await writeToFile('.babelrc', JSON.stringify(sampleBabelRc, null, 2))
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
}
