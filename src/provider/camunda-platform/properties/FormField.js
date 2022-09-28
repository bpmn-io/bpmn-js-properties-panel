import { CollapsibleEntry, ListEntry, TextFieldEntry, SelectEntry } from '@bpmn-io/properties-panel';

import FormFieldConstraint from './FormFieldConstraint';
import FormFieldProperty from './FormFieldProperty';
import FormFieldValue from './FormFieldValue';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import { without } from 'min-dash';


const CUSTOM_TYPE_VALUE = '',
      DEFINED_TYPE_VALUES = [ 'boolean', 'date', 'enum', 'long', 'string', undefined ];

export default function FormField(props) {
  const {
    idPrefix,
    formField
  } = props;

  const entries = [
    {
      id: idPrefix + '-formFieldID',
      component: Id,
      idPrefix,
      formField
    },
    {
      id: idPrefix + '-formFieldLabel',
      component: Label,
      idPrefix,
      formField
    },
    {
      id: idPrefix + '-formFieldType',
      component: Type,
      idPrefix,
      formField
    }
  ];

  if (!DEFINED_TYPE_VALUES.includes(formField.get('type'))) {
    entries.push({
      id: idPrefix + '-formFieldCustomType',
      component: CustomType,
      idPrefix,
      formField
    });
  }

  entries.push({
    id: idPrefix + '-formFieldDefaultValue',
    component: DefaultValue,
    idPrefix,
    formField
  });

  if (formField.get('type') === 'enum') {
    entries.push({
      id: idPrefix + '-formFieldValues',
      component: ValueList,
      formField,
      idPrefix
    });
  }

  entries.push({
    id: idPrefix + '-formFieldConstraints',
    component: ConstraintList,
    formField,
    idPrefix
  },
  {
    id: idPrefix + '-formFieldProperties',
    component: PropertiesList,
    formField,
    idPrefix
  });

  return entries;
}

function Id(props) {
  const {
    idPrefix,
    element,
    formField
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formField,
      properties: {
        id: value
      }
    });
  };

  const getValue = () => {
    return formField.get('id');
  };

  return TextFieldEntry({
    element: formField,
    id: idPrefix + '-formFieldID',
    label: translate('ID'),
    description: translate('Refers to the process variable name'),
    getValue,
    setValue,
    debounce
  });
}

function Label(props) {
  const {
    idPrefix,
    element,
    formField
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formField,
      properties: {
        label: value
      }
    });
  };

  const getValue = () => {
    return formField.get('label');
  };

  return TextFieldEntry({
    element: formField,
    id: idPrefix + '-formFieldLabel',
    label: translate('Label'),
    getValue,
    setValue,
    debounce
  });
}

function Type(props) {
  const {
    idPrefix,
    element,
    formField
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formField,
      properties: {
        type: value
      }
    });
  };

  const getValue = () => {
    const type = formField.get('type');

    return DEFINED_TYPE_VALUES.includes(type) ?
      type :
      CUSTOM_TYPE_VALUE;
  };

  const getOptions = () => {
    const options = [
      { label: translate('boolean'), value: 'boolean' },
      { label: translate('date'), value: 'date' },
      { label: translate('enum'), value: 'enum' },
      { label: translate('long'), value: 'long' },
      { label: translate('string'), value: 'string' },
      { label: translate('<custom type>'), value: CUSTOM_TYPE_VALUE }
    ];

    // for the initial state only, we want to show an empty state
    if (formField.get('type') === undefined) {
      options.unshift({ label: translate('<none>'), value: '' });
    }

    return options;
  };

  return SelectEntry({
    element: formField,
    id: idPrefix + '-formFieldType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

function CustomType(props) {
  const {
    idPrefix,
    element,
    formField
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    const type = value || '';

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formField,
      properties: {
        type
      }
    });
  };

  const getValue = () => {
    return formField.get('type');
  };

  return TextFieldEntry({
    element: formField,
    id: idPrefix + '-formFieldCustomType',
    label: translate('Custom type'),
    getValue,
    setValue,
    debounce
  });
}

function DefaultValue(props) {
  const {
    idPrefix,
    element,
    formField
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formField,
      properties: {
        defaultValue: value
      }
    });
  };

  const getValue = () => {
    return formField.get('defaultValue');
  };

  return TextFieldEntry({
    element: formField,
    id: idPrefix + '-formFieldDefaultValue',
    label: translate('Default value'),
    getValue,
    setValue,
    debounce
  });
}

