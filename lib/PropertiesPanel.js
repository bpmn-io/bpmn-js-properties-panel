'use strict';

var domify = require('min-dom/lib/domify'),
    domQuery = require('min-dom/lib/query'),
    domRemove = require('min-dom/lib/remove'),
    domClasses = require('min-dom/lib/classes'),
    domClosest = require('min-dom/lib/closest'),
    domAttr = require('min-dom/lib/attr'),
    domDelegate = require('min-dom/lib/delegate');


var is = require('bpmn-js/lib/util/ModelUtil').is;

var forEach = require('lodash/collection/forEach'),
    get = require('lodash/object/get');

function isToggle(node) {
  return node.type === 'checkbox' || node.type === 'radio';
}

function getPropertyPlaceholders(node) {
  return domQuery.all('input[name], textarea[name], [data-value]', node);
}

function getFormControls(node) {
  return domQuery.all('input[name], textarea[name], select[name]', node);
}

function getFormControlValuesInScope(entryNode) {
  var values = {};

  var controlNodes = getFormControls(entryNode);

  forEach(controlNodes, function(controlNode) {
    var value = controlNode.value;

    var name = domAttr(controlNode, 'name');

    // take toggle state into account for
    // radio / checkboxes
    if (isToggle(controlNode)) {
      if (controlNode.checked) {
        if (!domAttr(controlNode, 'value')) {
          value = true;
        } else {
          value = controlNode.value;
        }
      } else {
        value = null;
      }
    }

    if (value !== null) {
      // prevents values to be written to xml as empty string
      values[name] = (value !== '') ? value : undefined;
    }
  });

  return values;

}
/**
 * Extract input values from entry node
 *
 * @param  {DOMElement} entryNode
 * @returns {Object}
 */
function getFormControlValues(entryNode) {

  var values;

  var listContainer = domQuery('[data-list-entry-container]', entryNode);
  if(!!listContainer) {
    values = [];
    var listNodes = domQuery.all('[data-list-entry-container] > div', entryNode);
    forEach(listNodes, function(listNode) {
      values.push(getFormControlValuesInScope(listNode));
    });
  }
  else {
    values = getFormControlValuesInScope(entryNode);
  }

  return values;
}

/**
 * A properties panel implementation.
 *
 * To use it provide a `propertiesProvider` component that knows
 * about which properties to display.
 *
 * Properties edit state / visibility can be intercepted
 * via a custom {@link PropertiesActivator}.
 *
 * @class
 * @constructor
 *
 * @param {Object} config
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {PropertiesProvider} propertiesProvider
 * @param {ElementRegistry} elementRegistry
 * @param commandStack
 */
function PropertiesPanel(config, eventBus, modeling, propertiesProvider, elementRegistry, commandStack) {

  this._eventBus = eventBus;
  this._modeling = modeling;
  this._commandStack = commandStack;

  this._propertiesProvider = propertiesProvider;
  this._elementRegistry = elementRegistry;

  this._init(config);
}

PropertiesPanel.$inject = [ 'config.propertiesPanel', 'eventBus', 'modeling', 'propertiesProvider',
                            'elementRegistry', 'commandStack' ];

module.exports = PropertiesPanel;


PropertiesPanel.prototype._init = function(config) {

  var eventBus = this._eventBus;

  var self = this;

  eventBus.on('diagram.init', function() {
    self.registerCmdHandlers();
  });

  /**
   * Select the root element once it is added to the canvas
   */
  eventBus.on('root.added', function(e) {
    self.update(e.element);
  });

  eventBus.on('selection.changed', function(e) {
    var newElement = e.newSelection[0];

    self.update(newElement);
  });


  eventBus.on('elements.changed', function(e) {

    var current = self._current;
    var element = current && current.element;

    if (element) {
      if (e.elements.indexOf(element) !== -1) {
        self.update(element);
      }
    }
  });

  eventBus.on('diagram.destroy', function() {
    self.detach();
  });

  this._container = domify('<div class="djs-properties-panel"></div>');

  this._handle = domify('<div class="djs-properties-panel-handle"></div>');

  this._handle.addEventListener('click', function(e) {
    self.toggle(e);
  });

  this._bindListeners(this._container);

  if (config && config.parent) {
    this.attachTo(config.parent);
  }
};

