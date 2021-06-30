import Ids from 'ids';

/**
 * generate a semantic id with given prefix
 *
 * @param {string} prefix
 */
export function nextId(prefix) {
  var ids = new Ids([32,32,1]);

  return ids.nextPrefixed(prefix);
}