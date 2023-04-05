import {
  createTaskHeader,
  ensureExtension
} from '../CreateHelper';
import { getDefaultValue } from '../Helper';


export default class TaskHeaderBindingProvider {
  static create(element, options) {
    const {
      property,
      bpmnFactory
    } = options;

    const {
      binding
    } = property;

    const value = getDefaultValue(property);

    const taskHeaders = ensureExtension(element, 'zeebe:TaskHeaders', bpmnFactory);

    const header = createTaskHeader(binding, value, bpmnFactory);
    header.$parent = taskHeaders;
    taskHeaders.get('values').push(header);
  }
}