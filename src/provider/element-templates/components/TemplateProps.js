import { useService } from '../../../hooks';

import { getVersionOrDateFromTemplate } from '../util/templateUtil';

export function TemplateProps({ element, elementTemplates }) {
  const template = elementTemplates.get(element);

  if (!template) {
    return [];
  }

  return [
    {
      id: 'template-name',
      component: <TemplateName id="template-name" template={ template } />
    },
    {
      id: 'template-version',
      component: <TemplateVersion id="template-version" template={ template } />
    },
    {
      id: 'template-description',
      component: <TemplateDescription id="template-description" template={ template } />
    }
  ].filter(entry => !!entry.component);
}

function TemplateName({ id, template }) {
  const translate = useService('translate');

  return <TextEntry id={ id } label={ translate('Name') } content={ template.name } />;
}

function TemplateVersion({ id, template }) {
  const translate = useService('translate');

  const version = getVersionOrDateFromTemplate(template);

  return version ? <TextEntry id={ id } label={ translate('Version') } content={ version } /> : null;
}

function TemplateDescription({ id, template }) {
  const translate = useService('translate');

  const { description } = template;

  return description ?
    <TextEntry id={ id } label={ translate('Description') } content={ template.description } /> :
    null;
}

function TextEntry({ id, label, content }) {
  return <div data-entry-id={ id } class="bio-properties-panel-entry bio-properties-panel-text-entry">
    <span class="bio-properties-panel-label">{ label }</span>
    <span class="bio-properties-panel-text-entry__content">{ content }</span>
  </div>;
}
