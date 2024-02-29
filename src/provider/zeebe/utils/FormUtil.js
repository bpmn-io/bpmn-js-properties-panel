import { isDefined } from 'min-dash';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { nextId } from '../../../utils/ElementUtil';

import { getExtensionElementsList } from '../../../utils/ExtensionElementsUtil';

const FORM_KEY_PREFIX = 'camunda-forms:bpmn:',
      USER_TASK_FORM_ID_PREFIX = 'UserTaskForm_';

export const FORM_TYPES = {
  CAMUNDA_FORM_EMBEDDED: 'camunda-form-embedded',
  CAMUNDA_FORM_LINKED: 'camunda-form-linked',
  CUSTOM_FORM: 'custom-form',
  EXTERNAL_REFERENCE: 'external-reference'
};

export const DEFAULT_FORM_TYPE = FORM_TYPES.CAMUNDA_FORM_LINKED;

export function getFormDefinition(element) {
  const businessObject = getBusinessObject(element);

  const formDefinitions = getExtensionElementsList(businessObject, 'zeebe:FormDefinition');

  return formDefinitions[ 0 ];
}

export function getUserTaskForm(element, rootElement) {
  rootElement = rootElement || getRootElement(element);

  const formDefinition = getFormDefinition(element);

  if (!formDefinition) {
    return;
  }

  const formKey = formDefinition.get('formKey');

  const userTaskForms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');

  return userTaskForms.find(userTaskForm => {
    return userTaskFormIdToFormKey(userTaskForm.get('id')) === formKey;
  });
}

export function userTaskFormIdToFormKey(userTaskFormId) {
  return `${ FORM_KEY_PREFIX }${ userTaskFormId }`;
}

export function formKeyToUserTaskFormId(formKey) {
  return formKey.replace(FORM_KEY_PREFIX, '');
}

export function createUserTaskFormId() {
  return nextId(USER_TASK_FORM_ID_PREFIX);
}

export function getRootElement(element) {
  const businessObject = getBusinessObject(element);

  let parent = businessObject;

  while (parent.$parent && !is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }

  return parent;
}

export function getFormType(element) {
  const formDefinition = getFormDefinition(element);

  if (!formDefinition) {
    return;
  }

  const formId = formDefinition.get('formId'),
        formKey = formDefinition.get('formKey'),
        externalReference = formDefinition.get('externalReference');

  if (isDefined(formId)) {
    return FORM_TYPES.CAMUNDA_FORM_LINKED;
  }

  if (isDefined(externalReference)) {
    return FORM_TYPES.EXTERNAL_REFERENCE;
  }

  if (isDefined(formKey)) {

    if (getUserTaskForm(element)) {
      return FORM_TYPES.CAMUNDA_FORM_EMBEDDED;
    }

    return FORM_TYPES.CUSTOM_FORM;
  }
}

export function isZeebeUserTask(element) {
  const bo = getBusinessObject(element);

  return getExtensionElementsList(bo, 'zeebe:UserTask').length > 0;
}
