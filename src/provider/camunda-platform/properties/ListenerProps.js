import {
  CollapsibleEntry,
  ListEntry,
  SelectEntry,
  TextFieldEntry,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';


import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import FieldInjection from './FieldInjection';

import {
  addExtensionElements,
  getExtensionElementsList,
  removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';

import { getImplementationType } from '../utils/ImplementationTypeUtils';

import {
  useService
} from '../../../hooks';

import { createElement } from '../../../utils/ElementUtil';
import {
  DelegateExpression,
  Expression,
  JavaClass
} from './ImplementationProps';

import { ScriptProps } from './ScriptProps';
import { TimerProps } from './TimerProps';
import { getTimerEventDefinition } from '../../bpmn/utils/EventDefinitionUtil';

import { without } from 'min-dash';


const LISTENER_ALLOWED_TYPES = [
  'bpmn:Activity',
  'bpmn:Event',
  'bpmn:Gateway',
  'bpmn:SequenceFlow',
  'bpmn:Process',
  'bpmn:Participant'
];

const SCRIPT_PROPS = {
  'script': undefined,
  'resource': undefined,
  'scriptFormat': undefined
};

const CLASS_PROPS = {
  'class': undefined
};

const EXPRESSION_PROPS = {
  'expression': undefined
};

const DELEGATE_EXPRESSION_PROPS = {
  'delegateExpression': undefined
};

const DEFAULT_PROPS = {
  ...SCRIPT_PROPS,
  ...CLASS_PROPS,
  ...EXPRESSION_PROPS,
  ...DELEGATE_EXPRESSION_PROPS
};

const DEFAULT_EVENT_PROPS = {
  'eventDefinitions' : undefined,
  'event': undefined
};

const IMPLEMENTATION_TYPE_TO_LABEL = {
  class: 'Java class',
  expression: 'Expression',
  delegateExpression: 'Delegate expression',
  script: 'Script'
};

const EVENT_TO_LABEL = {
  start: 'Start',
  end: 'End',
  take: 'Take',
  create:'Create',
  assignment: 'Assignment',
  complete: 'Complete',
  delete: 'Delete',
  update: 'Update',
  timeout: 'Timeout'
};

/**
 * Cf. https://docs.camunda.org/manual/latest/user-guide/process-engine/delegation-code/#execution-listener
 */
export function ExecutionListenerProps({ element, injector }) {

  if (!isAny(element, LISTENER_ALLOWED_TYPES)) {
    return;
  }

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  if (is(element, 'bpmn:Participant') && !element.businessObject.processRef) {
    return;
  }

  const businessObject = getListenersContainer(element);
  const listeners = getExtensionElementsList(businessObject, 'camunda:ExecutionListener');

  return {
    items: listeners.map((listener, index) => {
      const id = `${element.id}-executionListener-${index}`;

      // @TODO(barmac): Find a way to pass translate for internationalized label.
      return {
        id,
        label: getListenerLabel(listener),
        entries: ExecutionListener({
          idPrefix: id,
          element,
          listener
        }),
        remove: removeListenerFactory({ element, listener, commandStack })
      };
    }),
    add: addExecutionListenerFactory({ bpmnFactory, commandStack, element })
  };
}

function ExecutionListener(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;


  return [ {
    id: `${idPrefix}-eventType`,
    component: EventType,
    listener
  },
  {
    id: `${idPrefix}-listenerType`,
    component: ListenerType,
    listener
  },
  ...ImplementationDetails({ idPrefix, element, listener }),
  {
    id: `${idPrefix}-fields`,
    component: Fields,
    listener
  } ];
}

export function TaskListenerProps({ element, injector }) {

  if (!is(element, 'bpmn:UserTask')) {
    return;
  }

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const businessObject = getListenersContainer(element);
  const listeners = getExtensionElementsList(businessObject, 'camunda:TaskListener');

  return {
    items: listeners.map((listener, index) => {
      const id = `${element.id}-taskListener-${index}`;

      // @TODO(barmac): Find a way to pass translate for internationalized label.
      return {
        id,
        label: getListenerLabel(listener),
        entries: TaskListener({
          idPrefix: id,
          element,
          listener
        }),

        remove: removeListenerFactory({ element, listener, commandStack })
      };
    }),

    add: addTaskListenerFactory({ bpmnFactory, commandStack, element })
  };
}

function TaskListener(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;


  return [ {
    id: `${idPrefix}-eventType`,
    component: EventType,
    listener
  },
  {
    id: `${idPrefix}-listenerId`,
    component: ListenerId,
    listener
  },
  {
    id: `${idPrefix}-listenerType`,
    component: ListenerType,
    listener
  },
  ...ImplementationDetails({ idPrefix, element, listener }),
  ...EventTypeDetails({ idPrefix, element, listener }),
  {
    id: `${idPrefix}-fields`,
    component: Fields,
    listener
  } ];
}

function removeListenerFactory({ element, listener, commandStack }) {
  return function removeListener(event) {
    event.stopPropagation();

    removeExtensionElements(element, getListenersContainer(element), listener, commandStack);
  };
}

function EventType({ id, element, listener }) {

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');

  function getValue() {
    return listener.get('event');
  }

  function setValue(value) {
    const properties = getDefaultEventTypeProperties(value, bpmnFactory);

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: listener,
      properties
    });
  }

  function getOptions() {

    if (is(listener, 'camunda:TaskListener')) {
      return [
        { value: 'create', label: translate('create') },
        { value: 'assignment', label: translate('assignment') },
        { value: 'complete', label: translate('complete') },
        { value: 'delete', label: translate('delete') },
        { value: 'update', label: translate('update') },
        { value: 'timeout', label: translate('timeout') }
      ];
    }

    if (is(element, 'bpmn:SequenceFlow')) {
      return [ { value: 'take', label: translate('take') } ];
    }

    return [
      { value: 'start', label: translate('start') },
      { value: 'end', label: translate('end') }
    ];
  }

  return <SelectEntry
    id={ id }
    label={ translate('Event type') }
    getValue={ getValue }
    setValue={ setValue }
    getOptions={ getOptions }
  />;
}

