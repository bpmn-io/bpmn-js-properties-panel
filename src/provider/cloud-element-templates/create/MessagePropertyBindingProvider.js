import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { getDefaultValue } from '../Helper';

export class MessagePropertyBindingProvider {
  static create(element, options) {
    const {
      bpmnFactory,
      property
    } = options;

    const {
      binding
    } = property;

    const {
      name
    } = binding;

    const value = getDefaultValue(property);

    let businessObject = getBusinessObject(element);

    if (is(businessObject, 'bpmn:Event')) {
      businessObject = businessObject.get('eventDefinitions')[0];
    }

    let message = businessObject.get('messageRef');

    if (!message) {
      message = bpmnFactory.create('bpmn:Message');
      businessObject.set('messageRef', message);
    }

    message.set(name, value);
  }
}
