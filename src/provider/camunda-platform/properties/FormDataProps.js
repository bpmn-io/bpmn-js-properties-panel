import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import FormField from './FormField';

import {
  without
} from 'min-dash';

export function FormDataProps({ element, injector }) {
  if (!isFormDataSupported(element)) {
    return;
  }

  const formFields = getFormFieldsList(element) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = formFields.map((formField, index) => {
    const id = element.id + '-formField-' + index;

    return {
      id,
      label: formField.get('id') || '',
      entries: FormField({
        idPrefix: id,
        element,
        formField
      }),
      autoFocusEntry: id + '-formFieldID',
      remove: removeFactory({ commandStack, element, formField })
    };
  });

  return {
    items,
    add: addFactory({ bpmnFactory, commandStack, element }),
    shouldSort: false
  };
}

function addFactory({ bpmnFactory, commandStack, element }) {
  return function(event) {
    event.stopPropagation();

    const commands = [];

    // (1) get camunda:FormData
    const formData = getFormData(element);

    // (2) create camunda:FormField
    const formField = createElement('camunda:FormField', {}, formData, bpmnFactory);

    // (3) add formField to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: formData,
        properties: {
          fields: [ ...formData.get('fields'), formField ]
        }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

function removeFactory({ commandStack, element, formField }) {
  return function(event) {
    event.stopPropagation();

    const formData = getFormData(element),
          formFields = getFormFieldsList(element);

    if (!formFields || !formFields.length) {
      return;
    }

    const fields = without(formData.get('fields'), formField);

    // update formData
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formData,
      properties: {
        fields
      }
    });
  };
}


// helper ///////////////////////////////

function isFormDataSupported(element) {
  const formData = getFormData(element);

  return ((is(element, 'bpmn:StartEvent') && !is(element.parent, 'bpmn:SubProcess'))
   || is(element, 'bpmn:UserTask')) && formData;
}

function getFormData(element) {
  const bo = getBusinessObject(element);

  return getExtensionElementsList(bo, 'camunda:FormData')[0];
}

function getFormFieldsList(element) {
  const businessObject = getBusinessObject(element);

  const formData = getFormData(businessObject);

  return formData && formData.fields;
}
