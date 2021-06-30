import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import TextField from '@bpmn-io/properties-panel/src/components/entries/TextField';

import {
  useService
} from '../../../hooks';

import {
  isIdValid
} from '../utils/ValidationUtil';


export default function IdProperty(props) {
  const {
    element
  } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const setValue = (value) => {
    modeling.updateProperties(element, {
      id: value
    });
  };

  const getValue = (element) => {
    return element.businessObject.id;
  };

  const validate = (value) => {
    const businessObject = getBusinessObject(element);

    return isIdValid(businessObject, value, translate);
  };

  return TextField({
    element,
    id: 'id',
    label: translate(is(element, 'bpmn:Participant') ? 'Participant ID' : 'ID'),
    getValue,
    setValue,
    debounce,
    validate
  });
}