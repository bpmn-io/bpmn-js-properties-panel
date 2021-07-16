import {
  getServiceTaskLikeBusinessObject
} from '../utils/ImplementationTypeUtils';

import {
  useContext
} from 'preact/hooks';

import {
  BpmnPropertiesPanelContext
} from '../../../context';

import {
  useService
} from '../../../hooks';

import {
  createElement
} from '../../bpmn/utils/ElementUtil';

import {
  getExtensionElementsList
} from '../../zeebe/utils/ExtensionElementsUtil';

import FieldInjection from './FieldInjection';


export function FieldInjectionProps(props) {
  const {
    element
  } = props;

  const businessObject = getServiceTaskLikeBusinessObject(element);

  if (!businessObject) {
    return null;
  }

  const fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');

  const items = fieldInjections.map((field, index) => {
    const id = 'fieldInjection-' + index;

    return {
      id,
      label: getFieldLabel(field),
      entries: FieldInjection({
        idPrefix: id,
        element,
        field
      }),
      autoFocusEntry: id + '-name',
      remove: RemoveContainer({ field })
    };
  });

  return {
    items,
    add: AddFieldInjection
  };
}

function RemoveContainer(props) {
  const {
    field
  } = props;

  return function RemoveFieldInjection(props) {
    const {
      children
    } = props;

    const {
      selectedElement: element
    } = useContext(BpmnPropertiesPanelContext);

    const commandStack = useService('commandStack');

    const removeElement = (event) => {
      event.stopPropagation();

      const businessObject = getServiceTaskLikeBusinessObject(element),
            extensionElements = businessObject.get('extensionElements');

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: extensionElements,
        propertyName: 'values',
        referencePropertyName: 'extensionElements',
        objectsToRemove: [ field ]
      });
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

function AddFieldInjection(props) {
  const {
    children
  } = props;

  const {
    selectedElement: element
  } = useContext(BpmnPropertiesPanelContext);

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack');

  const addElement = (event) => {

    event.stopPropagation();

    const commands = [];

    const businessObject = getServiceTaskLikeBusinessObject(element);

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

    // (2) create empty camunda:Field extensionElement
    const fieldInjection = createElement(
      'camunda:Field',
      {
        name: undefined,
        string: '', // string is the default type
        stringValue: undefined
      },
      extensionElements,
      bpmnFactory
    );

    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: extensionElements,
        propertyName: 'values',
        objectsToAdd: [ fieldInjection ]
      }
    });

    // (3) execute the commands
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

// helper ///////////////

function getFieldLabel(field) {
  return field.name || '<empty>';
}
