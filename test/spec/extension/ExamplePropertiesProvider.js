import {
  useState,
  useContext,
  useMemo
} from '@bpmn-io/properties-panel/preact/hooks';

import {
  useService
} from 'src/hooks';

import {
  LayoutContext,
  TextFieldEntry
} from '@bpmn-io/properties-panel';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';


function provideEntries(element, groups) {

  // (1) add new group
  const newGroup = {
    id: 'foo-group',
    label: 'Custom Foo Group',
    entries: []
  };

  newGroup.entries.push({
    id: 'foo-button-entry-1',
    component: AsyncDataEntry
  },{
    id: 'foo-button-entry-2',
    component: SimplyButtonEntry
  }, {
    id: 'foo-button-entry-3',
    component: AddPropertiesEntry
  }, {
    id: 'foo-button-entry-4',
    component: ChangeLayoutEntry
  }, {
    id: 'foo-button-entry-5',
    component: OrderingEntry
  });

  groups.push(newGroup);

  // (2) add to existing group
  const generalGroup = groups.find(({ id }) => id === 'general');

  generalGroup.entries.push({
    id: 'foo-entry',
    component: SimpleInputEntry
  });

  return groups;
}
class ExamplePropertiesProvider {
  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(500, this);
  }

  getGroups(element) {
    return (groups) => {
      return provideEntries(element, groups);
    };
  }
}

ExamplePropertiesProvider.$inject = [ 'propertiesPanel' ];

export default {
  __init__: [
    'examplePropertiesProvider'
  ],
  examplePropertiesProvider: [ 'type', ExamplePropertiesProvider ]
};

function SimpleInputEntry(props) {
  const {
    element
  } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');

  if (!is(element, 'bpmn:StartEvent')) {
    return;
  }

  const setValue = (value) => {
    modeling.updateProperties(element, {
      foo: value
    });
  };

  const getValue = (element) => {
    return element.businessObject.$attrs.foo;
  };

  return TextFieldEntry({
    element,
    id: 'foo',
    label: 'Some custom <Foo> Entry',
    getValue,
    setValue,
    debounce
  });
}

function SimplyButtonEntry(props) {
  const modeling = useService('modeling');

  const elementFactory = useService('elementFactory');

  const elementRegistry = useService('elementRegistry');

  const handleClick = () => {
    const serviceTask = elementFactory.createShape({ type: 'bpmn:ServiceTask' });

    const process = elementRegistry.get('Process_1');

    modeling.createShape(serviceTask, { x: Math.random() * 300, y: Math.random() * 400 }, process);
  };

  return (
    <div class="bio-properties-panel-entry">
      <button onClick={ handleClick }>Create an element</button>
    </div>
  );
}

function AddPropertiesEntry(props) {
  const propertiesPanel = useService('propertiesPanel');

  const handleClick = () => {
    propertiesPanel.registerProvider(499, {
      getGroups: (element) => {
        return (groups) => {
          return provideEntries(element, groups);
        };
      }
    });
  };

  return (
    <div class="bio-properties-panel-entry">
      <button onClick={ handleClick }>Add properties on the fly</button>
    </div>
  );
}

function ChangeLayoutEntry(props) {
  const {
    layout,
    setLayout
  } = useContext(LayoutContext);

  const hideEntry = () => {
    setLayout({
      ...layout,
      open: false
    });
  };

  return (
    <div>
      <div class="bio-properties-panel-entry">
        <button onClick={ hideEntry }>Hide properties panel</button>
      </div>
    </div>
  );
}

function AsyncDataEntry(props) {

  const [ value, setValue ] = useState(0);

  const longRunningFunction = async () => {
    return await new Promise(resolve => setTimeout(() => {
      resolve(500);
    }, 1500));
  };

  longRunningFunction().then((result) => {
    setValue(result);
  });

  return (
    <div class="bio-properties-panel-entry">
      {'Async Data: ' + value}
    </div>
  );
}

function OrderingEntry(props) {
  const {
    element
  } = props;

  const {
    layout,
    setLayoutForKey
  } = useContext(LayoutContext);

  const layoutKey = useMemo(() => {
    return `customOrdering-${element.id}`;
  }, [ element.id ]);

  const ordering = layout[layoutKey] || [ 1, 2, 3, 4, 5 ];

  const setRandomOrdering = () =>{
    setLayoutForKey(layoutKey, shuffle(ordering));
  };

  return (
    <div>
      <div class="bio-properties-panel-entry">
        <button onClick={ setRandomOrdering }>set random ordering</button>
        <div>
          { ordering.map(o => <span>{ o }</span>)}
        </div>
      </div>
    </div>
  );
}


// helpers ////////////////////////

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ list[i], list[j] ] = [ list[j], list[i] ];
  }
  return list;
}