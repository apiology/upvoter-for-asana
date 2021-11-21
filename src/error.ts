const logErrorOrig = (err: string): never => {
  alert(err);
  throw err;
};

// As of 4.4.4, TypeScript's control flow analysis is wonky with
// narrowing and functions that return never.  This is a workaround:
//
// https://github.com/microsoft/TypeScript/issues/36753
export const logError: (err: string) => never = logErrorOrig;

export default 'logError';
