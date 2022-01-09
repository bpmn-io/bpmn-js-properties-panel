import { CollapsibleEntry, ListEntry, TextFieldEntry } from '@bpmn-io/properties-panel';

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

export function MapProps(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const map = parameter.get('definition');
  const entries = map.get('entries');

  function renderEntry(entry, index, open) {
    const entryId = `${idPrefix}-mapEntry-${index}`;

    return (
      <CollapsibleEntry
        id={ entryId }
        entries={ MapEntry({ idPrefix: entryId, element, entry }) }
        label={ entry.get('key') || translate('<empty>') }
        open={ open }
      />
    );
  }

  function addEntry() {
    const entry = createElement('camunda:Entry', {}, parameter, bpmnFactory);

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: map,
      properties: {
        entries: [ ...map.get('entries'), entry ]
      }
    });
  }

  function removeEntry(entry) {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: map,
      properties: {
        entries: without(map.get('entries'), entry)
      }
    });
  }

  function compareFn(entry, anotherEntry) {
    const [ key = '', anotherKey = '' ] = [ entry.key, anotherEntry.key ];

    return key === anotherKey ? 0 : key > anotherKey ? 1 : -1;
  }

  return ListEntry({
    element,
    autoFocusEntry: true,
    compareFn,
    id: idPrefix + '-map',
    items: entries,
    label: translate('Map entries'),
    onAdd: addEntry,
    onRemove: removeEntry,
    renderItem: renderEntry,
  });
}

function MapEntry(props) {
  const {
    element,
    entry,
    idPrefix
  } = props;

  const entries = [ {
    id: idPrefix + '-key',
    component: <MapKey idPrefix={ idPrefix } element={ element } entry={ entry } />
  },{
    id: idPrefix + '-value',
    component: <MapValue idPrefix={ idPrefix } element={ element } entry={ entry } />
  } ];

  return entries;
}

function MapKey(props) {
  const {
    idPrefix,
    element,
    entry
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: entry,
      properties: {
        key: value
      }
    });
  };

  const getValue = () => {
    return entry.get('key');
  };

  return TextFieldEntry({
    element: entry,
    id: idPrefix + '-key',
    label: translate('Key'),
    getValue,
    setValue,
    debounce
  });
}

function MapValue(props) {
  const {
    idPrefix,
    element,
    entry
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const definition = entry.get('definition');
  const definitionLabels = {
    'camunda:Map': translate('Map'),
    'camunda:List': translate('List'),
    'camunda:Script': translate('Script')
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: entry,
      properties: {
        value
      }
    });
  };

  const getValue = () => {
    if (isDefinitionType(definition)) {
      return definitionLabels[definition.$type];
    }

    return entry.get('value');
  };

  return TextFieldEntry({
    element: entry,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    disabled: isDefinitionType(definition),
    debounce
  });
}


// helper ///////////////////

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