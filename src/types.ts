// https://stackoverflow.com/questions/68982261/typescript-check-if-a-value-is-string
export function isString<T>(data: T): data is T & string {
  return typeof data === 'string';
}

export function isNumber<T>(data: T): data is T & number {
  return typeof data === 'number';
}