PropertiesPanel.prototype.registerCmdHandlers = function() {
  var self = this;
  forEach(self.getCmdHandlers(), function(handler, id) {
    self._commandStack.registerHandler(id, handler);
  });
};

PropertiesPanel.prototype.getCmdHandlers = function() {
  return {
    'properties-panel.update-businessobject': require('./cmd/UpdateBusinessObjectHandler'),
    'properties-panel.create-and-reference': require('./cmd/CreateAndReferenceHandler'),
    'properties-panel.create-businessobject-list': require('./cmd/CreateBusinessObjectListHandler'),
    'properties-panel.update-businessobject-list': require('./cmd/UpdateBusinessObjectListHandler')
  };
};

PropertiesPanel.prototype.attachTo = function(parentNode) {

  // ensure we detach from the
  // previous, old parent
  this.detach();

  // unwrap jQuery if provided
  if (parentNode.get) {
    parentNode = parentNode.get(0);
  }

  if (typeof parentNode === 'string') {
    parentNode = domQuery(parentNode);
  }

  var container = this._container,
      handle = this._handle;

  parentNode.appendChild(handle);
  parentNode.appendChild(container);

  this._emit('attach');
};

PropertiesPanel.prototype.detach = function() {

  var container = this._container,
      parentNode = container.parentNode;

  if (!parentNode) {
    return;
  }

  this._emit('detach');

  parentNode.removeChild(container);
};

PropertiesPanel.prototype.update = function(element) {

  var current = this._current;

  // no actual selection change
  var needsCreate = true;


  if (current) {
    if (current.element === element) {
      // reuse existing panel
      needsCreate = false;
    } else if(typeof element === 'undefined') {

      // remove old panel
      domRemove(current.panel);


      // use RootElement of BPMN diagram to generate properties panel if no element is selected
      // and the process is no collaboration
      this._elementRegistry.forEach(function(rootElement) {
        if(is(rootElement, 'bpmn:Process')) {

          element = rootElement;

          needsCreate = true;
        }
      });
    } else {
      // remove old panel
      domRemove(current.panel);
    }
  }

  if (needsCreate) {
    this._current = this._create(element);
  }

  if (this._current) {
    this._updateActivation(this._current);
  }

  this._emit('update');
};

/**
 * Toggle the visibility of the properties panel container
 */
PropertiesPanel.prototype.toggle = function (event) {
  domClasses(this._container).toggle('hidden');
};

PropertiesPanel.prototype._emit = function(event) {
  this._eventBus.fire('propertiesPanel.' + event, { panel: this, current: this._current });
};

