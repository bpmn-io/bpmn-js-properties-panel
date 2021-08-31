import {
  useContext
} from 'preact/hooks';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';

import {
  BpmnPropertiesPanelContext
} from '../../../context';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import FormField from './FormField';

export function FormDataProps(props) {
  const {
    element
  } = props;

  if (!isFormDataSupported(element)) {
    return;
  }

  const formFields = getFormFieldsList(element) || [];

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
      remove: RemoveContainer({ formField })
    };
  });

  return {
    items,
    add: AddFormField,
    shouldSort: false
  };
}

function AddFormField(props) {
  const {
    children
  } = props;

  const {
    selectedElement: element
  } = useContext(BpmnPropertiesPanelContext);

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');

  const addElement = (event) => {

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
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
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
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ formData ]
        }
      });
    }

    // (3) create camunda:FormField
    const formField = createElement('camunda:FormField', {}, formData, bpmnFactory);

    // (4) add formField to list
    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: formData,
        propertyName: 'fields',
        objectsToAdd: [ formField ]
      }
    });

    // (5) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);

  };

  return (
    <div class="bio-properties-panel-group-header-button" onClick={ addElement }>
      {
        children
      }
    </div>
  );
}

function RemoveContainer(props) {
  const {
    formField
  } = props;

  return function RemoveFormField(props) {
    const {
      children
    } = props;

    const {
      selectedElement: element
    } = useContext(BpmnPropertiesPanelContext);

    const commandStack = useService('commandStack');

    const removeElement = (event) => {
      event.stopPropagation();

      const commands = [];

      const formData = getFormData(element),
            formFields = getFormFieldsList(element);

      if (!formFields || !formFields.length) {
        return;
      }

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: formData,
          propertyName: 'fields',
          objectsToRemove: [ formField ]
        }
      });

      // remove camunda:formData if there are no formFields anymore
      if (formFields.length === 1) {
        commands.push({
          cmd: 'properties-panel.update-businessobject-list',
          context: {
            element: element,
            currentObject: getBusinessObject(element).get('extensionElements'),
            propertyName: 'values',
            referencePropertyName: 'extensionElements',
            objectsToRemove: [ formData ]
          }
        });
      }

      commandStack.execute('properties-panel.multi-command-executor', commands);
    };

    return (
      <div onClick={ removeElement }>
        {
          children
        }
      </div>
    );
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
