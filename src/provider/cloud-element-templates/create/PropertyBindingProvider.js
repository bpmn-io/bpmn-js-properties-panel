import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { getDefaultValue } from '../Helper';


export default class PropertyBindingProvider {
  static create(element, options) {
    const {
      property
    } = options;

    const {
      binding
    } = property;

    const {
      name
    } = binding;

    const value = getDefaultValue(property);

    const businessObject = getBusinessObject(element);

    businessObject[name] = value;
  }
}