PropertiesPanel.prototype._bindListeners = function(container) {

  var self = this;

  domDelegate.bind(container, '[data-entry]', 'input', function onInput(event) {

    var node = event.delegateTarget,
        entryId = domAttr(node, 'data-entry'),
        entry = self.getEntry(entryId);

    var actionId = domAttr(event.target, 'data-input');
    if(!!actionId) {
      self.executeAction(entry, node, actionId, event);
    }

    var values = getFormControlValues(node);

    self.validate(entry, values);

    self.updateState(entry, node);
  });

  domDelegate.bind(container, '[data-entry]', 'change', function onChange(event) {

    var node = event.delegateTarget,
        entryId = domAttr(node, 'data-entry'),
        entry = self.getEntry(entryId);

    var values = getFormControlValues(node);

    if (self.validate(entry, values)) {
      self.applyChanges(entry, values, node);
    }

    self.updateState(entry, node);
  });

  domDelegate.bind(container, '[data-keypress]', 'keypress', function onKeyPress(event) {

    // triggers on all inputs
    var inputNode = event.delegateTarget;
    var entryNode = domClosest(inputNode, '[data-entry]');

    var actionId = domAttr(inputNode, 'data-keypress'),
        entryId = domAttr(entryNode, 'data-entry');

    var entry = self.getEntry(entryId);

    var isEntryDirty = self.executeAction(entry, entryNode, actionId, event);

    if(!!isEntryDirty) {
      var values = getFormControlValues(entryNode);

      if (self.validate(entry, values)) {
        self.applyChanges(entry, values);
      }
    }

    self.updateState(entry, entryNode);
  });

  domDelegate.bind(container, '[data-keydown]', 'keydown', function onKeyDown(event) {

    // triggers on all inputs
    var inputNode = event.delegateTarget;
    var entryNode = domClosest(inputNode, '[data-entry]');

    var actionId = domAttr(inputNode, 'data-keydown'),
        entryId = domAttr(entryNode, 'data-entry');

    var entry = self.getEntry(entryId);

    var isEntryDirty = self.executeAction(entry, entryNode, actionId, event);

    if(!!isEntryDirty) {
      var values = getFormControlValues(entryNode);

      if (self.validate(entry, values)) {
        self.applyChanges(entry, values);
      }
    }

    self.updateState(entry, entryNode);
  });

  domDelegate.bind(container, '[data-action]', 'click', function onClick(event) {

    // triggers on all inputs
    var inputNode = event.delegateTarget;
    var entryNode = domClosest(inputNode, '[data-entry]');

    var actionId = domAttr(inputNode, 'data-action'),
        entryId = domAttr(entryNode, 'data-entry');

    var entry = self.getEntry(entryId);

    var isEntryDirty = self.executeAction(entry, entryNode, actionId, event);

    if(!!isEntryDirty) {
      var values = getFormControlValues(entryNode);

      if (self.validate(entry, values)) {
        self.applyChanges(entry, values);
      }
    }

    self.updateState(entry, entryNode);
  });

  domDelegate.bind(container, '[data-mousedown]', 'mousedown', function onMousedown(event) {
    // triggers on all inputs
    var inputNode = event.delegateTarget;
    var entryNode = domClosest(inputNode, '[data-entry]');

    var eventHandlerId = domAttr(inputNode, 'data-mousedown'),
        entryId = domAttr(entryNode, 'data-entry');

    var entry = self.getEntry(entryId);

    var isEntryDirty = self.executeAction(entry, entryNode, eventHandlerId, event);

    if(!!isEntryDirty) {
      var values = getFormControlValues(entryNode);

      if (self.validate(entry, values)) {
        self.applyChanges(entry, values);
      }
    }

    self.updateState(entry, entryNode);
  });

  domDelegate.bind(container, '[data-focus]', 'focus', function onFocus(event) {

    // triggers on all inputs
    var inputNode = event.delegateTarget;
    var entryNode = domClosest(inputNode, '[data-entry]');

    var eventHandlerId = domAttr(inputNode, 'data-focus'),
        entryId = domAttr(entryNode, 'data-entry');

    var entry = self.getEntry(entryId);

    var isEntryDirty = self.executeAction(entry, entryNode, eventHandlerId, event);

    if(!!isEntryDirty) {
      var values = getFormControlValues(entryNode);

      if (self.validate(entry, values)) {
        self.applyChanges(entry, values);
      }
    }

    self.updateState(entry, entryNode);
  }, true);

  domDelegate.bind(container, '[data-blur]', 'blur', function onBlur(event) {

    // triggers on all inputs
    var inputNode = event.delegateTarget;
    var entryNode = domClosest(inputNode, '[data-entry]');

    var eventHandlerId = domAttr(inputNode, 'data-blur'),
        entryId = domAttr(entryNode, 'data-entry');

    var entry = self.getEntry(entryId);

    var isEntryDirty = self.executeAction(entry, entryNode, eventHandlerId, event);

    if(!!isEntryDirty) {
      var values = getFormControlValues(entryNode);

      if (self.validate(entry, values)) {
        self.applyChanges(entry, values);
      }
    }

    self.updateState(entry, entryNode);

  }, true);
};

PropertiesPanel.prototype.updateState = function(entry, entryNode) {
  this.updateShow(entry, entryNode);
};

