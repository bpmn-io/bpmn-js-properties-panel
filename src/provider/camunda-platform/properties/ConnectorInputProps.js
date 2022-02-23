import InputOutputParameter from './InputOutputParameter';

import {
  CreateParameterCmd,
  getInputParameters,
  getInputOutput
} from '../utils/InputOutputUtil';

import {
  areConnectorsSupported,
  getConnector
} from '../utils/ConnectorUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import { without } from 'min-dash';


export function ConnectorInputProps(props) {
  const {
    element,
    injector
  } = props;

  if (!areConnectorsSupported(element)) {
    return null;
  }

  const connector = getConnector(element);

  const commandStack = injector.get('commandStack'),
        bpmnFactory = injector.get('bpmnFactory');

  const inputParameters = getInputParameters(connector) || [];

  const items = inputParameters.map((parameter, index) => {
    const id = element.id + '-connector-inputParameter-' + index;

    return {
      id,
      label: parameter.get('name') || '',
      entries: InputOutputParameter({
        element,
        idPrefix: id,
        parameter
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory({ connector, element, parameter, commandStack })
    };
  });

  function add(event) {
    event.stopPropagation();

    const commands = [];

    // (1) ensure inputOutput
    let inputOutput = getInputOutput(connector);

    if (!inputOutput) {
      inputOutput = createElement('camunda:InputOutput', {
        inputParameters: [],
        outputParameters: []
      }, connector, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element: element,
          moddleElement: connector,
          properties: {
            inputOutput
          }
        }
      });
    }

    // (2) create + add parameter
    commands.push(
      CreateParameterCmd(element, 'camunda:InputParameter', inputOutput, bpmnFactory)
    );

    // (3) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  }

  return {
    items,
    add
  };
}

function removeFactory(props) {
  const {
    commandStack,
    connector,
    element,
    parameter
  } = props;

  return function(event) {
    event.stopPropagation();

    const inputOutput = getInputOutput(connector);

    if (!inputOutput) {
      return;
    }

    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: inputOutput,
      properties: {
        inputParameters: without(inputOutput.get('inputParameters'), parameter)
      }
    });
  };
}
