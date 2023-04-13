import { getBusinessObject, isAny } from 'bpmn-js/lib/util/ModelUtil';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { findMessage, getTemplateId, TEMPLATE_ID_ATTR } from './Helper';

/**
 * Handles referenced elements.
 */
export class ReferencedElementBehavior extends CommandInterceptor {
  constructor(eventBus, elementTemplates, modeling, canvas, bpmnjs) {
    super(eventBus);

    this._eventBus = eventBus;
    this._elementTemplates = elementTemplates;
    this._modeling = modeling;
    this._canvas = canvas;
    this._bpmnjs = bpmnjs;

    this.postExecuted([
      'element.updateProperties', 'element.updateModdleProperties'
    ], this._handlePropertiesUpdate, true, this);

    this.postExecuted('shape.replace', this._handleReplacement, true, this);

    this.postExecuted('shape.delete', this._handleRemoval, true, this);
  }

  /**
   * Remove template id from referenced element when template is unlinked.
   */
  _handlePropertiesUpdate(context) {
    const { element } = context;

    if (!canHaveReferencedElement(element)) {
      return;
    }

    if (getTemplateId(element)) {
      return;
    }

    const bo = getBusinessObject(element);
    const message = findMessage(bo);

    if (message && getTemplateId(message)) {
      this._modeling.updateModdleProperties(element, message, {
        [TEMPLATE_ID_ATTR]: undefined
      });
    }
  }

  /**
   * Remove referenced element when template is removed.
   */
  _handleReplacement(context) {
    const { oldShape } = context;

    if (!canHaveReferencedElement(oldShape)) {
      return;
    }

    const bo = getBusinessObject(oldShape);
    const message = findMessage(bo);

    if (!message || !getTemplateId(message)) {
      return;
    }

    this._removeRootElement(message);
  }

  _handleRemoval(context) {
    const { shape } = context;

    if (isLabel(shape)) {
      return;
    }

    if (!canHaveReferencedElement(shape)) {
      return;
    }

    if (!getTemplateId(shape)) {
      return;
    }

    const bo = getBusinessObject(shape);
    const message = findMessage(bo);

    if (message && getTemplateId(message)) {
      this._removeRootElement(message);
    }
  }

  _removeRootElement(rootElement) {
    const element = this._canvas.getRootElement();
    const definitions = this._bpmnjs.getDefinitions();
    const rootElements = definitions.get('rootElements');

    this._modeling.updateModdleProperties(element, definitions, {
      rootElements: rootElements.filter(e => e !== rootElement)
    });
  }
}

ReferencedElementBehavior.$inject = [
  'eventBus',
  'elementTemplates',
  'modeling',
  'canvas',
  'bpmnjs'
];

function canHaveReferencedElement(element) {
  return isAny(element, [
    'bpmn:ReceiveTask',
    'bpmn:SendTask',
    'bpmn:Event'
  ]);
}

function isLabel(element) {
  return element.type === 'label';
}
