export class TestLogger {
  log = console.log;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  debug = (message?: any, ...optionalParams: any[]): void => { /* do nothing */ };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  /* eslint-enable @typescript-eslint/no-unused-vars */

  warn = console.warn;

  error = console.error;

  userVisibleStatus = console.info;
}
