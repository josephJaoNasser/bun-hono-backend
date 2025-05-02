/**
 * convert a string to camel case
 * @param {string} str
 * @returns
 */
export default function toCamelCase(str: string): string {
  return str.replace(/[_\s-]+(.)?/g, (match, char) =>
    char ? char.toUpperCase() : ""
  );
}
