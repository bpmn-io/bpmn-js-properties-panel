'use strict';

var values = require('lodash/values');

/**
 * The guy knowing all configured element templates.
 *
 * This registry won't validate. Use the {@link Validator}
 * to verify a template is valid prior to adding it to
 * this registry.
 */
function ElementTemplates() {

  this._templates = {};

  /**
   * Sets the known element templates.
   *
   * @param {Array<TemplateDescriptor>} descriptors
   *
   * @return {ElementTemplates}
   */
  this.set = function(descriptors) {

    var templates = this._templates = {};

    descriptors.forEach(function(descriptor) {
      templates[descriptor.id] = descriptor;
    });

    return this;
  };

  /**
   * Get template descriptor with given id.
   *
   * @param {String} id
   *
   * @return {TemplateDescriptor}
   */
  this.get = function(id) {
    return this._templates[id];
  };

  /**
   * Return all known template descriptors.
   *
   * @return {Array<TemplateDescriptor>}
   */
  this.getAll = function() {
    return values(this._templates);
  };

}

module.exports = ElementTemplates;