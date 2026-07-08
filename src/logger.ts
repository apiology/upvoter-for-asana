export abstract class Logger {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  abstract log(message?: any, ...optionalParams: any[]): void;

  abstract debug(message?: any, ...optionalParams: any[]): void;

  abstract warn(message?: any, ...optionalParams: any[]): void;

  abstract error(message?: any, ...optionalParams: any[]): void;

  abstract userVisibleStatus(message: string): void;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
