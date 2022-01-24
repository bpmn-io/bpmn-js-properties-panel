import { Validator as BaseValidator } from '../element-templates/Validator';


/**
 * A Camunda Cloud element template validator.
 */
export class Validator extends BaseValidator {
  constructor() {
    super();
  }

  /**
   * TODO(pinussilvestrus): we disable JSON schema validation for now.
   *
   * Validate given template and return error (if any).
   *
   * @param {TemplateDescriptor} template
   *
   * @return {Error} validation error, if any
   */
  _validateTemplate(template) {
    let err;

    const id = template.id,
          version = template.version || '_';

    // (1) versioning
    if (this._templatesById[ id ] && this._templatesById[ id ][ version ]) {
      if (version === '_') {
        return this._logError(`template id <${ id }> already used`, template);
      } else {
        return this._logError(`template id <${ id }> and version <${ version }> already used`, template);
      }
    }

    return err;
  }
}
