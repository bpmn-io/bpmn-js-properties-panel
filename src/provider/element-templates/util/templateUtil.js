import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export function unlinkTemplate(element, injector) {
  const modeling = injector.get('modeling');

  modeling.updateProperties(element, {
    'camunda:modelerTemplate': null,
    'camunda:modelerTemplateVersion': null
  });
}

export function removeTemplate(element, injector) {
  const replace = injector.get('replace'),
        selection = injector.get('selection');

  const businessObject = getBusinessObject(element);

  const type = businessObject.$type,
        eventDefinitionType = getEventDefinitionType(businessObject);

  const newElement = replace.replaceElement(element, {
    type: type,
    eventDefinitionType: eventDefinitionType
  });

  selection.select(newElement);
}

export function updateTemplate(element, newTemplate, injector) {
  const commandStack = injector.get('commandStack'),
        elementTemplates = injector.get('elementTemplates');

  const oldTemplate = elementTemplates.get(element);

  commandStack.execute('propertiesPanel.camunda.changeTemplate', {
    element: element,
    newTemplate,
    oldTemplate
  });
}

function getEventDefinitionType(businessObject) {
  if (!businessObject.eventDefinitions) {
    return null;
  }

  var eventDefinition = businessObject.eventDefinitions[ 0 ];

  if (!eventDefinition) {
    return null;
  }

  return eventDefinition.$type;
}