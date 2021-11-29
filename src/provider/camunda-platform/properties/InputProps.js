import InputOutputParameter from './InputOutputParameter';

import {
  AddParameterCmd,
  areInputParametersSupported,
  getInputParameters,
  getInputOutput
} from '../utils/InputOutputUtil';


export function InputProps(props) {
  const {
    element,
    injector
  } = props;

  if (!areInputParametersSupported(element)) {
    return null;
  }

  const inputParameters = getInputParameters(element) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = inputParameters.map((parameter, index) => {
    const id = element.id + '-inputParameter-' + index;

    return {
      id,
      label: parameter.get('name') || '',
      entries: InputOutputParameter({
        idPrefix: id,
        element,
        parameter
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory({ element, commandStack, parameter })
    };
  });

  function add(event) {
    event.stopPropagation();

    commandStack.execute(
      'properties-panel.multi-command-executor',
      AddParameterCmd(element, 'camunda:InputParameter', bpmnFactory)
    );
  }

  return {
    items,
    add
  };
}

function removeFactory(props) {
  const {
    commandStack,
    element,
    parameter
  } = props;

  return function(event) {
    event.stopPropagation();

    const inputOutput = getInputOutput(element);

    if (!inputOutput) {
      return;
    }

    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: inputOutput,
      propertyName: 'inputParameters',
      objectsToRemove: [ parameter ]
    });
  };
}
