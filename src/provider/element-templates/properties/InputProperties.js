import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { ToggleSwitchEntry } from '@bpmn-io/properties-panel';

import InputOutputParameter from '../../camunda-platform/properties/InputOutputParameter';

import {
  findExtension,
  findInputParameter
} from '../Helper';

import { useService } from '../../../hooks';

import { without } from 'min-dash';

import { createElement } from '../../../utils/ElementUtil';

import { PropertyDescription } from '../components/PropertyDescription';

import { createInputParameter } from '../CreateHelper';


export function InputProperties(props) {
  const {
    element,
    index,
    property
  } = props;

  const {
    binding,
    description,
    label
  } = property;

  const { name } = binding;

  const businessObject = getBusinessObject(element),
        inputOutput = findExtension(businessObject, 'camunda:InputOutput');

  const inputParameter = inputOutput && findInputParameter(inputOutput, binding);

  const id = `${ element.id }-inputParameter-${ index }`;

  let entries = [];

  if (inputParameter) {
    entries = InputOutputParameter({
      idPrefix: id,
      element,
      parameter: inputParameter
    });

    // (1) remove name entry
    entries = removeEntry(entries, '-name');
  }

  // (2) add local variable assignment entry
  entries.unshift({
    id: `${ id }-local-variable-assignment`,
    component: <LocalVariableAssignment
      element={ element }
      id={ `${ id }-local-variable-assignment` }
      inputParameter={ inputParameter }
      property={ property } />
  });

  // (3) add description entry
  if (description) {
    entries.unshift({
      id: `${ id }-description`,
      component: <Description id={ `${ id }-description` } text={ description } />
    });
  }

  // @barmac: binding#name is required so there is no third option
  const item = {
    id,
    label: label || name,
    entries
  };

  return item;
}

// TODO(philippfromme): add text entry to properties-panel
function Description(props) {
  const {
    id,
    text
  } = props;

  return <div class="bio-properties-panel-entry" data-entry-id={ id }>
    <div class="bio-properties-panel-description">
      <PropertyDescription description={ text } />
    </div>
  </div>;
}

function LocalVariableAssignment(props) {
  const {
    element,
    id,
    property,
    inputParameter
  } = props;

  const { binding } = property;

  const bpmnFactory = useService('bpmnFactory'),
        modeling = useService('modeling'),
        translate = useService('translate');

  const getValue = () => {
    return inputParameter;
  };

  const setValue = (value) => {
    if (value) {
      addInputParameter(element, property, bpmnFactory, modeling);
    } else {
      removeInputParameter(element, binding, modeling);
    }
  };

  return ToggleSwitchEntry({
    id,
    label: translate('Local variable assignment'),
    switcherLabel: inputParameter ?
      translate('On') :
      translate('Off'),
    description: inputParameter ?
      '' :
      translate('Parameter won\'t be created as local variable.'),
    getValue,
    setValue
  });
}

function addInputParameter(element, property, bpmnFactory, modeling) {
  const {
    binding,
    value
  } = property;

  const businessObject = getBusinessObject(element);

  const extensionElements = businessObject.get('extensionElements');
  const inputOutput = findExtension(businessObject, 'camunda:InputOutput');

  let updatedBusinessObject, update;

  if (!extensionElements) {
    updatedBusinessObject = businessObject;

    const extensionElements = createExtensionElements(businessObject, bpmnFactory),
          inputOutput = createInputOutput(binding, value, bpmnFactory, extensionElements);
    extensionElements.values.push(inputOutput);

    update = { extensionElements };
  } else if (!inputOutput) {
    updatedBusinessObject = extensionElements;

    const inputOutput = createInputOutput(binding, value, bpmnFactory, extensionElements);

    update = { values: extensionElements.get('values').concat(inputOutput) };
  } else {
    updatedBusinessObject = inputOutput;

    const inputParameter = createInputParameter(binding, value, bpmnFactory);
    inputParameter.$parent = inputOutput;

    update = { inputParameters: inputOutput.get('camunda:inputParameters').concat(inputParameter) };
  }

  modeling.updateModdleProperties(element, updatedBusinessObject, update);
}

function removeInputParameter(element, binding, modeling) {
  const businessObject = getBusinessObject(element);

  const inputOutput = findExtension(businessObject, 'camunda:InputOutput'),
        inputParameters = inputOutput.get('camunda:inputParameters');

  const inputParameter = findInputParameter(inputOutput, binding);

  modeling.updateModdleProperties(element, inputOutput, {
    inputParameters: without(inputParameters, inputParameter)
  });
}

function removeEntry(entries, suffix) {
  const entry = entries.find(({ id }) => id.endsWith(suffix));

  return without(entries, entry);
}

function createExtensionElements(businessObject, bpmnFactory) {
  return createElement(
    'bpmn:ExtensionElements',
    { values: [] },
    businessObject,
    bpmnFactory
  );
}

function createInputOutput(binding, value, bpmnFactory, extensionElements) {
  const inputParameter = createInputParameter(binding, value, bpmnFactory);
  const inputOutput = createElement('camunda:InputOutput', {
    inputParameters: [ inputParameter ],
    outputParameters: []
  }, extensionElements, bpmnFactory);

  inputParameter.$parent = inputOutput;
  return inputOutput;
}
