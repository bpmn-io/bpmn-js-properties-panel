import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import TextField, { isEdited as defaultIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';

import {
  nextId
} from '../../../utils/ElementUtil';

import {
  find
} from 'min-dash';

import {
  useService
} from '../../../hooks';


export function FormProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:UserTask')) {
    return [];
  }

  return [
    {
      id: 'formConfiguration',
      component: <FormProperty element={ element } />,
      isEdited: defaultIsEdited
    }
  ];
}

function FormProperty(props) {
  const {
    element
  } = props;

  const injector = useService('injector');

  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const formHelper = injector.invoke(FormHelper);

  const getValue = () => formHelper.get(element);

  const setValue = (value) => formHelper.set(element, value);

  return TextField({
    element,
    id: 'formConfiguration',
    label: translate('Form JSON configuration'),
    getValue,
    setValue,
    debounce
  });
}


const USER_TASK_FORM_PREFIX = 'userTaskForm_';

function FormHelper(bpmnFactory, commandStack) {

  function getUserTaskForm(element, parent) {

    const rootElement = parent || getRootElement(element);

    // (1) get form definition from user task
    const formDefinition = getFormDefinition(element);

    if (!formDefinition) {
      return;
    }

    const formKey = formDefinition.get('formKey');

    // (2) retrieve user task form via form key
    const userTaskForm = findUserTaskForm(formKey, rootElement);

    return userTaskForm;
  }

  function getFormDefinition(element) {
    const businessObject = getBusinessObject(element);

    const formDefinitions = getExtensionElementsList(businessObject, 'zeebe:FormDefinition');

    return formDefinitions[0];
  }

  function setUserTaskForm(element, body) {

    const businessObject = getBusinessObject(element),
          rootElement = getRootElement(element);

    let commands = [],
        userTaskForm,
        formId;

    // (1) ensure extension elements
    let extensionElements = businessObject.get('extensionElements');

    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push(
        UpdateBusinessObjectCmd(element, businessObject, {
          extensionElements: extensionElements,
        })
      );
    }

    // (2) ensure root element extension elements
    let rootExtensionElements = rootElement.get('extensionElements');

    if (!rootExtensionElements) {
      rootExtensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        rootElement,
        bpmnFactory
      );

      commands.push(
        UpdateBusinessObjectCmd(element, rootElement, {
          extensionElements: rootExtensionElements,
        })
      );
    }

    // (3) ensure form definition
    let formDefinition = getFormDefinition(element);

    if (!formDefinition) {
      formId = createFormId();

      formDefinition = createFormDefinition(
        {
          formKey: createFormKey(formId)
        },
        extensionElements,
        bpmnFactory
      );

      commands.push(AddRemoveElementsFromListCmd(
        element,
        extensionElements,
        'values',
        'extensionElements',
        [ formDefinition ],
        []
      ));
    }

    formId = resolveFormId(formDefinition.get('formKey'));

    // (4) ensure user task form
    userTaskForm = getUserTaskForm(element);

    if (!userTaskForm) {
      userTaskForm = createUserTaskForm(
        {
          id: formId,
          body: body
        },
        rootExtensionElements,
        bpmnFactory
      );

      commands.push(AddRemoveElementsFromListCmd(
        element,
        rootExtensionElements,
        'values',
        'extensionElements',
        [ userTaskForm ],
        []
      ));
    }

    // (5) update user task form
    commands.push(UpdateBusinessObjectCmd(element, userTaskForm, {
      body
    }));

    return commands;

  }

  function unsetUserTaskForm(element) {

    const businessObject = getBusinessObject(element),
          rootElement = getRootElement(element),
          extensionElements = businessObject.get('extensionElements'),
          rootExtensionElements = rootElement.get('extensionElements');

    let commands = [];

    // (1) remove form definition
    const formDefinition = getFormDefinition(element);

    if (!formDefinition) {
      return commands;
    }

    commands.push(RemoveElementsFromListCmd(
      element,
      extensionElements,
      'values',
      'extensionElements',
      [ formDefinition ]
    ));

    // (2) remove referenced user task form
    const userTaskForm = getUserTaskForm(element);

    if (!userTaskForm) {
      return commands;
    }

    commands.push(RemoveElementsFromListCmd(
      element,
      rootExtensionElements,
      'values',
      'extensionElements',
      [ userTaskForm ]
    ));

    return commands;
  }

  function createFormKey(formId) {
    return 'camunda-forms:bpmn:' + formId;
  }

  function createFormId() {
    return nextId(USER_TASK_FORM_PREFIX);
  }

  function resolveFormId(formKey) {
    return formKey.split(':')[2];
  }

  function createFormDefinition(properties, extensionElements, bpmnFactory) {
    return createElement(
      'zeebe:FormDefinition',
      properties,
      extensionElements,
      bpmnFactory
    );
  }

  function createUserTaskForm(properties, extensionElements, bpmnFactory) {
    return createElement(
      'zeebe:UserTaskForm',
      properties,
      extensionElements,
      bpmnFactory
    );
  }

  function findUserTaskForm(formKey, rootElement) {
    const forms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');

    return find(forms, function(userTaskForm) {
      return createFormKey(userTaskForm.id) === formKey;
    });
  }

  function getRootElement(element) {
    var businessObject = getBusinessObject(element),
        parent = businessObject;

    while (parent.$parent && !is(parent, 'bpmn:Process')) {
      parent = parent.$parent;
    }

    return parent;
  }

  function get(element) {
    const value = getUserTaskForm(element);

    return value && value.body || '';
  }

  function set(element, body) {

    body = body && body.trim();

    const commands = (
      body
        ? setUserTaskForm(element, body)
        : unsetUserTaskForm(element)
    );

    commandStack.execute('properties-panel.multi-command-executor', commands);
  }

  return {
    get,
    set
  };

}

FormHelper.$inject = [ 'bpmnFactory', 'commandStack' ];


// helpers /////////////

function UpdateBusinessObjectCmd(element, businessObject, newProperties) {
  return {
    cmd: 'properties-panel.update-businessobject',
    context: {
      element: element,
      businessObject: businessObject,
      properties: newProperties
    }
  };
}

function RemoveElementsFromListCmd(element, businessObject, listPropertyName, referencePropertyName, objectsToRemove) {

  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element: element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      referencePropertyName: referencePropertyName,
      objectsToRemove: objectsToRemove
    }
  };
}

function AddRemoveElementsFromListCmd(element, businessObject, listPropertyName, referencePropertyName, objectsToAdd, objectsToRemove) {

  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element: element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      referencePropertyName: referencePropertyName,
      objectsToAdd: objectsToAdd,
      objectsToRemove: objectsToRemove
    }
  };
}