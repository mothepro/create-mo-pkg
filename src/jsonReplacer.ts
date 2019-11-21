/** Formats a JSONable value and replaces */
export default (json: any, map: { [replacementKey: string]: any }) =>
  JSON.stringify(
    json,
    (key: string, value: any) =>
      typeof map[key] != 'undefined'
        ? map[key]
        : value,
    2)
