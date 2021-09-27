import {
  getImplementationType
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
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';

import Error from './Error';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';


export function ErrorsProps(props) {
  const {
    element
  } = props;

  const businessObject = getBusinessObject(element);

  if (!is(element, 'bpmn:ServiceTask') || getImplementationType(element) !== 'external') {
    return null;
  }

  const errorEventDefinitions = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');

  const items = errorEventDefinitions.map((errorEventDefinition, index) => {
    const id = element.id + '-error-' + index;

    return {
      id,
      label: getErrorLabel(errorEventDefinition),
      entries: Error({
        idPrefix: id,
        element,
        errorEventDefinition
      }),
      autoFocusEntry: id + '-errorRef',
      remove: RemoveContainer({ errorEventDefinition })
    };
  });

  return {
    items,
    add: AddError
  };
}

function RemoveContainer(props) {
  const {
    errorEventDefinition
  } = props;

  return function RemoveError(props) {
    const {
      children
    } = props;

    const {
      selectedElement: element
    } = useContext(BpmnPropertiesPanelContext);

    const commandStack = useService('commandStack');

    const removeElement = (event) => {
      event.stopPropagation();

      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements');

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: extensionElements,
        propertyName: 'values',
        referencePropertyName: 'extensionElements',
        objectsToRemove: [ errorEventDefinition ]
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

function AddError(props) {
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

    // (2) create empty camunda:Error extensionElement
    const error = createElement(
      'camunda:ErrorEventDefinition',
      {},
      extensionElements,
      bpmnFactory
    );

    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: extensionElements,
        propertyName: 'values',
        objectsToAdd: [ error ]
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

// helpers //////////

function getErrorLabel(errorEventDefinition) {
  const error = errorEventDefinition.get('errorRef');

  if (!error) {
    return '<no reference>';
  }

  const errorCode = error.get('errorCode'),
        name = error.get('name');

  if (errorCode) {
    return `${ name } (code = ${ errorCode })`;
  }

  return name;
}
