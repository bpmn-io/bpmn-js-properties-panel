'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


var entryFieldDescription = require('../../../../factory/EntryFieldDescription');

var elementHelper = require('../../../../helper/ElementHelper'),
    extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper'),
    cmdHelper = require('../../../../helper/CmdHelper');

var ErrorsEntries = require('./ErrorsEntries');

var domQuery = require('min-dom').query;

module.exports = function(element, bpmnFactory, options, translate) {

  options = options || {};

  var result = {};

  var entries = result.entries = [];

  entries.push(
    getErrorsHeading(element, bpmnFactory, {
      type: 'camunda:ErrorEventDefinition',
      prop: 'errorEventDefinition',
      prefix: 'Error'
    }));

  append(entries,
    getErrorsEntries(element, bpmnFactory, {}, translate)
  );

  return result;
};

function getErrorsHeading(element, bpmnFactory, options) {
  var prefix = options.prefix;

  var entry = {
    id: prefix + '-heading',
    cssClasses: [ 'bpp-error' ],
    html: '<div class="bpp-field-wrapper">' +
            '<button type="button" class="bpp-error__add add action-button" ' + 'data-action="createElement">' +
            '</button><input name="hidden" type="hidden">' +
          '</div>'
  };

  entry.createElement = function(_, entryNode) {
    var commands = createElement();

    if (commands) {
      scheduleCommands(commands, entryNode);
      return true;
    }
  };

  entry.set = function() {
    var commands = entry._commands;

    if (commands) {
      delete entry._commands;
      return commands;
    }
  };

  function createElement() {
    var commands = [];
    var bo = getBusinessObject(element);
    var extensionElements = bo.get('extensionElements');

    if (!extensionElements) {
      extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
      commands.push(cmdHelper.updateBusinessObject(element, bo, { extensionElements: extensionElements }));
    }
    var newElem = elementHelper.createElement('camunda:ErrorEventDefinition', {}, extensionElements, bpmnFactory);
    commands.push(cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newElem ]));

    return commands;
  }

  /**
   * Schedule commands to be run with next `set` method call.
   *
   * @param {Array<any>} commands
   * @param {HTMLElement} entryNode
   */
  function scheduleCommands(commands, entryNode) {
    entry._commands = commands;

    // @barmac: hack to make properties panel call `set`
    var input = domQuery('input[type="hidden"]', entryNode);
    input.value = 1;
  }

  return entry;
}

function getErrors(bo) {
  return extensionElementsHelper.getExtensionElements(bo, 'camunda:ErrorEventDefinition') || [];
}


function getErrorsEntries(element, bpmnFactory, options, translate) {
  var idPrefix = options.idPrefix || '',
      bo = getBusinessObject(element),
      errorEventDefinitions = getErrors(bo),
      extensionElements = bo.get('extensionElements'),
      entries;

  if (errorEventDefinitions && !errorEventDefinitions.length) {
    var description = entryFieldDescription(translate, translate('No errors defined.'));

    return [{
      id: idPrefix + 'error-placeholder',
      cssClasses: [ 'bpp-error-placeholder' ],
      html: description
    }];
  }

  var errorsEntries = errorEventDefinitions.map(function(definition, index) {

    function onRemove() {
      var commands = [];

      commands.push(cmdHelper.removeElementsFromList(element, extensionElements, 'values', 'extensionElements', [definition]));
      return commands;
    }

    return ErrorsEntries(definition, bpmnFactory, element,
      {
        idPrefix: idPrefix + 'error-' + index,
        onRemove: onRemove,
        onToggle: onToggle
      }, translate);

    /**
     * Close remaining collapsible entries within group.
     *
     * @param {boolean} value
     * @param {HTMLElement} entryNode
     */
    function onToggle(value, entryNode) {
      if (!value) {
        return;
      }

      var currentEntryId = entryNode.dataset.entry;

      errorsEntries.forEach(function(entry) {
        if (entry.entries[0].id === currentEntryId) {
          return;
        }

        entry.setOpen(false, entryNode.parentElement);
      });

    }
  });

  entries = errorsEntries.map(function(input) {
    return input.entries;
  });

  return flatten(entries);
}

function flatten(arrays) {
  return Array.prototype.concat.apply([], arrays);
}

function append(array, items) {
  Array.prototype.push.apply(array, items);
}
