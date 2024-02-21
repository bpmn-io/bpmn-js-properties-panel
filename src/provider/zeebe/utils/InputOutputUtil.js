import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';
import { isZeebeServiceTask } from './ZeebeServiceTaskUtil';

import {
  getErrorEventDefinition,
  getEventDefinition
} from '../../bpmn/utils/EventDefinitionUtil';

function getElements(bo, type, prop) {
  const elems = getExtensionElementsList(bo, type);
  return !prop ? elems : (elems[0] || {})[prop] || [];
}

function getParameters(element, prop) {
  const ioMapping = getIoMapping(element);
  return (ioMapping && ioMapping.get(prop)) || [];
}

/**
 * Get a ioMapping from the business object
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement} the ioMapping object
 */
export function getIoMapping(element) {
  const bo = getBusinessObject(element);
  return (getElements(bo, 'zeebe:IoMapping') || [])[0];
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
  return getParameters.apply(this, [ element, 'inputParameters' ]);
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
  return getParameters.apply(this, [ element, 'outputParameters' ]);
}

export function areInputParametersSupported(element) {
  return isAny(element, [
    'bpmn:UserTask',
    'bpmn:SubProcess',
    'bpmn:CallActivity',
    'bpmn:BusinessRuleTask',
    'bpmn:ScriptTask'
  ]) || isZeebeServiceTask(element) || isSignalThrowEvent(element);
}

export function areOutputParametersSupported(element) {

  if (is(element, 'bpmn:EndEvent') && (
    getErrorEventDefinition(element) || getTerminateEventDefinition(element)
  )) {
    return false;
  }

  return isAny(element, [
    'zeebe:ZeebeServiceTask',
    'bpmn:UserTask',
    'bpmn:SubProcess',
    'bpmn:ReceiveTask',
    'bpmn:CallActivity',
    'bpmn:Event',
    'bpmn:BusinessRuleTask'
  ]);
}

function getTerminateEventDefinition(element) {
  return getEventDefinition(element, 'bpmn:TerminateEventDefinition');
}

export function createIOMapping(properties, parent, bpmnFactory) {
  return createElement('zeebe:IoMapping', properties, parent, bpmnFactory);
}

function isSignalThrowEvent(element) {
  if (!isAny(element, [
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent'
  ])) {
    return false;
  }

  return !!getEventDefinition(element, 'bpmn:SignalEventDefinition');
}
