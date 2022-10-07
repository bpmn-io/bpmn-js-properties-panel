import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { createCallActivityCalledElement } from '../CreateHelper';


export class CallActivityProcessIdBindingProvider {
  static create(element, options) {
    const {
      property,
      bpmnFactory
    } = options;

    const {
      value
    } = property;

    const extensionElements = getBusinessObject(element).get('extensionElements');

    const calledElement = createCallActivityCalledElement(value, bpmnFactory);
    calledElement.$parent = extensionElements;
    extensionElements.get('values').push(calledElement);
  }
}
