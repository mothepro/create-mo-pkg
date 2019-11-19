# mo-pkg

> Global command for creating packages the way Mo likes

## How to use

Install [Yarn](https://yarnpkg.com/lang/en/) command globally if not already.

Then run
`$ yarn create mo-pkg <name>`

## Actions preformed

1. Create a new folder with the specified name
2. Change into it
3. Run `yarn init` with proper arguments
4. Install a strict typescript
5. Install `ttypscript`, `import-map-shim` to build ES modules
6. Install testing framework (`mocha` & `should` and their types)
7. Build a sample `README.md` file
8. Write a simple `.gitignore` file
9. Initizialize the git repo
10. Commit the initial commit!
