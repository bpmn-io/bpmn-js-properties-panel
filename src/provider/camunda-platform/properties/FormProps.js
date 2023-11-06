import { isUndefined } from 'min-dash';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited, SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';

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
      component: FormKey,
      isEdited: isTextFieldEntryEdited
    });
  } else if (formType === 'formRef') {
    entries.push({
      id: 'formRef',
      component: FormRef,
      isEdited: isTextFieldEntryEdited
    }, {
      id: 'formRefBinding',
      component: Binding,
      isEdited: isSelectEntryEdited
    });

    if (bindingType === 'version') {
      entries.push({
        id: 'formRefVersion',
        component: Version,
        isEdited: isTextFieldEntryEdited
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
      'camunda:formKey': isUndefined(value) ? '' : value
    });
  };

  return TextFieldEntry({
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
      'camunda:formRef': isUndefined(value) ? '' : value
    });
  };

  return TextFieldEntry({
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

  return SelectEntry({
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

  return TextFieldEntry({
    element,
    id: 'formRefVersion',
    label: translate('Version'),
    getValue,
    setValue,
    debounce
  });
}
