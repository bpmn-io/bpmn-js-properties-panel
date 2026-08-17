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
      feelPopupContainer
    } = config || {};

    this._eventBus = eventBus;
    this._injector = injector;
    this._layoutConfig = layoutConfig;
    this._descriptionConfig = descriptionConfig;
    this._tooltipConfig = tooltipConfig;
    this._feelPopupContainer = feelPopupContainer;

    this._container = domify(
      '<div style="height: 100%" class="bio-properties-panel-container"></div>'
    );

    this._openButton = domify(`
      <button
        type="button"
        class="bio-properties-panel-open-btn"
        title="Open Properties Panel"
        aria-label="Open Properties Panel"
        style="display: none;"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"></rect>
          <path d="M15 3v18"></path>
          <path d="m10 15-3-3 3-3"></path>
        </svg>
      </button>
    `);

    domEvent.bind(this._openButton, 'click', (e) => {
      e.preventDefault();
      this.open();
    });

    document.body.appendChild(this._openButton);

    var commandStack = injector.get('commandStack', false);

    commandStack && setupKeyboard(this._container, eventBus, commandStack);

    eventBus.on('diagram.init', () => {
      if (parent) {
        this.attachTo(parent);
      }
    });

    eventBus.on('diagram.destroy', () => {
      this.detach();
      this._destroy();
    });

    eventBus.on('root.added', (event) => {
      const { element } = event;

      this._render(element);
    });

    eventBus.on('propertiesPanel.close', () => {
      this._container.classList.add('bio-properties-panel-is-closed');
      const parentNode = this._parent || this._container.parentNode;
      if (parentNode) {
        parentNode.classList.add('bio-properties-panel-is-closed');
        parentNode.style.display = 'none';
      }
      if (this._openButton) {
        this._openButton.style.display = 'flex';
      }
      const canvas = this._injector.get('canvas', false);
      if (canvas && typeof canvas.resized === 'function') {
        canvas.resized();
      }
    });

    eventBus.on('propertiesPanel.open', () => {
      this._container.classList.remove('bio-properties-panel-is-closed');
      const parentNode = this._parent || this._container.parentNode;
      if (parentNode) {
        parentNode.classList.remove('bio-properties-panel-is-closed');
        parentNode.style.display = '';
      }
      if (this._openButton) {
        this._openButton.style.display = 'none';
      }
      const canvas = this._injector.get('canvas', false);
      if (canvas && typeof canvas.resized === 'function') {
        canvas.resized();
      }
    });

    eventBus.on('propertiesPanel.toggle', () => {
      const isClosed = this._container.classList.contains('bio-properties-panel-is-closed');
      if (isClosed) {
        this.open();
      } else {
        this.close();
      }
    });
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

  /**
   * Opens the properties panel.
   */
  open() {
    this._eventBus.fire('propertiesPanel.open');
  }

  /**
   * Closes the properties panel.
   */
  close() {
    this._eventBus.fire('propertiesPanel.close');
  }

  /**
   * Toggles the open/closed state of the properties panel.
   */
  toggle() {
    this._eventBus.fire('propertiesPanel.toggle');
  }

  _getProviders() {
    const event = this._eventBus.createEvent({
      type: 'propertiesPanel.getProviders',
      providers: []
    });

    this._eventBus.fire(event);

    return event.providers;
  }

  _render(element) {
    const canvas = this._injector.get('canvas');

    if (!element) {
      element = canvas.getRootElement();
    }

    if (isImplicitRoot(element)) {
      return;
    }

    render(
      <BpmnPropertiesPanel
        element={ element }
        injector={ this._injector }
        getProviders={ this._getProviders.bind(this) }
        layoutConfig={ this._layoutConfig }
        descriptionConfig={ this._descriptionConfig }
        tooltipConfig={ this._tooltipConfig }
        feelPopupContainer={ this._feelPopupContainer }
      />,
      this._container
    );

    this._eventBus.fire('propertiesPanel.rendered');
  }

  _destroy() {
    if (this._openButton && this._openButton.parentNode) {
      this._openButton.parentNode.removeChild(this._openButton);
    }

    if (this._container) {
      render(null, this._container);

      this._eventBus.fire('propertiesPanel.destroyed');
    }
  }
}

BpmnPropertiesPanelRenderer.$inject = [ 'config.propertiesPanel', 'injector', 'eventBus' ];


// helpers ///////////////////////

function isImplicitRoot(element) {

  // Backwards compatibility for diagram-js<7.4.0, see https://github.com/bpmn-io/bpmn-properties-panel/pull/102
  return element && (element.isImplicit || element.id === '__implicitroot');
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