/**
 * Services that are only available in an editor (and only used to
 * modify the diagram). In a viewer they are replaced by an inert stub.
 */
const WRITE_SERVICES = [
  'commandStack',
  'bpmnFactory',
  'modeling',
  'debounceInput'
];

const WRITE_SERVICE_ERROR = 'write service not available: properties panel is read-only';

/**
 * A shared, inert stand-in for write services. Any attempt to call it
 * (or one of its members) throws, access alone is safe.
 */
const WRITE_SERVICE_STUB = new Proxy(function() {}, {
  get(target, property) {

    // never look like a promise or a primitive
    if (typeof property !== 'string' || property === 'then') {
      return undefined;
    }

    return WRITE_SERVICE_STUB;
  },
  apply() {
    throw new Error(WRITE_SERVICE_ERROR);
  },
  construct() {
    throw new Error(WRITE_SERVICE_ERROR);
  }
});

/**
 * `debounceInput` is invoked on render to wrap change handlers, it must
 * not throw. Handlers stay inert, as they only reach the throwing stub.
 */
const NO_DEBOUNCE = (fn) => fn;

/**
 * Check whether the given service is a write service, i.e. one that
 * may be missing in a viewer.
 *
 * @param {string} type
 *
 * @return {boolean}
 */
export function isWriteService(type) {
  return WRITE_SERVICES.includes(type);
}

/**
 * Get an editor-only service, falling back to an inert stub if
 * the service is not provided, i.e. when running in a viewer.
 *
 * @param {Injector} injector
 * @param {string} type
 *
 * @return {any}
 */
export function getWriteService(injector, type) {
  const service = injector.get(type, false);

  if (service) {
    return service;
  }

  return type === 'debounceInput' ? NO_DEBOUNCE : WRITE_SERVICE_STUB;
}

/**
 * Wrap the given injector so that write services missing from it
 * resolve to an inert stub. Other lookups are passed through.
 *
 * @param {Injector} injector
 *
 * @return {{ get: (type: string, strict?: boolean) => any }}
 */
export function withWriteServiceStubs(injector) {
  return {
    get(type, strict) {
      return isWriteService(type)
        ? getWriteService(injector, type)
        : injector.get(type, strict);
    }
  };
}
