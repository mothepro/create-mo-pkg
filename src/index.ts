#!/usr/bin/env node
import { assert, makeAndChange, run, writeToFile, readSampleFile } from './helpers'
import samplePackageJson from '../sample/package.json'

interface PackageDetails {
  pkgName: string
  author: string
}

const starterDevPkgs = [
  '@types/mocha',
  '@types/should-sinon',
  'mocha',
  'np',
  'should',
  'should-sinon',
  'sinon',
  'typescript',
],
  pkgJsonReplacer = ({ pkgName, author }: PackageDetails) =>
    (key: string, value: string) => {
      console.log('>', key, value)
      switch (key) {
        case 'name':
          return pkgName
        
        case 'author':
          return author

        case 'repository':
          return `https://github.com/mothepro/${pkgName}`

        default:
          return value
      }
    }

/**
4. Install a strict typescript
5. Install `ttypscript`, `import-map-shim` to build ES modules
6. Install testing framework (`mocha` & `should` and their types)
7. Build a sample `README.md` file
8. Write a simple `.gitignore` file
9. Initizialize the git repo
10. Commit the initial commit!
 */
async function go({ pkgName, author }: PackageDetails) {
  await makeAndChange(pkgName)
  console.log('Made new package', pkgName)

  await writeToFile('package.json', JSON.stringify(samplePackageJson, pkgJsonReplacer({ pkgName, author }), 2))
  console.log('Generated package.json')

  await run('yarn', 'add', '-D', ...starterDevPkgs)
  console.log('Added starter dev dependencies', ...starterDevPkgs)

  const license = await readSampleFile('LICENSE')
  writeToFile('LICENSE', license
    .replace(/\[yyyy\]/g, new Date().getFullYear().toString())
    .replace(/\[name of copyright owner\]/g, author))
}


go({
  pkgName: assert(process.argv[2], 'New package must have a name'),
  author: "Maurice Prosper",
})
