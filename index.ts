#!/usr/bin/env node
import assert from './src/assert'
import capitalCase from './src/captialCase'
import jsonReplacer from './src/jsonReplacer'
import makeAndChangeDir from './src/makeAndChangeDir'
import readSampleFile from './src/readSampleFile'
import run from './src/run'
import samplePackageJson from './sample/package.json'
import writeToFile from './src/writeToFile'

interface PackageDetails {
  pkgName: string
  author: string
  repository: string
}

const starterDevPkgs = [
  'typescript',

  '@types/mocha',
  'mocha',

  'should', // includes types now :)
  'should-sinon',

  '@types/should-sinon',
  'sinon',
  
  'np', // for publishing

  // for ES module import map gen
  // 'es-module-shims', // not needed since we just hardcode the unpkg usage in the HMTL
  'importly',
].sort()

async function go({ pkgName, author, repository }: PackageDetails) {
  await makeAndChangeDir(pkgName)
  console.log('Made new folder', pkgName)

  await writeToFile('package.json', jsonReplacer(samplePackageJson, {
    name: pkgName,
    author,
    repository,
  }))
  console.log('Generated package.json')

  writeToFile('LICENSE', (await readSampleFile('LICENSE'))
    .replace(/\[yyyy\]/g, new Date().getFullYear().toString())
    .replace(/\[name of copyright owner\]/g, author))
  console.log('Added Apache2 License')

  await writeToFile('.gitignore', await readSampleFile('.gitignore'))
  console.log('Added .gitignore')

  await writeToFile('README.md', (await readSampleFile('README.md'))
    .replace(/_NAME_/g, pkgName)
    .replace(/_DESC_/g, pkgName)
    .replace(/_NICENAME_/g, capitalCase(pkgName)))
  console.log('Added README')

  await run('git', 'init')
  await run('git', 'remote', 'add', 'origin', repository + '.git')
  console.log('Initialized Git repo')

  await run('yarn', 'add', '-D', ...starterDevPkgs)
  console.log('Added starter dev dependencies', ...starterDevPkgs)

  await run('git', 'add', '.')
  await run('git', 'commit', '-m', '"Init Commit!"')
  console.log('Successfully created', pkgName)
}

const pkgName = assert(process.argv[2], 'New package must have a name')
go({
  pkgName,
  author: "Maurice Prosper",
  repository: `https://github.com/mothepro/${pkgName}`,
}).catch(console.error)
