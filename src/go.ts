import capitalCase from './captialCase'
import jsonReplacer from './jsonReplacer'
import makeAndChangeDir from './makeAndChangeDir'
import readSampleFile from './readSampleFile'
import run from './run'
import samplePackageJson from '../sample/package.json'
import writeToFile from './writeToFile'

let verbosity = false

async function step(logMessage: string, ...promises: Promise<unknown>[]) {
  await Promise.all(promises)
  if (verbosity)
    console.log(logMessage)
}

export default async function ({ pkgName, author, username, devDependencies, verbose }: {
  pkgName: string
  author: string
  username: string
  devDependencies: string[]
  verbose: boolean
}) {
  verbosity = verbose
  console.log({ pkgName, author, username, devDependencies, verbose })

  await step(`Made new folder ${pkgName}`,
    makeAndChangeDir(pkgName))

  await step('Generated package.json',
    writeToFile('package.json', jsonReplacer(samplePackageJson, {
      name: pkgName,
      author,
      repository: `https://github.com${username}/${pkgName}`,
    })))

  await step('Added Apache2 License',
    writeToFile('LICENSE', (await readSampleFile('LICENSE'))
      .replace(/\[yyyy\]/g, new Date().getFullYear().toString())
      .replace(/\[name of copyright owner\]/g, author)))

  await step('Added .gitignore',
    writeToFile('.gitignore', await readSampleFile('.gitignore')))

  await step('Added README',
    writeToFile('README.md', (await readSampleFile('README.md'))
      .replace(/_NAME_/g, pkgName)
      .replace(/_DESC_/g, pkgName)
      .replace(/_NICENAME_/g, capitalCase(pkgName))))

  await step('Initialized Git repo',
    run('git', 'init').then(() => // find a better way to do this
      run('git', 'remote', 'add', 'origin', `https://github.com/${username}/${pkgName}.git`)))

  if (verbose)
    console.log('Adding dev dependencies', ...devDependencies)
  await step('Added starter dev dependencies',
    run('yarn', 'add', '-D', ...devDependencies))

  await step(`Successfully created ${pkgName}`,
    run('git', 'add', '.').then(() => // find a better way to do this
      run('git', 'commit', '-m', '"Init Commit!"')))
}
