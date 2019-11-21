#!/usr/bin/env node
import assert from './src/assert'
import go from './src/go'

const devDependencies = [
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

const pkgName = assert(process.argv[2], 'New package must have a name')

go({
  pkgName,
  author: "Maurice Prosper",
  username: 'mothepro',
  devDependencies,
}).catch(console.error)
