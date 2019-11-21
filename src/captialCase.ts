/** Returns the package name in a human readable form. */
export default (str: string) =>
  str
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.substr(0, 1).toUpperCase() + word.substr(1))
    .join(' ')
