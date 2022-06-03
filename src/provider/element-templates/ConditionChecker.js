import {
  applyConditions,
  elementMeetsTemplateConditions
} from './Condition';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

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

    this.postExecuted('element.updateModdleProperties', this._applyConditionsOnChange, true, this);
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

    debugger;
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


