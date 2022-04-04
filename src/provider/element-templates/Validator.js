import {
  filter,
  isArray,
  isString
} from 'min-dash';

import semverCompare from 'semver-compare';

import {
  validate as validateAgainstSchema,
  getSchemaVersion as getTemplateSchemaVersion
} from '@bpmn-io/element-templates-validator';

const SUPPORTED_SCHEMA_VERSION = getTemplateSchemaVersion();
const MORPHABLE_TYPES = [ 'bpmn:Activity', 'bpmn:Event', 'bpmn:Gateway' ];

/**
 * A element template validator.
 */
export class Validator {
  constructor(moddle) {
    this._templatesById = {};

    this._validTemplates = [];
    this._errors = [];
    this._moddle = moddle;
  }

  /**
   * Adds the templates.
   *
   * @param {Array<TemplateDescriptor>} templates
   *
   * @return {Validator}
   */
  addAll(templates) {
    if (!isArray(templates)) {
      this._logError('templates must be []');
    } else {
      templates.forEach(this.add, this);
    }

    return this;
  }

  /**
   * Add the given element template, if it is valid.
   *
   * @param {TemplateDescriptor} template
   *
   * @return {Validator}
   */
  add(template) {
    const err = this._validateTemplate(template);

    let id, version;

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
  }

  /**
   * Validate given template and return error (if any).
   *
   * @param {TemplateDescriptor} template
   *
   * @return {Error} validation error, if any
   */
  _validateTemplate(template) {
    let err;

    const id = template.id,
          version = template.version || '_',
          schemaVersion = template.$schema && getSchemaVersion(template.$schema);

    // (1) compatibility
    if (schemaVersion && (semverCompare(SUPPORTED_SCHEMA_VERSION, schemaVersion) < 0)) {
      return this._logError(
        `unsupported element template schema version <${ schemaVersion }>. Your installation only supports up to version <${ SUPPORTED_SCHEMA_VERSION }>. Please update your installation`,
        template
      );
    }

    // (2) versioning
    if (this._templatesById[ id ] && this._templatesById[ id ][ version ]) {
      if (version === '_') {
        return this._logError(`template id <${ id }> already used`, template);
      } else {
        return this._logError(`template id <${ id }> and version <${ version }> already used`, template);
      }
    }

    // (3) elementType validation
    const elementTypeError = this._validateElementType(template);

    if (elementTypeError) {
      return elementTypeError;
    }

    // (4) JSON schema compliance
    const validationResult = validateAgainstSchema(template);

    const {
      errors,
      valid
    } = validationResult;

    if (!valid) {
      err = new Error('invalid template');

      filteredSchemaErrors(errors).forEach((error) => {
        this._logError(error.message, template);
      });
    }

    return err;
  }

  /**
   * Validate elementType for given template and return error (if any).
   *
   * @param {TemplateDescriptor} template
   *
   * @return {Error} validation error, if any
   */
  _validateElementType(template) {
    if (template.elementType && template.appliesTo) {

      const elementType = template.elementType.value,
            appliesTo = template.appliesTo;

      // (3.1) template can be applied to elementType
      // prevents cases where the elementType is not part of appliesTo
      if (!appliesTo.find(type => this._isType(elementType, type))) {
        return this._logError(`template does not apply to requested element type <${ elementType }>`, template);
      }

      // (3.2) template only applies to same type of element
      // prevent elementTemplates to morph into incompatible types, e.g. Task -> SequenceFlow
      for (const sourceType of appliesTo) {
        if (!this._canMorph(sourceType, elementType)) {
          return this._logError(`can not morph <${sourceType}> into <${elementType}>`, template);
        }
      }
    }
  }


  /**
   * Check if given type is a subtype of given base type.
   *
   * @param {String} type
   * @param {String} baseType
   * @returns {Boolean}
   */
  _isType(type, baseType) {
    const moddleType = this._moddle.getType(type);

    return moddleType && (baseType in this._moddle.getElementDescriptor(moddleType).allTypesByName);
  }


  /**
   * Checks if a given type can be morphed into another type.
   *
   * @param {String} sourceType
   * @param {String} targetType
   * @returns {Boolean}
   */
  _canMorph(sourceType, targetType) {

    if (sourceType === targetType) {
      return true;
    }

    const baseType = MORPHABLE_TYPES.find(type => this._isType(sourceType, type));

    if (!baseType) {
      return false;
    }

    return this._isType(targetType, baseType);
  }

  /**
   * Log an error for the given template
   *
   * @param {(String|Error)} err
   * @param {TemplateDescriptor} template
   *
   * @return {Error} logged validation errors
   */
  _logError(err, template) {
    if (isString(err)) {

      if (template) {
        const {
          id,
          name
        } = template;

        err = `template(id: <${ id }>, name: <${ name }>): ${ err }`;
      }

      err = new Error(err);
    }

    this._errors.push(err);

    return err;
  }

  getErrors() {
    return this._errors;
  }

  getValidTemplates() {
    return this._validTemplates;
  }
}


// helpers //////////

/**
 * Extract schema version from schema URI
 *
 * @param {String} schemaUri - for example https://unpkg.com/@camunda/element-templates-json-schema@99.99.99/resources/schema.json
 *
 * @return {String} for example '99.99.99'
 */
export function getSchemaVersion(schemaUri) {
  const re = /\d+\.\d+\.\d+/g;

  const match = schemaUri.match(re);

  return match === null ? undefined : match[ 0 ];
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
export function filteredSchemaErrors(schemaErrors) {
  return filter(schemaErrors, (err) => {
    const {
      dataPath,
      keyword
    } = err;

    // (1) regular errors are customized from the schema
    if (keyword === 'errorMessage') {
      return true;
    }

    // (2) data type errors
    // ignore type errors nested in scopes
    if (keyword === 'type' && dataPath && !dataPath.startsWith('/scopes/')) {
      return true;
    }

    return false;
  });
}