import {
  Validator as BaseValidator,
  filteredSchemaErrors,
  getSchemaVersion
} from '../element-templates/Validator';

import semverCompare from 'semver-compare';

import {
  validateZeebe as validateAgainstSchema,
  getZeebeSchemaPackage as getTemplateSchemaPackage,
  getZeebeSchemaVersion as getTemplateSchemaVersion
} from '@bpmn-io/element-templates-validator';

const SUPPORTED_SCHEMA_VERSION = getTemplateSchemaVersion();
const SUPPORTED_SCHEMA_PACKAGE = getTemplateSchemaPackage();

/**
 * A Camunda Cloud element template validator.
 */
export class Validator extends BaseValidator {
  constructor(moddle) {
    super(moddle);
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
          schema = template.$schema,
          schemaVersion = schema && getSchemaVersion(schema);

    // (1) $schema attribute defined
    if (!schema) {
      return this._logError(
        'missing $schema attribute.',
        template
      );
    }

    if (!this.isSchemaValid(schema)) {
      return this._logError(
        `unsupported $schema attribute <${ schema }>.`,
        template
      );
    }

    // (2) compatibility
    if (schemaVersion && (semverCompare(SUPPORTED_SCHEMA_VERSION, schemaVersion) < 0)) {
      return this._logError(
        `unsupported element template schema version <${ schemaVersion }>. Your installation only supports up to version <${ SUPPORTED_SCHEMA_VERSION }>. Please update your installation`,
        template
      );
    }

    // (3) versioning
    if (this._templatesById[ id ] && this._templatesById[ id ][ version ]) {
      if (version === '_') {
        return this._logError(`template id <${ id }> already used`, template);
      } else {
        return this._logError(`template id <${ id }> and version <${ version }> already used`, template);
      }
    }

    // (4) elementType validation
    const elementTypeError = this._validateElementType(template);

    if (elementTypeError) {
      return elementTypeError;
    }

    // (5) JSON schema compliance
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

  isSchemaValid(schema) {
    return schema && schema.includes(SUPPORTED_SCHEMA_PACKAGE);
  }
}
