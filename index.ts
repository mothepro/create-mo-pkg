#!/usr/bin/env node
import { assert, makeAndChange, run } from './helpers'

const [pkgName] = process.argv.slice(2)

;(async function () {
  assert(!!pkgName, 'New package must have a name')
  await makeAndChange(pkgName)
  console.log('cmd>', await run('echo', '%cd%'))
})()

