import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

export class MessagePropertyBindingProvider {
  static create(element, options) {
    const {
      bpmnFactory,
      property
    } = options;

    const {
      binding,
      value
    } = property;

    const {
      name
    } = binding;

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
