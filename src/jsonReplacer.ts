/** Formats a JSONable value and replaces */
export default (json: any, map: { [replacementKey: string]: any }) =>
  JSON.stringify(
    json,
    (key: string, value: any) =>
      key in map
        ? map[key]
        : value,
    2)
