import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import InputOutputParameter from './InputOutputParameter';

import {
  areOutputParametersSupported,
  getOutputParameters,
  getIoMapping,
  createIOMapping
} from '../utils/InputOutputUtil';

import {
  createElement,
  nextId
} from '../../../utils/ElementUtil';

import { without } from 'min-dash';


export function OutputProps({ element, injector }) {

  if (!areOutputParametersSupported(element)) {
    return null;
  }

  const outputParameters = getOutputParameters(element) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = outputParameters.map((parameter, index) => {
    const id = element.id + '-output-' + index;

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

    let commands = [];

    const ioMapping = getIoMapping(element);

    if (!ioMapping) {
      return;
    }

    const outputParameters = without(ioMapping.get('outputParameters'), parameter);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: ioMapping,
        properties: {
          outputParameters
        }
      }
    });

    // remove ioMapping if there are no input/output parameters anymore
    if (!ioMapping.get('inputParameters').length && !outputParameters.length) {
      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements'),
            values = without(extensionElements.get('values'), ioMapping);

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

    let commands = [];

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
      const parent = extensionElements;

      ioMapping = createIOMapping({
        inputParameters: [],
        outputParameters: []
      }, parent, bpmnFactory);

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
    const newParameter = createElement('zeebe:Output', {
      target: nextId('OutputVariable_')
    }, ioMapping, bpmnFactory);

    // (4) add parameter to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: ioMapping,
        properties: {
          outputParameters: [ ...ioMapping.get('outputParameters'), newParameter ]
        }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}
