import {
  isFunction,
  isUndefined
} from 'min-dash';

import { Validator } from './Validator';

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
 * @param {Moddle} moddle
 */
export default class ElementTemplatesLoader {
  constructor(loadTemplates, eventBus, elementTemplates, moddle) {
    this._loadTemplates = loadTemplates;
    this._eventBus = eventBus;
    this._elementTemplates = elementTemplates;
    this._moddle = moddle;

    eventBus.on('diagram.init', () => {
      this.reload();
    });
  }

  reload() {
    const loadTemplates = this._loadTemplates;

    // no templates specified
    if (isUndefined(loadTemplates)) {
      return;
    }

    // template loader function specified
    if (isFunction(loadTemplates)) {

      return loadTemplates((err, templates) => {

        if (err) {
          return this.templateErrors([ err ]);
        }

        this.setTemplates(templates);
      });
    }

    // templates array specified
    if (loadTemplates.length) {
      return this.setTemplates(loadTemplates);
    }
  }

  setTemplates(templates) {
    const elementTemplates = this._elementTemplates,
          moddle = this._moddle;

    const validator = new Validator(moddle).addAll(templates);

    const errors = validator.getErrors(),
          validTemplates = validator.getValidTemplates();

    elementTemplates.set(validTemplates);

    if (errors.length) {
      this.templateErrors(errors);
    }

    this.templatesChanged();
  }

  templatesChanged() {
    this._eventBus.fire('elementTemplates.changed');
  }

  templateErrors(errors) {
    this._eventBus.fire('elementTemplates.errors', {
      errors: errors
    });
  }
}

ElementTemplatesLoader.$inject = [
  'config.elementTemplates',
  'eventBus',
  'elementTemplates',
  'moddle'
];