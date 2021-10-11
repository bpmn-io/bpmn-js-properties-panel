import { CreateIcon } from '@bpmn-io/properties-panel/lib/components/icons';

import {
  useService
} from '../../../hooks';


/**
 * @param {import('@bpmn-io/properties-panel').GroupDefinition} props
 */
export default function ElementTemplatesGroup(props) {
  const {
    id,
    label,
    element
  } = props;

  const eventBus = useService('eventBus');

  const selectTemplate = () => {
    eventBus.fire('elementTemplates.select', { element });
  };

  return <div class="bio-properties-panel-group" data-group-id={ 'group-' + id }>
    <div class="bio-properties-panel-group-header">
      <div title={ label } class="bio-properties-panel-group-header-title">
        { label }
      </div>

      <div class="bio-properties-panel-group-header-buttons">
        <SelectTemplate onClick={ selectTemplate } />
      </div>
    </div>
  </div>;
}

function SelectTemplate(props) {
  const translate = useService('translate');

  return (
    <button
      title="Select a template"
      class="bio-properties-panel-group-header-button bio-properties-panel-select-template-button"
      onClick={ props.onClick }
    >
      <CreateIcon />
      <label class="bio-properties-panel-select-template-button-label">
        { translate('Select') }
      </label>
    </button>
  );
}
