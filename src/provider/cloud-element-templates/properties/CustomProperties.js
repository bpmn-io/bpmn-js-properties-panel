import {
  find,
  forEach,
  groupBy,
  isString,
  isUndefined
} from 'min-dash';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { useService } from '../../../hooks';

import { PropertyDescription } from '../../element-templates/components/PropertyDescription';

import {
  Group,
  SelectEntry, isSelectEntryEdited,
  CheckboxEntry, isCheckboxEntryEdited,
  TextAreaEntry, isTextAreaEntryEdited,
  TextFieldEntry, isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import {
  findExtension,
  findInputParameter,
  findOutputParameter,
  findTaskHeader
} from '../Helper';

import {
  createInputParameter,
  createOutputParameter,
  createTaskDefinitionWithType,
  createTaskHeader,
  shouldUpdate
} from '../CreateHelper';

import { createElement } from '../../../utils/ElementUtil';

const PROPERTY_TYPE = 'property';

const PRIMITIVE_MODDLE_TYPES = [
  'Boolean',
  'Integer',
  'String'
];

const ZEBBE_INPUT_TYPE = 'zeebe:input',
      ZEEBE_OUTPUT_TYPE = 'zeebe:output',
      ZEEBE_TASK_DEFINITION_TYPE_TYPE = 'zeebe:taskDefinition:type',
      ZEEBE_TASK_HEADER_TYPE = 'zeebe:taskHeader';

const EXTENSION_BINDING_TYPES = [
  ZEBBE_INPUT_TYPE,
  ZEEBE_OUTPUT_TYPE,
  ZEEBE_TASK_DEFINITION_TYPE_TYPE,
  ZEEBE_TASK_HEADER_TYPE
];

const TASK_DEFINITION_TYPES = [
  ZEEBE_TASK_DEFINITION_TYPE_TYPE
];

const IO_BINDING_TYPES = [
  ZEBBE_INPUT_TYPE,
  ZEEBE_OUTPUT_TYPE
];

const DEFAULT_CUSTOM_GROUP = {
  id: 'ElementTemplates__CustomProperties',
  label: 'Custom properties'
};


export function CustomProperties(props) {
  const {
    element,
    elementTemplate
  } = props;

  const groups = [];

  const {
    id,
    properties,
    groups: propertyGroups
  } = elementTemplate;

  // (1) group properties by group id
  const groupedProperties = groupByGroupId(properties);
  const defaultProps = [];

  forEach(groupedProperties, (properties, groupId) => {

    const group = findCustomGroup(propertyGroups, groupId);

    if (!group) {
      return defaultProps.push(...properties);
    }

    addCustomGroup(groups, {
      element,
      id: `ElementTemplates__CustomProperties-${groupId}`,
      label: group.label,
      properties: properties,
      templateId: `${id}-${groupId}`
    });
  });

  // (2) add default custom props
  if (defaultProps.length) {
    addCustomGroup(groups, {
      ...DEFAULT_CUSTOM_GROUP,
      element,
      properties: defaultProps,
      templateId: id
    });
  }

  return groups;
}

function addCustomGroup(groups, props) {

  const {
    element,
    id,
    label,
    properties,
    templateId
  } = props;

  const customPropertiesGroup = {
    id,
    label,
    component: Group,
    entries: []
  };

  properties.forEach((property, index) => {
    const entry = createCustomEntry(`custom-entry-${ templateId }-${ index }`, element, property);

    if (entry) {
      customPropertiesGroup.entries.push(entry);
    }
  });

  if (customPropertiesGroup.entries.length) {
    groups.push(customPropertiesGroup);
  }
}

function createCustomEntry(id, element, property) {
  let { type } = property;

  if (!type) {
    type = getDefaultType(property);
  }

  if (type === 'Boolean') {
    return {
      id,
      component: <BooleanProperty element={ element } id={ id } property={ property } />,
      isEdited: isCheckboxEntryEdited
    };
  }

  if (type === 'Dropdown') {
    return {
      id,
      component: <DropdownProperty element={ element } id={ id } property={ property } />,
      isEdited: isSelectEntryEdited
    };
  }

  if (type === 'String') {
    return {
      id,
      component: <StringProperty element={ element } id={ id } property={ property } />,
      isEdited: isTextFieldEntryEdited
    };
  }

  if (type === 'Text') {
    return {
      id,
      component: <TextAreaProperty element={ element } id={ id } property={ property } />,
      isEdited: isTextAreaEntryEdited
    };
  }
}

function getDefaultType(property) {
  const { binding } = property;

  const { type } = binding;

  if ([
    PROPERTY_TYPE,
    ZEEBE_TASK_DEFINITION_TYPE_TYPE,
    ZEBBE_INPUT_TYPE,
    ZEEBE_OUTPUT_TYPE,
    ZEEBE_TASK_HEADER_TYPE
  ].includes(type)) {
    return 'String';
  }
}

function BooleanProperty(props) {
  const {
    element,
    id,
    property
  } = props;

  const {
    description,
    editable,
    label
  } = property;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack');

  return CheckboxEntry({
    element,
    getValue: propertyGetter(element, property),
    id,
    label,
    description: PropertyDescription({ description }),
    setValue: propertySetter(bpmnFactory, commandStack, element, property),
    disabled: editable === false
  });
}

function DropdownProperty(props) {
  const {
    element,
    id,
    property
  } = props;

  const {
    description,
    editable,
    label
  } = property;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack');

  const getOptions = () => {
    const { choices } = property;

    return choices.map(({ name, value }) => {
      return {
        label: name,
        value
      };
    });
  };

  return SelectEntry({
    element,
    id,
    label,
    getOptions,
    description: PropertyDescription({ description }),
    getValue: propertyGetter(element, property),
    setValue: propertySetter(bpmnFactory, commandStack, element, property),
    disabled: editable === false
  });
}

function StringProperty(props) {
  const {
    element,
    id,
    property
  } = props;

  const {
    description,
    editable,
    label
  } = property;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack'),
        debounce = useService('debounceInput'),
        translate = useService('translate');

  return TextFieldEntry({
    debounce,
    element,
    getValue: propertyGetter(element, property),
    id,
    label,
    description: PropertyDescription({ description }),
    setValue: propertySetter(bpmnFactory, commandStack, element, property),
    validate: propertyValidator(translate, property),
    disabled: editable === false
  });
}

function TextAreaProperty(props) {
  const {
    element,
    id,
    property
  } = props;

  const {
    description,
    editable,
    label
  } = property;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack'),
        debounce = useService('debounceInput');

  return TextAreaEntry({
    debounce,
    element,
    id,
    label,
    description: PropertyDescription({ description }),
    getValue: propertyGetter(element, property),
    setValue: propertySetter(bpmnFactory, commandStack, element, property),
    disabled: editable === false
  });
}

function propertyGetter(element, property) {
  return function getValue() {
    let businessObject = getBusinessObject(element);

    const {
      binding,
      optional,
      value: defaultValue = ''
    } = property;

    const {
      name,
      type
    } = binding;

    // property
    if (type === 'property') {
      const value = businessObject.get(name);

      if (!isUndefined(value)) {
        return value;
      }

      return defaultValue;
    }

    // zeebe:taskDefinition
    if (TASK_DEFINITION_TYPES.includes(type)) {
      const taskDefinition = findExtension(businessObject, 'zeebe:TaskDefinition');

      if (taskDefinition) {
        if (type === ZEEBE_TASK_DEFINITION_TYPE_TYPE) {
          return taskDefinition.get('type');
        }
      }

      return defaultValue;
    }

    if (IO_BINDING_TYPES.includes(type)) {
      const ioMapping = findExtension(businessObject, 'zeebe:IoMapping');

      if (!ioMapping) {
        return defaultValue;
      }

      // zeebe:Input
      if (type === ZEBBE_INPUT_TYPE) {
        const inputParameter = findInputParameter(ioMapping, binding);

        if (inputParameter) {
          return inputParameter.get('source');
        }

        // allow empty values for optional parameters
        return optional ? '' : defaultValue;
      }

      // zeebe:Output
      if (type === ZEEBE_OUTPUT_TYPE) {
        const outputParameter = findOutputParameter(ioMapping, binding);

        if (outputParameter) {
          return outputParameter.get('target');
        }

        // allow empty values for optional parameters
        return optional ? '' : defaultValue;
      }
    }

    // zeebe:taskHeaders
    if (type === ZEEBE_TASK_HEADER_TYPE) {
      const taskHeaders = findExtension(businessObject, 'zeebe:TaskHeaders');

      if (!taskHeaders) {
        return defaultValue;
      }

      const header = findTaskHeader(taskHeaders, binding);

      if (header) {
        return header.get('value');
      }

      return defaultValue;
    }

    // should never throw as templates are validated beforehand
    throw unknownBindingError(element, property);
  };
}

function propertySetter(bpmnFactory, commandStack, element, property) {
  return function setValue(value) {
    let businessObject = getBusinessObject(element);

    const {
      binding
    } = property;

    const {
      name,
      type
    } = binding;

    let extensionElements;

    let propertyValue;

    const commands = [];

    // ensure extension elements
    if (EXTENSION_BINDING_TYPES.includes(type)) {
      extensionElements = businessObject.get('extensionElements');

      if (!extensionElements) {
        extensionElements = createElement('bpmn:ExtensionElements', null, businessObject, bpmnFactory);

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: businessObject,
            properties: { extensionElements }
          }
        });
      }
    }

    // property
    if (type === 'property') {

      const propertyDescriptor = businessObject.$descriptor.propertiesByName[ name ];

      const { type: propertyType } = propertyDescriptor;

      // do not override non-primitive types
      if (!PRIMITIVE_MODDLE_TYPES.includes(propertyType)) {
        throw new Error(`cannot set property of type <${ propertyType }>`);
      }

      if (propertyType === 'Boolean') {
        propertyValue = !!value;
      } else if (propertyType === 'Integer') {
        propertyValue = parseInt(value, 10);

        if (isNaN(propertyValue)) {

          // do not set NaN value
          propertyValue = undefined;
        }
      } else {

        // make sure we don't remove the property
        propertyValue = value || '';
      }

      if (!isUndefined(propertyValue)) {
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: businessObject,
            properties: { [ name ]: propertyValue }
          }
        });
      }
    }

    // zeebe:taskDefinition
    if (TASK_DEFINITION_TYPES.includes(type)) {
      const oldTaskDefinition = findExtension(extensionElements, 'zeebe:TaskDefinition');

      let newTaskDefinition;

      if (type === ZEEBE_TASK_DEFINITION_TYPE_TYPE) {
        newTaskDefinition = createTaskDefinitionWithType(value, bpmnFactory);
      } else {
        return unknownBindingError(element, property);
      }

      const values = extensionElements.get('values').filter((value) => value !== oldTaskDefinition);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: { values: [ ...values, newTaskDefinition ] }
        }
      });
    }

    if (IO_BINDING_TYPES.includes(type)) {
      let ioMapping = findExtension(extensionElements, 'zeebe:IoMapping');

      if (!ioMapping) {
        ioMapping = createElement('zeebe:IoMapping', null, businessObject, bpmnFactory);

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: extensionElements,
            properties: { values: [ ...extensionElements.get('values'), ioMapping ] }
          }
        });
      }

      // zeebe:Input
      if (type === ZEBBE_INPUT_TYPE) {
        const oldZeebeInputParameter = findInputParameter(ioMapping, binding);
        const values = ioMapping.get('inputParameters').filter((value) => value !== oldZeebeInputParameter);

        // do not persist empty parameters when configured as <optional>
        if (shouldUpdate(value, property)) {
          const newZeebeInputParameter = createInputParameter(binding, value, bpmnFactory);
          values.push(newZeebeInputParameter);
        }

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: ioMapping,
            properties: { inputParameters: [ ...values ] }
          }
        });
      }

      // zeebe:Output
      if (type === ZEEBE_OUTPUT_TYPE) {
        const oldZeebeOutputParameter = findOutputParameter(ioMapping, binding);
        const values = ioMapping.get('outputParameters').filter((value) => value !== oldZeebeOutputParameter);

        // do not persist empty parameters when configured as <optional>
        if (shouldUpdate(value, property)) {
          const newZeebeOutputParameter = createOutputParameter(binding, value, bpmnFactory);
          values.push(newZeebeOutputParameter);
        }

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: ioMapping,
            properties: { 'outputParameters': [ ...values ] }
          }
        });
      }
    }

    // zeebe:taskHeaders
    if (type === ZEEBE_TASK_HEADER_TYPE) {
      let taskHeaders = findExtension(extensionElements, 'zeebe:TaskHeaders');

      if (!taskHeaders) {
        taskHeaders = createElement('zeebe:TaskHeaders', null, businessObject, bpmnFactory);

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: extensionElements,
            properties: { values: [ ...extensionElements.get('values'), taskHeaders ] }
          }
        });
      }

      const oldTaskHeader = findTaskHeader(taskHeaders, binding);

      const newTaskHeader = createTaskHeader(binding, value, bpmnFactory);

      const values = taskHeaders.get('values').filter((value) => value !== oldTaskHeader);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: taskHeaders,
          properties: { values: [ ...values, newTaskHeader ] }
        }
      });
    }

    if (commands.length) {
      commandStack.execute(
        'properties-panel.multi-command-executor',
        commands
      );

      return;
    }

    // should never throw as templates are validated beforehand
    throw unknownBindingError(element, property);
  };
}

