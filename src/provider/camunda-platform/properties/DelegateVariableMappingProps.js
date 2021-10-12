import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';
import Select, { isEdited as selectIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/Select';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  useService
} from '../../../hooks';


export function DelegateVariableMappingProps(props) {
  const { element } = props;

  const entries = [
    {
      id: 'calledElementDelegateVariableMappingType',
      component: <DelegateVariableMappingType element={ element } />,
      isEdited: selectIsEdited
    }
  ];

  const type = getDelegateVariableMappingType(element);
  if (type === 'class') {
    entries.push({
      id: 'calledElementVariableMappingClass',
      component: <VariableMappingClass element={ element } />,
      isEdited: textFieldIsEdited
    });
  } else if (type === 'delegateExpression') {
    entries.push({
      id: 'calledElementVariableMappingDelegateExpression',
      component: <VariableMappingDelegateExpression element={ element } />,
      isEdited: textFieldIsEdited
    });
  }

  return entries;
}

const DEFAULT_PROPS = {
  'camunda:variableMappingClass': undefined,
  'camunda:variableMappingDelegateExpression': undefined
};

function DelegateVariableMappingType(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    return getDelegateVariableMappingType(element);
  };

  const setValue = (value) => {
    const properties = { ...DEFAULT_PROPS };

    if (value === 'class') {
      properties['camunda:variableMappingClass'] = '';
    } else if (value === 'delegateExpression') {
      properties['camunda:variableMappingDelegateExpression'] = '';
    }

    commandStack.execute('element.updateProperties', { element, properties });
  };

  const getOptions = () => ([
    { value: 'none', label: translate('<none>') },
    { value: 'class', label: translate('Class') },
    { value: 'delegateExpression', label: translate('Delegate expression') }
  ]);

  return <Select
    element={ element }
    id="calledElementDelegateVariableMappingType"
    label={ translate('Delegate Variable Mapping') }
    getValue={ getValue }
    setValue={ setValue }
    getOptions={ getOptions }
  />;
}

function VariableMappingDelegateExpression(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getBusinessObject(element).get('camunda:variableMappingDelegateExpression');
  };

  const setValue = value => {
    modeling.updateProperties(element, {
      variableMappingDelegateExpression: value || '',
      variableMappingClass: undefined
    });
  };

  return <TextField
    element={ element }
    id="calledElementVariableMappingDelegateExpression"
    label={ translate('Delegate Expression') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function VariableMappingClass(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getBusinessObject(element).get('camunda:variableMappingClass');
  };

  const setValue = value => {
    modeling.updateProperties(element, {
      variableMappingDelegateExpression: undefined,
      variableMappingClass: value || '',
    });
  };

  return <TextField
    element={ element }
    id="calledElementVariableMappingClass"
    label={ translate('Delegate Class') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}


// helper /////

function getDelegateVariableMappingType(element) {
  const businessObject = getBusinessObject(element);

  if (businessObject.get('camunda:variableMappingClass') !== undefined) {
    return 'class';
  } else if (businessObject.get('camunda:variableMappingDelegateExpression') !== undefined) {
    return 'delegateExpression';
  }

  return 'none';
}
