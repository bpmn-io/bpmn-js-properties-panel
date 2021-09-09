import { isDefined } from 'min-dash';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

export function getFormRefBinding(element) {
  const businessObject = getBusinessObject(element);

  return businessObject.get('camunda:formRefBinding') || 'latest';
}

export function getFormType(element) {
  const businessObject = getBusinessObject(element);

  if (isDefined(businessObject.get('camunda:formKey'))) {
    return 'formKey';
  } else if (isDefined(businessObject.get('camunda:formRef'))) {
    return 'formRef';
  }
}

export function isFormSupported(element) {
  return (is(element, 'bpmn:StartEvent') && !is(element.parent, 'bpmn:SubProcess'))
    || is(element, 'bpmn:UserTask');
}