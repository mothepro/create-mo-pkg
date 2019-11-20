#!/usr/bin/env node
import { assert, makeAndChange, run, writeToFile } from './helpers'
import samplePackageJson from './sample/package.json'

const starterDevPkgs = [
  '@types/mocha',
  '@types/should-sinon',
  'mocha',
  'np',
  'should',
  'should-sinon',
  'sinon',
  'typescript',
]

function pkgJsonReplacer(key: string, value: string) {
  switch (key) {
    case 'name':
      return pkgName

    case 'repository':
      return `https://github.com/mothepro/${pkgName}`

    default:
      return value
  }
}

const [pkgName] = process.argv.slice(2)

async function go() {
    assert(!!pkgName, 'New package must have a name')
    
    await makeAndChange(pkgName)
    console.log('Made new package ', pkgName)
    
    await writeToFile('package.json', JSON.stringify(samplePackageJson, pkgJsonReplacer, 2))
    console.log('Generated package.json.')

    await run('yarn', 'add', '-D', ...starterDevPkgs)
    console.log('Added starter dev dependencies.', ...starterDevPkgs)
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

 go()
