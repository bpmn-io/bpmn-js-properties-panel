import {
  useContext
} from 'preact/hooks';

import { BpmnPropertiesPanelContext } from '../context';


export default function(type, strict) {
  const {
    getService
  } = useContext(BpmnPropertiesPanelContext);

  return getService(type, strict);
}