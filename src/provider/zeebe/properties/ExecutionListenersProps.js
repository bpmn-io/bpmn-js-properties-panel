import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import { CollapsibleEntry, ListEntry } from '@bpmn-io/properties-panel';

import { groupBy, without } from 'min-dash';

import ExecutionListenerEntries from './ExecutionListener';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  getCompensateEventDefinition
} from '../../../utils/EventDefinitionUtil';


const EVENT_TO_LABEL = {
  'start': 'Start',
  'end': 'End'
};

const DEFAULT_LISTENER_PROPS = {
  eventType: 'start'
};


export function ExecutionListenersProps({ element, injector }) {
  let businessObject = getRelevantBusinessObject(element);

  // not allowed in empty pools
  if (!businessObject) {
    return;
  }

  if (!canHaveExecutionListeners(businessObject)) {
    return;
  }

  const listeners = getListenersList(businessObject) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack'),
        modeling = injector.get('modeling'),
        translate = injector.get('translate');

  const grouped = groupBy(listeners, 'eventType');

  const startListeners = grouped.start,
        endListeners = grouped.end;

  // const items = listeners.map((listener, index) => {
  //   const id = element.id + '-executionListener-' + index;
  //   const type = listener.get('type') || '<no type>';

  //   return {
  //     id,
  //     label: translate(`${EVENT_TO_LABEL[listener.get('eventType')]}: {type}`, { type }),
  //     entries: ExecutionListenerProperty({
  //       idPrefix: id,
  //       element,
  //       listener
  //     }),
  //     autoFocusEntry: id + '-eventType',
  //     remove: removeFactory({ modeling, element, listener })
  //   };
  // });

  const onRemove = removeFactory({ modeling, element });

  const entries = [
    {
      id: element.id + '-startExecutionListeners-',
      component: Listeners,
      label: translate('Start'),
      items: startListeners,
      onAdd: addFactory('start', { bpmnFactory, commandStack, element }),
      onRemove
    },
    {
      id: element.id + '-endExecutionListeners-',
      component: Listeners,
      label: translate('End'),
      items: endListeners,
      onAdd: addFactory('end', { bpmnFactory, commandStack, element }),
      onRemove
    }
  ];

  return entries;
}

function Listeners(props) {
  return <ListEntry
    { ...props }
    component={ ExecutionListener }
  />;
}


function removeFactory({ modeling, element }) {
  return function(listener) {
    const businessObject = getRelevantBusinessObject(element);
    const container = getExecutionListenersContainer(businessObject);

    if (!container) {
      return;
    }

    const listeners = without(container.get('listeners'), listener);

    modeling.updateModdleProperties(element, container, { listeners });
  };
}

function addFactory(eventType, { bpmnFactory, commandStack, element }) {
  return function() {
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
    const executionListener = createElement('zeebe:ExecutionListener', { eventType }, executionListeners, bpmnFactory);

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

function ExecutionListener(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: listener,
    open
  } = props;
  const listenerId = `${ idPrefix }-listener-${ index }`;

  return (
    <CollapsibleEntry
      id={ listenerId }
      element={ element }
      entries={ ExecutionListenerEntries({
        element,
        listener,
        idPrefix: listenerId
      }) }
      label={ listener.get('type') || '<no type>' }
      open={ open }
    />
  );
}


// helper //////////////////

export function getRelevantBusinessObject(element) {
  let businessObject = getBusinessObject(element);

  if (is(element, 'bpmn:Participant')) {
    return businessObject.get('processRef');
  }

  return businessObject;
}

export function getExecutionListenersContainer(element) {
  const executionListeners = getExtensionElementsList(element, 'zeebe:ExecutionListeners');

  return executionListeners && executionListeners[0];
}

export function getListenersList(element) {
  const executionListeners = getExecutionListenersContainer(element);

  return executionListeners && executionListeners.get('listeners');
}

function canHaveExecutionListeners(bo) {
  if (isCompensationBoundaryEvent(bo)) {
    return false;
  }

  return isAny(bo, [
    'bpmn:Process',
    'bpmn:Activity',
    'bpmn:Gateway',
    'bpmn:Event'
  ]);
}

function isCompensationBoundaryEvent(bo) {
  return is(bo, 'bpmn:BoundaryEvent') && getCompensateEventDefinition(bo);
}
