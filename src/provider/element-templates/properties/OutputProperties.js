import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import TextField from '@bpmn-io/properties-panel/lib/components/entries/TextField';
import ToggleSwitch from '@bpmn-io/properties-panel/lib/components/entries/ToggleSwitch';

import { containsSpace } from '../../bpmn/utils/ValidationUtil';

import {
  findExtension,
  findOutputParameter
} from '../Helper';

import { useService } from '../../../hooks';

import { without } from 'min-dash';

import { createElement } from '../../../utils/ElementUtil';

import { createOutputParameter } from '../CreateHelper';


export function OutputProperties(props) {
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

  const businessObject = getBusinessObject(element),
        inputOutput = findExtension(businessObject, 'camunda:InputOutput');

  if (!inputOutput) {
    return;
  }

  const outputParameter = findOutputParameter(inputOutput, binding);

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
    component: <ProcessVariableAssignment element={ element } id={ `${ id }-local-variable-assignment` } property={ property } />
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
    label,
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
    <div class="bio-properties-panel-description">{ text }</div>
  </div>;
}

function ProcessVariableAssignment(props) {
  const {
    element,
    id,
    property
  } = props;

  const { binding } = property;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack'),
        translate = useService('translate');

  const businessObject = getBusinessObject(element),
        inputOutput = findExtension(businessObject, 'camunda:InputOutput');

  const outputParameter = findOutputParameter(inputOutput, binding);

  const getValue = () => {
    return findOutputParameter(inputOutput, binding);
  };

  const setValue = (value) => {
    if (value) {
      addOutputParameter(element, property, bpmnFactory, commandStack);
    } else {
      removeOutputParameter(element, binding, commandStack);
    }
  };

  return ToggleSwitch({
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

  return TextField({
    debounce,
    element: outputParameter,
    id,
    label: translate('Assign to process variable'),
    getValue,
    setValue,
    validate
  });
}

function addOutputParameter(element, property, bpmnFactory, commandStack) {
  const {
    binding,
    value
  } = property;

  const commands = [];

  const businessObject = getBusinessObject(element);

  let extensionElements = businessObject.get('extensionElements');

  // (1) ensure bpmn:ExtensionElements
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

  // (2) ensure camunda:InputOutput
  let inputOutput = findExtension(businessObject, 'camunda:InputOutput');

  if (!inputOutput) {
    inputOutput = createElement('camunda:InputOutput', {
      inputParameters: [],
      outputParameters: []
    }, extensionElements, bpmnFactory);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: { values: [ ...extensionElements.get('values'), inputOutput ] }
      }
    });
  }

  // (3) add camunda:InputParameter
  const outputParamter = createOutputParameter(binding, value, bpmnFactory);

  outputParamter.$parent = inputOutput;

  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: inputOutput,
      properties: { outputParameters: [ ...inputOutput.get('camunda:outputParameters'), outputParamter ] }
    }
  });

  commandStack.execute('properties-panel.multi-command-executor', commands);
}

function removeOutputParameter(element, binding, commandStack) {
  const businessObject = getBusinessObject(element);

  const inputOutput = findExtension(businessObject, 'camunda:InputOutput'),
        outputParameters = inputOutput.get('camunda:outputParameters');

  const outputParameter = findOutputParameter(inputOutput, binding);

  commandStack.execute('element.updateModdleProperties', {
    element,
    moddleElement: inputOutput,
    properties: { outputParameters: without(outputParameters, outputParameter) }
  });
}