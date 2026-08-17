import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

export default function CustomHeader(props) {
  const {
    element,
    headerProvider,
    eventBus
  } = props;

  const {
    getElementLabel,
    getTypeLabel
  } = headerProvider;

  const label = getElementLabel(element) || (element.businessObject && element.businessObject.name) || element.id || '';
  const type = getTypeLabel(element);

  // Format type nicely like "Pool" for bpmn:Participant or raw type
  let formattedType = type;
  if (is(element, 'bpmn:Participant')) {
    formattedType = 'Pool';
  } else if (element.type) {
    const rawType = element.type.replace(/^bpmn:/, '');
    if (rawType) {
      formattedType = rawType;
    }
  }

  const elementId = element.id || '';
  const subtitle = `Type:${formattedType}${elementId ? ` (${elementId})` : ''}`;

  const handleClose = (e) => {
    e.preventDefault();
    if (eventBus) {
      eventBus.fire('propertiesPanel.close', { element });
    }
  };

  return (
    <div class="bio-properties-panel-header bio-properties-panel-custom-header">
      <div class="bio-properties-panel-header-eyebrow">
        PROPERTIES PANEL
      </div>

      <h1 class="bio-properties-panel-header-title" title={ label }>
        { label }
      </h1>

      <div class="bio-properties-panel-header-bottom">
        <div class="bio-properties-panel-header-subtitle" title={ subtitle }>
          { subtitle }
        </div>

        <button
          type="button"
          class="bio-properties-panel-close-btn"
          onClick={ handleClose }
          title="Close"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
