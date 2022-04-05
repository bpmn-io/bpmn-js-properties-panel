export {
  getVersionOrDateFromTemplate,
  removeTemplate
} from '../../element-templates/util/templateUtil';

export function unlinkTemplate(element, injector) {
  const modeling = injector.get('modeling');

  // remove template attributes
  modeling.updateProperties(element, {
    'zeebe:modelerTemplate': null,
    'zeebe:modelerTemplateVersion': null,
    'zeebe:modelerTemplateIcon': null
  });
}

export function updateTemplate(element, newTemplate, injector) {
  const elementTemplates = injector.get('elementTemplates');

  return elementTemplates.applyTemplate(element, newTemplate);
}