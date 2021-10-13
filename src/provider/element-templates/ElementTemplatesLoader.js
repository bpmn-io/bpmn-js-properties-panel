'use strict';

var Validator = require('./Validator');

/**
 * The guy responsible for template loading.
 *
 * Provide the actual templates via the `config.elementTemplates`.
 *
 * That configuration can either be an array of template
 * descriptors or a node style callback to retrieve
 * the templates asynchronously.
 *
 * @param {Array<TemplateDescriptor>|Function} loadTemplates
 * @param {EventBus} eventBus
 * @param {ElementTemplates} elementTemplates
 */
function ElementTemplatesLoader(loadTemplates, eventBus, elementTemplates) {
  this._loadTemplates = loadTemplates;
  this._eventBus = eventBus;
  this._elementTemplates = elementTemplates;

  var self = this;

  eventBus.on('diagram.init', function() {
    self.reload();
  });
}

module.exports = ElementTemplatesLoader;

ElementTemplatesLoader.$inject = [
  'config.elementTemplates',
  'eventBus',
  'elementTemplates'
];


ElementTemplatesLoader.prototype.reload = function() {

  var self = this;

  var loadTemplates = this._loadTemplates;

  // no templates specified
  if (typeof loadTemplates === 'undefined') {
    return;
  }

  // template loader function specified
  if (typeof loadTemplates === 'function') {

    return loadTemplates(function(err, templates) {

      if (err) {
        return self.templateErrors([ err ]);
      }

      self.setTemplates(templates);
    });
  }

  // templates array specified
  if (loadTemplates.length) {
    return this.setTemplates(loadTemplates);
  }

};

ElementTemplatesLoader.prototype.setTemplates = function(templates) {

  var elementTemplates = this._elementTemplates;

  var validator = new Validator().addAll(templates);

  var errors = validator.getErrors(),
      validTemplates = validator.getValidTemplates();

  elementTemplates.set(validTemplates);

  if (errors.length) {
    this.templateErrors(errors);
  }

  this.templatesChanged();
};

ElementTemplatesLoader.prototype.templatesChanged = function() {
  this._eventBus.fire('elementTemplates.changed');
};

ElementTemplatesLoader.prototype.templateErrors = function(errors) {
  this._eventBus.fire('elementTemplates.errors', {
    errors: errors
  });
};