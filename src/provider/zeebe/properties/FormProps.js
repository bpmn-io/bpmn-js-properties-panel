import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  SelectEntry,
  TextFieldEntry,
  TextAreaEntry,
  isSelectEntryEdited,
  isTextFieldEntryEdited,
  isTextAreaEntryEdited
} from '@bpmn-io/properties-panel';

import { createElement } from '../../../utils/ElementUtil';

import {
  isUndefined,
  without
} from 'min-dash';

import {
  useService
} from '../../../hooks';

import {
  createUserTaskFormId,
  formKeyToUserTaskFormId,
  FORM_TYPES,
  getFormDefinition,
  getFormType,
  getRootElement,
  getUserTaskForm,
  userTaskFormIdToFormKey
} from '../utils/FormUtil';


export function FormProps(props) {
  const { element } = props;

  if (!is(element, 'bpmn:UserTask')) {
    return [];
  }

  const entries = [ {
    id: 'formType',
    component: FormType,
    isEdited: isSelectEntryEdited
  } ];

  const formType = getFormType(element);

  if (formType === FORM_TYPES.CAMUNDA_FORM_EMBEDDED) {
    entries.push({
      id: 'formConfiguration',
      component: FormConfiguration,
      isEdited: isTextAreaEntryEdited
    });

  } else if (formType === FORM_TYPES.CUSTOM_FORM) {
    entries.push({
      id: 'customFormKey',
      component: CustomFormKey,
      isEdited: isTextFieldEntryEdited
    });
  }

  return entries;
}


