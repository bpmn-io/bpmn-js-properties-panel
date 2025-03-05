import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { createElement } from './ElementUtil';

/**
 * createOrUpdateFormalExpression - upserts a specific formal expression
 *
 * If the value is falsy, the formal expression is removed.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 * @param {string} newValue
 * @param {BpmnFactory} bpmnFactory
 * @param {CommandStack} commandStack
 */
export function createOrUpdateFormalExpression(
    element,
    propertyName,
    newValue,
    bpmnFactory,
    commandStack
) {
  return commandStack.execute(
    'element.updateModdleProperties',
    createOrUpdateFormalExpressionCommand(element, propertyName, newValue, bpmnFactory)
  );
}

/**
 * createOrUpdateFormalExpression - creates a commant to upsert a specific formal expression
 *
 * If the value is falsy, the formal expression is removed.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 * @param {string} newValue
 * @param {BpmnFactory} bpmnFactory
 */
export function createOrUpdateFormalExpressionCommand(
    element,
    propertyName,
    newValue,
    bpmnFactory
) {
  const businessObject = getBusinessObject(element);
  const expressionProps = {};

  if (!newValue) {

    // remove formal expression
    expressionProps[propertyName] = undefined;

    return {
      element,
      moddleElement: businessObject,
      properties: expressionProps,
    };
  }

  const existingExpression = businessObject.get(propertyName);
  if (!existingExpression) {

    // add formal expression
    expressionProps[propertyName] = createElement(
      'bpmn:FormalExpression',
      { body: newValue },
      businessObject,
      bpmnFactory
    );

    return {
      element,
      moddleElement: businessObject,
      properties: expressionProps,
    };
  }

  // edit existing formal expression
  return {
    element,
    moddleElement: existingExpression,
    properties: {
      body: newValue,
    },
  };
}
