import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { createTaskDefinitionWithRetries } from '../CreateHelper';


export default class TaskDefinitionRetriesBindingProvider {
  static create(element, options) {
    const {
      property,
      bpmnFactory
    } = options;

    const {
      value
    } = property;

    const extensionElements = getBusinessObject(element).get('extensionElements');

    const taskDefinition = createTaskDefinitionWithRetries(value, bpmnFactory);
    taskDefinition.$parent = extensionElements;
    extensionElements.get('values').push(taskDefinition);
  }
}