function ListenerId({ id, element, listener }) {

  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');

  let options = {
    element,
    id: id,
    label: translate('Listener ID'),
    debounce,
    isEdited: isTextFieldEntryEdited,
    setValue: (value) => {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: listener,
        properties: {
          'camunda:id': value
        }
      });
    },
    getValue: () => {
      return listener.get('camunda:id');
    }
  };

  return TextFieldEntry(options);
}

function ListenerType({ id, element, listener }) {

  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  function getValue() {
    return getListenerType(listener);
  }

  function setValue(value) {
    const properties = getDefaultImplementationProperties(value, bpmnFactory);

    modeling.updateModdleProperties(
      element,
      listener,
      properties
    );
  }

  function getOptions() {
    return getListenerTypeOptions(translate);
  }

  return <SelectEntry
    id={ id }
    label={ translate('Listener type') }
    getValue={ getValue }
    setValue={ setValue }
    getOptions={ getOptions }
  />;
}

function ImplementationDetails(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;

  const type = getListenerType(listener);

  if (type === 'class') {
    return [ {
      id: getPrefixedId(idPrefix, 'javaClass'),
      component: JavaClass,
      businessObject: listener
    } ];
  } else if (type === 'expression') {
    return [ {
      id: getPrefixedId(idPrefix, 'expression'),
      component: Expression,
      businessObject: listener
    } ];
  } else if (type === 'delegateExpression') {
    return [ {
      id: getPrefixedId(idPrefix, 'delegateExpression'),
      component: DelegateExpression,
      businessObject: listener
    } ];
  } else if (type === 'script') {
    return ScriptProps({ element, script: listener.get('script'), prefix: idPrefix });
  }

  // should never happen
  return [];
}

function EventTypeDetails(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;

  const type = listener.get('event');

  if (type === 'timeout') {

    return TimerProps({ element, listener, timerEventDefinition: getTimerEventDefinition(listener), idPrefix: idPrefix });
  }
  return [];
}

