import { useCallback } from '@bpmn-io/properties-panel/preact/hooks';

import { pathEquals } from '@philippfromme/moddle-helpers';

import {
  isArray,
  isFunction
} from 'min-dash';

export function useShowCallback(businessObject, path) {
  return useCallback((event) => {
    if (event.id !== businessObject.get('id')) {
      return false;
    }

    if (isArray(path)) {
      return event.path && pathEquals(event.path, path);
    }

    if (isFunction(path)) {
      return path(event);
    }
  }, [ businessObject, path ]);
}