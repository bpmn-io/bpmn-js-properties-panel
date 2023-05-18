import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';
import { findMessage } from '../Helper';

export function removeRootElement(rootElement, injector) {
  const modeling = injector.get('modeling'),
        canvas = injector.get('canvas'),
        bpmnjs = injector.get('bpmnjs');

  const element = canvas.getRootElement(),
        definitions = bpmnjs.getDefinitions(),
        rootElements = definitions.get('rootElements');

  const newRootElements = rootElements.filter(e => e !== rootElement);

  // short-circuit to prevent unnecessary updates
  if (newRootElements.length === rootElements.length) {
    return;
  }

  modeling.updateModdleProperties(element, definitions, {
    rootElements: newRootElements
  });
}

/**
 * Remove message from element and the diagram.
 *
 * @param {import('bpmn-js/lib/model/Types').Element} element
 * @param {import('didi').Injector} injector
 */
export function removeMessage(element, injector) {
  const modeling = injector.get('modeling');

  const bo = getReferringElement(element);

  const message = findMessage(bo);

  if (!message) {
    return;
  }

  modeling.updateModdleProperties(element, bo, {
    messageRef: undefined
  });
  removeRootElement(message, injector);
}


export function getReferringElement(element) {
  const bo = getBusinessObject(element);

  if (is(bo, 'bpmn:Event')) {
    return bo.get('eventDefinitions')[0];
  }

  return bo;
}
