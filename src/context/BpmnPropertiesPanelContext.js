import {
  createContext
} from 'preact';

const BpmnPropertiesPanelContext = createContext({
  selectedElement: null,
  injector: null,
  getService() { return null;}
});

export default BpmnPropertiesPanelContext;