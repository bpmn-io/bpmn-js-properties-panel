'use strict';

var isArray = require('min-dash').isArray,
    isObject = require('min-dash').isObject,
    keys = require('min-dash').keys;

var semver = require('semver');

var handleLegacyScopes = require('./util/handleLegacyScopes');

var DROPDOWN_TYPE = 'Dropdown';

var VALID_TYPES = [ 'String', 'Text', 'Boolean', 'Hidden', DROPDOWN_TYPE ];

var PROPERTY_TYPE = 'property',
    CAMUNDA_PROPERTY_TYPE = 'camunda:property',
    CAMUNDA_INPUT_PARAMETER_TYPE = 'camunda:inputParameter',
    CAMUNDA_OUTPUT_PARAMETER_TYPE = 'camunda:outputParameter',
    CAMUNDA_IN_TYPE = 'camunda:in',
    CAMUNDA_OUT_TYPE = 'camunda:out',
    CAMUNDA_IN_BUSINESS_KEY_TYPE = 'camunda:in:businessKey',
    CAMUNDA_EXECUTION_LISTENER = 'camunda:executionListener',
    CAMUNDA_FIELD = 'camunda:field',
    CAMUNDA_CONNECTOR = 'camunda:Connector';

var VALID_BINDING_TYPES = [
  PROPERTY_TYPE,
  CAMUNDA_PROPERTY_TYPE,
  CAMUNDA_INPUT_PARAMETER_TYPE,
  CAMUNDA_OUTPUT_PARAMETER_TYPE,
  CAMUNDA_IN_TYPE,
  CAMUNDA_OUT_TYPE,
  CAMUNDA_IN_BUSINESS_KEY_TYPE,
  CAMUNDA_EXECUTION_LISTENER,
  CAMUNDA_FIELD
];

