import { h, render } from '@bpmn-io/properties-panel/preact';

import {
  domify,
  query as domQuery
} from 'min-dom';

import BpmnPropertiesPanelHeader from './BpmnPropertiesPanelHeader';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

export default class BpmnPropertiesPanelHeaderRenderer {

  constructor(config, injector, eventBus) {
    const { parent } = config || {};

    this._eventBus = eventBus;
    this._injector = injector;
    this._element = null;

    this._container = domify(
      '<div class="bio-properties-panel"></div>'
    );

    eventBus.on('diagram.init', () => {
      if (parent) {
        this.attachTo(parent);
      }
    });

    eventBus.on('root.added', (event) => {
      if (event.element && event.element.isImplicit) {
        return;
      }

      this._renderElement(event.element);
    });

    eventBus.on('selection.changed', (e) => {
      const { newSelection = [] } = e;
      const canvas = injector.get('canvas', false);
      if (!canvas) {
        return;
      }

      const rootElement = canvas.getRootElement();
      if (rootElement && rootElement.isImplicit) {
        return;
      }

      const element = newSelection.length > 1
        ? newSelection
        : newSelection[0] || rootElement;

      this._renderElement(element);
    });

    eventBus.on('elements.changed', (e) => {
      if (!this._element) {
        return;
      }

      const current = Array.isArray(this._element) ? this._element : [ this._element ];
      if (e.elements.some(el => current.includes(el))) {
        this._renderElement(this._element);
      }
    });

    eventBus.on('import.done', () => {
      const canvas = injector.get('canvas', false);
      if (!canvas) {
        return;
      }

      const rootElement = canvas.getRootElement();
      if (rootElement && !rootElement.isImplicit) {
        this._renderElement(rootElement);
      }
    });

    eventBus.on('diagram.destroy', () => {
      this.detach();
      render(null, this._container);
    });
  }

  /**
   * Attach the header to a parent node.
   *
   * @param {HTMLElement|string} container
   */
  attachTo(container) {
    if (!container) {
      throw new Error('container required');
    }

    if (container.get && container.constructor.prototype.jquery) {
      container = container.get(0);
    }

    if (typeof container === 'string') {
      container = domQuery(container);
    }

    this.detach();

    container.appendChild(this._container);

    this._eventBus.fire('propertiesPanelHeader.attach');
  }

  /**
   * Detach the header from its parent node.
   */
  detach() {
    const parentNode = this._container.parentNode;

    if (parentNode) {
      parentNode.removeChild(this._container);

      this._eventBus.fire('propertiesPanelHeader.detach');
    }
  }

  _renderElement(element) {
    this._element = element;

    render(
      h(BpmnPropertiesPanelHeader, { injector: this._injector, element }),
      this._container
    );
  }
}

BpmnPropertiesPanelHeaderRenderer.$inject = [
  'config.propertiesPanelHeader',
  'injector',
  'eventBus'
];
