import { createElement } from './ElementUtil';

/**
 * createOrUpdateFormalExpression - upserts a specific formal expression
 *
 * If the value is falsy, the formal expression is removed.
 *
 * @param {djs.model.Base} element
 * @param {ModdleElement} moddleElement
 * @param {string} propertyName
 * @param {string} newValue
 * @param {BpmnFactory} bpmnFactory
 * @param {CommandStack} commandStack
 */
export function createOrUpdateFormalExpression(
    element,
    moddleElement,
    propertyName,
    newValue,
    bpmnFactory,
    commandStack
) {
  return commandStack.execute(
    'element.updateModdleProperties',
    createOrUpdateFormalExpressionCommand(
      element,
      moddleElement,
      propertyName,
      newValue,
      bpmnFactory
    )
  );
}

/**
 * createOrUpdateFormalExpressionCommand - creates a command to upsert a specific formal expression
 *
 * If the value is falsy, the formal expression is removed.
 *
 * @param {djs.model.Base} element
 * @param {ModdleElement} moddleElement
 * @param {string} propertyName
 * @param {string} newValue
 * @param {BpmnFactory} bpmnFactory
 */
export function createOrUpdateFormalExpressionCommand(
    element,
    moddleElement,
    propertyName,
    newValue,
    bpmnFactory
) {
  const expressionProps = {};

  if (!newValue) {

    // remove formal expression
    expressionProps[propertyName] = undefined;

    return {
      element,
      moddleElement,
      properties: expressionProps,
    };
  }

  const existingExpression = moddleElement.get(propertyName);
  if (existingExpression) {

    // edit existing formal expression
    return {
      element,
      moddleElement: existingExpression,
      properties: {
        body: newValue,
      },
    };
  }

  // add formal expression
  expressionProps[propertyName] = createElement(
    'bpmn:FormalExpression',
    { body: newValue },
    moddleElement,
    bpmnFactory
  );

  return {
    element,
    moddleElement,
    properties: expressionProps,
  };
}
