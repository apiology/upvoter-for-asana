export default class AlfredLogger {
  // logging is not possible in alfy, as stdout would interfere with
  // the JSON output from alfy, and alfy interprets anything written
  // to stderr as something it should create a separate JSON output
  // about, which is not helpful when we are trying to create a
  // success output.

  // See alfy's issue 86

  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  /* eslint-disable @typescript-eslint/no-empty-function */
  log = (message?: any, ...optionalParams: any[]) => { };

  debug = (s: string): void => { };

  warn = (message?: any, ...optionalParams: any[]) => { };

  error = (message?: any, ...optionalParams: any[]) => { };

  userVisibleStatus = (s: string): void => { };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  /* eslint-enable @typescript-eslint/no-unused-vars */
  /* eslint-enable @typescript-eslint/no-empty-function */
}
