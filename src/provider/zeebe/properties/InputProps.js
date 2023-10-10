import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import InputOutputParameter from './InputOutputParameter';

import {
  areInputParametersSupported,
  createIOMapping,
  getInputParameters,
  getIoMapping
} from '../utils/InputOutputUtil';

import {
  createElement,
  nextId
} from '../../../utils/ElementUtil';

import { without } from 'min-dash';


export function InputProps({ element, injector }) {

  if (!areInputParametersSupported(element)) {
    return null;
  }

  const inputParameters = getInputParameters(element) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = inputParameters.map((parameter, index) => {
    const id = element.id + '-input-' + index;

    return {
      id,
      label: parameter.get('target') || '',
      entries: InputOutputParameter({
        idPrefix: id,
        element,
        parameter
      }),
      autoFocusEntry: id + '-target',
      remove: removeFactory({ commandStack, element, parameter })
    };
  });

  return {
    items,
    add: addFactory({ element, bpmnFactory, commandStack }),
    shouldSort: false
  };
}

function removeFactory({ commandStack, element, parameter }) {
  return function(event) {
    event.stopPropagation();

    const commands = [];

    const ioMapping = getIoMapping(element);

    if (!ioMapping) {
      return;
    }

    const inputParameters = without(ioMapping.get('inputParameters'), parameter);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: ioMapping,
        properties: {
          inputParameters
        }
      }
    });

    const businessObject = getBusinessObject(element),
          extensionElements = businessObject.get('extensionElements'),
          values = without(extensionElements.get('values'), ioMapping);

    // remove ioMapping if there are no input/output parameters anymore
    if (!inputParameters.length && !ioMapping.get('outputParameters').length) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values
          }
        }
      });
    }

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

function addFactory({ element, bpmnFactory, commandStack }) {
  return function(event) {
    event.stopPropagation();

    const commands = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure IoMapping
    let ioMapping = getIoMapping(element);

    if (!ioMapping) {
      ioMapping = createIOMapping({
        inputParameters: [],
        outputParameters: []
      }, extensionElements, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), ioMapping ]
          }
        }
      });
    }

    // (3) create parameter
    const newParameter = createElement('zeebe:Input', {
      target: nextId('InputVariable_')
    }, ioMapping, bpmnFactory);

    // (4) add parameter to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: ioMapping,
        properties: {
          inputParameters: [ ...ioMapping.get('inputParameters'), newParameter ]
        }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}
