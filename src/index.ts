#!/usr/bin/env node
import { assert, makeAndChange, run, writeToFile, readSampleFile, jsonReplacer } from './helpers'
import samplePackageJson from '../sample/package.json'

interface PackageDetails {
  pkgName: string
  author: string
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

/**
7. Build a sample `README.md` file
8. Write a simple `.gitignore` file
9. Initizialize the git repo
10. Commit the initial commit!
 */
async function go({ pkgName, author }: PackageDetails) {
  await makeAndChange(pkgName)
  console.log('Made new folder', pkgName)

  await writeToFile('package.json', jsonReplacer(samplePackageJson, {
    name: pkgName,
    repostiory: `https://github.com/mothepro/${pkgName}`,
    author,
  }))
  console.log('Generated package.json')

  const license = await readSampleFile('LICENSE')
  writeToFile('LICENSE', license
    .replace(/\[yyyy\]/g, new Date().getFullYear().toString())
    .replace(/\[name of copyright owner\]/g, author))
  console.log('Add Apache2 License')

  console.log('Adding starter dev dependencies', ...starterDevPkgs)
  await run('yarn', 'add', '-D', ...starterDevPkgs)

  console.log('Successfully created', pkgName)
}


go({
  pkgName: assert(process.argv[2], 'New package must have a name'),
  author: "Maurice Prosper",
})
