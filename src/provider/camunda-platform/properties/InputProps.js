import {
  useContext
} from 'preact/hooks';

import {
  BpmnPropertiesPanelContext
} from '../../../context';

import {
  useService
} from '../../../hooks';

import InputOutputParameter from './InputOutputParameter';

import {
  AddParameterCmd,
  areInputParametersSupported,
  getInputParameters,
  getInputOutput
} from '../utils/InputOutputUtil';


export function InputProps(props) {
  const {
    element
  } = props;

  if (!areInputParametersSupported(element)) {
    return null;
  }

  const inputParameters = getInputParameters(element) || [];

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
      remove: RemoveContainer({ parameter })
    };
  });

  return {
    items,
    add: AddInputParameter
  };
}

function RemoveContainer(props) {
  const {
    parameter
  } = props;

  return function RemoveInputParameter(props) {
    const {
      children
    } = props;

    const {
      selectedElement: element
    } = useContext(BpmnPropertiesPanelContext);

    const commandStack = useService('commandStack');

    const removeElement = (event) => {
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

    return (
      <div class="bio-properties-panel-remove-container" onClick={ removeElement }>
        {
          children
        }
      </div>
    );
  };
}

function AddInputParameter(props) {
  const {
    children
  } = props;

  const {
    selectedElement: element
  } = useContext(BpmnPropertiesPanelContext);

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');

  const addElement = (event) => {
    event.stopPropagation();

    commandStack.execute(
      'properties-panel.multi-command-executor',
      AddParameterCmd(element, 'camunda:InputParameter', bpmnFactory)
    );
  };

  return (
    <div class="bio-properties-panel-add-container" onClick={ addElement }>
      {
        children
      }
    </div>
  );
}