PropertiesPanel.prototype.updateShow = function(entry, node) {
  var current = this._current;

  if (!current) {
    return;
  }

  var showNodes = domQuery.all('[data-show]', node) || [];
  forEach(showNodes, function(showNode) {

    var expr = domAttr(showNode, 'data-show');
    var fn = get(entry, expr);
    if(!!fn) {
      var scope = domClosest(showNode, '[data-scope]');
      var shouldShow = fn(current.element, node, showNode, scope) || false;
      var hasClass = domClasses(showNode).has('djs-properties-hide');
      if(shouldShow) {
        if(hasClass) {
          domClasses(showNode).remove('djs-properties-hide');
        }
      }
      else {
        domClasses(showNode).add('djs-properties-hide');
      }
    }
  });
};

PropertiesPanel.prototype.executeAction = function(entry, entryNode, actionId, event) {
  var current = this._current;

  if (!current) {
    return;
  }

  var fn = get(entry, actionId);
  if (!!fn) {
    var scopeNode = domClosest(event.target, '[data-scope]');
    return fn(current.element, entryNode, event, scopeNode);
  }
};

PropertiesPanel.prototype.applyChanges = function(entry, values, containerElement) {

  var element = this._current.element;

  var actualChanges = entry.set(element, values, containerElement);

  // if the entry does not change the element itself but needs to perform a custom cmd
  if(!!actualChanges.cmd) {
    var cmd = actualChanges.cmd;
    this._commandStack.execute(cmd, actualChanges.context || {element : element});
  }
  else {
    this._modeling.updateProperties(element, actualChanges);
  }

};

PropertiesPanel.prototype.applyValidationErrors = function(validationErrors, entryNode) {

  var valid = true;

  var controlNodes = getFormControls(entryNode);

  forEach(controlNodes, function(controlNode) {

    var name = domAttr(controlNode, 'name');

    var error = validationErrors[name];

    if (error) {
      valid = false;
    }

    var errorNode = domQuery('[data-invalid="' + name + '"], [data-invalid=""]', entryNode);

    if (errorNode) {
      errorNode.innerText = !error ? '' : (error.message || error);

      domClasses(errorNode).toggle('invalid', !!error);
    }

    // TODO: validate asynchronously?
    domClasses(controlNode).toggle('invalid', !!error);

  });

  return valid;
};

PropertiesPanel.prototype.validate = function(entry, values) {
  var self = this;

  var current = this._current;

  var valid = true;

  var entryNode = domQuery('[data-entry=' + entry.id + ']', current.panel);

  if(values instanceof Array) {
    var listEntryNodes = domQuery.all('[data-list-entry-container] > div', entryNode);

    // create new elements
    for(var i = 0; i < values.length; i++) {
      var listValue = values[i];

      if(entry.validateListItem) {
        var validationErrors = entry.validateListItem(current.element, listValue);
        var listEntryNode = listEntryNodes[i];

        valid = valid && self.applyValidationErrors(validationErrors, listEntryNode);
      }
    }

  }
  else {

    if (entry.validate) {
      this.validationErrors = entry.validate(current.element, values);
      valid = valid && self.applyValidationErrors(this.validationErrors, entryNode);
    }

  }

  return valid;
};

PropertiesPanel.prototype.getEntry = function(id) {
  return this._current && this._current.entries[id];
};

var flattenDeep = require('lodash/array/flattenDeep'),
    indexBy = require('lodash/collection/indexBy'),
    map = require('lodash/collection/map');

PropertiesPanel.prototype._create = function(element) {

  if (!element) {
    return null;
  }

  var groups = this._propertiesProvider.getGroups(element);

  var containerNode = this._container;

  var panelNode = this._createPanel(element, groups);

  containerNode.appendChild(panelNode);

  var entries = indexBy(flattenDeep(map(groups, 'entries')), 'id');

  return {
    groups: groups,
    entries: entries,
    element: element,
    panel: panelNode
  };
};

