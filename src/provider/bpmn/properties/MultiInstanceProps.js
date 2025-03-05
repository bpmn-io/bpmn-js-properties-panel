import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  createOrUpdateFormalExpression
} from '../../../utils/FormalExpressionUtil';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function MultiInstanceProps(props) {
  const {
    element
  } = props;

  if (!isMultiInstanceSupported(element)) {
    return [];
  }

  const entries = [
    {
      id: 'loopCardinality',
      component: LoopCardinality,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'completionCondition',
      component: CompletionCondition,
      isEdited: isTextFieldEntryEdited
    }
  ];

  return entries;
}

function LoopCardinality(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    return getLoopCardinalityValue(element);
  };

  const setValue = (value) => {
    return createOrUpdateFormalExpression(
      element,
      getLoopCharacteristics(element),
      'loopCardinality',
      value,
      bpmnFactory,
      commandStack
    );
  };

  return TextFieldEntry({
    element,
    id: 'loopCardinality',
    label: translate('Loop cardinality'),
    getValue,
    setValue,
    debounce
  });
}

function CompletionCondition(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    return getCompletionConditionValue(element);
  };

  const setValue = (value) => {
    return createOrUpdateFormalExpression(
      element,
      getLoopCharacteristics(element),
      'completionCondition',
      value,
      bpmnFactory,
      commandStack
    );
  };

  return TextFieldEntry({
    element,
    id: 'completionCondition',
    label: translate('Completion condition'),
    getValue,
    setValue,
    debounce
  });
}


// helper ////////////////////////////

// generic ///////////////////////////

/**
 * isMultiInstanceSupported - check whether given element supports MultiInstanceLoopCharacteristics.
 *
 * @param {djs.model.Base} element
 * @return {boolean}
 */
function isMultiInstanceSupported(element) {
  const loopCharacteristics = getLoopCharacteristics(element);
  return !!loopCharacteristics && is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics');
}

/**
 * getBody - get the body of a given expression.
 *
 * @param {ModdleElement<bpmn:FormalExpression>} expression
 * @return {string} the body (value) of the expression
 */
function getBody(expression) {
  return expression && expression.get('body');
}

/**
 * getProperty - get a property value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 *
 * @return {any} the property value
 */
function getProperty(element, propertyName) {
  const loopCharacteristics = getLoopCharacteristics(element);
  return loopCharacteristics && loopCharacteristics.get(propertyName);
}

/**
 * getLoopCharacteristics - get loopCharacteristics of a given element.
 *
 * @param {djs.model.Base} element
 * @return {ModdleElement<bpmn:MultiInstanceLoopCharacteristics> | undefined}
 */
function getLoopCharacteristics(element) {
  const bo = getBusinessObject(element);
  return bo.loopCharacteristics;
}

// loopCardinality

/**
 * getLoopCardinality - get the loop cardinality of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the loop cardinality
 */
function getLoopCardinality(element) {
  return getProperty(element, 'loopCardinality');
}

/**
 * getLoopCardinalityValue - get the loop cardinality value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the loop cardinality value
 */
function getLoopCardinalityValue(element) {
  const loopCardinality = getLoopCardinality(element);
  return getBody(loopCardinality);
}

// completionCondition /////////////////////

/**
 * getCompletionCondition - get the completion condition of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the completion condition
 */
function getCompletionCondition(element) {
  return getProperty(element, 'completionCondition');
}

/**
 * getCompletionConditionValue - get the completion condition value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the completion condition value
 */
function getCompletionConditionValue(element) {
  const completionCondition = getCompletionCondition(element);
  return getBody(completionCondition);
}
