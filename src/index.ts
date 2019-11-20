#!/usr/bin/env node
import { assert, makeAndChange, run, writeToFile, readSampleFile, jsonReplacer } from './helpers'
import samplePackageJson from '../sample/package.json'

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
  await makeAndChange(pkgName)
  console.log('Made new folder', pkgName)

  await writeToFile('package.json', jsonReplacer(samplePackageJson, {
    name: pkgName,
    author,
    repository,
  }))
  console.log('Generated package.json')

  const license = await readSampleFile('LICENSE')
  writeToFile('LICENSE', license
    .replace(/\[yyyy\]/g, new Date().getFullYear().toString())
    .replace(/\[name of copyright owner\]/g, author))
  console.log('Added Apache2 License')

  await writeToFile('.gitignore', await readSampleFile('.gitignore'))
  console.log('Added .gitignore')

  await writeToFile('README.md', await readSampleFile('README.md'))
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
