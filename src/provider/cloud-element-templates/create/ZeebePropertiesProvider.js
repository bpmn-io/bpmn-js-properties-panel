import {
  createZeebeProperty,
  ensureExtension,
  shouldUpdate
} from '../CreateHelper';


export default class ZeebePropertiesProvider {
  static create(element, options) {
    const {
      property,
      bpmnFactory
    } = options;

    const {
      binding,
      value
    } = property;

    const zeebeProperties = ensureExtension(element, 'zeebe:Properties', bpmnFactory);

    if (!shouldUpdate(value, property)) {
      return;
    }

    const zeebeProperty = createZeebeProperty(binding, value, bpmnFactory);
    zeebeProperty.$parent = zeebeProperties;
    zeebeProperties.get('properties').push(zeebeProperty);
  }
}