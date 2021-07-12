import BpmnPropertiesPanelRenderer from './BpmnPropertiesPanelRenderer';

import Commands from '../cmd';
import DebounceInputModule from '@bpmn-io/properties-panel/lib/features/debounce-input';

export default {
  __depends__: [
    Commands,
    DebounceInputModule
  ],
  __init__: [
    'propertiesPanel'
  ],
  propertiesPanel: [ 'type', BpmnPropertiesPanelRenderer ]
};