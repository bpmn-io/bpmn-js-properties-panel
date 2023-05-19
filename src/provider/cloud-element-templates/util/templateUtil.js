export {
  getVersionOrDateFromTemplate,
  removeTemplate
} from '../../element-templates/util/templateUtil';

export function unlinkTemplate(element, injector) {
  const modeling = injector.get('modeling'),
        eventBus = injector.get('eventBus');

  eventBus.fire('elementTemplates.unlink', { element });

  // remove template attributes
  modeling.updateProperties(element, {
    'zeebe:modelerTemplate': null,
    'zeebe:modelerTemplateVersion': null,
    'zeebe:modelerTemplateIcon': null
  });
}

export function updateTemplate(element, newTemplate, injector) {
  const elementTemplates = injector.get('elementTemplates'),
        eventBus = injector.get('eventBus');

  eventBus.fire('elementTemplates.update', { element, newTemplate });

  return elementTemplates.applyTemplate(element, newTemplate);
}