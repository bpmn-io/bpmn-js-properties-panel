import {
  useContext
} from '@bpmn-io/properties-panel/preact/hooks';

import { BpmnPropertiesPanelContext } from '../context';

export function useService(type, strict) {
  const {
    getService
  } = useContext(BpmnPropertiesPanelContext);

  return getService(type, strict);
}