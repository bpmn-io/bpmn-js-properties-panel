import {
  createOutputParameter,
  ensureExtension,
  shouldUpdate
} from '../CreateHelper';


export default class OutputBindingProvider {
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

    const output = createOutputParameter(binding, value, bpmnFactory);
    output.$parent = ioMapping;
    ioMapping.get('outputParameters').push(output);
  }
}