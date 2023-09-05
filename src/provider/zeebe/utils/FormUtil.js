import {
  find,
  isUndefined
} from 'min-dash';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { getExtensionElementsList } from '../../../utils/ExtensionElementsUtil';

import { nextId } from '../../../utils/ElementUtil';

const USER_TASK_FORM_PREFIX = 'userTaskForm_';

export function getFormDefinition(element) {
  const businessObject = getBusinessObject(element);

  const formDefinitions = getExtensionElementsList(businessObject, 'zeebe:FormDefinition');

  return formDefinitions[0];
}

export function getUserTaskForm(element, parent) {
  const rootElement = parent || getRootElement(element);

  // (1) get form definition from user task
  const formDefinition = getFormDefinition(element);

  if (isUndefined(formDefinition)) {
    return;
  }

  const formKey = formDefinition.get('formKey');

  // (2) retrieve user task form via form key
  const userTaskForm = findUserTaskForm(formKey, rootElement);

  return userTaskForm;
}

export function createFormKey(formId) {
  return 'camunda-forms:bpmn:' + formId;
}

export function createFormId() {
  return nextId(USER_TASK_FORM_PREFIX);
}

export function resolveFormId(formKey) {
  return formKey.split(':')[2];
}

export function findUserTaskForm(formKey, rootElement) {
  const forms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');

  return find(forms, function(userTaskForm) {
    return createFormKey(userTaskForm.id) === formKey;
  });
}

export function getRootElement(element) {
  const businessObject = getBusinessObject(element);

  let parent = businessObject;

  while (parent.$parent && !is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }

  return parent;
}

export function isCamundaForm(element) {
  const formDefinition = getFormDefinition(element);
  const userTaskForm = getUserTaskForm(element);

  return formDefinition && userTaskForm;
}

export function isCustomKey(element) {
  const formDefinition = getFormDefinition(element);
  const userTaskForm = getUserTaskForm(element);

  return formDefinition && !userTaskForm;
}