import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import { without } from 'min-dash';

import { TaskListenerEntries, EVENT_TYPE, EVENT_TO_LABEL } from './TaskListener';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import { isZeebeUserTask } from '../utils/FormUtil';


export function TaskListenersProps({ element, injector }) {
  let businessObject = getRelevantBusinessObject(element);

  // not allowed in empty pools
  if (!businessObject) {
    return;
  }

  if (!isZeebeUserTask(element)) {
    return;
  }

  const moddle = injector.get('moddle');
  if (!canHaveTaskListeners(businessObject, moddle)) {
    return;
  }

  const listeners = getListenersList(businessObject) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack'),
        modeling = injector.get('modeling'),
        translate = injector.get('translate');

  const items = listeners.map((listener, index) => {
    const id = element.id + '-taskListener-' + index;
    const type = listener.get('type') || '<no type>';

    return {
      id,
      label: translate(`${EVENT_TO_LABEL[listener.get('eventType')]}: {type}`, { type }),
      entries: TaskListenerEntries({
        idPrefix: id,
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
    const container = getTaskListenersContainer(businessObject);

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

    // (2) ensure zeebe:TaskListeners
    let taskListeners = getTaskListenersContainer(businessObject);

    if (!taskListeners) {
      const parent = extensionElements;

      taskListeners = createElement('zeebe:TaskListeners', {
        listeners: []
      }, parent, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), taskListeners ]
          }
        }
      });
    }

    // (3) create zeebe:TaskListener
    const TaskListener = createElement(
      'zeebe:TaskListener', getDefaultListenerProps(), taskListeners, bpmnFactory
    );

    // (4) add TaskListener to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskListeners,
        properties: {
          listeners: [ ...taskListeners.get('listeners'), TaskListener ]
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

function getTaskListenersContainer(element) {
  const TaskListeners = getExtensionElementsList(element, 'zeebe:TaskListeners');

  return TaskListeners && TaskListeners[0];
}

function getListenersList(element) {
  const TaskListeners = getTaskListenersContainer(element);

  return TaskListeners && TaskListeners.get('listeners');
}

function canHaveTaskListeners(bo, moddle) {
  const TaskListenersDescriptor = moddle.getTypeDescriptor('zeebe:TaskListeners');

  return isAny(bo, TaskListenersDescriptor.meta.allowedIn);
}

function getDefaultListenerProps() {
  return {
    eventType: EVENT_TYPE[0]
  };
}