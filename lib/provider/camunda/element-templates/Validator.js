'use strict';

var isArray = require('lodash/lang/isArray');
var isObject = require('lodash/lang/isObject');

var DROPDOWN_TYPE = 'Dropdown';
var LIST_TYPE = 'List';
var MAP_TYPE = 'Map';

var VALID_TYPES = [ 'String', 'Text', 'Boolean', 'Hidden', DROPDOWN_TYPE, LIST_TYPE, MAP_TYPE ];

var PROPERTY_TYPE = 'property',
    CAMUNDA_PROPERTY_TYPE = 'camunda:property',
    CAMUNDA_INPUT_PARAMETER_TYPE = 'camunda:inputParameter',
    CAMUNDA_OUTPUT_PARAMETER_TYPE = 'camunda:outputParameter',
    CAMUNDA_IN_TYPE = 'camunda:in',
    CAMUNDA_OUT_TYPE = 'camunda:out',
    CAMUNDA_IN_BUSINESS_KEY_TYPE = 'camunda:in:businessKey',
    CAMUNDA_EXECUTION_LISTENER = 'camunda:executionListener';

var VALID_BINDING_TYPES = [
  PROPERTY_TYPE,
  CAMUNDA_PROPERTY_TYPE,
  CAMUNDA_INPUT_PARAMETER_TYPE,
  CAMUNDA_OUTPUT_PARAMETER_TYPE,
  CAMUNDA_IN_TYPE,
  CAMUNDA_OUT_TYPE,
  CAMUNDA_IN_BUSINESS_KEY_TYPE,
  CAMUNDA_EXECUTION_LISTENER
];


/**
 * A element template validator.
 */
