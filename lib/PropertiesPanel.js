'use strict';

var domify = require('min-dom/lib/domify'),
    domQuery = require('min-dom/lib/query'),
    domRemove = require('min-dom/lib/remove'),
    domClasses = require('min-dom/lib/classes'),
    domClosest = require('min-dom/lib/closest'),
    domAttr = require('min-dom/lib/attr'),
    domDelegate = require('min-dom/lib/delegate');

var forEach = require('lodash/collection/forEach'),
    get = require('lodash/object/get'),
    keys = require('lodash/object/keys'),
    isEmpty = require('lodash/lang/isEmpty'),
    isArray = require('lodash/lang/isArray'),
    xor = require('lodash/array/xor'),
    debounce = require('lodash/function/debounce');

var calculateSelectionUpdate = require('./util/StringUtils').calculateSelectionUpdate;


var DEBOUNCE_DELAY = 300;

function isToggle(node) {
  return node.type === 'checkbox' || node.type === 'radio';
}

function isSelect(node) {
  return node.type === 'select-one';
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
/*function getFormControlValues(entryNode) {

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
}*/
function getFormControlValues(entryNode) {

  var values;

  var listContainer = domQuery('[data-list-entry-container]', entryNode);
  var tableListContainer = domQuery('[data-list-table-container]', entryNode);

  if(!!listContainer) {
    values = [];
    var listNodes = domQuery.all('[data-list-entry-container] > div', entryNode);
    forEach(listNodes, function(listNode) {
      values.push(getFormControlValuesInScope(listNode));
    });
  }
  else if(!!tableListContainer) {
    values = [];    
    var tableListNodes = domQuery.all('[data-list-table-container] > div', entryNode);
    forEach(tableListNodes, function(tableListNode) {
      var value = {};
      var headNode = domQuery.all('[data-list-table-head-container]', tableListNode);
      if(!!headNode && headNode.length > 0){
          value = getFormControlValuesInScope(headNode[0]);        
      }  
      var tableNodes = domQuery.all('[data-list-table-rows-container]', tableListNode);
      forEach(tableNodes, function(tableNode) { 
        var name = domAttr(tableNode, 'name');
        if(value[name]===undefined){
          value[name] = [];
        }
        var rowNodes = domQuery.all('[data-list-table-rows-sub-container] > div', tableNode);
        forEach(rowNodes,function(rowNode){
          var tempValue = getFormControlValuesInScope(rowNode);
          if(Object.getOwnPropertyNames(tempValue).length > 0){
              value[name].push(tempValue);              
          }
        });
      });
      values.push(value);
    });
  }
  else{
    values = getFormControlValuesInScope(entryNode);
  }

  return values;
}

var keys = Object.keys;

/**
 * Return true if the given form extracted value equals
 * to an old cached version.
 *
 * @param {Object} value
 * @param {Object} oldValue
 * @return {Boolean}
 */
function valueEqual(value, oldValue) {

  if (value && !oldValue) {
    return false;
  }

  var allKeys = keys(value).concat(keys(oldValue));

  return allKeys.every(function(key) {
    return value[key] === oldValue[key];
  });
}

/**
 * Return true if the given form extracted value(s)
 * equal an old cached version.
 *
 * @param {Array<Object>|Object} values
 * @param {Array<Object>|Object} oldValues
 * @return {Boolean}
 */
function valuesEqual(values, oldValues) {

  if (isArray(values)) {

    if (values.length !== oldValues.length) {
      return false;
    }

    return values.every(function(v, idx) {
      return valueEqual(v, oldValues[idx]);
    });
  }

  return valueEqual(values, oldValues);
}

/**
 * Return a mapping of { id: entry } for all entries in the given groups.
 *
 * @param {Object} groups
 * @return {Object}
 */
function extractEntries(groups) {
  return indexBy(flattenDeep(map(groups, 'entries')), 'id');
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
 * @param {Canvas} canvas
 * @param commandStack
 */
function PropertiesPanel(config, eventBus, modeling, propertiesProvider, commandStack, canvas) {

  this._eventBus = eventBus;
  this._modeling = modeling;
  this._commandStack = commandStack;
  this._canvas = canvas;

  this._propertiesProvider = propertiesProvider;

  this._init(config);
}

PropertiesPanel.$inject = [
  'config.propertiesPanel',
  'eventBus',
  'modeling',
  'propertiesProvider',
  'commandStack',
  'canvas' ];

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

  if (!parentNode) {
    throw new Error('parentNode required');
  }

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

  var container = this._container;

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

  if (typeof element === 'undefined') {

    // use RootElement of BPMN diagram to generate properties panel if no element is selected
    element = this._canvas.getRootElement();
  }

  var newGroups = this._propertiesProvider.getGroups(element);

  if (current && current.element === element) {
    // see if we can reuse the existing panel

    needsCreate = this._groupsChanged(current, newGroups);
    //needsCreate = false;
  }

  if (needsCreate) {

    if (current) {
      // remove old panel
      domRemove(current.panel);
    }

    this._current = this._create(element, newGroups);
  }

  if (this._current) {
    this._updateActivation(this._current);
  }

  this._emit('update');
};


/**
 * Returns true if one of two groups has different entries than the other.
 *
 * @param  {Object} current
 * @param  {Object} newGroups
 * @return {Booelan}
 */
PropertiesPanel.prototype._groupsChanged = function(current, newGroups) {

  var oldEntryIds = keys(current.entries),
      newEntryIds = keys(extractEntries(newGroups));

  return !isEmpty(xor(oldEntryIds, newEntryIds));
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

  var handleChange = function handleChange(event) {

    var node = event.delegateTarget,
        entryId = domAttr(node, 'data-entry'),
        entry = self.getEntry(entryId);

    var values = getFormControlValues(node);

    if (self.validate(entry, values)) {
      self.applyChanges(entry, values, node);
    }

    self.updateState(entry, node);
  };

  domDelegate.bind(container, '[data-entry]', 'input', debounce(handleChange, DEBOUNCE_DELAY));
  domDelegate.bind(container, '[data-entry]', 'change', handleChange);

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


  function handleInput(event, element) {
    // triggers on all inputs
    var inputNode = event.delegateTarget;

    var entryNode = domClosest(inputNode, '[data-entry]');

    // only work on data entries
    if (!entryNode) {
      return;
    }

    var eventHandlerId = domAttr(inputNode, 'data-blur'),
        entryId = domAttr(entryNode, 'data-entry');

    var entry = self.getEntry(entryId);

    var isEntryDirty = self.executeAction(entry, entryNode, eventHandlerId, event);

    if (isEntryDirty) {
      var values = getFormControlValues(entryNode);

      if (self.validate(entry, values)) {
        self.applyChanges(entry, values);
      }
    }

    self.updateState(entry, entryNode);
  }

  domDelegate.bind(container, '[data-blur]', 'blur', handleInput, true);
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
    if (fn) {
      var scope = domClosest(showNode, '[data-scope]') || node;
      var shouldShow = fn(current.element, node, showNode, scope) || false;
      var hasClass = domClasses(showNode).has('djs-properties-hide');
      if (shouldShow) {
        if (hasClass) {
          domClasses(showNode).remove('djs-properties-hide');
        }
      } else {
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
    var scopeNode = domClosest(event.target, '[data-scope]') || entryNode;
    return fn(current.element, entryNode, event, scopeNode);
  }
};

PropertiesPanel.prototype.applyChanges = function(entry, values, containerElement) {

  var element = this._current.element;

  // ensure we only update the model if we got dirty changes
  if (valuesEqual(values, entry.oldValues)) {
    return;
  }

  var actualChanges = entry.set(element, values, containerElement);

  // if the entry does not change the element itself but needs to perform a custom cmd
  if (actualChanges.cmd) {
    this._commandStack.execute(actualChanges.cmd, actualChanges.context || {element : element});
  } else {
    this._modeling.updateProperties(element, actualChanges);
  }

  entry.oldValues = values;
};

PropertiesPanel.prototype.applyValidationErrors = function(validationErrors, entryNode) {

  var valid = true;

  var controlNodes = getFormControls(entryNode);

  forEach(controlNodes, function(controlNode) {

    var name = domAttr(controlNode, 'name');

    var error = validationErrors[name];

    var errorMessageNode = domQuery('.error-message', controlNode.parentNode);

    if (error) {
      valid = false;

      if (!errorMessageNode) {
        errorMessageNode = domify('<div></div>');

        domClasses(errorMessageNode).add('error-message');

        // insert errorMessageNode after controlNode
        controlNode.parentNode.insertBefore(errorMessageNode, controlNode.nextSibling);
      }

      errorMessageNode.innerHTML = error;
      domClasses(controlNode).add('invalid');
    } else {
      if (errorMessageNode) {
        controlNode.parentNode.removeChild(errorMessageNode);
        domClasses(controlNode).remove('invalid');
      }
    }

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
    if(!!listEntryNodes && listEntryNodes.length>0){
      // create new elements
      for(var i = 0; i < values.length; i++) {
        var listValue = values[i];

        if(entry.validateListItem) {
          var validationErrors = entry.validateListItem(current.element, listValue);
          var listEntryNode = listEntryNodes[i];

          valid = self.applyValidationErrors(validationErrors, listEntryNode) && valid;
        }
      }
    }
    var tableListEntryNodes = domQuery.all('[data-list-table-container] > div', entryNode);
    if(!!tableListEntryNodes && tableListEntryNodes.length>0){
      // create new elements
      for(var ii = 0; ii < values.length; ii++) {
        var tableListValue = values[ii];

        if(entry.validateListItem) {
          var tableValidationErrors = entry.validateListItem(current.element, tableListValue);
          var tableListEntryNode = tableListEntryNodes[j];

          var head = domQuery.all('[data-list-table-head-container]', tableListEntryNode)[0];
          for(var name in tableValidationErrors){
            if(!tableValidationErrors[name] instanceof Array){
                valid = self.applyValidationErrors(tableValidationErrors[name], head) && valid;                    
            }
          }
          var tables = domQuery.all('[data-list-table-rows-container]', tableListEntryNode);
          for(var j=0; j<tables.length; j++){
            var table = tables[j];
            var tableName = domAttr(table, 'name');
            var validationError = tableValidationErrors[tableName];
            if(!!validationError){
              var rows = domQuery.all('[data-list-table-rows-sub-container] > div', table);
              for(var k=0;k<validationError.length && k<rows.length;k++){
                valid = self.applyValidationErrors(validationError[k], rows[k]) && valid;                    
              }
            }
          }
        }
      }
    }
  }
  else {

    if (entry.validate) {
      this.validationErrors = entry.validate(current.element, values);
      valid = self.applyValidationErrors(this.validationErrors, entryNode) && valid;
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

PropertiesPanel.prototype._create = function(element, groups) {

  if (!element) {
    return null;
  }

  var containerNode = this._container;

  var panelNode = this._createPanel(element, groups);

  containerNode.appendChild(panelNode);

  var entries = extractEntries(groups);

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
        newValue,
        editable;

    // we deal with an input element
    if ('value' in node) {
      name = domAttr(node, 'name');
      editable = isPropertyEditable(entry, name);
      newValue = values[name];

      domAttr(node, 'readonly', editable ? null : '');
      domAttr(node, 'disabled', editable ? null : '');

      if (isToggle(node)) {
        setToggleValue(node, newValue);
      } else if (isSelect(node)) {
        setSelectValue(node, newValue);
      } else {
        setInputValue(node, newValue);
      }
    }

    // we deal with some non-editable html element
    else {
      name = domAttr(node, 'data-value');
      setTextValue(node, values[name]);
    }
  });
};

PropertiesPanel.prototype._bindTableTemplate = function(element, entry, values, entryNode) {

  var eventBus = this._eventBus;

  function isPropertyEditable(entry, propertyName) {
    return eventBus.fire('propertiesPanel.isPropertyEditable', {
      entry: entry,
      propertyName: propertyName,
      element: element
    });
  }

  var entryNodeHead = domQuery.all('[data-list-table-head-container]', entryNode);
  if(!!entryNodeHead && entryNodeHead.length > 0){
      var inputNodes = getPropertyPlaceholders(entryNodeHead[0]);

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

          } else if (isSelect(node)) {
            if(values[name] !== undefined) {
              node.value = values[name];
            }

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
  }

  var entryNodeTables = domQuery.all('[data-list-table-rows-container]', entryNode);
  forEach(entryNodeTables, function(entryNodeTable){
      var entryNodeRows = domQuery('[data-list-table-rows-sub-container]', entryNodeTable);
      var existingEntryNodeRows = domQuery.all('[data-list-table-rows-sub-container] > div', entryNodeTable);
      var tableName = domAttr(entryNodeTable, 'name');
      if(values[tableName]!==undefined){
        var entryPropertyName = tableName;
        for(var i=0; i<values[tableName].length; i++) {
          var nodeTemplate = existingEntryNodeRows[i];
          if(!nodeTemplate){
            nodeTemplate = domify(entry[entryPropertyName].createListEntryTemplate(values[tableName][i], i));
            entryNodeRows.appendChild(nodeTemplate);
          }
          var inputNodes = getPropertyPlaceholders(nodeTemplate);
          for(var j=0; j<inputNodes.length; j++) {
            var node = inputNodes[j];
            var name,
                value,
                editable;

            // we deal with an input element
            if ('value' in node) {
              name = domAttr(node, 'name');
              value = values[tableName][i][name];
              editable = isPropertyEditable(entry, name);

              domAttr(node, 'readonly', editable ? null : '');
              domAttr(node, 'disabled', editable ? null : '');

              if (isToggle(node)) {
                node.checked = !!(node.value == value || (!domAttr(node, 'value') && value));

              } else if (isSelect(node)) {
                if(values[tableName][i][name] !== undefined) {
                  node.value = values[tableName][i][name];
                }

              } else {
                // prevents input fields from having the value 'undefined'
                node.value = (values[tableName][i][name] !== undefined) ? values[tableName][i][name] : '';
              }
            }

            // we deal with some non-editable html element
            else {
              name = domAttr(node, 'data-value');
              node.textContent = values[tableName][i][name];
            }
          }
        }
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

      if (values instanceof Array) {
        var listEntryContainer = domQuery('[data-list-entry-container]', entryNode);
        if(!!listEntryContainer){
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

            var entriesToRemove = existingElements.length - values.length;

            for(var j = 0; j < entriesToRemove; j++) {
              // remove orphaned element
              listEntryContainer.removeChild(listEntryContainer.lastChild);
            }
        }

        var tableListEntryContainer = domQuery('[data-list-table-container]', entryNode);
        if(!!tableListEntryContainer){
            var tableExistingElements = domQuery.all('[data-list-table-container] > div', entryNode);
        
            for(var ii = 0; ii < values.length; ii++) {
              var tableListValue = values[ii];
              var tableListItemNode = tableExistingElements[ii];
              if(!tableListItemNode) {
                tableListItemNode = domify(entry.createListEntryTemplate(tableListValue, ii));
                tableListEntryContainer.appendChild(tableListItemNode);
              }
              self._bindTableTemplate(element, entry, tableListValue, tableListItemNode);
            }

            var tableEntriesToRemove = tableExistingElements.length - values.length;

            for(var jj = 0; jj < tableEntriesToRemove; jj++) {
              // remove orphaned element
              tableListEntryContainer.removeChild(tableListEntryContainer.lastChild);
            }
        }
      } else {
        self._bindTemplate(element, entry, values, entryNode);
      }

      // update conditionally visible elements
      self.validate(entry, values);
      self.updateState(entry, entryNode);

      // remember initial state for later dirty checking
      entry.oldValues = getFormControlValues(entryNode);
    });

    domClasses(groupNode).toggle('hidden', !groupVisible);
  });


  // inject elements id into header
  var headerIdNode = domQuery('[data-label-id]', panelNode);

  if (headerIdNode) {
    headerIdNode.textContent = element.id || '';
  }
};

PropertiesPanel.prototype._createPanel = function(element, groups) {
  var self = this;

  var panelNode = domify('<div class="djs-properties"></div>'),
      headerNode = domify('<div class="djs-properties-header">' +
        '<div class="label" data-label-id></div>' +
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
        '<span class="group-label">' + group.label + '</span>' +
      '</div>');

    // TODO(nre): use event delegation to handle that...
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



function setInputValue(node, value) {

  var selection;

  // prevents input fields from having the value 'undefined'
  if (value === undefined) {
    value = '';
  }

  // update selection on undo/redo
  if (document.activeElement === node) {
    selection = calculateSelectionUpdate(getSelection(node), node.value, value);
  }

  node.value = value;

  if (selection) {
    setSelection(node, selection);
  }
}

function setSelectValue(node, value) {
  if (value !== undefined) {
    node.value = value;
  }
}

function setToggleValue(node, value) {
  var nodeValue = node.value;

  node.checked = (value === nodeValue) || (!domAttr(node, 'value') && value);
}

function setTextValue(node, value) {
  node.textContent = value;
}


function getSelection(node) {
  return {
    start: node.selectionStart,
    end: node.selectionEnd
  };
}

function setSelection(node, selection) {
  node.selectionStart = selection.start;
  node.selectionEnd = selection.end;
}
