'use strict';

var Validator = require('../Validator');

/**
 * Validate the given template descriptors and
 * return a list of errors.
 *
 * @param {Array<TemplateDescriptor>} descriptors
 *
 * @return {Array<Error>}
 */
module.exports = function validate(descriptors) {

  return new Validator().addAll(descriptors).getErrors();
};