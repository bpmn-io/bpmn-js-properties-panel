import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  isFeelEntryEdited,
} from '@bpmn-io/properties-panel';

import { useService } from '../../../hooks';
import { FeelEntryWithVariableContextWithFeelLanguageContext } from '../../../entries/FeelEntryWithContext';
import { createOrUpdateFormalExpression } from '../../../utils/FormalExpressionUtil';

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
    return createOrUpdateFormalExpression(
      element,
      getBusinessObject(element),
      'completionCondition',
      value,
      bpmnFactory,
      commandStack
    );
  };

  return FeelEntryWithVariableContextWithFeelLanguageContext({
    element,
    id: 'completionCondition',
    label: translate('Completion condition'),
    feel: 'required',
    getValue,
    setValue,
    debounce,
  });
}