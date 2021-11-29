import {
  assign,
  forEach,
  isObject,
  keys
} from 'min-dash';

/**
 * Converts legacy scopes descriptor to newer supported array structure.
 *
 * For example, it transforms
 *
 * scopes: {
 *   'camunda:Connector':
 *     { properties: []
 *   }
 * }
 *
 * to
 *
 * scopes: [
 *   {
 *     type: 'camunda:Connector',
 *     properties: []
 *   }
 * ]
 *
 * @param {ScopesDescriptor} scopes
 *
 * @returns {Array}
 */
export default function handleLegacyScopes(scopes = []) {
  const scopesAsArray = [];

  if (!isObject(scopes)) {
    return scopes;
  }

  forEach(keys(scopes), function(scopeName) {
    scopesAsArray.push(assign({
      type: scopeName
    }, scopes[scopeName]));
  });

  return scopesAsArray;
}
