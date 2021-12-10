import { isDefined } from 'min-dash';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

const FORM_KEY_PROPS = {
  'camunda:formRef': undefined,
  'camunda:formRefBinding': undefined,
  'camunda:formRefVersion': undefined
};

const FORM_REF_PROPS = {
  'camunda:formKey': undefined
};

export function FormTypeProps(props) {
  const {
    element
  } = props;

  return [
    {
      id: 'formType',
      component: <FormType element={ element } />,
      isEdited: isSelectEntryEdited
    }
  ];
}

function FormType(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    if (isDefined(businessObject.get('camunda:formKey'))) {
      return 'formKey';
    } else if (isDefined(businessObject.get('camunda:formRef'))) {
      return 'formRef';
    }

    return '';
  };

  const setValue = (value) => {
    if (value === 'formKey') {
      modeling.updateProperties(element, {
        'camunda:formKey': ''
      });
    } else if (value === 'formRef') {
      modeling.updateProperties(element, {
        'camunda:formRef': ''
      });
    } else {
      modeling.updateProperties(element, {
        ...FORM_KEY_PROPS,
        ...FORM_REF_PROPS
      });
    }
  };

  const getOptions = () => {
    return [
      { value: '', label: translate('<none>') },
      { value: 'formKey', label: translate('Embedded or External Task Forms') },
      { value: 'formRef', label: translate('Camunda Forms') }
    ];
  };

  return SelectEntry({
    element,
    id: 'formType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}