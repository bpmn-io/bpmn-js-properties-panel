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

import TextArea, { isEdited as textAreaIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextArea';
import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';
import Select, { isEdited as selectIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/Select';

/**
 * Defines condition properties for conditional sequence flow.
 * Cf. https://docs.camunda.org/manual/latest/reference/bpmn20/gateways/sequence-flow/
 */
export function ConditionProps(props) {
  const { element } = props;

  if (!is(element, 'bpmn:SequenceFlow') || !isConditionalSource(element.source)) {
    return [];
  }

  const entries = [];

  entries.push({
    id: 'conditionType',
    component: <ConditionType element={ element } />,
    isEdited: selectIsEdited
  });

  const conditionType = getConditionType(element);

  if (conditionType === 'script') {
    entries.push(
      ...ConditionScriptProps({ element })
    );
  } else if (conditionType === 'expression') {
    entries.push({
      id: 'conditionExpression',
      component: <ConditionExpression element={ element } />,
      isEdited: textFieldIsEdited
    });
  }

  return entries;
}


function ConditionType(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);


  const getValue = () => {
    return getConditionType(element);
  };

  const setValue = (value) => {
    const commands = [];

    // (1) Remove formalExpression if <none> is selected
    if (value === '') {
      commands.push({
        cmd: 'element.updateProperties',
        context: {
          element: element,
          properties: {
            conditionExpression: undefined
          }
        }
      });
    } else {

      // (2) If we set value to a default flow, make it a non-default flow
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

      // (3) Create and set formalExpression element containing the conditionExpression
      const attributes = {
        body: '',
        language: value === 'script' ? '' : undefined,
      };
      const formalExpressionElement = createElement(
        'bpmn:FormalExpression',
        attributes,
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateProperties',
        context: {
          element: element,
          properties: {
            conditionExpression: formalExpressionElement
          }
        }
      });
    }

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const getOptions = () => ([
    { value: '', label: translate('<none>') },
    { value: 'script', label: translate('Script') },
    { value: 'expression', label: translate('Expression') }
  ]);

  return <Select
    element={ element }
    id="conditionType"
    label={ translate('Type') }
    getValue={ getValue }
    setValue={ setValue }
    getOptions={ getOptions }
  />;
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
    return getConditionExpression(element).get('body');
  };

  const setValue = (value) => {
    const businessObject = getBusinessObject(element);
    const conditionExpression = createElement(
      'bpmn:FormalExpression',
      {
        body: value
      },
      businessObject,
      bpmnFactory
    );

    commandStack.execute('properties-panel.update-businessobject', {
      element,
      businessObject,
      properties: { conditionExpression }
    });
  };

  return <TextField
    element={ element }
    id="conditionExpression"
    label={ translate('Condition Expression') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function ConditionScriptProps(props) {
  const { element } = props;

  const entries = [];
  const scriptType = getScriptType(element);

  // (1) language
  entries.push({
    id: 'conditionScriptLanguage',
    component: <Language element={ element } />,
    isEdited: textFieldIsEdited
  });

  // (2) type
  entries.push({
    id: 'conditionScriptType',
    component: <ScriptType element={ element } />,
    isEdited: selectIsEdited
  });

  // (3) script
  if (scriptType === 'script') {
    entries.push({
      id: 'conditionScriptValue',
      component: <Script element={ element } />,
      isEdited: textAreaIsEdited
    });
  } else if (scriptType === 'resource') {

    // (4) resource
    entries.push({
      id: 'conditionScriptResource',
      component: <Resource element={ element } />,
      isEdited: textFieldIsEdited
    });
  }

  return entries;
}

function Language(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionExpression(element).get('language');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: getConditionExpression(element),
      properties: {
        language: value || ''
      }
    });
  };

  return <TextField
    element={ element }
    id="conditionScriptLanguage"
    label={ translate('Format') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function ScriptType(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    return getScriptType(element);
  };

  const setValue = (value) => {

    // reset script properties on type change
    const updatedProperties = {
      'body': value === 'script' ? '' : undefined,
      'camunda:resource': value === 'resource' ? '' : undefined
    };

    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: getConditionExpression(element),
      properties: updatedProperties
    });
  };

  const getOptions = () => {

    const options = [
      { value: 'resource', label: translate('External Resource') },
      { value: 'script', label: translate('Inline Script') }
    ];

    return options;
  };

  return Select({
    element,
    id: 'conditionScriptType',
    label: translate('Script Type'),
    getValue,
    setValue,
    getOptions
  });
}

function Script(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionExpression(element).get('body');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: getConditionExpression(element),
      properties: {
        'body': value || ''
      }
    });
  };

  return <TextArea
    element={ element }
    id="conditionScriptValue"
    label={ translate('Script') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
    monospace
  />;
}

function Resource(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionExpression(element).get('camunda:resource');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: getConditionExpression(element),
      properties: {
        'camunda:resource': value || ''
      }
    });
  };

  return <TextField
    element
    id="conditionScriptResource"
    label={ translate('Resource') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}


// helper ////////////////////

const CONDITIONAL_SOURCES = [
  'bpmn:Activity',
  'bpmn:ExclusiveGateway'
];

function isConditionalSource(element) {
  return isAny(element, CONDITIONAL_SOURCES);
}

function getConditionType(element) {
  const conditionExpression = getConditionExpression(element);

  if (!conditionExpression) {
    return '';
  } else {
    return conditionExpression.get('language') === undefined ? 'expression' : 'script';
  }
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

  return businessObject.get('conditionExpression');
}

function getScriptType(element) {
  const conditionExpression = getConditionExpression(element);

  const resource = conditionExpression.get('camunda:resource');
  if (typeof resource !== 'undefined') {
    return 'resource';
  } else {
    return 'script';
  }
}
