import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, ToggleSwitchEntry } from '@bpmn-io/properties-panel';

import { containsSpace } from '../../bpmn/utils/ValidationUtil';

import {
  findExtension,
  findOutputParameter
} from '../Helper';

import { useService } from '../../../hooks';

import { without } from 'min-dash';

import { PropertyDescription } from '../components/PropertyDescription';

import { createElement } from '../../../utils/ElementUtil';

import { createOutputParameter } from '../CreateHelper';


export function OutputProperties(props) {
  const {
    element,
    index,
    injector,
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

  const translate = injector.get('translate');

  const outputParameter = inputOutput && findOutputParameter(inputOutput, binding);

  const id = `${ element.id }-outputParameter-${ index }`;

  let entries = [];

  // (1) add description entry
  if (description) {
    entries.push({
      id: `${ id }-description`,
      component: <Description id={ `${ id }-description` } text={ description } />
    });
  }

  // (2) add local variable assignment entry
  entries.push({
    id: `${ id }-local-variable-assignment`,
    component: <ProcessVariableAssignment
      element={ element }
      id={ `${ id }-local-variable-assignment` }
      outputParameter={ outputParameter }
      property={ property } />
  });

  if (outputParameter) {

    // (3) add assign to process variable entry
    entries.push({
      id: `${ id }-assign-to-process-variable`,
      component: <AssignToProcessVariable element={ element } id={ `${ id }-assign-to-process-variable` } property={ property } />
    });
  }

  const item = {
    id,
    label: label || name || translate('<unnamed>'),
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

function ProcessVariableAssignment(props) {
  const {
    element,
    id,
    property,
    outputParameter
  } = props;

  const { binding } = property;

  const bpmnFactory = useService('bpmnFactory'),
        modeling = useService('modeling'),
        translate = useService('translate');

  const getValue = () => {
    return outputParameter;
  };

  const setValue = (value) => {
    if (value) {
      addOutputParameter(element, property, bpmnFactory, modeling);
    } else {
      removeOutputParameter(element, binding, modeling);
    }
  };

  return ToggleSwitchEntry({
    id,
    label: translate('Process variable assignment'),
    switcherLabel: outputParameter ?
      translate('On') :
      translate('Off'),
    description: outputParameter ?
      '' :
      translate('Parameter won\'t be available in process scope.'),
    getValue,
    setValue
  });
}

function AssignToProcessVariable(props) {
  const {
    element,
    id,
    property
  } = props;

  const { binding } = property;

  const inputOutput = findExtension(element, 'camunda:InputOutput'),
        outputParameter = findOutputParameter(inputOutput, binding);

  const commandStack = useService('commandStack'),
        debounce = useService('debounceInput'),
        translate = useService('translate');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: outputParameter,
      properties: { name: value }
    });
  };

  const getValue = () => {
    return outputParameter.get('camunda:name');
  };

  const validate = (value) => {
    if (!value) {
      return translate('Process variable name must not be empty.');
    } else if (containsSpace(value)) {
      return translate('Process variable name must not contain spaces.');
    }
  };

  return TextFieldEntry({
    debounce,
    element: outputParameter,
    id,
    label: translate('Assign to process variable'),
    getValue,
    setValue,
    validate
  });
}

function addOutputParameter(element, property, bpmnFactory, modeling) {
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

    const outputParameter = createOutputParameter(binding, value, bpmnFactory);
    outputParameter.$parent = inputOutput;

    update = { outputParameters: inputOutput.get('camunda:outputParameters').concat(outputParameter) };
  }

  modeling.updateModdleProperties(element, updatedBusinessObject, update);
}

function removeOutputParameter(element, binding, modeling) {
  const businessObject = getBusinessObject(element);

  const inputOutput = findExtension(businessObject, 'camunda:InputOutput'),
        outputParameters = inputOutput.get('camunda:outputParameters');

  const outputParameter = findOutputParameter(inputOutput, binding);

  modeling.updateModdleProperties(element, inputOutput, {
    outputParameters: without(outputParameters, outputParameter)
  });
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
  const outputParameter = createOutputParameter(binding, value, bpmnFactory);
  const inputOutput = createElement('camunda:InputOutput', {
    inputParameters: [],
    outputParameters: [ outputParameter ],
  }, extensionElements, bpmnFactory);

  outputParameter.$parent = inputOutput;
  return inputOutput;
}
