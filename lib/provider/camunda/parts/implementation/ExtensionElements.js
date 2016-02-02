'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var domQuery = require('min-dom/lib/query'),
    domify = require('min-dom/lib/domify'),
    forEach = require('lodash/collection/forEach');

var elementHelper = require('../../../../helper/ElementHelper'),
    utils = require('../../../../Utils');

function getSelectBox(node, id) {
  var query = 'select[name=selectedExtensionElement]' + (id ? '[id=cam-extension-elements-' + id + ']' : '');
  return domQuery(query, node);
}

function generateElementId(prefix) {
  prefix = prefix + '_';
  return utils.nextId(prefix);
}

module.exports = function (element, bpmnFactory, params) {

  var id     = params.id,
      prefix = params.prefix || 'elem',
      label  = params.label || id;

  var modelProperty = params.modelProperty || 'id';

  var newElement        = params.createExtensionElement,
      getElements       = params.getExtensionElements,
      onSelectionChange = params.selectionChanged;

  var defaultSize = params.size || 5,
      resizable   = params.resizable;

  var __action;

  var selectionChanged = function(element, node, event, scope) {
    if (typeof onSelectionChange === 'function') {
      return onSelectionChange(element, node, event, scope);
    }
  };

  var createOption = function(value) {
    return '<option value="' + value + '" data-value data-name="extensionElementValue">' + value + '</option>';
  };

  var initSelectionSize = function(selectBox, optionsLength) {
    if (resizable) {
      selectBox.size = optionsLength > defaultSize ? optionsLength : defaultSize;
    }
  };

  return {
    id: id,
    html: '<div class="pp-row" id="cam-extension-elements' + (id ? '-' + id : '') + '">' +
            '<label for="cam-extension-elements' + (id ? '-' + id : '') + '">' + label + '</label>' +
            '<div class="pp-field-wrapper">' +
              '<select id="cam-extension-elements' + (id ? '-' + id : '') + '"' +
                      'name="selectedExtensionElement" ' +
                      'size="' + defaultSize + '" ' +
                      'data-list-entry-container ' +
                      'data-on-change="selectionChanged">' +
              '</select>' +
              '<button class="add" id="newElementAction" data-action="createExtensionElement"><span>+</span></button>' +
            '</div>' +
          '</div>',

    get: function(element, node) {
      var elements = getElements(getBusinessObject(element));

      var result = [];
      forEach(elements, function(elem) {
        result.push({
          extensionElementValue: elem.get(modelProperty)
        });
      });

      var selectBox = getSelectBox(node.parentNode, id);
      initSelectionSize(selectBox, result.length);

      return result;
    },

    set: function(element, values, node) {
      var action = __action;
      var bo = getBusinessObject(element);

      var cmd;

      if (action.id === 'create-element') {

        var extensionElements = bo.get('extensionElements');
        if (!extensionElements) {
          extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
          cmd = {
            extensionElements: extensionElements
          };
        }

        if (typeof newElement === 'function') {
          var result = newElement(element, extensionElements, action.value);

          // ignore returned command, because the extension
          // elements must be added to business object
          cmd = cmd || result.cmd;
        }
      }

      __action = undefined;

      return cmd || {};
    },

    deselect: function(element, node) {
      var selectBox = getSelectBox(node, id);
      selectBox.selectedIndex = -1;
    },

    getSelection: function(element, node) {
      var selectBox = getSelectBox(node, id);
      return {
        value: (selectBox || {}).value,
        idx: (selectBox || {}).selectedIndex
      };
    },

    createListEntryTemplate: function(value, index, selectBox) {
      initSelectionSize(selectBox, selectBox.options.length + 1);
      return createOption(value.extensionElementValue);
    },

    setControl: function(node, value) {
      node.value = value;
      node.text = value;
    },

    createExtensionElement: function(element, node) {
      // create option template
      var generatedId = generateElementId(prefix);

      var selectBox = getSelectBox(node, id);
      var template = domify(createOption(generatedId));

      // add new empty option as last child element
      selectBox.appendChild(template);

      // select last child element
      selectBox.lastChild.selected = 'selected';
      selectionChanged(element, node);

      // update select box size
      initSelectionSize(selectBox, selectBox.options.length);

      __action = {
        id: 'create-element',
        value: generatedId
      };

      return true;
    },

    selectionChanged: selectionChanged
  };

};
