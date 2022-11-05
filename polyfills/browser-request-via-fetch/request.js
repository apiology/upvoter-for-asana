function request(params, callback) {
  const {
    method, url, json, qs, headers,
  } = params;
  let { body } = params;
  const qsStr = new URLSearchParams(qs);
  const fullUrl = `${url}?${qsStr}`;
  if (typeof json === 'object') {
    body = JSON.stringify(json);
  }
  const fetchOptions = { method, headers, body };
  const promise = fetch(fullUrl, fetchOptions);
  promise.then((fetchResponse) => {
    if (!fetchResponse.ok) {
      const errorMessage = `Problem fetching ${fullUrl} with ${JSON.stringify(fetchOptions)} from ${JSON.stringify(params)}: ${fetchResponse.status}: ${fetchResponse.statusText}`;
      callback(new Error(errorMessage), null, null);
    } else {
      const requestResponse = {};
      const error = null;
      if (json === true) {
        callback(error, requestResponse, fetchResponse.json());
      } else {
        callback(error, requestResponse, fetchResponse.text());
      }
    }
  }).catch((error) => {
    callback(error, null, null);
  });
}

module.exports = request;
