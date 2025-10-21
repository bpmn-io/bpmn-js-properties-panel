import BpmnPropertiesPanel from './BpmnPropertiesPanel';

import {
  isUndo,
  isRedo
} from 'diagram-js/lib/features/keyboard/KeyboardUtil';

import {
  render
} from '@bpmn-io/properties-panel/preact';

import {
  domify,
  query as domQuery,
  event as domEvent
} from 'min-dom';

import { isArray, reduce } from 'min-dash';

const DEFAULT_PRIORITY = 1000;

/**
 * @typedef { import('@bpmn-io/properties-panel').GroupDefinition } GroupDefinition
 * @typedef { import('@bpmn-io/properties-panel').ListGroupDefinition } ListGroupDefinition
 * @typedef { { getGroups: (ModdleElement) => (Array{GroupDefinition|ListGroupDefinition}) => Array{GroupDefinition|ListGroupDefinition}) } PropertiesProvider
 */

export default class BpmnPropertiesPanelRenderer {

  constructor(config, injector, eventBus) {
    const {
      parent,
      layout: layoutConfig,
      description: descriptionConfig,
      tooltip: tooltipConfig,
      feelPopupContainer,
      getFeelPopupLinks
    } = config || {};

    this._eventBus = eventBus;
    this._injector = injector;
    this._layoutConfig = layoutConfig;
    this._descriptionConfig = descriptionConfig;
    this._tooltipConfig = tooltipConfig;
    this._feelPopupContainer = feelPopupContainer;
    this._getFeelPopupLinks = getFeelPopupLinks;

    this._container = domify(
      '<div style="height: 100%" tabindex="-1" class="bio-properties-panel-container"></div>'
    );

    const commandStack = injector.get('commandStack', false);

    commandStack && setupKeyboard(this._container, eventBus, commandStack);

    eventBus.on('diagram.init', () => {
      if (parent) {
        this.attachTo(parent);
      }
    });

    eventBus.on('diagram.destroy', () => {
      this.detach();
    });

    this._selectedElement = null;
    this._groups = [];

    const update = () => {
      updateSelectedElement();
      updateGroups();

      this._render();

      eventBus.fire('propertiesPanel.updated', {
        element: this._selectedElement
      });
    };

    const updateSelectedElement = () => {
      const canvas = injector.get('canvas'),
            selection = injector.get('selection');

      const rootElement = canvas.getRootElement();

      if (isImplicitRoot(rootElement)) {
        this._selectedElement = rootElement;

        return;
      }

      const selectedElements = selection.get();

      if (selectedElements.length > 1) {
        this._selectedElement = selectedElements;
      } else if (selectedElements.length === 1) {
        this._selectedElement = selectedElements[0];
      } else {
        this._selectedElement = rootElement;
      }
    };

    const updateGroups = () => {
      if (!this._selectedElement || isImplicitRoot(this._selectedElement) || isArray(this._selectedElement)) {
        this._groups = [];

        return;
      }

      const providers = this._getProviders(this._selectedElement);

      this._groups = reduce(providers, (groups, provider) => {
        const updater = provider.getGroups(this._selectedElement);

        return updater(groups);
      }, []);
    };

    const updateLayout = ({ layout }) => {
      this._layoutConfig = layout;

      this._render();

      eventBus.fire('propertiesPanel.updated', {
        element: this._selectedElement
      });
    };

    eventBus.on('selection.changed', update);
    eventBus.on('elements.changed', update);
    eventBus.on('elementTemplates.changed', update);
    eventBus.on('propertiesPanel.providersChanged', update);

    eventBus.on('propertiesPanel.setLayout', updateLayout);
  }

  /**
   * Attach the properties panel to a parent node.
   *
   * @param {HTMLElement} container
   */
  attachTo(container) {
    if (!container) {
      throw new Error('container required');
    }

    // unwrap jQuery if provided
    if (container.get && container.constructor.prototype.jquery) {
      container = container.get(0);
    }

    if (typeof container === 'string') {
      container = domQuery(container);
    }

    // (1) detach from old parent
    this.detach();

    // (2) append to parent container
    container.appendChild(this._container);

    // (3) notify interested parties
    this._eventBus.fire('propertiesPanel.attach');
  }

  /**
   * Detach the properties panel from its parent node.
   */
  detach() {
    const parentNode = this._container.parentNode;

    if (parentNode) {
      parentNode.removeChild(this._container);

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

    if (typeof provider.getGroups !== 'function') {
      console.error(
        'Properties provider does not implement #getGroups(element) API'
      );

      return;
    }

    this._eventBus.on('propertiesPanel.getProviders', priority, function(event) {
      event.providers.push(provider);
    });

    this._eventBus.fire('propertiesPanel.providersChanged');
  }

  /**
   * Updates the layout of the properties panel.
   * @param {Object} layout
   */
  setLayout(layout) {
    this._eventBus.fire('propertiesPanel.setLayout', { layout });
  }

  _getProviders() {
    const event = this._eventBus.createEvent({
      type: 'propertiesPanel.getProviders',
      providers: []
    });

    this._eventBus.fire(event);

    return event.providers;
  }

  _render() {
    if (!this._selectedElement || isImplicitRoot(this._selectedElement)) {
      return;
    }

    render(
      <BpmnPropertiesPanel
        element={ this._selectedElement }
        groups={ this._groups }
        injector={ this._injector }
        layoutConfig={ this._layoutConfig }
        descriptionConfig={ this._descriptionConfig }
        tooltipConfig={ this._tooltipConfig }
        feelPopupContainer={ this._feelPopupContainer }
        getFeelPopupLinks={ this._getFeelPopupLinks }
      />,
      this._container
    );

    this._eventBus.fire('propertiesPanel.rendered');
  }

  _destroy() {
    if (this._container) {
      render(null, this._container);

      this._eventBus.fire('propertiesPanel.destroyed');
    }
  }
}

BpmnPropertiesPanelRenderer.$inject = [ 'config.propertiesPanel', 'injector', 'eventBus' ];


// helpers ///////////////////////

function isImplicitRoot(element) {
  return element && element.isImplicit;
}

/**
 * Setup keyboard bindings (undo, redo) on the given container.
 *
 * @param {Element} container
 * @param {EventBus} eventBus
 * @param {CommandStack} commandStack
 */
function setupKeyboard(container, eventBus, commandStack) {

  function cancel(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleKeys(event) {

    if (isUndo(event)) {
      commandStack.undo();

      return cancel(event);
    }

    if (isRedo(event)) {
      commandStack.redo();

      return cancel(event);
    }
  }

  eventBus.on('keyboard.bind', function() {
    domEvent.bind(container, 'keydown', handleKeys);
  });

  eventBus.on('keyboard.unbind', function() {
    domEvent.unbind(container, 'keydown', handleKeys);
  });
}