import {
  useContext
} from 'preact/hooks';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelContext
} from '../../../context';

import {
  useService
} from '../../../hooks';

import ExtensionProperty from './ExtensionProperty';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';


export function ExtensionPropertiesProps(props) {

  const {
    element
  } = props;

  let businessObject = getRelevantBusinessObject(element);

  // do not offer for empty pools
  if (!businessObject) {
    return;
  }

  const properties = getPropertiesList(businessObject) || [];

  const items = properties.map((property, index) => {
    const id = element.id + '-extensionProperty-' + index;

    return {
      id,
      label: property.get('name') || '',
      entries: ExtensionProperty({
        idPrefix: id,
        element,
        property
      }),
      autoFocusEntry: id + '-name',
      remove: RemoveContainer({ property })
    };
  });

  return {
    items,
    add: AddExtensionProperty
  };
}

function RemoveContainer(props) {
  const {
    property
  } = props;

  return function RemoveExtensionProperty(props) {
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

      const businessObject = getRelevantBusinessObject(element);
      const properties = getProperties(businessObject);

      if (!properties) {
        return;
      }

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: properties,
          propertyName: 'values',
          objectsToRemove: [ property ]
        }
      });

      // remove camunda:Properties if there are no properties anymore
      if (properties.get('values').length === 1) {
        commands.push({
          cmd: 'properties-panel.update-businessobject-list',
          context: {
            element: element,
            currentObject: getBusinessObject(element).get('extensionElements'),
            propertyName: 'values',
            objectsToRemove: [ properties ]
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

function AddExtensionProperty(props) {
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

    let commands = [];

    const businessObject = getRelevantBusinessObject(element);

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

    // (2) ensure camunda:Properties
    let properties = getProperties(businessObject);

    if (!properties) {
      const parent = extensionElements;

      properties = createElement('camunda:Properties', {
        values: []
      }, parent, bpmnFactory);

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ properties ]
        }
      });
    }

    // (3) create camunda:Property
    const property = createElement('camunda:Property', {}, properties, bpmnFactory);

    // (4) add property to list
    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: properties,
        propertyName: 'values',
        objectsToAdd: [ property ]
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


// helper //////////////////

function getRelevantBusinessObject(element) {
  let businessObject = getBusinessObject(element);

  if (is(element, 'bpmn:Participant')) {
    return businessObject.get('processRef');
  }

  return businessObject;
}

function getProperties(businessObject) {
  return getExtensionElementsList(businessObject, 'camunda:Properties')[0];
}

function getPropertiesList(businessObject) {
  const properties = getProperties(businessObject);
  return properties && properties.get('values');
}