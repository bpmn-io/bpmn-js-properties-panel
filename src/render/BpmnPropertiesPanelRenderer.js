import BpmnPropertiesPanel from './BpmnPropertiesPanel';

import {
  render
} from 'preact';

import {
  query as domQuery
} from 'min-dom';

const DEFAULT_PRIORITY = 1000;

/**
 * @typedef { import('@bpmn-io/properties-panel/src/PropertiesPanel').GroupDefinition } GroupDefinition
 * @typedef { import('@bpmn-io/properties-panel/src/PropertiesPanel').ListGroupDefinition } ListGroupDefinition
 * @typedef { { getGroups: (ModdleElement) => (Array{GroupDefinition|ListGroupDefinition}) => Array{GroupDefinition|ListGroupDefinition}) } PropertiesProvider
 */

export default class BpmnPropertiesPanelRenderer {

  constructor(config, injector, eventBus) {
    let {
      parent: parentNode,
      layout: layoutConfig
    } = config || {};

    if (typeof parentNode === 'string') {
      parentNode = domQuery(parentNode);
    }

    this._eventBus = eventBus;
    this._injector = injector;
    this._layoutConfig = layoutConfig;

    this._parentNode = parentNode;


    this._eventBus.on('root.added', (event) => {

      const { element } = event;

      if (this._parentNode) {
        this.attachTo(this._parentNode, element);
      }
    });

    eventBus.on('root.removed', () => {
      this.detach();
    });
  }

  /**
   * Attach the properties panel to a parent node.
   *
   * @param {HTMLElement} container
   * @param {ModdleElement} element
   */
  attachTo(container, element) {
    const canvas = this._injector.get('canvas');

    if (!container) {
      throw new Error('container required');
    }

    if (!element) {
      element = canvas.getRootElement();
    }

    // (1) detach from old parent
    this.detach();

    // (2) save new parent
    this._parentNode = container;

    // (3) render properties panel to new parent
    render(
      <BpmnPropertiesPanel
        element={ element }
        injector={ this._injector }
        getProviders={ this._getProviders.bind(this) }
        layoutConfig={ this._layoutConfig }
      />,
      this._parentNode
    );

    // (4) notify interested parties
    this._eventBus.fire('propertiesPanel.attach');
  }

  /**
   * Detach the properties panel from its parent node.
   */
  detach() {
    if (this._parentNode) {
      render(null, this._parentNode);

      this._eventBus.fire('propertiesPanel.detach');
    }
  }

  /**
   * Register a new properties provider to the properties panel.
   *
   * @param {Number} [priority]
   * @param {PropertiesProvider} provider
   */
  registerProvider(priority, provider) {

    if (!provider) {
      provider = priority;
      priority = DEFAULT_PRIORITY;
    }

    this._eventBus.on('propertiesPanel.getProviders', priority, function(event) {
      event.providers.push(provider);
    });

    this._eventBus.fire('propertiesPanel.providersChanged');
  }

  _getProviders() {
    const event = this._eventBus.createEvent({
      type: 'propertiesPanel.getProviders',
      providers: []
    });

    this._eventBus.fire(event);

    return event.providers;
  }
}

BpmnPropertiesPanelRenderer.$inject = ['config.propertiesPanel', 'injector', 'eventBus'];