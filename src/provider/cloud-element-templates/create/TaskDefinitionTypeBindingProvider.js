import {
  ensureExtension
} from '../CreateHelper';


export default class TaskDefinitionTypeBindingProvider {
  static create(element, options) {
    const {
      property,
      bpmnFactory
    } = options;

    const {
      value
    } = property;

    const taskDefinition = ensureExtension(element, 'zeebe:TaskDefinition', bpmnFactory);
    taskDefinition.set('type', value);
  }
}