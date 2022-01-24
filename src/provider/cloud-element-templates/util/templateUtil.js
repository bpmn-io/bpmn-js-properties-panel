import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { isUndefined } from 'min-dash';


export function unlinkTemplate(element, injector) {
  const modeling = injector.get('modeling');

  modeling.updateProperties(element, {
    'zeebe:modelerTemplate': null,
    'zeebe:modelerTemplateVersion': null
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

  commandStack.execute('propertiesPanel.zeebe.changeTemplate', {
    element: element,
    newTemplate,
    oldTemplate
  });
}

export function getVersionOrDateFromTemplate(template) {
  var metadata = template.metadata,
      version = template.version;

  if (metadata) {
    if (!isUndefined(metadata.created)) {
      return toDateString(metadata.created);
    } else if (!isUndefined(metadata.updated)) {
      return toDateString(metadata.updated);
    }
  }

  if (isUndefined(version)) {
    return null;
  }

  return version;
}


// helper //////
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

function toDateString(timestamp) {
  var date = new Date(timestamp);

  var year = date.getFullYear();

  var month = leftPad(String(date.getMonth() + 1), 2, '0');

  var day = leftPad(String(date.getDate()), 2, '0');

  return day + '.' + month + '.' + year;
}

function leftPad(string, length, character) {
  while (string.length < length) {
    string = character + string;
  }

  return string;
}
