export {
  getVersionOrDateFromTemplate,
  removeTemplate
} from '../../element-templates/util/templateUtil';

export function unlinkTemplate(element, injector) {
  const modeling = injector.get('modeling');

  modeling.updateProperties(element, {
    'zeebe:modelerTemplate': null,
    'zeebe:modelerTemplateVersion': null
  });
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