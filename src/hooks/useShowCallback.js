import { useCallback } from '@bpmn-io/properties-panel/preact/hooks';

import { pathEquals } from '@philippfromme/moddle-helpers';

import {
  isArray,
  isFunction
} from 'min-dash';

/**
 * Returns a memoized callback to be passed as `show` prop. Callback returns
 * true if (1) ID and path match or (2) ID matches and matcher returns true.
 *
 * @example
 *
 * // using path
 * const show = useShowCallback(businessObject, [ 'foo' ]);
 *
 * @example
 *
 * // using matcher
 * const show = useShowCallback(businessObject, (event) => event.foo === 'bar');
 *
 * @param {Object} businessObject
 * @param {string[]|Function} matcher
 *
 * @returns {Function}
 */
export function useShowCallback(businessObject, matcher) {
  return useCallback((event) => {
    const {
      id,
      path
    } = event;

    if (id !== businessObject.get('id')) {
      return false;
    }

    if (isArray(matcher)) {
      return path && pathEquals(path, matcher);
    }

    if (isFunction(matcher)) {
      return !!matcher(event);
    }

    return false;
  }, [ businessObject, matcher ]);
}