function Field(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: field,
    open
  } = props;

  const fieldId = `${ idPrefix }-field-${ index }`;

  return (
    <CollapsibleEntry
      id={ fieldId }
      element={ element }
      entries={ FieldInjection({
        element,
        field,
        idPrefix: fieldId
      }) }
      label={ field.get('name') || '<empty>' }
      open={ open }
    />
  );
}

function Fields(props) {
  const {
    id,
    element,
    listener
  } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const fields = listener.get('fields');

  function addField() {
    const field = createElement('camunda:Field', {}, listener, bpmnFactory);

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: listener,
      properties: {
        fields: [ ...listener.get('fields'), field ]
      }
    });
  }

  function removeField(field) {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: listener,
      properties: {
        fields: without(listener.get('fields'), field)
      }
    });
  }

  return <ListEntry
    id={ id }
    element={ element }
    label={ translate('Field injection') }
    items={ fields }
    component={ Field }
    onAdd={ addField }
    onRemove={ removeField }
    compareFn={ compareName }
    autoFocusEntry
  />;
}

function addListenerFactory({ bpmnFactory, commandStack, element, listenerGroup }) {
  return function(event) {
    event.stopPropagation();

    const listener = bpmnFactory.create(listenerGroup, {
      event: getDefaultEvent(element, listenerGroup),
      class: ''
    });

    const businessObject = getListenersContainer(element);

    addExtensionElements(element, businessObject, listener, bpmnFactory, commandStack);
  };
}

function addTaskListenerFactory(props) {
  return addListenerFactory({ ...props, listenerGroup:'camunda:TaskListener' });
}

function addExecutionListenerFactory(props) {
  return addListenerFactory({ ...props, listenerGroup:'camunda:ExecutionListener' });
}

// helper

/**
 * Get a readable label for a listener.
 *
 * @param {ModdleElement} listener
 * @param {string => string} [translate]
 */
function getListenerLabel(listener, translate = value => value) {
  const event = listener.get('event');
  const implementationType = getListenerType(listener);

  return `${translate(EVENT_TO_LABEL[event])}: ${translate(IMPLEMENTATION_TYPE_TO_LABEL[implementationType])}`;
}

function getListenerTypeOptions(translate) {
  return Object.entries(IMPLEMENTATION_TYPE_TO_LABEL)
    .map(([ value, label ]) => ({
      value,
      label: translate(label)
    }));
}

function getListenerType(listener) {
  return getImplementationType(listener);
}

function getDefaultEvent(element, listenerGroup) {
  if (listenerGroup === 'camunda:TaskListener') return 'create';

  return is(element, 'bpmn:SequenceFlow') ? 'take' : 'start';
}

function getDefaultImplementationProperties(type, bpmnFactory) {
  switch (type) {
  case 'class':
    return { ...DEFAULT_PROPS, 'class': '' };
  case 'expression':
    return { ...DEFAULT_PROPS, 'expression': '' };
  case 'delegateExpression':
    return { ...DEFAULT_PROPS, 'delegateExpression': '' };
  case 'script':
    return { ...DEFAULT_PROPS, 'script': bpmnFactory.create('camunda:Script') };
  }
}

function getDefaultEventTypeProperties(type, bpmnFactory) {
  switch (type) {
  case 'timeout':
    return { ...DEFAULT_EVENT_PROPS, eventDefinitions: [ bpmnFactory.create('bpmn:TimerEventDefinition') ], event:type };
  default:
    return { ...DEFAULT_EVENT_PROPS, event: type };
  }
}

function getPrefixedId(prefix, id) {
  return `${prefix}-${id}`;
}

function compareName(field, anotherField) {
  const [ name = '', anotherName = '' ] = [ field.name, anotherField.name ];

  return name === anotherName ? 0 : name > anotherName ? 1 : -1;
}

function getListenersContainer(element) {
  const businessObject = getBusinessObject(element);

  return businessObject.get('processRef') || businessObject;
}
