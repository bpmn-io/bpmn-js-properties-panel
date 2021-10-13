import { Validator } from '../Validator';

/**
 * Validate the given template descriptors and
 * return a list of errors.
 *
 * @param {Array<TemplateDescriptor>} descriptors
 *
 * @return {Array<Error>}
 */
export default function validate(descriptors) {
  return new Validator().addAll(descriptors).getErrors();
}
