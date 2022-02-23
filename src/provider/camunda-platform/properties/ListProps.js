import { ListEntry, SimpleEntry } from '@bpmn-io/properties-panel';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { without } from 'min-dash';

import {
  useService
} from '../../../hooks';

import {
  createElement
} from '../../../utils/ElementUtil';


function ListProp(props) {
  const {
    element,
    id: idPrefix,
    index,
    item
  } = props;

  const id = `${ idPrefix }-listItem-${ index }`;

  return (
    <ListItem
      idPrefix={ id }
      element={ element }
      item={ item }
    />
  );
}

export function ListProps(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const list = parameter.get('definition');
  const items = list.get('items');

  function addItem() {
    const value = createElement('camunda:Value', {}, parameter, bpmnFactory);

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: list,
      properties: {
        items: [ ...list.get('items'), value ]
      }
    });
  }

  function removeItem(item) {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: list,
      properties: {
        items: without(list.get('items'), item)
      }
    });
  }

  function compareFn(item, anotherItem) {
    const [ value = '', anotherValue = '' ] = [ item.value, anotherItem.value ];

    return value === anotherValue ? 0 : value > anotherValue ? 1 : -1;
  }

  return ListEntry({
    element,
    autoFocusEntry: true,
    compareFn,
    id: idPrefix + '-list',
    items,
    label: translate('List values'),
    onAdd: addItem,
    onRemove: removeItem,
    component: ListProp
  });
}

function ListItem(props) {
  const {
    idPrefix,
    element,
    item
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const definitionLabels = {
    'camunda:Map': translate('Map'),
    'camunda:List': translate('List'),
    'camunda:Script': translate('Script')
  };

  const getValue = () => {
    if (isDefinitionType(item)) {
      return definitionLabels[item.$type];
    }

    return item.get('value');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: item,
      properties: {
        value
      }
    });
  };

  return ListValue({
    id: idPrefix + '-value',
    disabled: isDefinitionType(item),
    getValue,
    setValue
  });
}

function ListValue(props) {
  const {
    id,
    disabled,
    getValue,
    setValue
  } = props;

  const debounce = useService('debounceInput', true);

  return (
    <SimpleEntry
      id={ id }
      getValue={ getValue }
      setValue={ setValue }
      disabled={ disabled }
      debounce={ debounce } />
  );
}

// helper //////////////////////

function isScript(element) {
  return is(element, 'camunda:Script');
}

function isList(element) {
  return is(element, 'camunda:List');
}

function isMap(element) {
  return is(element, 'camunda:Map');
}

function isDefinitionType(element) {
  return isScript(element) || isList(element) || isMap(element);
}