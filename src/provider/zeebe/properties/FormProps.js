import {
  isUndefined,
  without
} from 'min-dash';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  SelectEntry,
  TextFieldEntry,
  TextAreaEntry,
  isFeelEntryEdited,
  isTextFieldEntryEdited,
  isTextAreaEntryEdited
} from '@bpmn-io/properties-panel';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';

import { createElement } from '../../../utils/ElementUtil';

import { useService } from '../../../hooks';

import {
  createUserTaskFormId,
  FORM_TYPES,
  getFormDefinition,
  getFormType,
  getRootElement,
  getUserTaskForm,
  isZeebeUserTask,
  userTaskFormIdToFormKey
} from '../utils/FormUtil';

const NONE_VALUE = 'none';


export function FormProps(props) {
  const { element } = props;

  if (!is(element, 'bpmn:UserTask')) {
    return [];
  }

  const entries = [ {
    id: 'formType',
    component: FormType,
    isEdited: node => node.value !== NONE_VALUE
  } ];

  const formType = getFormType(element);

  if (formType === FORM_TYPES.CAMUNDA_FORM_EMBEDDED) {
    entries.push({
      id: 'formConfiguration',
      component: FormConfiguration,
      isEdited: isTextAreaEntryEdited
    });
  } else if (formType === FORM_TYPES.CAMUNDA_FORM_LINKED) {
    entries.push({
      id: 'formId',
      component: FormId,
      isEdited: isTextFieldEntryEdited
    });
  } else if (formType === FORM_TYPES.CUSTOM_FORM) {
    entries.push({
      id: 'customFormKey',
      component: CustomForm,
      isEdited: isTextFieldEntryEdited
    });
  } else if (formType === FORM_TYPES.EXTERNAL_REFERENCE) {
    entries.push({
      id: 'externalReference',
      component: ExternalReference,
      isEdited: isFeelEntryEdited
    });
  }

  return entries;
}


