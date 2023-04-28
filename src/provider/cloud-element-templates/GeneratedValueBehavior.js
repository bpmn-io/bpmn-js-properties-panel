import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getDefaultValue } from './Helper';
import { getPropertyValue, setPropertyValue } from './util/propertyUtil';

/**
 * Handles generated value properties.
 */
export class GeneratedValueBehavior extends CommandInterceptor {
  constructor(eventBus, elementTemplates, modeling, commandStack, bpmnFactory) {
    super(eventBus);

    this._eventBus = eventBus;
    this._elementTemplates = elementTemplates;
    this._modeling = modeling;

    this.preExecute('shape.create', context => {
      const element = context.shape;
      const template = elementTemplates.get(element);

      if (!template) {
        return;
      }

      const generatedProps = template.properties.filter(p => p.generatedValue);

      generatedProps.forEach(p => {
        if (!getPropertyValue(element, p)) {
          return;
        }

        const value = getDefaultValue(p);

        setPropertyValue(bpmnFactory, commandStack, element, p, value);
      });
    }, true);
  }
}

GeneratedValueBehavior.$inject = [
  'eventBus',
  'elementTemplates',
  'modeling',
  'commandStack',
  'bpmnFactory'
];
