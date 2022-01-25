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

import { without } from 'min-dash';

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

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure camunda:FormData
    let formData = getFormData(element);

    if (!formData) {
      const parent = extensionElements;

      formData = createElement('camunda:FormData', {
        fields: []
      }, parent, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), formData ]
          }
        }
      });
    }

    // (3) create camunda:FormField
    const formField = createElement('camunda:FormField', {}, formData, bpmnFactory);

    // (4) add formField to list
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

    // (5) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

function removeFactory({ commandStack, element, formField }) {
  return function(event) {
    event.stopPropagation();

    const commands = [];

    const formData = getFormData(element),
          formFields = getFormFieldsList(element);

    if (!formFields || !formFields.length) {
      return;
    }

    const fields = without(formData.get('fields'), formField);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: formData,
        properties: {
          fields
        }
      }
    });

    // remove camunda:formData if there are no formFields anymore
    if (!fields.length) {
      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements'),
            values = without(extensionElements.get('values'), formData);

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
    }

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}


// helper ///////////////////////////////

function isFormDataSupported(element) {
  return (is(element, 'bpmn:StartEvent') && !is(element.parent, 'bpmn:SubProcess'))
   || is(element, 'bpmn:UserTask');
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
