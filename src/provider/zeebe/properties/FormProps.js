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

  const getValue = () => {
    return getFormType(element) || '';
  };

  const setValue = (value) => {
    removeUserTaskForm(injector, element);

    if (value === FORM_TYPES.CAMUNDA_FORM_EMBEDDED) {
      setUserTaskForm(injector, element, '');
    } else if (value === FORM_TYPES.CUSTOM_FORM) {
      setFormDefinition(injector, element, '');
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

  const getValue = () => {
    const userTaskForm = getUserTaskForm(element);
    return userTaskForm.get('body');
  };

  const setValue = (value) => {
    setUserTaskForm(injector, element, value);
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

  const getValue = () => {
    const formDefinition = getFormDefinition(element);
    return formDefinition.get('formKey');
  };

  const setValue = (value) => {
    setFormDefinition(injector, element, value);
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

// helpers /////////////

/**
 * @typedef { { cmd: string, context: Object } } Command
 * @typedef {Command[]} Commands
 */

/**
 * @param {import('didi').Injector} injector
 * @param {import('diagram-js/lib/model/Types').Element} element
 * @param {Object} userTaskFormProperties
 *
 * @returns {Commands}
 */
function ensureUserTaskForm(injector, element, userTaskFormProperties) {
  const bpmnFactory = injector.get('bpmnFactory');

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
      injector,
      userTaskFormProperties,
      rootExtensionElements
    );

    commands.push(
      createUpdateModdlePropertiesCommand(element, rootExtensionElements,{
        values: [ ...rootExtensionElements.get('values'), userTaskForm ]
      })
    );
  }

  commands.push(createUpdateModdlePropertiesCommand(element, userTaskForm, userTaskFormProperties));

  return commands;
}

/**
 * @param {import('didi').Injector} injector
 * @param {import('diagram-js/lib/model/Types').Element} element
 * @param {string} [customFormKey]
 *
 * @returns { { formId: string, commands: Commands } }
 */
function ensureFormDefinition(injector, element, customFormKey) {
  const bpmnFactory = injector.get('bpmnFactory');

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

    const formDefinitionProperties = {
      formKey
    };

    formDefinition = createFormDefinition(injector, formDefinitionProperties, extensionElements);

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

/**
 * @param {import('didi').Injector} injector
 * @param {import('diagram-js/lib/model/Types').Element} element
 * @param {string} [customFormKey]
 */
function setFormDefinition(injector, element, customFormKey) {
  const commandStack = injector.get('commandStack');

  const {
    commands
  } = ensureFormDefinition(injector, element, customFormKey);

  commandStack.execute('properties-panel.multi-command-executor', commands);
}

/**
 * @param {import('didi').Injector} injector
 * @param {import('diagram-js/lib/model/Types').Element} element
 * @param {string} body
 */
function setUserTaskForm(injector, element, body) {
  const commandStack = injector.get('commandStack');

  let {
    formId,
    commands
  } = ensureFormDefinition(injector, element);

  commands = [
    ...commands,
    ...ensureUserTaskForm(injector, element, {
      id: formId,
      body
    })
  ];

  commandStack.execute('properties-panel.multi-command-executor', commands);
}

/**
 * @param {import('diagram-js/lib/model/Types').Element} element
 *
 * @returns {Commands}
 */
function removeFormDefinition(element) {
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

/**
 * @param {import('didi').Injector} injector
 * @param {import('diagram-js/lib/model/Types').Element} element
 */
function removeUserTaskForm(injector, element) {
  const commandStack = injector.get('commandStack');

  const rootElement = getRootElement(element),
        rootExtensionElements = rootElement.get('extensionElements');

  // (1) remove form definition
  const commands = removeFormDefinition(element);

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

/**
 * @param {import('didi').Injector} injector
 * @param {Object} properties
 * @param {import('bpmn-js/lib/model/Types').ModdleElement} parent
 *
 * @returns {import('bpmn-js/lib/model/Types').ModdleElement}
 */
function createFormDefinition(injector, properties, parent) {
  const bpmnFactory = injector.get('bpmnFactory');

  return createElement(
    'zeebe:FormDefinition',
    properties,
    parent,
    bpmnFactory
  );
}

/**
 * @param {import('didi').Injector} injector
 * @param {Object} properties
 * @param {import('bpmn-js/lib/model/Types').ModdleElement} parent
 *
 * @returns {import('bpmn-js/lib/model/Types').ModdleElement}
 */
function createUserTaskForm(injector, properties, parent) {
  const bpmnFactory = injector.get('bpmnFactory');

  return createElement(
    'zeebe:UserTaskForm',
    properties,
    parent,
    bpmnFactory
  );
}

/**
 * @param {import('diagram-js/lib/model/Types').Element} element
 * @param {import('bpmn-js/lib/model/Types').ModdleElement} moddleElement
 * @param {Object} properties
 *
 * @returns {Command}
 */
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