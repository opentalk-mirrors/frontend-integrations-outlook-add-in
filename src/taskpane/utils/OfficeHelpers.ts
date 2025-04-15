/**
 * Wraps Office async methods using a callback function so the result is returned as Promise
 */
export function callbackAsPromise<T>(
  getter: (callback: (result: Office.AsyncResult<T>) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    getter((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        resolve(result.value);
      } else {
        reject(result.error);
      }
    });
  });
}
