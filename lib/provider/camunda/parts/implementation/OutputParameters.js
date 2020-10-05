'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var elementHelper = require('../../../../helper/ElementHelper'),
    extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper'),
    inputOutputHelper = require('../../../../helper/InputOutputHelper'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    utils = require('../../../../Utils');

var entryFieldDescription = require('../../../../factory/EntryFieldDescription');

var domQuery = require('min-dom').query;

var InputOutputParameter = require('./InputOutputParameter');

module.exports = function(element, bpmnFactory, options, translate) {

  options = options || {};

  var insideConnector = !!options.insideConnector,
      idPrefix = options.idPrefix || '';

  var result = {};

  var entries = result.entries = [];

  if (!inputOutputHelper.isInputOutputSupported(element, insideConnector) ||
    !inputOutputHelper.areOutputParametersSupported(element, insideConnector)) {
    return result;
  }

  var parametersOptions = {
    insideConnector: insideConnector,
    idPrefix: idPrefix
  };

  // output parameters ///////////////////////////////////////////////////////
  entries.push(
    getParametersHeading(element, bpmnFactory, {
      idPrefix: idPrefix,
      insideConnector: insideConnector,
      type: 'camunda:OutputParameter',
      prop: 'outputParameters',
      prefix: 'Output'
    }));

  append(entries,
    getOutputParameterEntries(element, bpmnFactory, parametersOptions, translate)
  );

  return result;
};

function getParametersHeading(element, bpmnFactory, options) {
  var idPrefix = options.idPrefix || '',
      prefix = options.prefix,
      type = options.type,
      prop = options.prop,
      insideConnector = options.insideConnector;

  var entry = {
    id: idPrefix + prefix + '-heading',
    cssClasses: [ 'bpp-input-output' ],
    html: '<div class="bpp-field-wrapper">' +
      '<button type="button" class="bpp-input-output__add add action-button" ' + 'data-action="createElement">' +
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

    var inputOutput = getInputOutput(element, insideConnector);
    if (!inputOutput) {
      var parent = !insideConnector ? extensionElements : getConnector(element);
      inputOutput = createInputOutput(parent, bpmnFactory, {
        inputParameters: [],
        outputParameters: []
      });

      if (!insideConnector) {
        commands.push(cmdHelper.addAndRemoveElementsFromList(
          element,
          extensionElements,
          'values',
          'extensionElements',
          [ inputOutput ],
          []
        ));
      } else {
        commands.push(cmdHelper.updateBusinessObject(element, parent, { inputOutput: inputOutput }));
      }
    }

    var newElem = createParameter(type, inputOutput, bpmnFactory, { name: generateElementId(prefix) });
    commands.push(cmdHelper.addElementsTolist(element, inputOutput, prop, [], [ newElem ]));

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

function getOutputParameterEntries(element, bpmnFactory, options, translate) {
  var idPrefix = options.idPrefix,
      insideConnector = options.insideConnector,
      inputOutput = getInputOutput(element, insideConnector),
      params = getOutputParameters(element, insideConnector),
      entries;

  if (!params.length) {
    var description = entryFieldDescription(translate, translate('No variables defined.'));

    return [{
      id: idPrefix + 'output-parameter' + '-placeholder',
      cssClasses: [ 'bpp-input-output-placeholder' ],
      html: description
    }];
  }

  var outputParameters = params.map(function(param, index) {
    function onRemove() {
      var commands = [];
      commands.push(cmdHelper.removeElementsFromList(element, inputOutput, 'outputParameters', null, [param]));

      // remove inputOutput if there are no input/output parameters anymore
      if (inputOutput.get('outputParameters').length === 1 && (inputOutput.get('inputParameters') || []).length === 0) {

        if (!insideConnector) {
          commands.push(extensionElementsHelper.removeEntry(getBusinessObject(element), element, inputOutput));
        }
        else {
          var connector = getConnector(element);
          commands.push(cmdHelper.updateBusinessObject(element, connector, { inputOutput: undefined }));
        }
      }

      return commands;
    }

    return InputOutputParameter(param, bpmnFactory,
      {
        idPrefix: idPrefix + 'output-parameter-' + index,
        onRemove: onRemove,
        onToggle: onToggle
      }, translate);
  });

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

    outputParameters.forEach(function(outputParameter) {
      if (outputParameter.entries[0].id === currentEntryId) {
        return;
      }

      outputParameter.setOpen(false);
    });
  }

  entries = outputParameters.map(function(input) {
    return input.entries;
  });

  return flatten(entries);
}

function append(array, items) {
  Array.prototype.push.apply(array, items);
}

function flatten(arrays) {
  return Array.prototype.concat.apply([], arrays);
}

function generateElementId(prefix) {
  prefix = prefix + '_';
  return utils.nextId(prefix);
}

function getInputOutput(element, insideConnector) {
  return inputOutputHelper.getInputOutput(element, insideConnector);
}

function getConnector(element) {
  return inputOutputHelper.getConnector(element);
}

function getOutputParameters(element, insideConnector) {
  return inputOutputHelper.getOutputParameters(element, insideConnector);
}

function createElement(type, parent, factory, properties) {
  return elementHelper.createElement(type, properties, parent, factory);
}

function createInputOutput(parent, bpmnFactory, properties) {
  return createElement('camunda:InputOutput', parent, bpmnFactory, properties);
}

function createParameter(type, parent, bpmnFactory, properties) {
  return createElement(type, parent, bpmnFactory, properties);
}
