import { findExtension } from '../Helper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { without } from 'min-dash';

export {
  getVersionOrDateFromTemplate,
  removeTemplate
} from '../../element-templates/util/templateUtil';

export function unlinkTemplate(element, injector) {
  const modeling = injector.get('modeling');

  // (1) remove template attributes
  modeling.updateProperties(element, {
    'zeebe:modelerTemplate': null,
    'zeebe:modelerTemplateVersion': null
  });


  // (2) remove template icon
  const icon = findExtension(element, 'zeebe:ModelerTemplateIcon');

  if (icon) {
    const extensionElements = getBusinessObject(element).get('extensionElements');
    modeling.updateModdleProperties(element, extensionElements, {
      values: without(extensionElements.get('values'), extension => extension === icon)
    });
  }
}

export function updateTemplate(element, newTemplate, injector) {
  const elementTemplates = injector.get('elementTemplates');

  return elementTemplates.applyTemplate(element, newTemplate);
}