function propertyValidator(translate, property) {
  return function validate(value) {
    const { constraints = {} } = property;

    const {
      maxLength,
      minLength,
      notEmpty
    } = constraints;

    if (notEmpty && isEmptyString(value)) {
      return translate('Must not be empty.');
    }

    if (maxLength && value.length > maxLength) {
      return translate('Must have max length {maxLength}.', { maxLength });
    }

    if (minLength && value.length < minLength) {
      return translate('Must have min length {minLength}.', { minLength });
    }

    let { pattern } = constraints;

    if (pattern) {
      let message;

      if (!isString(pattern)) {
        message = pattern.message;
        pattern = pattern.value;
      }

      if (!matchesPattern(value, pattern)) {
        return message || translate('Must match pattern {pattern}.', { pattern });
      }
    }
  };
}

function unknownBindingError(element, property) {
  const businessObject = getBusinessObject(element);

  const id = businessObject.get('id');

  const { binding } = property;

  const { type } = binding;

  return new Error(`unknown binding <${ type }> for element <${ id }>, this should never happen`);
}

function isEmptyString(string) {
  return !string || !string.trim().length;
}

function matchesPattern(string, pattern) {
  return new RegExp(pattern).test(string);
}

function groupByGroupId(properties) {
  return groupBy(properties, 'group');
}

function findCustomGroup(groups, id) {
  return find(groups, g => g.id === id);
}