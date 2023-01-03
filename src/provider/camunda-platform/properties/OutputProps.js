import InputOutputParameter from './InputOutputParameter';

import {
  AddParameterCmd,
  areOutputParametersSupported,
  getOutputParameters,
  getInputOutput
} from '../utils/InputOutputUtil';

import { without } from 'min-dash';


export function OutputProps({ element, injector }) {

  if (!areOutputParametersSupported(element)) {
    return null;
  }

  const outputParameters = getOutputParameters(element) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = outputParameters.map((parameter, index) => {
    const id = element.id + '-outputParameter-' + index;

    return {
      id,
      label: parameter.get('name') || '',
      entries: InputOutputParameter({
        idPrefix: id,
        element,
        parameter
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory({ commandStack, element, parameter })
    };
  });

  return {
    items,
    add: addFactory({ bpmnFactory, commandStack, element }),
    shouldSort: false
  };
}

function removeFactory({ commandStack, element, parameter }) {
  return function(event) {
    event.stopPropagation();

    const inputOutput = getInputOutput(element);

    if (!inputOutput) {
      return;
    }

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: inputOutput,
      properties: {
        outputParameters: without(inputOutput.get('outputParameters'), parameter)
      }
    });
  };
}

function addFactory({ bpmnFactory, commandStack, element }) {
  return function(event) {
    event.stopPropagation();

    commandStack.execute(
      'properties-panel.multi-command-executor',
      AddParameterCmd(element, 'camunda:OutputParameter', bpmnFactory)
    );
  };
}
