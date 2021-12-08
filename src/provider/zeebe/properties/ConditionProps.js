import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import TextField, { isEdited as defaultIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';


export function ConditionProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:SequenceFlow')) {
    return [];
  }

  const conditionProps = [];

  if (isConditionalSource(element.source)) {
    conditionProps.push({
      id: 'conditionExpression',
      component: <ConditionExpression element={ element } />,
      isEdited: defaultIsEdited
    });
  }

  return conditionProps;
}

function ConditionExpression(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack'),
        bpmnFactory = useService('bpmnFactory'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionExpression(element);
  };

  const setValue = (value) => {
    const commands = [];

    const businessObject = getBusinessObject(element);

    // (1) If we set value to a default flow, make it a non-default flow
    // by updating the element source
    const source = element.source;

    if (source.businessObject.default === businessObject) {
      commands.push({
        cmd: 'element.updateProperties',
        context: {
          element: source,
          properties: { 'default': undefined }
        }
      });
    }

    // (2) Create and set formalExpression element containing the conditionExpression,
    // unless the provided value is empty
    const formalExpressionElement = (value && value != '') ?
      createElement(
        'bpmn:FormalExpression',
        {
          body: value
        },
        businessObject,
        bpmnFactory
      )
      : undefined;

    commands.push({
      cmd: 'element.updateProperties',
      context: {
        element: element,
        properties: {
          conditionExpression: formalExpressionElement
        }
      }
    });

    // (3) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextField({
    element,
    id: 'conditionExpression',
    label: translate('Condition expression'),
    getValue,
    setValue,
    debounce
  });
}


// helper //////////////////////////

const CONDITIONAL_SOURCES = [
  'bpmn:Activity',
  'bpmn:ExclusiveGateway'
];

function isConditionalSource(element) {
  return isAny(element, CONDITIONAL_SOURCES);
}

/**
 * getConditionExpression - get the body value of a condition expression for a given element
 *
 * @param  {ModdleElement} element
 *
 * @return {string|undefined}
 */
function getConditionExpression(element) {
  const businessObject = getBusinessObject(element);

  const conditionExpression = businessObject.conditionExpression;

  if (conditionExpression) {
    return conditionExpression.get('body');
  }
}
