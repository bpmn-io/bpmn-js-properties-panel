import { Validator } from '../Validator';

/**
 * Validate the given template descriptors and
 * return a list of errors.
 *
 * @param {Array<TemplateDescriptor>} descriptors
 * @param {Moddle} moddle
 *
 * @return {Array<Error>}
 */
export default function validate(descriptors, moddle) {
  return new Validator(moddle).addAll(descriptors).getErrors();
}
