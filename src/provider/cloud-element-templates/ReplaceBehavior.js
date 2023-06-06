import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

/**
 * This Behavior checks if the new element's type is in
 * the list of elements the template applies to and unlinks
 * it if not.
 */
export default class ReplaceBehavior extends CommandInterceptor {
  constructor(elementTemplates, injector) {
    super(injector.get('eventBus'));

    this.postExecuted('shape.replace', function(e) {
      var context = e.context,
          oldShape = context.oldShape,
          oldBo = getBusinessObject(oldShape),
          newShape = context.newShape,
          newBo = getBusinessObject(newShape);

      if (!oldBo.modelerTemplate) {
        return;
      }

      const template = newBo.modelerTemplate;
      const version = newBo.modelerTemplateVersion;

      const elementTemplate = elementTemplates.get(template, version);

      if (!elementTemplate) {
        elementTemplates.unlinkTemplate(newShape);
        return;
      }

      const { appliesTo, elementType } = elementTemplate;

      if (elementType) {
        if (!is(newShape, elementType.value) || shouldUnlinkEvent(newShape, elementType)) {
          elementTemplates.unlinkTemplate(newShape);
        }

        return;
      }

      const allowed = appliesTo.reduce((allowed, type) => {
        return allowed || is(newBo, type);
      }, false);

      if (!allowed) {
        elementTemplates.unlinkTemplate(newShape);
      }
    });
  }
}

ReplaceBehavior.$inject = [
  'elementTemplates',
  'injector'
];

function shouldUnlinkEvent(newShape, elementType) {
  if (!is(newShape, 'bpmn:Event')) {
    return false;
  }

  const { eventDefinition } = elementType,
        bo = getBusinessObject(newShape),
        eventDefinitions = bo.get('eventDefinitions');

  if (!eventDefinition) {
    return eventDefinitions.length !== 0;
  }

  return !is(eventDefinitions[0], eventDefinition);
}
