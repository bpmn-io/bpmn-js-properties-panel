import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import {
  useService
} from '../../../hooks';

export function FormKeyProps(props) {
  const {
    element
  } = props;

  if (!isFormKeySupported(element)) {
    return [];
  }

  return [
    {
      id: 'formKey',
      component: <FormKey element={ element } />,
      isEdited: textFieldIsEdited
    }
  ];
}

function FormKey(props) {
  const { element } = props;

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');

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
    label: translate('Key'),
    getValue,
    setValue,
    debounce
  });
}


// helper //////////////

/**
 * isFormKeySupported - check whether a given element supports camunda:formKey
 *
 * @param  {ModdleElement} element
 * @return {boolean}
 */
function isFormKeySupported(element) {
  return (is(element, 'bpmn:StartEvent') && !is(element.parent, 'bpmn:SubProcess'))
   || is(element, 'bpmn:UserTask');
}
