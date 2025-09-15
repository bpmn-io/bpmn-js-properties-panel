import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  CheckboxEntry,
  isTextFieldEntryEdited,
  TextFieldEntry,
} from '@bpmn-io/properties-panel';

import { useService } from '../../../hooks';
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
      isEdited: isTextFieldEntryEdited,
    },
    {
      id: 'cancelRemainingInstances',
      component: CancelRemainingInstances,
      isEdited: (node) => node && !node.checked // the default value is true
    },
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

  return TextFieldEntry({
    element,
    id: 'completionCondition',
    label: translate('Completion condition'),
    getValue,
    setValue,
    debounce
  });
}

function CancelRemainingInstances(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('cancelRemainingInstances');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        cancelRemainingInstances: value,
      },
    });
  };

  return CheckboxEntry({
    element,
    id: 'cancelRemainingInstances',
    label: translate('Cancel remaining instances'),
    getValue,
    setValue,
  });
}