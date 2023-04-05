import {
  createOutputParameter,
  ensureExtension,
  shouldUpdate
} from '../CreateHelper';
import { getDefaultValue } from '../Helper';


export default class OutputBindingProvider {
  static create(element, options) {
    const {
      property,
      bpmnFactory
    } = options;

    const {
      binding
    } = property;

    const value = getDefaultValue(property);

    const ioMapping = ensureExtension(element, 'zeebe:IoMapping', bpmnFactory);

    if (!shouldUpdate(value, property)) {
      return;
    }

    const output = createOutputParameter(binding, value, bpmnFactory);
    output.$parent = ioMapping;
    ioMapping.get('outputParameters').push(output);
  }
}