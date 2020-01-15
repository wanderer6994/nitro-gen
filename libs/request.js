const request = require("request-promise");

module.exports = async options => {
  options.method = options.method || "GET";

  const headers = {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
  };

  if (options.headers) {
    for (const key of Object.keys(options.headers)) {
      headers[key] = options.headers[key];
    }
  }

  const settings = {
    ...options,
    uri: options.uri,
    json: options.json,
    method: options.method,
    proxy: options.proxy || null,
    resolveWithFullResponse: true,
    qs: options.qs,
    simple: false,
    headers
  };

  return await request.defaults({ jar: true })(settings);
};
