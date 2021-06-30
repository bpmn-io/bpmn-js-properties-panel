import {
  useContext
} from 'preact/hooks';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelContext
} from '../../../context';

import {
  useService
} from '../../../hooks';

import Header from './Header';

import {
  getHeaders,
  getTaskHeaders
} from '../utils/HeadersUtil';

import {
  createElement
} from '../utils/ElementUtil';


export function HeaderProps(element) {
  const headers = getHeaders(element) || [];

  const items = headers.map((header, index) => {
    const id = 'header-' + index;

    return {
      id,
      label: header.get('key') || '',
      entries: Header({
        idPrefix: id,
        element,
        header
      }),
      autoFocusEntry: id + '-key',
      remove: RemoveContainer({ header })
    };
  });

  return {
    items,
    add: AddHeader
  };
}

function RemoveContainer(props) {
  const {
    header
  } = props;

  return function RemoveHeader(props) {
    const {
      children
    } = props;

    const {
      selectedElement: element
    } = useContext(BpmnPropertiesPanelContext);

    const commandStack = useService('commandStack');

    const removeElement = (event) => {
      event.stopPropagation();

      let commands = [];

      const taskHeaders = getTaskHeaders(element);

      if (!taskHeaders) {
        return;
      }

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: taskHeaders,
          propertyName: 'values',
          objectsToRemove: [ header ]
        }
      });

      // remove zeebe:TaskHeaders if there are no headers anymore
      if (taskHeaders.get('values').length === 1) {
        commands.push({
          cmd: 'properties-panel.update-businessobject-list',
          context: {
            element: element,
            currentObject: getBusinessObject(element).get('extensionElements'),
            propertyName: 'values',
            objectsToRemove: [ taskHeaders ]
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

function AddHeader(props) {
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

    // (2) ensure zeebe:TaskHeaders
    let taskHeaders = getTaskHeaders(element);

    if (!taskHeaders) {
      const parent = extensionElements;

      taskHeaders = createElement('zeebe:TaskHeaders', {
        values: []
      }, parent, bpmnFactory);

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ taskHeaders ]
        }
      });
    }

    // (3) create header
    const header = createElement('zeebe:Header', {}, taskHeaders, bpmnFactory);

    // (4) add header to list
    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: taskHeaders,
        propertyName: 'values',
        objectsToAdd: [ header ]
      }
    });

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