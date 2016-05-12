'use strict';

var isArray = require('lodash/lang/isArray'),
    forEach = require('lodash/collection/forEach');

var DROPDOWN_TYPE = 'Dropdown';

var VALID_TYPES = [ 'String', 'Text', 'Boolean', DROPDOWN_TYPE ];

var PROPERTY_TYPE = 'property',
    CAMUNDA_PROPERTY_TYPE = 'camunda:property',
    INPUT_PARAMETER_TYPE = 'camunda:inputParameter',
    OUTPUT_PARAMETER_TYPE = 'camunda:outputParameter';

var VALID_BINDING_TYPES = [
  PROPERTY_TYPE,
  CAMUNDA_PROPERTY_TYPE,
  INPUT_PARAMETER_TYPE,
  OUTPUT_PARAMETER_TYPE
];


/**
 * The guy knowing all configured element templates.
 *
 * Ask him anything template related or add more...
 *
 * @param {Array<TemplateDescriptor>} initialTemplates
 */
function ElementTemplates(initialTemplates) {

  this._errors = [];
  this._all = {};

  /**
   * Clear the templates and validation state
   */
  this.clear = function() {
    this._errors = [];
    this._all = {};
  };

  this.logError = function(err, template) {

    if (typeof err === 'string') {
      if (template) {
        err = 'template(id: ' + template.id + ') ' + err;
      }

      err = new Error(err);
    }

    this._errors.push(err);

    return err;
  };

  /**
   * Adds the templates.
   *
   * @param {Array<TemplateDescriptor>} templates
   */
  this.addAll = function(templates) {

    if (!isArray(templates)) {
      this.logError('templates must be []');
    } else {
      templates.forEach(this.add, this);
    }
  };

  /**
   * Add the given element template, if it is valid.
   *
   * @param {TemplateDescriptor} template
   */
  this.add = function(template) {

    var id = template.id,
        appliesTo = template.appliesTo,
        properties = template.properties;

    var err;

    if (!id) {
      return this.logError('missing template id');
    }

    if (this._all[id]) {
      return this.logError('template id <' + id + '> already used');
    }

    if (!isArray(appliesTo)) {
      err = this.logError('missing appliesTo=[]', template);
    }

    if (!isArray(properties)) {
      err = this.logError('missing properties=[]', template);
    } else {
      if (!this._validateProperties(properties)) {
        err = new Error('invalid properties');
      }
    }

    if (!err) {
      this._all[id] = template;
    }
  };

  /**
   * Validate properties and return false if any is invalid.
   *
   * @param {Array<PropertyDescriptor>} properties
   *
   * @return {Boolean}
   */
  this._validateProperties = function(properties) {
    var validProperties = properties.filter(this._validateProperty, this);

    return properties.length === validProperties.length;
  };

  /**
   * Validate property and return false, if there was
   * a validation error.
   *
   * @param {PropertyDescriptor} property
   *
   * @return {Boolean}
   */
  this._validateProperty = function(property) {

    var type = property.type,
        binding = property.binding;

    var err;

    if (VALID_TYPES.indexOf(type) === -1) {
      err = this.logError(
              'invalid property type <' + type + '>; ' +
              'must be any of { ' + VALID_TYPES.join(', ') + ' }');
    }

    if (type === DROPDOWN_TYPE) {
      if (!isArray(property.choices)) {
        err = this.logError('must provide choices=[] with ' + DROPDOWN_TYPE + ' type');
      } else

      if (!property.choices.every(isDropdownChoiceValid)) {
        err = this.logError(
          '{ name, value } must be specified for ' +
          DROPDOWN_TYPE + ' choices'
        );
      }
    }

    if (!binding) {
      return this.logError('property missing binding');
    }

    var bindingType = binding.type;

    if (VALID_BINDING_TYPES.indexOf(bindingType) === -1) {
      err = this.logError(
              'invalid property.binding type <' + bindingType + '>; ' +
              'must be any of { ' + VALID_BINDING_TYPES.join(', ') + ' }');
    }

    if (bindingType === PROPERTY_TYPE ||
        bindingType === CAMUNDA_PROPERTY_TYPE ||
        bindingType === INPUT_PARAMETER_TYPE) {

      if (!binding.name) {
        err = this.logError(
                'property.binding <' + bindingType + '> requires name');
      }
    }

    if (bindingType === OUTPUT_PARAMETER_TYPE) {
      if (!binding.source) {
        err = this.logError(
                'property.binding <' + bindingType + '> requires source');
      }
    }

    return !err;
  };


  /**
   * Get template descriptor with given id.
   *
   * @param {String} id
   *
   * @return {TemplateDescriptor}
   */
  this.get = function(id) {
    return this._all[id];
  };

  /**
   * Return all known template descriptors.
   *
   * @return {Map<String, TemplateDescriptor>}
   */
  this.getAll = function() {
    return this._all;
  };

  /**
   * Do something with every known template descriptor.
   *
   * @param {Function} fn
   * @param {Any} context
   *
   * @return {Any}
   */
  this.forEach = function(fn, context) {
    return forEach(this._all, fn, context);
  };


  // initialize (optional) default templates

  if (initialTemplates) {
    this.addAll(initialTemplates);
  }
}

ElementTemplates.$inject = [ 'config.elementTemplates' ];

module.exports = ElementTemplates;


//////// helpers ///////////////////////////////////

function isDropdownChoiceValid(c) {
  return 'name' in c && 'value' in c;
}