PropertiesPanel.prototype._bindTemplate = function(element, entry, values, entryNode) {

  var eventBus = this._eventBus;

  function isPropertyEditable(entry, propertyName) {
    return eventBus.fire('propertiesPanel.isPropertyEditable', {
      entry: entry,
      propertyName: propertyName,
      element: element
    });
  }

  var inputNodes = getPropertyPlaceholders(entryNode);

  forEach(inputNodes, function(node) {

    var name,
        value,
        editable;

    // we deal with an input element
    if ('value' in node) {
      name = domAttr(node, 'name');
      value = values[name];
      editable = isPropertyEditable(entry, name);

      domAttr(node, 'readonly', editable ? null : '');
      domAttr(node, 'disabled', editable ? null : '');

      if (isToggle(node)) {
        node.checked = !!(node.value == value || (!domAttr(node, 'value') && value));
      } else {
        // prevents input fields from having the value 'undefined'
        node.value = (values[name] !== undefined) ? values[name] : '';
      }
    }

    // we deal with some non-editable html element
    else {
      name = domAttr(node, 'data-value');
      node.textContent = values[name];
    }
  });
};

PropertiesPanel.prototype._updateActivation = function(current) {
  var self = this;

  var eventBus = this._eventBus;

  var element = current.element;

  function isEntryVisible(entry) {
    return eventBus.fire('propertiesPanel.isEntryVisible', {
      entry: entry,
      element: element
    });
  }

  var panelNode = current.panel;


  forEach(current.groups, function(group) {

    var groupVisible = false;

    var groupNode = domQuery('[data-group=' + group.id + ']', panelNode);

    forEach(group.entries, function(entry) {

      var entryNode = domQuery('[data-entry=' + entry.id + ']', groupNode);

      var entryVisible = isEntryVisible(entry);

      groupVisible = groupVisible || entryVisible;

      domClasses(entryNode).toggle('hidden', !entryVisible);

      var values = 'get' in entry ? entry.get(element, entryNode) : {};

      if(values instanceof Array) {
        var listEntryContainer = domQuery('[data-list-entry-container]', entryNode);
        var existingElements = domQuery.all('[data-list-entry-container] > div', entryNode);

        for(var i = 0; i < values.length; i++) {
          var listValue = values[i];
          var listItemNode = existingElements[i];
          if(!listItemNode) {
            listItemNode = domify(entry.createListEntryTemplate(listValue, i));
            listEntryContainer.appendChild(listItemNode);
          }
          self._bindTemplate(element, entry, listValue, listItemNode);
        }

      }
      else {
        self._bindTemplate(element, entry, values, entryNode);
      }

      // update conditionally visible elements
      self.updateState(entry, entryNode);
    });

    domClasses(groupNode).toggle('hidden', !groupVisible);
  });

};

PropertiesPanel.prototype._createPanel = function(element, groups) {
  var self = this;

  var panelNode = domify('<div class="djs-properties"></div>'),
      headerNode = domify('<div class="djs-properties-header">' +
        '<div class="label">' + element.id + '</div>' +
        '<div class="search">' +
          '<input type="search" placeholder="Search for property" />' +
          '<button><span>Search</span></button>' +
        '</div>' +
      '</div>');

  panelNode.appendChild(headerNode);

  forEach(groups, function(group) {

    if (!group.id) {
      throw new Error('group must have an id');
    }

    var groupNode = domify('<div class="djs-properties-group" data-group="' + group.id + '">' +
        '<span class="group-toggle"></span>' +
        '<span class="group-label">'+group.label+'</span>' +
      '</div>');
    groupNode.querySelector('.group-toggle').addEventListener('click', function (evt) {
      domClasses(groupNode).toggle('group-closed');
      evt.preventDefault();
      evt.stopPropagation();
    });
    groupNode.addEventListener('click', function (evt) {
      if (!evt.defaultPrevented && domClasses(groupNode).has('group-closed')) {
        domClasses(groupNode).remove('group-closed');
      }
    });

    forEach(group.entries, function(entry) {

      if (!entry.id) {
        throw new Error('entry must have an id');
      }

      var html = entry.html;

      if (typeof html === 'string') {
        html = domify(html);
      }

      // unwrap jquery
      if (html.get) {
        html = html.get(0);
      }

      var entryNode = domify('<div class="djs-properties-entry" data-entry="' + entry.id + '"></div>');

      forEach(entry.cssClasses || [], function (cssClass) {
        domClasses(entryNode).add(cssClass);
      });

      entryNode.appendChild(html);

      groupNode.appendChild(entryNode);

      // update conditionally visible elements
      self.updateState(entry, entryNode);
    });

    panelNode.appendChild(groupNode);
  });

  return panelNode;
};
