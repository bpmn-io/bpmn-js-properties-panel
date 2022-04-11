import { getLabel, setLabel } from 'bpmn-js/lib/features/label-editing/LabelUtil';
import { createCategoryValue } from 'bpmn-js/lib/features/modeling/behavior/util/CategoryUtil';
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

function createBlankBusinessObject(element, injector) {
  const bpmnFactory = injector.get('bpmnFactory'),
        bpmnJs = injector.get('bpmnjs');

  const bo = getBusinessObject(element),
        newBo = bpmnFactory.create(bo.$type),
        label = getLabel(element);

  if (!label) {
    return newBo;
  }

  if (is(element, 'bpmn:Group')) {
    const definitions = bpmnJs.getDefinitions();
    const categoryValue = createCategoryValue(definitions, bpmnFactory);

    newBo.categoryValueRef = categoryValue;
  }

  setLabel({ businessObject: newBo }, label);

  return newBo;
}