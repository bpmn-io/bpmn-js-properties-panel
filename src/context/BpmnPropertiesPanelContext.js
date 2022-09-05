import {
  createContext
} from '@bpmn-io/properties-panel/preact';

const BpmnPropertiesPanelContext = createContext({
  selectedElement: null,
  injector: null,
  getService() { return null;},
  variableContext: {}
});

export default BpmnPropertiesPanelContext;