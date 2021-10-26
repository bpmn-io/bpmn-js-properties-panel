import {
  ArrowIcon,
  CreateIcon
} from '@bpmn-io/properties-panel/lib/components/icons';

import { useLayoutState } from '@bpmn-io/properties-panel/lib/hooks';

import classnames from 'classnames';

import {
  useService
} from '../../../hooks';
import { getTemplateId } from '../Helper';

/**
 * @typedef {NoTemplate|KnownTemplate|UnknownTemplate|OutdatedTemplate} TemplateState
 */

/**
 * @typedef NoTemplate
 * @property {'NO_TEMPLATE'} type
 *
 * @typedef KnownTemplate
 * @property {'KNOWN_TEMPLATE'} type
 * @property {object} template
 *
 * @typedef UnknownTemplate
 * @property {'UNKNOWN_TEMPLATE'} type
 * @property {string} templateId
 *
 * @typedef OutdatedTemplate
 * @property {'OUTDATED_TEMPLATE'} type
 * @property {object} template
 * @property {object} newerTemplate
 */


export function ElementTemplatesGroup(props) {
  const {
    id,
    label,
    element,
    entries = []
  } = props;

  const [ open, setOpen ] = useLayoutState(
    [ 'groups', id, 'open' ],
    false
  );

  const empty = !entries.length;

  const toggleOpen = () => !empty && setOpen(!open);

  return <div class="bio-properties-panel-group" data-group-id={ 'group-' + id }>
    <div class={ classnames(
      'bio-properties-panel-group-header',
      {
        empty,
        open: open && !empty
      }
    ) } onClick={ toggleOpen }
    >
      <div title={ label } class="bio-properties-panel-group-header-title">
        { label }
      </div>

      <div class="bio-properties-panel-group-header-buttons">
        <TemplateGroupButtons element={ element } />
        { !empty && <SectionToggle open={ open } /> }
      </div>
    </div>

    <div class={ classnames(
      'bio-properties-panel-group-entries',
      { open: open && !empty }
    ) }>
      {
        entries.map(e => e.component)
      }
    </div>
  </div>;
}


/**
 *
 * @param {object} props
 * @param {TemplateState} props.templateState
 * @param {object} props.element
 */
function TemplateGroupButtons({ element }) {
  const elementTemplates = useService('elementTemplates');

  const templateState = getTemplateState(elementTemplates, element);

  if (templateState.type === 'NO_TEMPLATE') {
    return <SelectTemplate element={ element } />;
  }

  return null;
}


function SectionToggle({ open }) {
  return <button
    title="Toggle section"
    class="bio-properties-panel-group-header-button bio-properties-panel-arrow"
  >
    <ArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
  </button>;
}

function SelectTemplate({ element }) {
  const translate = useService('translate');
  const eventBus = useService('eventBus');

  const selectTemplate = () => eventBus.fire('elementTemplates.select', { element });

  return (
    <button
      title="Select a template"
      class="bio-properties-panel-group-header-button bio-properties-panel-select-template-button"
      onClick={ selectTemplate }
    >
      <CreateIcon />
      <label class="bio-properties-panel-select-template-button-label">
        { translate('Select') }
      </label>
    </button>
  );
}


// helper //////

/**
 * Determine template state in the current element.
 *
 * @param {object} elementTemplates
 * @param {object} element
 * @returns {TemplateState}
 */
function getTemplateState(elementTemplates, element) {
  const templateId = getTemplateId(element),
        template = elementTemplates.get(templateId);

  if (!templateId) {
    return { type: 'NO_TEMPLATE' };
  }

  if (!template) {
    return { type: 'UNKNOWN_TEMPLATE', templateId };
  }

  const newerTemplate = findNewerTemplate(elementTemplates, template);
  if (newerTemplate) {
    return { type: 'OUTDATED_TEMPLATE', template, newerTemplate };
  }

  return { type: 'KNOWN_TEMPLATE', template };
}

function findNewerTemplate(elementTemplates, template) {
  const templates = elementTemplates.getAll();

  return templates.find(currentTemplate => currentTemplate.version > template.version);
}
