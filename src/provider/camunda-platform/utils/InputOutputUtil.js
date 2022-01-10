import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  createElement,
  nextId
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';


function getElements(businessObject, type, property) {
  const elements = getExtensionElementsList(businessObject, type);
  return !property ? elements : (elements[0] || {})[property] || [];
}

function getParameters(element, prop) {
  const inputOutput = getInputOutput(element);
  return (inputOutput && inputOutput.get(prop)) || [];
}

/**
 * Get a camunda:inputOutput from the business object
 *
 * @param {djs.model.Base | ModdleElement} element
 *
 * @return {ModdleElement} the inputOutput object
 */
export function getInputOutput(element) {
  if (is(element, 'camunda:Connector')) {
    return element.get('inputOutput');
  }

  const businessObject = getBusinessObject(element);

  return (getElements(businessObject, 'camunda:InputOutput') || [])[0];
}


/**
 * Return all input parameters existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of input parameter objects
 */
export function getInputParameters(element) {
  return getParameters(element, 'inputParameters');
}

/**
 * Return all output parameters existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of output parameter objects
 */
export function getOutputParameters(element) {
  return getParameters(element, 'outputParameters');
}


export function isInputOutputSupported(element) {
  const businessObject = getBusinessObject(element);

  return (
    is(businessObject, 'bpmn:FlowNode') && !(
      isAny(businessObject, [ 'bpmn:StartEvent', 'bpmn:BoundaryEvent', 'bpmn:Gateway' ]) ||
      is(businessObject, 'bpmn:SubProcess') && businessObject.get('triggeredByEvent')
    )
  );
}

export function areInputParametersSupported(element) {
  return isInputOutputSupported(element);
}

export function areOutputParametersSupported(element) {
  const businessObject = getBusinessObject(element);
  return (
    isInputOutputSupported(element) &&
    !is(businessObject, 'bpmn:EndEvent') &&
    !businessObject.loopCharacteristics
  );
}

export function getInputOutputType(parameter) {
  const definitionTypes = {
    'camunda:Map': 'map',
    'camunda:List': 'list',
    'camunda:Script': 'script'
  };

  let type = 'stringOrExpression';

  const definition = parameter.get('definition');
  if (typeof definition !== 'undefined') {
    type = definitionTypes[definition.$type];
  }

  return type;
}

export function CreateParameterCmd(element, type, parent, bpmnFactory) {
  const isInput = type === 'camunda:InputParameter';

  const newParameter = createElement(type, {
    name: nextId(isInput ? 'Input_' : 'Output_')
  }, parent, bpmnFactory);

  const propertyName = isInput ? 'inputParameters' : 'outputParameters';

  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: parent,
      properties: {
        [ propertyName ]: [ ...parent.get(propertyName), newParameter ]
      }
    }
  };
}

export function AddParameterCmd(element, type, bpmnFactory) {
  const commands = [];
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

  // (2) ensure inputOutput
  let inputOutput = getInputOutput(element);

  if (!inputOutput) {
    const parent = extensionElements;

    inputOutput = createElement('camunda:InputOutput', {
      inputParameters: [],
      outputParameters: []
    }, parent, bpmnFactory);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: [ ...extensionElements.get('values'), inputOutput ]
        }
      }
    });
  }

  // (3) create + add parameter
  commands.push(CreateParameterCmd(element, type, inputOutput, bpmnFactory));

  return commands;
}