var SUPPORTED_SCHEMA_VERSION = require('@camunda/element-templates-json-schema/package.json').version;


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

    var id, version;

    if (!err) {
      id = template.id;
      version = template.version || '_';

      if (!this._templatesById[ id ]) {
        this._templatesById[ id ] = {};
      }

      this._templatesById[ id ][ version ] = template;

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
        version = template.version || '_',
        name = template.name,
        appliesTo = template.appliesTo,
        properties = template.properties,
        scopes = template.scopes,
        schemaVersion = template.$schema && getSchemaVersion(template.$schema);

    if (!id) {
      return this._logError('missing template id', template);
    }

    if (!name) {
      return this._logError('missing template name', template);
    }

    if (schemaVersion &&
       (semver.compare(SUPPORTED_SCHEMA_VERSION, schemaVersion) < 0)) {
      return this._logError('unsupported element template schema version <' + schemaVersion +
         '>. Your installation only supports up to version <' + SUPPORTED_SCHEMA_VERSION +
         '>. Please update your installation', template);
    }

    if (this._templatesById[ id ] && this._templatesById[ id ][ version ]) {
      if (version === '_') {
        return this._logError('template id <' + id + '> already used', template);
      } else {
        return this._logError('template id <' + id + '> and version <' + version + '> already used', template);
      }
    }

    if (!isArray(appliesTo)) {
      err = this._logError('missing appliesTo=[]', template);
    }

    if (!isArray(properties)) {
      err = this._logError('missing properties=[]', template);
    } else {
      if (!this._validateProperties(template, properties)) {
        err = new Error('invalid properties');
      }
    }

    if (scopes) {
      err = this._validateScopes(template, scopes);
    }

    return err;
  };

  /**
   * Validate given scopes and return error (if any).
   *
   * @param {TemplateDescriptor} template
   * @param {ScopesDescriptor|Array<TemplateDescriptor>} scopes
   *
   * @return {Error} validation error, if any
   */
  this._validateScopes = function(template, scopes) {

    var err,
        scopeType;

    var self = this;

    // handle legacy scope descriptor
    if (!isArray(scopes)) {

      if (!isObject(scopes)) {
        return this._logError('invalid scopes, should be scopes={} or scopes=[]', template);
      }

      // only support <camunda:Connector> for legacy scopes
      keys(scopes).forEach(function(scope) {
        if (scope !== CAMUNDA_CONNECTOR) {
          err = self._logError('invalid scope <' + scope + '>, object descriptor is only supported for <' + CAMUNDA_CONNECTOR + '>', template);
        }
      });
    }

    handleLegacyScopes(scopes).forEach(function(scope) {
      scopeType = scope.type;

      if (!isObject(scope) || isArray(scope)) {
        err = self._logError('invalid scope, should be scope={}', template);
      }

      if (!scopeType) {
        err = self._logError('invalid scope, missing type', template);
      }

      if (!isArray(scope.properties)) {
        err = self._logError(
          'missing properties=[] in scope <' + scopeType + '>', template
        );
      } else {
        if (!self._validateProperties(template, scope.properties)) {
          err = new Error('invalid properties in scope <' + scopeType + '>');
        }
      }
    });

    return err;
  };

  /**
   * Validate properties and return false if any is invalid.
   *
   * @param {TemplateDescriptor} template
   * @param {Array<PropertyDescriptor>} properties
   *
   * @return {Boolean} true if all properties are valid
   */
  this._validateProperties = function(template, properties) {
    var validProperties = properties.filter(function(ele) { return this._validateProperty(template, ele); }, this);

    return properties.length === validProperties.length;
  };

  /**
   * Validate property and return false, if there was
   * a validation error.
   *
   * @param {TemplateDescriptor} template
   * @param {PropertyDescriptor} property
   *
   * @return {Boolean} true if property is valid
   */
  this._validateProperty = function(template, property) {

    var type = property.type,
        binding = property.binding;

    var err;

    var bindingType = binding.type;

    if (type && VALID_TYPES.indexOf(type) === -1) {
      err = this._logError(
        'invalid property type <' + type + '>; ' +
        'must be any of { ' + VALID_TYPES.join(', ') + ' }',
        template
      );
    }

    if (type === DROPDOWN_TYPE && bindingType !== CAMUNDA_EXECUTION_LISTENER) {
      if (!isArray(property.choices)) {
        err = this._logError(
          'must provide choices=[] with ' + DROPDOWN_TYPE + ' type',
          template
        );
      } else

      if (!property.choices.every(isDropdownChoiceValid)) {
        err = this._logError(
          '{ name, value } must be specified for ' +
          DROPDOWN_TYPE + ' choices',
          template
        );
      }
    }

    if (!binding) {
      return this._logError('property missing binding', template);
    }

    if (VALID_BINDING_TYPES.indexOf(bindingType) === -1) {
      err = this._logError(
        'invalid property.binding type <' + bindingType + '>; ' +
        'must be any of { ' + VALID_BINDING_TYPES.join(', ') + ' }',
        template
      );
    }

    if (bindingType === PROPERTY_TYPE ||
        bindingType === CAMUNDA_PROPERTY_TYPE ||
        bindingType === CAMUNDA_INPUT_PARAMETER_TYPE ||
        bindingType === CAMUNDA_FIELD) {

      if (!binding.name) {
        err = this._logError(
          'property.binding <' + bindingType + '> requires name',
          template
        );
      }
    }

    if (bindingType === CAMUNDA_OUTPUT_PARAMETER_TYPE) {
      if (!binding.source) {
        err = this._logError(
          'property.binding <' + bindingType + '> requires source',
          template
        );
      }
    }

    if (bindingType === CAMUNDA_IN_TYPE) {

      if (!binding.variables && !binding.target) {
        err = this._logError(
          'property.binding <' + bindingType + '> requires ' +
          'variables or target',
          template
        );
      }
    }

    if (bindingType === CAMUNDA_OUT_TYPE) {

      if (!binding.variables && !binding.source && !binding.sourceExpression) {
        err = this._logError(
          'property.binding <' + bindingType + '> requires ' +
          'variables, sourceExpression or source',
          template
        );
      }
    }

    if (bindingType === CAMUNDA_EXECUTION_LISTENER) {

      if (type && type !== 'Hidden') {
        err = this._logError(
          'invalid property type <' + type + '> for ' + CAMUNDA_EXECUTION_LISTENER + '; ' +
          'must be <Hidden>',
          template
        );
      }
    }

    return !err;
  };

  /**
   * Log an error for the given template
   *
   * @param {(String|Error)} err
   * @param {TemplateDescriptor} template
   *
   * @return {Error} logged validation errors
   */
  this._logError = function(err, template) {

    if (typeof err === 'string') {

      if (template) {
        err = 'template(id: <' + template.id + '>, name: <' + template.name + '>): ' + err;
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


// helpers ///////////////////////////////////

function isDropdownChoiceValid(c) {
  return 'name' in c && 'value' in c;
}

/**
 * Extract schema version from schema URI
 *
 * @param {String} schemaUri - for example https://unpkg.com/@camunda/element-templates-json-schema@99.99.99/resources/schema.json
 *
 * @return {String} for example '99.99.99'
 */
function getSchemaVersion(schemaUri) {
  var re = /\d+\.\d+\.\d+/g;

  var match = schemaUri.match(re);

  return match === null ? undefined : match[0];
}
