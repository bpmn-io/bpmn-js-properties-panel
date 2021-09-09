import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import Select, { isEdited as selectIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/Select';
import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import { FormTypeProps } from './FormTypeProps';

import {
  useService
} from '../../../hooks';

import {
  getFormType,
  getFormRefBinding,
  isFormSupported
} from '../utils/FormTypeUtils';


export function FormProps(props) {
  const {
    element
  } = props;

  if (!isFormSupported(element)) {
    return [];
  }

  const formType = getFormType(element),
        bindingType = getFormRefBinding(element);

  // (1) display form type select
  const entries = [
    ...FormTypeProps({ element })
  ];

  // (2) display form properties based on type
  if (formType === 'formKey') {
    entries.push({
      id: 'formKey',
      component: <FormKey element={ element } />,
      isEdited: textFieldIsEdited
    });
  } else if (formType === 'formRef') {
    entries.push({
      id: 'formRef',
      component: <FormRef element={ element } />,
      isEdited: textFieldIsEdited
    }, {
      id: 'formRefBinding',
      component: <Binding element={ element } />,
      isEdited: selectIsEdited
    });

    if (bindingType === 'version') {
      entries.push({
        id: 'formRefVersion',
        component: <Version element={ element } />,
        isEdited: textFieldIsEdited
      });
    }
  }

  return entries;
}

function FormKey(props) {
  const { element } = props;

  const debounce = useService('debounceInput');
  const modeling = useService('modeling');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:formKey');
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      'camunda:formKey': value
    });
  };

  return TextField({
    element,
    id: 'formKey',
    label: translate('Form key'),
    getValue,
    setValue,
    debounce
  });
}

function FormRef(props) {
  const { element } = props;

  const debounce = useService('debounceInput');
  const modeling = useService('modeling');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:formRef');
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      'camunda:formRef': value
    });
  };

  return TextField({
    element,
    id: 'formRef',
    label: translate('Form reference'),
    getValue,
    setValue,
    debounce
  });
}

function Binding(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');

  const getValue = () => {
    return getFormRefBinding(element);
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      'camunda:formRefBinding': value
    });
  };

  // Note: default is "latest",
  // cf. https://docs.camunda.org/manual/develop/reference/bpmn20/custom-extensions/extension-attributes/#formrefbinding
  const getOptions = () => {

    const options = [
      { value: 'deployment', label: translate('deployment') },
      { value: 'latest', label: translate('latest') },
      { value: 'version', label: translate('version') }
    ];

    return options;
  };

  return Select({
    element,
    id: 'formRefBinding',
    label: translate('Binding'),
    getValue,
    setValue,
    getOptions
  });
}

function Version(props) {
  const { element } = props;

  const debounce = useService('debounceInput');
  const modeling = useService('modeling');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:formRefVersion');
  };

  const setValue = (value) => {
    modeling.updateProperties(element, {
      'camunda:formRefVersion': value
    });
  };

  return TextField({
    element,
    id: 'formRefVersion',
    label: translate('Version'),
    getValue,
    setValue,
    debounce
  });
}
