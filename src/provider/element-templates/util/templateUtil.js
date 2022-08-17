import { getLabel, setLabel } from 'bpmn-js/lib/features/label-editing/LabelUtil';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

import { isUndefined } from 'min-dash';


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

  const newBusinessObject = createBlankBusinessObject(element, injector);

  const newElement = replace.replaceElement(element, {
    type: type,
    businessObject: newBusinessObject,
    eventDefinitionType: eventDefinitionType
  });

  selection.select(newElement);
}

export function updateTemplate(element, newTemplate, injector) {
  const elementTemplates = injector.get('elementTemplates');

  return elementTemplates.applyTemplate(element, newTemplate);
}

export function getVersionOrDateFromTemplate(template) {
  const metadata = template.metadata,
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


// helper ///////////

function getEventDefinitionType(businessObject) {
  if (!businessObject.eventDefinitions) {
    return null;
  }

  const eventDefinition = businessObject.eventDefinitions[ 0 ];

  if (!eventDefinition) {
    return null;
  }

  return eventDefinition.$type;
}

/**
 * Example: 01.01.1900 01:01
 *
 * @param {number} timestamp
 * @returns {string}
 */
function toDateString(timestamp) {
  const date = new Date(timestamp);

  const year = date.getFullYear();

  const month = withLeadingZeros(String(date.getMonth() + 1));

  const day = withLeadingZeros(String(date.getDate()));

  const hours = withLeadingZeros(String(date.getHours()));

  const minutes = withLeadingZeros(String(date.getMinutes()));

  return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
}

function withLeadingZeros(string) {
  return leftPad(string, 2, '0');
}

function leftPad(string, length, character) {
  while (string.length < length) {
    string = character + string;
  }

  return string;
}

function createBlankBusinessObject(element, injector) {
  const bpmnFactory = injector.get('bpmnFactory');

  const bo = getBusinessObject(element),
        newBo = bpmnFactory.create(bo.$type),
        label = getLabel(element);

  if (!label) {
    return newBo;
  }

  if (is(element, 'bpmn:Group')) {
    newBo.categoryValueRef = bpmnFactory.create('bpmn:CategoryValue');
  }

  setLabel({ businessObject: newBo }, label);

  return newBo;
}