function FormType(props) {
  const { element } = props;

  const injector = useService('injector'),
        translate = useService('translate');

  const getValue = () => {
    return getFormType(element) || NONE_VALUE;
  };

  const setValue = (value) => {
    setFormType(injector, element, value);
  };

  const getOptions = () => {
    return getFormTypeOptions(translate, element);
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

function setFormType(injector, element, value) {
  if (value === FORM_TYPES.CAMUNDA_FORM_EMBEDDED) {
    setUserTaskForm(injector, element, '');
  } else if (value === FORM_TYPES.CAMUNDA_FORM_LINKED) {
    setFormId(injector, element, '');
  } else if (value === FORM_TYPES.CUSTOM_FORM) {
    setCustomFormKey(injector, element, '');
  } else if (value === FORM_TYPES.EXTERNAL_REFERENCE) {
    setExternalReference(injector, element, '');
  } else {
    removeFormDefinition(injector, element);
  }
}

function getFormTypeOptions(translate, element) {
  if (isZeebeUserTask(element)) {
    return [
      { value: NONE_VALUE, label: translate('<none>') },
      { value: FORM_TYPES.CAMUNDA_FORM_LINKED, label: translate('Camunda Form') },
      { value: FORM_TYPES.EXTERNAL_REFERENCE, label: translate('External form reference') }
    ];
  }

  return [
    { value: NONE_VALUE, label: translate('<none>') },
    { value: FORM_TYPES.CAMUNDA_FORM_LINKED, label: translate('Camunda Form (linked)') },
    { value: FORM_TYPES.CAMUNDA_FORM_EMBEDDED, label: translate('Camunda Form (embedded)') },
    { value: FORM_TYPES.CUSTOM_FORM, label: translate('Custom form key') }
  ];
}


function FormConfiguration(props) {
  const { element } = props;

  const debounce = useService('debounceInput'),
        injector = useService('injector'),
        translate = useService('translate');

  const getValue = () => {
    return getUserTaskForm(element).get('body');
  };

  const setValue = (value) => {
    setUserTaskForm(injector, element, isUndefined(value) ? '' : value);
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


function FormId(props) {
  const { element } = props;

  const debounce = useService('debounceInput'),
        injector = useService('injector'),
        translate = useService('translate');

  const getValue = () => {
    return getFormDefinition(element).get('formId');
  };

  const setValue = (value) => {
    setFormId(injector, element, isUndefined(value) ? '' : value);
  };

  return TextFieldEntry({
    element,
    id: 'formId',
    label: translate('Form ID'),
    getValue,
    setValue,
    debounce
  });
}

function CustomForm(props) {
  const { element } = props;

  const debounce = useService('debounceInput'),
        injector = useService('injector'),
        translate = useService('translate');

  const getValue = () => {
    const formDefinition = getFormDefinition(element);
    return formDefinition.get('formKey');
  };

  const setValue = (value) => {
    setCustomFormKey(injector, element, isUndefined(value) ? '' : value);
  };

  return TextFieldEntry({
    element,
    id: 'customFormKey',
    label: translate('Custom form key'),
    getValue,
    setValue,
    debounce
  });
}

function ExternalReference(props) {
  const { element } = props;

  const debounce = useService('debounceInput'),
        injector = useService('injector'),
        translate = useService('translate');

  const getValue = () => {
    const formDefinition = getFormDefinition(element);
    return formDefinition.get('externalReference');
  };

  const setValue = (value) => {
    setExternalReference(injector, element, isUndefined(value) ? '' : value);
  };

  return FeelEntryWithVariableContext({
    element,
    id: 'externalReference',
    label: translate('External form reference'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}

// helpers /////////////

/**
 * @typedef { { cmd: string, context: Object } } Command
 * @typedef {Command[]} Commands
 *
 * @typedef {import('diagram-js/lib/model/Types').Element} Element
 * @typedef {import('bpmn-js/lib/model/Types').ModdleElement} ModdleElement
 *
 * @param {import('didi').Injector} Injector
 */

/**
 * @param {Injector} injector
 * @param {Element} element
 *
 * @returns { {
 *   commands: Commands,
 *   extensionElements: ModdleElement
 * } }
 */
function getOrCreateExtensionElements(injector, element, moddleElement) {
  const businessObject = moddleElement || getBusinessObject(element);

  let extensionElements = businessObject.get('extensionElements');

  if (extensionElements) {
    return {
      commands: [],
      extensionElements
    };
  }

  const bpmnFactory = injector.get('bpmnFactory');

  extensionElements = createElement('bpmn:ExtensionElements', {
    values: []
  }, businessObject, bpmnFactory);

  return {
    commands: [
      createUpdateModdlePropertiesCommand(element, businessObject, {
        extensionElements
      })
    ],
    extensionElements
  };
}

/**
 * @param {Injector} injector
 * @param {Element} element
 *
 * @returns { {
*   commands: Commands,
*   formDefinition: ModdleElement
* } }
*/
function getOrCreateFormDefintition(injector, element) {
  let formDefinition = getFormDefinition(element);

  if (formDefinition) {
    return {
      commands: [],
      formDefinition
    };
  }

  const {
    extensionElements,
    commands
  } = getOrCreateExtensionElements(injector, element);

  formDefinition = createFormDefinition(injector, {}, extensionElements);

  return {
    commands: [
      ...commands,
      createUpdateModdlePropertiesCommand(element, extensionElements, {
        values: [
          ...extensionElements.get('values'),
          formDefinition
        ]
      })
    ],
    formDefinition
  };
}

/**
 * @param {Injector} injector
 * @param {Element} element
 *
 * @returns { {
 *   commands: Commands,
 *   formDefinition: ModdleElement,
 *   userTaskForm: ModdleElement
 * } }
 */
function getOrCreateUserTaskForm(injector, element) {
  let userTaskForm = getUserTaskForm(element);

  if (userTaskForm) {
    return {
      commands: [],
      formDefinition: getFormDefinition(element),
      userTaskForm
    };
  }

  const rootElement = getRootElement(element);

  const {
    extensionElements,
    commands: extensionElementsCommands
  } = getOrCreateExtensionElements(injector, element, rootElement);

  const {
    formDefinition,
    commands: formDefinitionCommands
  } = getOrCreateFormDefintition(injector, element);

  const formId = createUserTaskFormId();

  userTaskForm = createUserTaskForm(injector, {
    id: formId
  }, extensionElements);

  return {
    commands: [
      ...extensionElementsCommands,
      ...formDefinitionCommands,
      createUpdateModdlePropertiesCommand(element, extensionElements, {
        values: [
          ...extensionElements.get('values'),
          userTaskForm
        ]
      }),
      createUpdateModdlePropertiesCommand(element, formDefinition, {
        formKey: userTaskFormIdToFormKey(formId)
      })
    ],
    formDefinition,
    userTaskForm
  };
}

function setFormId(injector, element, formId) {
  let {
    commands,
    formDefinition
  } = getOrCreateFormDefintition(injector, element);

  const commandStack = injector.get('commandStack');

  commandStack.execute('properties-panel.multi-command-executor', [
    ...commands,
    createUpdateModdlePropertiesCommand(element, formDefinition, {
      formId
    })
  ]);
}

function setCustomFormKey(injector, element, formKey) {
  let {
    commands,
    formDefinition
  } = getOrCreateFormDefintition(injector, element);

  const commandStack = injector.get('commandStack');

  commandStack.execute('properties-panel.multi-command-executor', [
    ...commands,
    createUpdateModdlePropertiesCommand(element, formDefinition, {
      formKey
    })
  ]);
}

function setExternalReference(injector, element, externalReference) {
  let {
    commands,
    formDefinition
  } = getOrCreateFormDefintition(injector, element);

  const commandStack = injector.get('commandStack');

  commandStack.execute('properties-panel.multi-command-executor', [
    ...commands,
    createUpdateModdlePropertiesCommand(element, formDefinition, {
      externalReference
    })
  ]);
}

function setUserTaskForm(injector, element, body) {
  let {
    commands,
    userTaskForm
  } = getOrCreateUserTaskForm(injector, element);

  const commandStack = injector.get('commandStack');

  commandStack.execute('properties-panel.multi-command-executor', [
    ...commands,
    createUpdateModdlePropertiesCommand(element, userTaskForm, {
      body
    })
  ]);
}

function removeFormDefinition(injector, element) {
  const formDefinition = getFormDefinition(element);

  /**
   * @type {import('bpmn-js/lib/features/modeling/Modeling').default}
   */
  const modeling = injector.get('modeling');

  if (formDefinition) {
    const businessObject = getBusinessObject(element),
          extensionElements = businessObject.get('extensionElements');

    modeling.updateModdleProperties(element, extensionElements, {
      values: without(extensionElements.get('values'), formDefinition)
    });
  }
}

/**
 * @param {Injector} injector
 * @param {Object} properties
 * @param {ModdleElement} parent
 *
 * @returns {ModdleElement}
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
 * @param {Injector} injector
 * @param {Object} properties
 * @param {ModdleElement} parent
 *
 * @returns {ModdleElement}
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
 * @param {Element} element
 * @param {ModdleElement} moddleElement
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