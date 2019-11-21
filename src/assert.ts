/** Ends the process if the expression is falsy */
export default function (expression: any, str = `Didn't expect ${expression} to be false.`) {
  if (!expression) {
    console.error(str)
    process.exit(1)
  }
  return expression
}
