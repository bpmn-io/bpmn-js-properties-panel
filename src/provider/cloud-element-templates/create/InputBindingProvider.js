import {
  createInputParameter,
  ensureExtension,
  shouldUpdate
} from '../CreateHelper';


export default class InputBindingProvider {
  static create(element, options) {
    const {
      property,
      bpmnFactory
    } = options;

    const {
      binding,
      value
    } = property;

    const ioMapping = ensureExtension(element, 'zeebe:IoMapping', bpmnFactory);

    if (!shouldUpdate(value, property)) {
      return;
    }

    const input = createInputParameter(binding, value, bpmnFactory);
    input.$parent = ioMapping;
    ioMapping.get('inputParameters').push(input);
  }
}