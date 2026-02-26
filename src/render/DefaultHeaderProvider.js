import { PanelHeaderProvider } from './PanelHeaderProvider';

/**
 * Default implementation of the properties panel header provider service.
 *
 * This service provides the default header provider that can be injected
 * and overridden by custom implementations.
 */
export default class DefaultHeaderProvider {

  constructor(translate) {
    this._translate = translate;
  }

  /**
   * Get the header provider configuration.
   *
   * @returns {Object} Header provider configuration
   */
  getHeaderProvider() {
    return PanelHeaderProvider(this._translate);
  }
}

DefaultHeaderProvider.$inject = [ 'translate' ];
