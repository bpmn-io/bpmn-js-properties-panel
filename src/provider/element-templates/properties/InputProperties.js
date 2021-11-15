import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import ToggleSwitch from '@bpmn-io/properties-panel/lib/components/entries/ToggleSwitch';

import InputOutputParameter from '../../camunda-platform/properties/InputOutputParameter';

import {
  findExtension,
  findInputParameter
} from '../Helper';

import { useService } from '../../../hooks';

import { without } from 'min-dash';

import { createElement } from '../../../utils/ElementUtil';

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

  if (!inputOutput) {
    return;
  }

  const inputParameter = findInputParameter(inputOutput, binding);

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
    component: <LocalVariableAssignment element={ element } id={ `${ id }-local-variable-assignment` } property={ property } />
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
    <div class="bio-properties-panel-description">{ text }</div>
  </div>;
}

function LocalVariableAssignment(props) {
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

  const inputParameter = findInputParameter(inputOutput, binding);

  const getValue = () => {
    return findInputParameter(inputOutput, binding);
  };

  const setValue = (value) => {
    if (value) {
      addInputParameter(element, property, bpmnFactory, commandStack);
    } else {
      removeInputParameter(element, binding, commandStack);
    }
  };

  return ToggleSwitch({
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

function addInputParameter(element, property, bpmnFactory, commandStack) {
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
  const inputParameter = createInputParameter(binding, value, bpmnFactory);

  inputParameter.$parent = inputOutput;

  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: inputOutput,
      properties: { inputParameters: [ ...inputOutput.get('camunda:inputParameters'), inputParameter ] }
    }
  });

  commandStack.execute('properties-panel.multi-command-executor', commands);
}

function removeInputParameter(element, binding, commandStack) {
  const businessObject = getBusinessObject(element);

  const inputOutput = findExtension(businessObject, 'camunda:InputOutput'),
        inputParameters = inputOutput.get('camunda:inputParameters');

  const inputParameter = findInputParameter(inputOutput, binding);

  commandStack.execute('element.updateModdleProperties', {
    element,
    moddleElement: inputOutput,
    properties: { inputParameters: without(inputParameters, inputParameter) }
  });
}

function removeEntry(entries, suffix) {
  const entry = entries.find(({ id }) => id.endsWith(suffix));

  return without(entries, entry);
}