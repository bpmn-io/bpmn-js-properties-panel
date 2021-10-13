import { is } from 'bpmn-js/lib/util/ModelUtil';

/**
 * This function catches the <moddleCopy.canCopyProperty> event
 * and only allows the copy of the modelerTemplate property
 * if the element's type or its parent's is in
 * the list of elements the template applies to.
 */
export default function ReplaceBehavior(elementTemplates, eventBus) {
  eventBus.on('moddleCopy.canCopyProperty', function(context) {
    const {
      parent,
      property,
      propertyName
    } = context;

    if (propertyName !== 'modelerTemplate') {
      return;
    }

    const elementTemplate = elementTemplates.get(property);

    if (!elementTemplate) {
      return false;
    }

    const { appliesTo } = elementTemplate;

    const allowed = appliesTo.reduce((allowed, type) => {
      return allowed || is(parent, type);
    }, false);

    if (!allowed) {
      return false;
    }
  });
}

ReplaceBehavior.$inject = [
  'elementTemplates',
  'eventBus'
];
