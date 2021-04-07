'use strict';

var isArray = require('min-dash').isArray,
    filter = require('min-dash').filter;

var semver = require('semver');

var validateAgainstSchema = require('@bpmn-io/element-templates-validator').validate,
    getTemplateSchemaVersion = require('@bpmn-io/element-templates-validator').getSchemaVersion;

var SUPPORTED_SCHEMA_VERSION = getTemplateSchemaVersion();


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
        schemaVersion = template.$schema && getSchemaVersion(template.$schema),
        self = this;

    // (1) Compatibility
    if (schemaVersion &&
       (semver.compare(SUPPORTED_SCHEMA_VERSION, schemaVersion) < 0)) {
      return this._logError('unsupported element template schema version <' + schemaVersion +
        '>. Your installation only supports up to version <' + SUPPORTED_SCHEMA_VERSION +
        '>. Please update your installation', template);
    }

    // (2) Versioning
    if (this._templatesById[ id ] && this._templatesById[ id ][ version ]) {
      if (version === '_') {
        return this._logError('template id <' + id + '> already used', template);
      } else {
        return this._logError('template id <' + id + '> and version <' + version + '> already used', template);
      }
    }

    // (3) JSON Schema compliant
    var validationResult = validateAgainstSchema(template),
        valid = validationResult.valid,
        errors = validationResult.errors;

    if (!valid) {
      err = new Error('invalid template');

      filteredSchemaErrors(errors).forEach(function(error) {
        self._logError(error.message, template);
      });
    }

    return err;
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

/**
 * Extract only relevant errors of the validation result.
 *
 * The JSON Schema we use under the hood produces more errors than we need for a
 * detected schema violation (for example, unmatched sub-schemas, if-then-rules,
 * `oneOf`-definitions ...).
 *
 * We call these errors "relevant" that have a custom error message defined by us OR
 * are basic data type errors.
 *
 * @param {Array} schemaErrors
 *
 * @return {Array}
 */
function filteredSchemaErrors(schemaErrors) {
  return filter(schemaErrors, function(err) {

    // (1) regular errors are customized from the schema
    if (err.keyword === 'errorMessage') {
      return true;
    }

    // (2) data type errors are relevant, except for
    // (scope) root level data type errors due to basic schema errors
    if (err.keyword === 'type' && err.dataPath && err.dataPath !== '/scopes') {
      return true;
    }

    return false;
  });
}