function Value(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: value,
    open
  } = props;

  const translate = useService('translate');

  const id = `${ idPrefix }-value-${ index }`;

  return (
    <CollapsibleEntry
      id={ id }
      element={ element }
      entries={ FormFieldValue({
        idPrefix: id,
        element,
        value
      }) }
      label={ value.get('id') || translate('<empty>') }
      open={ open }
    />
  );
}

function ValueList(props) {
  const {
    element,
    formField,
    idPrefix
  } = props;

  const id = `${ idPrefix }-formFieldValues`;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const values = formField.get('values') || [];

  function addValue() {
    const value = createElement(
      'camunda:Value',
      { id: undefined, name: undefined },
      formField,
      bpmnFactory
    );

    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: formField,
      properties: {
        values: [ ...formField.get('values'), value ]
      }
    });
  }

  function removeValue(value) {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: formField,
      properties: {
        values: without(formField.get('values'), value)
      }
    });
  }

  return <ListEntry
    element={ element }
    autoFocusEntry={ `[data-entry-id="${id}-value-${values.length - 1}"] input` }
    id={ id }
    label={ translate('Values') }
    items={ values }
    component={ Value }
    onAdd={ addValue }
    onRemove={ removeValue }
  />;
}

function Constraint(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: constraint,
    open
  } = props;

  const translate = useService('translate');

  const id = `${ idPrefix }-constraint-${ index }`;

  return (
    <CollapsibleEntry
      id={ id }
      element={ element }
      entries={ FormFieldConstraint({
        constraint,
        element,
        idPrefix: id
      }) }
      label={ constraint.get('name') || translate('<empty>') }
      open={ open }
    />
  );
}

function ConstraintList(props) {
  const {
    element,
    formField,
    idPrefix
  } = props;

  const id = `${ idPrefix }-formFieldConstraints`;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  let validation = formField.get('validation');

  const constraints = (validation && validation.get('constraints')) || [];

  function addConstraint() {
    const commands = [];

    // (1) ensure validation
    if (!validation) {
      validation = createElement(
        'camunda:Validation',
        { },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: formField,
          properties: { validation }
        }
      });
    }

    // (2) add constraint
    const constraint = createElement(
      'camunda:Constraint',
      { name: undefined, config: undefined },
      validation,
      bpmnFactory
    );

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: validation,
        properties: {
          constraints: [ ...validation.get('constraints'), constraint ]
        }
      }
    });

    // (3) commit updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  }

  function removeConstraint(constraint) {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: validation,
      properties: {
        constraints: without(validation.get('constraints'), constraint)
      }
    });
  }

  return (
    <ListEntry
      element={ element }
      autoFocusEntry={ `[data-entry-id="${id}-constraint-${constraints.length - 1}"] input` }
      id={ id }
      label={ translate('Constraints') }
      items={ constraints }
      component={ Constraint }
      onAdd={ addConstraint }
      onRemove={ removeConstraint } />
  );
}

function Property(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: property,
    open
  } = props;

  const translate = useService('translate');

  const id = `${ idPrefix }-property-${ index }`;

  return (
    <CollapsibleEntry
      id={ id }
      element={ element }
      entries={ FormFieldProperty({
        element,
        idPrefix: id,
        property
      }) }
      label={ property.get('id') || translate('<empty>') }
      open={ open }
    />
  );
}

function PropertiesList(props) {
  const {
    element,
    formField,
    idPrefix
  } = props;

  const id = `${ idPrefix }-formFieldProperties`;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  let properties = formField.get('properties');

  const propertyEntries = (properties && properties.get('values')) || [];

  function addProperty() {
    const commands = [];

    // (1) ensure properties
    if (!properties) {
      properties = createElement(
        'camunda:Properties',
        { },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: formField,
          properties: { properties }
        }
      });
    }

    // (2) add property
    const property = createElement(
      'camunda:Property',
      { id: undefined, value: undefined },
      properties,
      bpmnFactory
    );

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: properties,
        properties: {
          values: [ ...properties.get('values'), property ]
        }
      }
    });

    // (3) commit updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  }

  function removeProperty(property) {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: properties,
      properties: {
        values: without(properties.get('values'), property)
      }
    });
  }

  return <ListEntry
    element={ element }
    autoFocusEntry={ true }
    id={ id }
    compareFn={ createAlphanumericCompare('id') }
    label={ translate('Properties') }
    items={ propertyEntries }
    component={ Property }
    onAdd={ addProperty }
    onRemove={ removeProperty }
  />;
}

// helper //////////////////

function createAlphanumericCompare(field) {
  return function(entry, anotherEntry) {
    const [ key = '', anotherKey = '' ] = [ entry[field], anotherEntry[field] ];

    return key === anotherKey ? 0 : key > anotherKey ? 1 : -1;
  };
}
