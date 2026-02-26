import BpmnPropertiesPanelRenderer from './BpmnPropertiesPanelRenderer';
import DefaultHeaderProviderModule from './DefaultHeaderProviderModule';

import Commands from '../cmd';
import { DebounceInputModule, FeelPopupModule } from '@bpmn-io/properties-panel';

export default {
  __depends__: [
    Commands,
    DebounceInputModule,
    FeelPopupModule,
    DefaultHeaderProviderModule
  ],
  __init__: [
    'propertiesPanel'
  ],
  propertiesPanel: [ 'type', BpmnPropertiesPanelRenderer ]
};