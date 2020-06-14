#!/usr/bin/env node
import { name, author, username, type, description, scoped, verbose, tests } from './args'
import main from '../index'
import captialCase from '../src/captialCase'

main({
  name, author, username, type, description, scoped, tests,
  
  // Log, if requested
  log: (...strs: string[]) => verbose && console.log(...strs),

  // Update string to use template replacements
  templates: (str: string) => str
    .replace(/_YEAR_/g, new Date().getFullYear().toString())
    .replace(/_AUTHOR_/g, author)
    .replace(/_SCOPE_/g, scoped ? `@${username}/` : '')
    .replace(/_NAME_/g, name)
    .replace(/_DESC_/g, description)
    .replace(/_NICENAME_/g, captialCase(name))
}).catch(console.error)
