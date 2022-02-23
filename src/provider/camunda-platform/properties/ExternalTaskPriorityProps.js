import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  getServiceTaskLikeBusinessObject
} from '../utils/ImplementationTypeUtils';


export function ExternalTaskPriorityProps(props) {
  const {
    element
  } = props;

  const businessObject = getBusinessObject(element);

  if (!is(element, 'bpmn:Process') &&
      !(is(element, 'bpmn:Participant') && businessObject.get('processRef')) &&
      !isExternalTaskLike(element)) {
    return [];
  }

  return [
    {
      id: 'externalTaskPriority',
      component: ExternalTaskPriority,
      isEdited: isTextFieldEntryEdited
    },
  ];
}

function ExternalTaskPriority(props) {
  const { element } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  let businessObject;

  if (is(element, 'bpmn:Participant')) {
    businessObject = getBusinessObject(element).get('processRef');
  } else if (isExternalTaskLike(element)) {
    businessObject = getServiceTaskLikeBusinessObject(element);
  } else {
    businessObject = getBusinessObject(element);
  }

  const getValue = () => {
    return businessObject.get('camunda:taskPriority');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:taskPriority': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'externalTaskPriority',
    label: translate('Priority'),
    getValue,
    setValue,
    debounce
  });
}


// helper //////////////////

function isExternalTaskLike(element) {
  const bo = getServiceTaskLikeBusinessObject(element),
        type = bo && bo.get('camunda:type');

  return is(bo, 'camunda:ServiceTaskLike') && type && type === 'external';
}
