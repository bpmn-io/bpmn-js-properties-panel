import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import { without } from 'min-dash';

import { ExecutionListenerEntries, getEventTypes, EVENT_TO_LABEL } from './ExecutionListener';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  getCompensateEventDefinition
} from '../../../utils/EventDefinitionUtil';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }


export function ExecutionListenersProps({ element, injector }) {
  let businessObject = getRelevantBusinessObject(element);

  // not allowed in empty pools
  if (!businessObject) {
    return;
  }

  const moddle = injector.get('moddle');
  if (!canHaveExecutionListeners(businessObject, moddle)) {
    return;
  }

  const listeners = getListenersList(businessObject) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack'),
        modeling = injector.get('modeling'),
        translate = injector.get('translate');

  const items = listeners.map((listener, index) => {
    const id = element.id + '-executionListener-' + index;
    const type = listener.get('type') || '<no type>';

    return {
      id,
      label: translate(`${EVENT_TO_LABEL[listener.get('eventType')]}: {type}`, { type }),
      entries: ExecutionListenerEntries({
        idPrefix: id,
        element,
        listener
      }),
      autoFocusEntry: id + '-eventType',
      remove: removeFactory({ modeling, element, listener })
    };
  });

  return {
    items,
    add: addFactory({ bpmnFactory, commandStack, element })
  };
}

function removeFactory({ modeling, element, listener }) {
  return function(event) {
    event.stopPropagation();

    const businessObject = getRelevantBusinessObject(element);
    const container = getExecutionListenersContainer(businessObject);

    if (!container) {
      return;
    }

    const listeners = without(container.get('listeners'), listener);

    modeling.updateModdleProperties(element, container, { listeners });
  };
}

function addFactory({ bpmnFactory, commandStack, element }) {
  return function(event) {
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
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure zeebe:ExecutionListeners
    let executionListeners = getExecutionListenersContainer(businessObject);

    if (!executionListeners) {
      const parent = extensionElements;

      executionListeners = createElement('zeebe:ExecutionListeners', {
        listeners: []
      }, parent, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), executionListeners ]
          }
        }
      });
    }

    // (3) create zeebe:ExecutionListener
    const executionListener = createElement(
      'zeebe:ExecutionListener', getDefaultListenerProps(element), executionListeners, bpmnFactory
    );

    // (4) add executionListener to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: executionListeners,
        properties: {
          listeners: [ ...executionListeners.get('listeners'), executionListener ]
        }
      }
    });

    // (5) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}


// helper //////////////////

function getRelevantBusinessObject(element) {
  let businessObject = getBusinessObject(element);

  if (is(element, 'bpmn:Participant')) {
    return businessObject.get('processRef');
  }

  return businessObject;
}

function getExecutionListenersContainer(element) {
  const executionListeners = getExtensionElementsList(element, 'zeebe:ExecutionListeners');

  return executionListeners && executionListeners[0];
}

function getListenersList(element) {
  const executionListeners = getExecutionListenersContainer(element);

  return executionListeners && executionListeners.get('listeners');
}

function canHaveExecutionListeners(bo, moddle) {
  const executionListenersDescriptor = moddle.getTypeDescriptor('zeebe:ExecutionListeners');

  if (!isAny(bo, executionListenersDescriptor.meta.allowedIn)) {
    return false;
  }

  if (isCompensationBoundaryEvent(bo)) {
    return false;
  }

  return true;
}

function isCompensationBoundaryEvent(bo) {
  return is(bo, 'bpmn:BoundaryEvent') && getCompensateEventDefinition(bo);
}

function getDefaultListenerProps(element) {
  const eventTypes = getEventTypes(element);

  return {
    eventType: eventTypes[0]
  };
}