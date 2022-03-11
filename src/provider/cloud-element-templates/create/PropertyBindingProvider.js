import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';


export default class PropertyBindingProvider {
  static create(element, options) {
    const {
      property
    } = options;

    const {
      binding,
      value
    } = property;

    const {
      name
    } = binding;

    const businessObject = getBusinessObject(element);

    businessObject[name] = value;
  }
}