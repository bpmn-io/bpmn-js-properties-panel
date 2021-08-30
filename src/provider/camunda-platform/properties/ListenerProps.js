import ListEntry from '@bpmn-io/properties-panel/lib/components/entries/List';
import CollapsibleEntry from '@bpmn-io/properties-panel/lib/components/entries/Collapsible';
import SelectEntry from '@bpmn-io/properties-panel/lib/components/entries/Select';


import {
  useContext
} from 'preact/hooks';

import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import FieldInjection from './FieldInjection';

import {
  addExtensionElement,
  getExtensionElementsList,
  removeExtensionElement
} from '../utils/ExtensionElementsUtil';

import { getImplementationType } from '../utils/ImplementationTypeUtils';

import {
  BpmnPropertiesPanelContext
} from '../../../context';

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

const IMPLEMENTATION_TYPE_TO_LABEL = {
  class: 'Java class',
  expression: 'Expression',
  delegateExpression: 'Delegate expression',
  script: 'Script'
};

const EVENT_TO_LABEL = {
  start: 'Start',
  end: 'End',
  take: 'Take'
};

/**
 * Cf. https://docs.camunda.org/manual/latest/user-guide/process-engine/delegation-code/#execution-listener
 */
export function ExecutionListenerProps(props) {
  const {
    element
  } = props;

  if (!isAny(element, LISTENER_ALLOWED_TYPES)) {
    return;
  }

  if (is(element, 'bpmn:Participant') && !element.businessObject.processRef) {
    return;
  }

  const businessObject = getListenersContainer(element);
  const listeners = getExtensionElementsList(businessObject, 'camunda:ExecutionListener');

  return {
    items: listeners.map((listener, index) => {
      const id = `${element.id}-listener-${index}`;

      // @TODO(barmac): Find a way to pass translate for internationalized label.
      return {
        id,
        label: getListenerLabel(listener),
        entries: ExecutionListener({
          idPrefix: id,
          element,
          listener
        }),
        remove: RemoveListenerContainer({ listener })
      };
    }),
    add: AddListener
  };
}

function ExecutionListener(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;


  return [{
    id: `${idPrefix}-eventType`,
    component: <EventType id={ `${idPrefix}-eventType` } element={ element } listener={ listener } />
  },
  {
    id: `${idPrefix}-listenerType`,
    component: <ListenerType id={ `${idPrefix}-listenerType` } element={ element } listener={ listener } />
  },
  ...ImplementationDetails({ idPrefix, element, listener }),
  {
    id: `${idPrefix}-fields`,
    component: <Fields id={ `${idPrefix}-fields` } element={ element } listener={ listener } />
  }];
}

function RemoveListenerContainer(props) {
  const { listener } = props;

  return function RemoveListener(props) {
    const {
      children
    } = props;

    const {
      selectedElement: element
    } = useContext(BpmnPropertiesPanelContext);

    const modeling = useService('modeling');

    function removeListener(event) {
      event.stopPropagation();
      removeExtensionElement(element, getListenersContainer(element), listener, modeling);
    }

    return (
      <div onClick={ removeListener }>
        { children }
      </div>
    );
  };
}

function EventType({ id, element, listener }) {

  const modeling = useService('modeling');
  const translate = useService('translate');

  function getValue() {
    return listener.get('event');
  }

  function setValue(value) {
    modeling.updateModdleProperties(
      element,
      listener,
      { event: value }
    );
  }

  function getOptions() {
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
    return [{
      id: getPrefixedId(idPrefix, 'javaClass'),
      component: <JavaClass element={ element } businessObject={ listener } id={ getPrefixedId(idPrefix, 'javaClass') } />
    }];
  } else if (type === 'expression') {
    return [{
      id: getPrefixedId(idPrefix, 'expression'),
      component: <Expression element={ element } businessObject={ listener } id={ getPrefixedId(idPrefix, 'expression') } />
    }];
  } else if (type === 'delegateExpression') {
    return [{
      id: getPrefixedId(idPrefix, 'delegateExpression'),
      component: <DelegateExpression element={ element } businessObject={ listener } id={ getPrefixedId(idPrefix, 'delegateExpression') } />
    }];
  } else if (type === 'script') {
    return ScriptProps({ element, script: listener.get('script'), prefix: idPrefix });
  }
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

  function Field(field, index, isNew) {
    const fieldId = `${id}-field-${index}`;

    return (
      <CollapsibleEntry
        id={ fieldId }
        entries={ FieldInjection({ idPrefix: fieldId, element, field }) }
        label={ field.get('name') || '<empty>' }
        open={ !!isNew }
      />
    );
  }

  function addField() {
    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: listener,
      objectsToAdd: [ createElement('camunda:Field', {}, listener, bpmnFactory) ],
      propertyName: 'fields'
    });
  }

  function removeField(field) {
    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: listener,
      objectsToRemove: [ field ],
      propertyName: 'fields'
    });
  }

  return <ListEntry
    id={ id }
    element={ element }
    label={ translate('Field injection') }
    items={ fields }
    renderItem={ Field }
    onAdd={ addField }
    onRemove={ removeField }
    compareFn={ compareName }
    autoFocusEntry
  />;
}

function AddListener(props) {

  const {
    children
  } = props;

  const {
    selectedElement: element
  } = useContext(BpmnPropertiesPanelContext);

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');

  const addListener = event => {
    event.stopPropagation();

    const listener = bpmnFactory.create('camunda:ExecutionListener', {
      event: getDefaultEvent(element),
      class: ''
    });

    const businessObject = getListenersContainer(element);

    addExtensionElement(element, businessObject, listener, bpmnFactory, commandStack);
  };

  return (
    <div onClick={ addListener }>
      { children }
    </div>
  );
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

function getDefaultEvent(element) {
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

function getPrefixedId(prefix, id) {
  return `${prefix}-${id}`;
}

function compareName(field, anotherField) {
  const [ name = '', anotherName = '' ] = [ field.name, anotherField.name ];

  return name === anotherName ? 0 : name > anotherName ? 1 : -1;
}

function getListenersContainer(element) {
  const bo = getBusinessObject(element);

  return bo.get('processRef') || bo;
}
