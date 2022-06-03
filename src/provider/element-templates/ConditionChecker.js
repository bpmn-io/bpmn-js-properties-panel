import {
  applyConditions,
  elementMeetsTemplateConditions
} from './Condition';

/**
 * Goal: After element is changed, check if the template conditions are met and if not,
 * remove element's properties accordingly. If conditions were not met before but now are,
 * add element's properties accordingly.
 *
 * @todo(@barmac): use command interceptor -> to prevent `undo`
 */
export class ConditionChecker {
  constructor(eventBus, elementTemplates) {
    this._eventBus = eventBus;
    this._elementTemplates = elementTemplates;

    eventBus.on('elements.changed', ({ elements }) => {
      elements.forEach(element => {
        this.checkConditions(element);
      });
    });
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
