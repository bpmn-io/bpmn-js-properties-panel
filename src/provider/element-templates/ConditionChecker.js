import {
  applyConditions,
  elementMeetsTemplateConditions
} from './Condition';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getPropertyValue } from './util/propertyUtil';

const HIGH_PRIORITY = 1500;

/**
 * Goal: After element is changed, check if the template conditions are met and if not,
 * remove element's properties accordingly. If conditions were not met before but now are,
 * add element's properties accordingly.
 *
 * @todo(@barmac): use command interceptor -> to prevent `undo`
 */
export class ConditionChecker extends CommandInterceptor {
  constructor(eventBus, elementTemplates) {
    super(eventBus);

    this._eventBus = eventBus;
    this._elementTemplates = elementTemplates;

    // reduce template properties based on conditions
    this.preExecute('propertiesPanel.camunda.changeTemplate', HIGH_PRIORITY, this._applyConditions, true, this);

    this.postExecuted([
      'element.updateProperties', 'element.updateModdleProperties'
    ], this._applyConditionsOnChange, true, this);
  }

  _applyConditions(context) {
    const { element, newTemplate, oldTemplate } = context;

    // conditions are applied only once per change
    if (templatesEqual(newTemplate, oldTemplate)) {
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

    const propertiesToRemove = diffTemplateProperties(template, reducedTemplate);
    const propertiesToAddOrKeep = reducedTemplate.properties;


    // if we start removing properties here, this will trigger new `element.update[Moddle]Properties`
    // which in turn triggers a new conditions check. Ideally, we should check conditions only
    // once at the end of command execution.

    debugger;

    // @barmac: We can't do this because we end up in an infinite loop.
    // this._elementTemplates.applyTemplate(element, reducedTemplate);
  }

  checkConditions(element) {
    const elementTemplate = this._elementTemplates.get(element);

    if (!elementTemplate) {
      return;
    }

    const reducedTemplate = applyConditions(element, elementTemplate);


    // template = {
    //   properties: [
    //     {
    //       id: 'method'
    //       /** GET => 1 condition not met, POST => OK */
    //     },
    //     {
    //       id: 'body',
    //       condition: {
    //         property: 'method',
    //         oneOf: [ 'POST', 'PUT', 'PATCH', 'DELETE' ]
    //     }
    //   ]
    // }

    // remove when infinite loop is solved
    return;

    if (elementMeetsTemplateConditions(element, reducedTemplate)) {
      return;
    }

    debugger;

    // We run into an infinite loop because element template returned from elementTemplates
    // is always the same, immutable object. So it's almost always different than the
    // reduced template.
    // if (propertiesEqual(reducedTemplate, elementTemplate)) {
    //   return;
    // }

    this._elementTemplates.applyTemplate(element, reducedTemplate);

    console.log('changed element', element, elementTemplate, reducedTemplate);

    console.log('new element', element.businessObject);
  }
}

ConditionChecker.$inject = [
  'eventBus',
  'elementTemplates'
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
