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

/**
 * Wraps Office setAsync method so you can await for the value to be set
 * @param setter The setAsync function that you want to await
 * @param value The value that needs to be passed to the setAsync function
 * @param options The options for the setAsync function (if it is supported)
 * @returns
 */
export function setAsyncAsPromise<T>(
  setter: (
    value: T,
    optionsOrCallback: unknown,
    callback?: (result: Office.AsyncResult<void>) => void
  ) => void,
  value: T,
  options?: unknown
): Promise<void> {
  return callbackAsPromise<void>((callback) => {
    if (options === undefined) {
      setter(value, callback);
    } else {
      setter(value, options, callback);
    }
  });
}
