import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextAreaEntry, isTextAreaEntryEdited } from '@bpmn-io/properties-panel';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  nextId
} from '../../../utils/ElementUtil';

import {
  find, without
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
      isEdited: isTextAreaEntryEdited
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

  return TextAreaEntry({
    element,
    id: 'formConfiguration',
    label: translate('Form JSON configuration'),
    rows: 4,
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
        UpdateModdlePropertiesCmd(element, businessObject, {
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
        UpdateModdlePropertiesCmd(element, rootElement, {
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

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), formDefinition ]
          }
        }
      });
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

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: rootExtensionElements,
          properties: {
            values: [ ...rootExtensionElements.get('values'), userTaskForm ]
          }
        }
      });
    }

    // (5) update user task form
    commands.push(UpdateModdlePropertiesCmd(element, userTaskForm, {
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

    let values = without(extensionElements.get('values'), formDefinition);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values
        }
      }
    });

    // (2) remove referenced user task form
    const userTaskForm = getUserTaskForm(element);

    if (!userTaskForm) {
      return commands;
    }

    values = without(rootExtensionElements.get('values'), userTaskForm);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: rootExtensionElements,
        properties: {
          values
        }
      }
    });

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
    const businessObject = getBusinessObject(element);

    let parent = businessObject;

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

function UpdateModdlePropertiesCmd(element, businessObject, newProperties) {
  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: businessObject,
      properties: newProperties
    }
  };
}