function FormType(props) {
  const { element } = props;

  const injector = useService('injector'),
        translate = useService('translate');

  const formHelper = injector.invoke(FormHelper);

  const getValue = () => {
    return getFormType(element) || '';
  };

  const setValue = (value) => {
    formHelper.resetForm(element);

    if (value === FORM_TYPES.CAMUNDA_FORM_EMBEDDED) {
      formHelper.setUserTaskForm(element, '');

    } else if (value === FORM_TYPES.CUSTOM_FORM) {
      formHelper.setFormDefinition(element, '');
    }
  };

  const getOptions = () => {
    return [
      { value: '', label: translate('<none>') },
      { value: FORM_TYPES.CAMUNDA_FORM_EMBEDDED, label: translate('Camunda forms') },
      { value: FORM_TYPES.CUSTOM_FORM, label: translate('Custom form key') },
    ];
  };

  return SelectEntry({
    element,
    id: 'formType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

function FormConfiguration(props) {
  const { element } = props;

  const debounce = useService('debounceInput'),
        injector = useService('injector'),
        translate = useService('translate');

  const formHelper = injector.invoke(FormHelper);

  const getValue = () => {
    const userTaskForm = getUserTaskForm(element);
    return userTaskForm.get('body');
  };

  const setValue = (value) => {
    formHelper.setUserTaskForm(element, value);
  };

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


function CustomFormKey(props) {
  const { element } = props;

  const debounce = useService('debounceInput'),
        injector = useService('injector'),
        translate = useService('translate');

  const formHelper = injector.invoke(FormHelper);

  const getValue = () => {
    const formDefinition = getFormDefinition(element);
    return formDefinition.get('formKey');
  };

  const setValue = (value) => {
    formHelper.setFormDefinition(element, value);
  };

  return TextFieldEntry({
    element,
    id: 'customFormKey',
    label: translate('Form key'),
    getValue,
    setValue,
    debounce
  });
}


function FormHelper(bpmnFactory, commandStack) {

  function ensureTaskForm(element, values) {

    let commands = [];

    const rootElement = getRootElement(element);

    // (1) ensure root element extension elements
    let rootExtensionElements = rootElement.get('extensionElements');

    if (!rootExtensionElements) {
      rootExtensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        rootElement,
        bpmnFactory
      );

      commands.push(
        createUpdateModdlePropertiesCommand(element, rootElement, {
          extensionElements: rootExtensionElements,
        })
      );
    }

    // (2) ensure user task form
    let userTaskForm = getUserTaskForm(element);

    // (2.1) create user task form if doesn't exist
    if (!userTaskForm) {
      userTaskForm = createUserTaskForm(
        values,
        rootExtensionElements,
        bpmnFactory
      );

      commands.push(
        createUpdateModdlePropertiesCommand(element, rootExtensionElements,{
          values: [ ...rootExtensionElements.get('values'), userTaskForm ]
        })
      );
    }

    commands.push(createUpdateModdlePropertiesCommand(element, userTaskForm, values));

    return commands;
  }

  function ensureFormDefinition(element, customFormKey) {
    const businessObject = getBusinessObject(element);

    let commands = [];

    // (1) ensure extension elements
    let extensionElements = businessObject.get('extensionElements');

    if (isUndefined(extensionElements)) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push(
        createUpdateModdlePropertiesCommand(element, businessObject, {
          extensionElements: extensionElements,
        })
      );
    }

    // (2) ensure form definition
    let formDefinition = getFormDefinition(element);

    // (2.1) create if doesn't exist
    if (!formDefinition) {
      let formKey = customFormKey;

      if (isUndefined(formKey)) {
        const formId = createUserTaskFormId();
        formKey = userTaskFormIdToFormKey(formId);
      }

      formDefinition = createFormDefinition(
        {
          formKey
        },
        extensionElements,
        bpmnFactory
      );

      commands.push(
        createUpdateModdlePropertiesCommand(element, extensionElements, {
          values: [ ...extensionElements.get('values'), formDefinition ]
        })
      );
    }

    // (2.2) update existing form definition with custom key
    else if (customFormKey) {
      commands.push(
        createUpdateModdlePropertiesCommand(element, formDefinition, {
          formKey: customFormKey
        })
      );
    }

    return {
      formId: formKeyToUserTaskFormId(formDefinition.get('formKey')),
      commands
    };
  }

  function setFormDefinition(element, customFormKey) {

    const {
      commands
    } = ensureFormDefinition(element, customFormKey);

    commandStack.execute('properties-panel.multi-command-executor', commands);
  }

  function setUserTaskForm(element, value) {

    const {
      formId,
      commands: formDefCommands
    } = ensureFormDefinition(element);

    const userTaskCommands = ensureTaskForm(element, { id:formId, body:value });
    const commands = formDefCommands.concat(userTaskCommands);

    commandStack.execute('properties-panel.multi-command-executor', commands);
  }

  function unsetFormDefinition(element) {

    const businessObject = getBusinessObject(element),
          extensionElements = businessObject.get('extensionElements');

    let commands = [];

    const formDefinition = getFormDefinition(element);

    if (!formDefinition) {
      return commands;
    }

    let values = without(extensionElements.get('values'), formDefinition);

    commands.push(
      createUpdateModdlePropertiesCommand(element, extensionElements, { values })
    );

    return commands;
  }

  function resetForm(element) {

    const rootElement = getRootElement(element),
          rootExtensionElements = rootElement.get('extensionElements');

    // (1) remove form definition
    const commands = unsetFormDefinition(element);

    // (2) remove referenced user task form
    const userTaskForm = getUserTaskForm(element);

    if (!userTaskForm) {
      commandStack.execute('properties-panel.multi-command-executor', commands);
      return;
    }

    const values = without(rootExtensionElements.get('values'), userTaskForm);

    commands.push(
      createUpdateModdlePropertiesCommand(element, rootExtensionElements, { values })
    );

    commandStack.execute('properties-panel.multi-command-executor', commands);

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

  return {
    setFormDefinition,
    setUserTaskForm,
    resetForm
  };

}

FormHelper.$inject = [ 'bpmnFactory', 'commandStack' ];


// helpers /////////////

function createUpdateModdlePropertiesCommand(element, moddleElement, properties) {
  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement,
      properties
    }
  };
}