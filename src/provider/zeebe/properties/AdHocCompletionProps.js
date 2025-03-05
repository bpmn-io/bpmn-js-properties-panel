import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  isFeelEntryEdited,
} from '@bpmn-io/properties-panel';

import { createElement } from '../../../utils/ElementUtil';

import { useService } from '../../../hooks';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function AdHocCompletionProps(props) {
  const { element } = props;

  if (!is(element, 'bpmn:AdHocSubProcess')) {
    return [];
  }

  return [
    {
      id: 'completionCondition',
      component: CompletionCondition,
      isEdited: isFeelEntryEdited,
    }
  ];
}

function CompletionCondition(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    const expression = getBusinessObject(element).get('completionCondition');
    return expression && expression.get('body');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      updateFormalExpression(element, 'completionCondition', value, bpmnFactory)
    );
  };

  return FeelEntryWithVariableContext({
    element,
    id: 'completionCondition',
    label: translate('Completion condition'),
    feel: 'required',
    getValue,
    setValue,
    debounce,
  });
}

// helper ////////////////////////////

// formal expression /////////////////

/**
 * updateFormalExpression - updates a specific formal expression
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 * @param {string} newValue
 * @param {BpmnFactory} bpmnFactory
 */
function updateFormalExpression(element, propertyName, newValue, bpmnFactory) {
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
