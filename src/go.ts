import capitalCase from './captialCase'
import jsonReplacer from './jsonReplacer'
import makeAndChangeDir from './makeAndChangeDir'
import readSampleFile from './readSampleFile'
import run from './run'
import samplePackageJson from '../sample/package.json'
import writeToFile from './writeToFile'

interface PackageDetails {
  pkgName: string
  author: string
  username: string
  devDependencies: string[]
}

export default async function({ pkgName, author, username, devDependencies }: PackageDetails) {
  await makeAndChangeDir(pkgName)
  console.log('Made new folder', pkgName)

  await writeToFile('package.json', jsonReplacer(samplePackageJson, {
    name: pkgName,
    author,
    repository: `https://github.com${username}/${pkgName}`,
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
  await run('git', 'remote', 'add', 'origin', `https://github.com${username}/${pkgName}.git`)
  console.log('Initialized Git repo')

  await run('yarn', 'add', '-D', ...devDependencies)
  console.log('Added starter dev dependencies', ...devDependencies)

  await run('git', 'add', '.')
  await run('git', 'commit', '-m', '"Init Commit!"')
  console.log('Successfully created', pkgName)
}
