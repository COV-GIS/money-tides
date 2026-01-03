/**
 * Return a URL from base and query string key/value pairs.
 *
 * @param base - base URL
 * @param params - query string params
 */
const createURL = (base: string, params: { [key: string]: string | number }): string => {
  const url = new URL(base);

  Object.entries(params).forEach(([key, value]): void => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
};

export default createURL;
