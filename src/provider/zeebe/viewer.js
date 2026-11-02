import ZeebePropertiesProviderModule from './index';

/**
 * Read-only variant of the provider, to be used with a viewer. Reuses the
 * editor provider, which tolerates missing editing services.
 */
export default {
  __depends__: [ ZeebePropertiesProviderModule ]
};
