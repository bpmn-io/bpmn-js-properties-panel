import BpmnPropertiesPanelViewerRenderer from './BpmnPropertiesPanelViewerRenderer';

/**
 * Read-only properties panel. Does not require any editing features, i.e.
 * neither commands, debounce nor the FEEL popup.
 */
export default {
  __init__: [
    'propertiesPanel'
  ],
  propertiesPanel: [ 'type', BpmnPropertiesPanelViewerRenderer ]
};
