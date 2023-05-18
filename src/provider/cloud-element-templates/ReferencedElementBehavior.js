import { getBusinessObject, isAny } from 'bpmn-js/lib/util/ModelUtil';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { isString } from 'min-dash';

import { findMessage, getTemplateId, TEMPLATE_ID_ATTR } from './Helper';
import {
  getReferringElement,
  removeRootElement
} from './util/rootElementUtil';

/**
 * Handles referenced elements.
 */
export class ReferencedElementBehavior extends CommandInterceptor {
  constructor(eventBus, elementTemplates, modeling, injector, moddleCopy, bpmnFactory) {
    super(eventBus);

    this._eventBus = eventBus;
    this._elementTemplates = elementTemplates;
    this._modeling = modeling;
    this._injector = injector;

    this.postExecuted([
      'element.updateProperties', 'element.updateModdleProperties'
    ], this._handlePropertiesUpdate, true, this);

    this.postExecuted('shape.replace', this._handleReplacement, true, this);

    this.postExecuted('shape.delete', this._handleRemoval, true, this);


    // copy templated root element when pasting
    eventBus.on('copyPaste.pasteElement', function(context) {
      const {
        referencedRootElement
      } = context.descriptor;

      if (!referencedRootElement) {
        return;
      }

      if (!getTemplateId(referencedRootElement)) {
        return;
      }

      context.descriptor.referencedRootElement = moddleCopy.copyElement(
        referencedRootElement,
        bpmnFactory.create(referencedRootElement.$type)
      );
    });
  }

  /**
   * Unlink referenced element when template is unlinked.
   */
  _handlePropertiesUpdate(context) {
    const { element, properties } = context;

    if (!canHaveReferencedElement(element)) {
      return;
    }

    if (!(TEMPLATE_ID_ATTR in properties) || isString(properties[TEMPLATE_ID_ATTR])) {
      return;
    }

    const bo = getBusinessObject(element);
    const message = findMessage(bo);

    if (message && getTemplateId(message)) {
      this._modeling.updateModdleProperties(element, message, {
        [TEMPLATE_ID_ATTR]: null
      });
    }
  }

  /**
   * Remove referenced element when template is removed.
   * Keep referenced element when template is replaced.
   */
  _handleReplacement(context) {
    const { oldShape, newShape } = context;
    const oldTemplate = getTemplateId(oldShape),
          newTemplate = getTemplateId(newShape);

    if (!canHaveReferencedElement(oldShape) || !oldTemplate) {
      return;
    }

    const bo = getBusinessObject(oldShape);
    const message = findMessage(bo);

    if (!message || !getTemplateId(message)) {
      return;
    }

    if (!canHaveReferencedElement(newShape) || !newTemplate) {
      removeRootElement(message, this._injector);
      return;
    }

    this._addMessage(newShape, message);
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
      removeRootElement(message, this._injector);
    }
  }

  _addMessage(element, message) {
    const bo = getReferringElement(element);

    this._modeling.updateModdleProperties(element, bo, {
      'messageRef': message
    });
  }
}

ReferencedElementBehavior.$inject = [
  'eventBus',
  'elementTemplates',
  'modeling',
  'injector',
  'moddleCopy',
  'bpmnFactory'
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
