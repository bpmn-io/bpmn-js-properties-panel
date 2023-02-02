import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import Header from './Header';

import {
  areHeadersSupported,
  getHeaders,
  getTaskHeaders
} from '../utils/HeadersUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import { without } from 'min-dash';


export function HeaderProps({ element, injector }) {

  if (!areHeadersSupported(element)) {
    return null;
  }

  const headers = getHeaders(element) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = headers.map((header, index) => {
    const id = element.id + '-header-' + index;

    return {
      id,
      label: header.get('key') || '',
      entries: Header({
        idPrefix: id,
        element,
        header
      }),
      autoFocusEntry: id + '-key',
      remove: removeFactory({ commandStack, element, header })
    };
  });

  return {
    items,
    add: addFactory({ bpmnFactory, commandStack, element }),
    shouldSort: false
  };
}

function removeFactory({ commandStack, element, header }) {
  return function(event) {
    event.stopPropagation();

    let commands = [];

    const taskHeaders = getTaskHeaders(element);

    if (!taskHeaders) {
      return;
    }

    const newTaskHeaders = without(taskHeaders.get('values'), header);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskHeaders,
        properties: {
          values: newTaskHeaders
        }
      }
    });

    // remove zeebe:TaskHeaders if there are no headers anymore
    if (!newTaskHeaders.length) {
      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements');

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: without(extensionElements.get('values'), taskHeaders)
          }
        }
      });
    }

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

function addFactory({ bpmnFactory, commandStack, element }) {
  return function(event) {

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
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
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
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), taskHeaders ]
          }
        }
      });
    }

    // (3) create header
    const header = createElement('zeebe:Header', {}, taskHeaders, bpmnFactory);

    // (4) add header to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskHeaders,
        properties: {
          values: [ ...taskHeaders.get('values'), header ]
        }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);

  };
}
