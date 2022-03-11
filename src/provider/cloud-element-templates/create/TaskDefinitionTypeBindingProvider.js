import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { createTaskDefinitionWithType } from '../CreateHelper';


export default class TaskDefinitionTypeBindingProvider {
  static create(element, options) {
    const {
      property,
      bpmnFactory
    } = options;

    const {
      value
    } = property;

    const extensionElements = getBusinessObject(element).get('extensionElements');

    const taskDefinition = createTaskDefinitionWithType(value, bpmnFactory);
    taskDefinition.$parent = extensionElements;
    extensionElements.get('values').push(taskDefinition);
  }
}