function Validator() {

  this._templatesById = {};

  this._validTemplates = [];
  this._errors = [];


  /**
   * Adds the templates.
   *
   * @param {Array<TemplateDescriptor>} templates
   *
   * @return {Validator} self
   */
  this.addAll = function(templates) {

    if (!isArray(templates)) {
      this._logError('templates must be []');
    } else {
      templates.forEach(this.add, this);
    }

    return this;
  };

  /**
   * Add the given element template, if it is valid.
   *
   * @param {TemplateDescriptor} template
   *
   * @return {Validator} self
   */
  this.add = function(template) {

    var err = this._validateTemplate(template);

    if (!err) {
      this._templatesById[template.id] = template;

      this._validTemplates.push(template);
    }

    return this;
  };

  /**
   * Validate given template and return error (if any).
   *
   * @param {TemplateDescriptor} template
   *
   * @return {Error} validation error, if any
   */
  this._validateTemplate = function(template) {

    var err,
        id = template.id,
        appliesTo = template.appliesTo,
        properties = template.properties,
        scopes = template.scopes;

    if (!id) {
      return this._logError('missing template id');
    }

    if (id in this._templatesById) {
      return this._logError('template id <' + id + '> already used');
    }

    if (!isArray(appliesTo)) {
      err = this._logError('missing appliesTo=[]', template);
    }

    if (!isArray(properties)) {
      err = this._logError('missing properties=[]', template);
    } else {
      if (!this._validateProperties(properties)) {
        err = new Error('invalid properties');
      }
    }

    if (scopes) {
      err = this._validateScopes(template, scopes);
    }

    return err;
  };

  this._validateScopes = function(template, scopes) {

    var err,
        scope,
        scopeName;

    if (!isObject(scopes) || isArray(scopes)) {
      return this._logError('invalid scopes, should be scopes={}', template);
    }

    for (scopeName in scopes) {
      scope = scopes[scopeName];

      if (!isObject(scope) || isArray(scope)) {
        err = this._logError('invalid scope, should be scope={}', template);
      }

      if (!isArray(scope.properties)) {
        err = this._logError(
          'missing properties=[] in scope <' + scopeName + '>', template
        );
      } else {
        if (!this._validateProperties(scope.properties)) {
          err = new Error('invalid properties in scope <' + scopeName + '>');
        }
      }
    }

    return err;
  };

  /**
   * Validate properties and return false if any is invalid.
   *
   * @param {Array<PropertyDescriptor>} properties
   *
   * @return {Boolean} true if all properties are valid
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
   * @return {Boolean} true if property is valid
   */
  this._validateProperty = function(property) {

    var type = property.type,
        binding = property.binding;

    var err;

    var bindingType = binding.type;

    if (VALID_TYPES.indexOf(type) === -1) {
      err = this._logError(
              'invalid property type <' + type + '>; ' +
              'must be any of { ' + VALID_TYPES.join(', ') + ' }');
    }

    if (type === DROPDOWN_TYPE && bindingType !== CAMUNDA_EXECUTION_LISTENER) {
      if (!isArray(property.choices)) {
        err = this._logError('must provide choices=[] with ' + DROPDOWN_TYPE + ' type');
      } else

      if (!property.choices.every(isDropdownChoiceValid)) {
        err = this._logError(
          '{ name, value } must be specified for ' +
          DROPDOWN_TYPE + ' choices'
        );
      }
    }

    if (!binding) {
      return this._logError('property missing binding');
    }

    if (VALID_BINDING_TYPES.indexOf(bindingType) === -1) {
      err = this._logError(
              'invalid property.binding type <' + bindingType + '>; ' +
              'must be any of { ' + VALID_BINDING_TYPES.join(', ') + ' }');
    }

    if (bindingType === CAMUNDA_INPUT_PARAMETER_TYPE
        || bindingType === CAMUNDA_OUTPUT_PARAMETER_TYPE) {
      if (type === MAP_TYPE) {
        if (property.value) {
          if (!isObject(property.value)) {
            err = this._logError('must provide value={} with ' + MAP_TYPE + ' type');
          } else

          if (!property.value.every(isMapValueValid)) {
            err = this._logError(
              '{ key, value } must be specified for ' +
              MAP_TYPE + ' value'
            );
          }
        }
      }
      else if (type === LIST_TYPE) {
        if (property.value) {
          if (!isArray(property.value)) {
            err = this._logError('must provide value=[] with ' + LIST_TYPE + ' type');
          } else

          if (!property.value.every(isListValueValid)) {
            err = this._logError(
              '[ string, ] must be specified for ' +
              LIST_TYPE + ' value'
            );
          }
        }
      }
    }

    if (bindingType === PROPERTY_TYPE ||
        bindingType === CAMUNDA_PROPERTY_TYPE ||
        bindingType === CAMUNDA_INPUT_PARAMETER_TYPE) {

      if (!binding.name) {
        err = this._logError(
                'property.binding <' + bindingType + '> requires name');
      }
    }

    if (bindingType === CAMUNDA_OUTPUT_PARAMETER_TYPE) {
      if (!binding.source) {
        err = this._logError(
                'property.binding <' + bindingType + '> requires source');
      }
    }

    if (bindingType === CAMUNDA_IN_TYPE) {

      if (!binding.variables && !binding.target) {
        err = this._logError(
                'property.binding <' + bindingType + '> requires ' +
                'variables or target');
      }
    }

    if (bindingType === CAMUNDA_OUT_TYPE) {

      if (!binding.variables && !binding.source && !binding.sourceExpression) {
        err = this._logError(
                'property.binding <' + bindingType + '> requires ' +
                'variables, sourceExpression or source');
      }
    }

    if (bindingType === CAMUNDA_EXECUTION_LISTENER) {

      if (type !== 'Hidden') {
        err = this._logError(
                'invalid property type <' + type + '> for ' + CAMUNDA_EXECUTION_LISTENER + '; ' +
                'must be <Hidden>');
      }
    }

    return !err;
  };


  this._logError = function(err, template) {

    if (typeof err === 'string') {
      if (template) {
        err = 'template(id: ' + template.id + ') ' + err;
      }

      err = new Error(err);
    }

    this._errors.push(err);

    return err;
  };

  this.getErrors = function() {
    return this._errors;
  };

  this.getValidTemplates = function() {
    return this._validTemplates;
  };
}

module.exports = Validator;


//////// helpers ///////////////////////////////////

function isDropdownChoiceValid(c) {
  return 'name' in c && 'value' in c;
}

function isMapValueValid(c) {
  return 'key' in c && 'value' in c;
}

function isListValueValid(c) {
  return !isArray(c) && !isObject(c);
}