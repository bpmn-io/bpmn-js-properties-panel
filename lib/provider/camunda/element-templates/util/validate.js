'use strict';

var ElementTemplates = require('../ElementTemplates');

/**
 * Validate the given template descriptors and
 * return a list of errors.
 *
 * @param {Array<TemplateDescriptor>} descriptors
 *
 * @return {Array<Error>}
 */
module.exports = function validate(descriptors) {

  var templates = new ElementTemplates();

  templates.addAll(descriptors);

  return templates._errors;
};