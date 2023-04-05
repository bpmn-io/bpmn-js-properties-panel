import {
  ensureExtension
} from '../CreateHelper';
import { getDefaultValue } from '../Helper';


export default class TaskDefinitionTypeBindingProvider {
  static create(element, options) {
    const {
      property,
      bpmnFactory
    } = options;

    const value = getDefaultValue(property);

    const taskDefinition = ensureExtension(element, 'zeebe:TaskDefinition', bpmnFactory);
    taskDefinition.set('type', value);
  }
}