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
  areOutputParametersSupported,
  getOutputParameters,
  getInputOutput
} from '../utils/InputOutputUtil';


export function OutputProps(props) {
  const {
    element
  } = props;

  if (!areOutputParametersSupported(element)) {
    return null;
  }

  const outputParameters = getOutputParameters(element) || [];

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
      remove: RemoveContainer({ parameter })
    };
  });

  return {
    items,
    add: AddOutputParameter
  };
}

function RemoveContainer(props) {
  const {
    parameter
  } = props;

  return function RemoveOutputParameter(props) {
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
        propertyName: 'outputParameters',
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

function AddOutputParameter(props) {
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
      AddParameterCmd(element, 'camunda:OutputParameter', bpmnFactory)
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
