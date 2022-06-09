import {
  applyConditions,
  elementMeetsTemplateConditions
} from './Condition';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getPropertyValue } from './util/propertyUtil';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

const HIGH_PRIORITY = 1500;

/**
 * Goal: After element is changed, check if the template conditions are met and if not,
 * remove element's properties accordingly. If conditions were not met before but now are,
 * add element's properties accordingly.
 *
 * @todo(@barmac): use command interceptor -> to prevent `undo`
 */
export class ConditionChecker extends CommandInterceptor {
  constructor(eventBus, elementTemplates, commandStack, changeElementTemplateHelper) {
    super(eventBus);

    this._eventBus = eventBus;
    this._elementTemplates = elementTemplates;
    this._commandStack = commandStack;
    this.helper = changeElementTemplateHelper;

    // reduce template properties based on conditions
    this.preExecute('propertiesPanel.camunda.changeTemplate', HIGH_PRIORITY, this._applyConditions, true, this);

    this.postExecuted([
      'element.updateProperties', 'element.updateModdleProperties'
    ], this._applyConditionsOnChange, true, this);
  }

  _applyConditions(context) {
    const { element, newTemplate, oldTemplate } = context;

    // conditions are applied only once per change
    if (!newTemplate || templatesEqual(newTemplate, oldTemplate)) {
      return;
    }

    // TODO (@barmac): apply conditions based also on the **default** values
    const reducedTemplate = applyConditions(element, newTemplate);

    context.newTemplate = reducedTemplate;
  }

  _applyConditionsOnChange(context) {

    const {
      conditionalLogic,
      element
    } = context;

    // opt-out from changes trigger by condition checker
    if (conditionalLogic) {
      return;
    }

    const template = this._elementTemplates.get(element);

    if (!template) {
      return;
    }

    const reducedTemplate = applyConditions(element, template);

    this.helper._updateAllProps(element, template, reducedTemplate);

    this._commandStack.execute('element.updateProperties', {
      element,
      properties: {},
      conditionalLogic: true
    });
  }
}

ConditionChecker.$inject = [
  'eventBus',
  'elementTemplates',
  'commandStack',
  'changeElementTemplateHelper'
];

// function propertiesEqual(template1, template2) {
//   return template1.properties.length === template2.properties.length;
// }


// helper //////////
function templatesEqual(template1, template2) {
  if (!template1 || !template2) {
    return false;
  }

  return template1.id === template2.id && template1.version === template2.version;
}


function diffTemplateProperties(sourceTemplate, reducedTemplate) {
  return sourceTemplate.properties.filter(
    property => !reducedTemplate.properties.includes(property));
}
