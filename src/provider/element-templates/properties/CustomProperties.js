import {
  forEach,
  find,
  groupBy,
  isArray,
  isString,
  isUndefined
} from 'min-dash';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { useService } from '../../../hooks';

import {
  Group,
  SelectEntry, isSelectEntryEdited,
  CheckboxEntry, isCheckboxEntryEdited,
  TextAreaEntry, isTextAreaEntryEdited,
  TextFieldEntry, isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

import { PropertyDescription } from '../components/PropertyDescription';

import {
  findCamundaErrorEventDefinition,
  findCamundaInOut,
  findCamundaProperty,
  findExtension,
  findExtensions,
  findInputParameter,
  findOutputParameter
} from '../Helper';

import {
  createElement,
  getRoot
} from '../../../utils/ElementUtil';

import {
  createCamundaErrorEventDefinition,
  createCamundaFieldInjection,
  createCamundaIn,
  createCamundaInWithBusinessKey,
  createCamundaOut,
  createCamundaProperty,
  createError,
  createInputParameter,
  createOutputParameter
} from '../CreateHelper';


const CAMUNDA_ERROR_EVENT_DEFINITION_TYPE = 'camunda:errorEventDefinition',
      CAMUNDA_EXECUTION_LISTENER_TYPE = 'camunda:executionListener',
      CAMUNDA_FIELD_TYPE = 'camunda:field',
      CAMUNDA_IN_BUSINESS_KEY_TYPE = 'camunda:in:businessKey',
      CAMUNDA_IN_TYPE = 'camunda:in',
      CAMUNDA_INPUT_PARAMETER_TYPE = 'camunda:inputParameter',
      CAMUNDA_OUT_TYPE = 'camunda:out',
      CAMUNDA_OUTPUT_PARAMETER_TYPE = 'camunda:outputParameter',
      CAMUNDA_PROPERTY_TYPE = 'camunda:property',
      PROPERTY_TYPE = 'property';

const EXTENSION_BINDING_TYPES = [
  CAMUNDA_ERROR_EVENT_DEFINITION_TYPE,
  CAMUNDA_FIELD_TYPE,
  CAMUNDA_IN_TYPE,
  CAMUNDA_IN_BUSINESS_KEY_TYPE,
  CAMUNDA_INPUT_PARAMETER_TYPE,
  CAMUNDA_OUT_TYPE,
  CAMUNDA_OUTPUT_PARAMETER_TYPE,
  CAMUNDA_PROPERTY_TYPE
];

const IO_BINDING_TYPES = [
  CAMUNDA_INPUT_PARAMETER_TYPE,
  CAMUNDA_OUTPUT_PARAMETER_TYPE
];

const IN_OUT_BINDING_TYPES = [
  CAMUNDA_IN_BUSINESS_KEY_TYPE,
  CAMUNDA_IN_TYPE,
  CAMUNDA_OUT_TYPE
];

const PRIMITIVE_MODDLE_TYPES = [
  'Boolean',
  'Integer',
  'String'
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
    groups: propertyGroups,
    scopes
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

  // (3) add custom scopes props
  if (isArray(scopes)) {
    scopes.forEach((scope) => {
      const {
        properties,
        type
      } = scope;

      const id = type.replace(/:/g, '-');

      addCustomGroup(groups, {
        element,
        id: `ElementTemplates__CustomGroup-${ id }`,
        label: `Custom properties for scope <${ type }>`,
        properties,
        templateId: id,
        scope
      });
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
    scope,
    templateId
  } = props;

  const customPropertiesGroup = {
    id,
    label,
    component: Group,
    entries: []
  };

  properties.forEach((property, index) => {
    const entry = createCustomEntry(
      `custom-entry-${ templateId }-${ index }`,
      element,
      property,
      scope
    );

    if (entry) {
      customPropertiesGroup.entries.push(entry);
    }
  });

  if (customPropertiesGroup.entries.length) {
    groups.push(customPropertiesGroup);
  }
}

function createCustomEntry(id, element, property, scope) {
  let { type } = property;

  if (!type) {
    type = getDefaultType(property);
  }

  if (type === 'Boolean') {
    return {
      id,
      component: <BooleanProperty element={ element } id={ id } property={ property } scope={ scope } />,
      isEdited: isCheckboxEntryEdited
    };
  }

  if (type === 'Dropdown') {
    return {
      id,
      component: <DropdownProperty element={ element } id={ id } property={ property } scope={ scope } />,
      isEdited: isSelectEntryEdited
    };
  }

  if (type === 'String') {
    return {
      id,
      component: <StringProperty element={ element } id={ id } property={ property } scope={ scope } />,
      isEdited: isTextFieldEntryEdited
    };
  }

  if (type === 'Text') {
    return {
      id,
      component: <TextAreaProperty element={ element } id={ id } property={ property } scope={ scope } />,
      isEdited: isTextAreaEntryEdited
    };
  }
}

function getDefaultType(property) {
  const { binding } = property;

  const { type } = binding;

  if ([
    PROPERTY_TYPE,
    CAMUNDA_PROPERTY_TYPE,
    CAMUNDA_IN_TYPE,
    CAMUNDA_IN_BUSINESS_KEY_TYPE,
    CAMUNDA_OUT_TYPE,
    CAMUNDA_FIELD_TYPE
  ].includes(type)) {
    return 'String';
  }

  if (type === CAMUNDA_EXECUTION_LISTENER_TYPE) {
    return 'Hidden';
  }
}

function BooleanProperty(props) {
  const {
    element,
    id,
    property,
    scope
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
    getValue: propertyGetter(element, property, scope),
    id,
    label,
    description: PropertyDescription({ description }),
    setValue: propertySetter(bpmnFactory, commandStack, element, property, scope),
    disabled: editable === false
  });
}

function DropdownProperty(props) {
  const {
    element,
    id,
    property,
    scope
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
    getValue: propertyGetter(element, property, scope),
    setValue: propertySetter(bpmnFactory, commandStack, element, property, scope),
    disabled: editable === false
  });
}

function StringProperty(props) {
  const {
    element,
    id,
    property,
    scope
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
    getValue: propertyGetter(element, property, scope),
    id,
    label,
    description: PropertyDescription({ description }),
    setValue: propertySetter(bpmnFactory, commandStack, element, property, scope),
    validate: propertyValidator(translate, property),
    disabled: editable === false
  });
}

function TextAreaProperty(props) {
  const {
    element,
    id,
    property,
    scope
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
    getValue: propertyGetter(element, property, scope),
    setValue: propertySetter(bpmnFactory, commandStack, element, property, scope),
    disabled: editable === false
  });
}

function propertyGetter(element, property, scope) {
  return function getValue() {
    let businessObject = getBusinessObject(element);

    const {
      binding,
      value: defaultValue = ''
    } = property;

    const {
      name,
      type
    } = binding;

    if (scope) {
      businessObject = getScopeBusinessObject(businessObject, scope);

      if (!businessObject) {
        return defaultValue;
      }
    }

    // property
    if (type === 'property') {
      const value = businessObject.get(name);

      if (name === 'conditionExpression') {
        if (value) {
          return value.get('body');
        }

        return defaultValue;
      } else {
        if (!isUndefined(value)) {
          return value;
        }

        return defaultValue;
      }
    }

    // camunda:ErrorEventDefinition
    if (type === CAMUNDA_ERROR_EVENT_DEFINITION_TYPE) {
      const { errorRef } = binding;

      const errorEventDefinition = findCamundaErrorEventDefinition(businessObject, errorRef);

      if (errorEventDefinition) {
        return errorEventDefinition.get('camunda:expression');
      } else {
        return '';
      }
    }

    // camunda:Field
    if (type === CAMUNDA_FIELD_TYPE) {
      const camundaFields = findExtensions(businessObject, [ 'camunda:Field' ]);

      const camundaField = camundaFields.find((camundaField) => {
        return camundaField.get('camunda:name') === name;
      });

      if (camundaField) {
        return camundaField.get('camunda:string') || camundaField.get('camunda:expression');
      } else {
        return '';
      }
    }

    // camunda:Property
    if (type === CAMUNDA_PROPERTY_TYPE) {
      let camundaProperties;

      if (scope) {

        // TODO(philippfromme): as ony bpmn:Error and camunda:Connector are supported this code is practically dead
        camundaProperties = businessObject.get('properties');
      } else {
        camundaProperties = findExtension(businessObject, 'camunda:Properties');
      }

      if (camundaProperties) {
        const camundaProperty = findCamundaProperty(camundaProperties, binding);

        if (camundaProperty) {
          return camundaProperty.get('camunda:value');
        }
      }

      return defaultValue;
    }

    if (IO_BINDING_TYPES.includes(type)) {
      let inputOutput;

      if (scope) {
        inputOutput = businessObject.get('inputOutput');
      } else {
        inputOutput = findExtension(businessObject, 'camunda:InputOutput');
      }

      if (!inputOutput) {
        return defaultValue;
      }

      // camunda:InputParameter
      if (type === CAMUNDA_INPUT_PARAMETER_TYPE) {
        const inputParameter = findInputParameter(inputOutput, binding);

        if (inputParameter) {
          const { scriptFormat } = binding;

          if (scriptFormat) {
            const definition = inputParameter.get('camunda:definition');

            if (definition) {
              return definition.get('camunda:value');
            }
          } else {
            return inputParameter.get('value') || '';
          }
        }

        return defaultValue;
      }

      // camunda:OutputParameter
      if (type === CAMUNDA_OUTPUT_PARAMETER_TYPE) {
        const outputParameter = findOutputParameter(inputOutput, binding);

        if (outputParameter) {
          return outputParameter.get('camunda:name');
        }

        return defaultValue;
      }
    }

    // camunda:In and camunda:Out
    if (IN_OUT_BINDING_TYPES.includes(type)) {
      const camundaInOut = findCamundaInOut(businessObject, binding);

      if (camundaInOut) {
        if (type === CAMUNDA_IN_BUSINESS_KEY_TYPE) {
          return camundaInOut.get('camunda:businessKey');
        } else
        if (type === CAMUNDA_OUT_TYPE) {
          return camundaInOut.get('camunda:target');
        } else
        if (type === CAMUNDA_IN_TYPE) {
          const { expression } = binding;

          if (expression) {
            return camundaInOut.get('camunda:sourceExpression');
          } else {
            return camundaInOut.get('camunda:source');
          }
        }
      }

      return defaultValue;
    }

    // should never throw as templates are validated beforehand
    throw unknownBindingError(element, property);
  };
}

function propertySetter(bpmnFactory, commandStack, element, property, scope) {
  return function setValue(value) {
    let businessObject = getBusinessObject(element);

    const { binding } = property;

    const {
      name,
      type
    } = binding;

    const rootElement = getRoot(businessObject);

    let extensionElements;

    let propertyValue;

    const commands = [];

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

    if (scope) {
      businessObject = getScopeBusinessObject(businessObject, scope);

      if (!businessObject) {

        // bpmn:Error
        if (scope.type === 'bpmn:Error') {
          businessObject = createError(scope.id, rootElement, bpmnFactory);

          commands.push({
            cmd: 'element.updateModdleProperties',
            context: {
              element,
              moddleElement: rootElement,
              properties: { rootElements: [ ...rootElement.get('rootElements'), businessObject ] }
            }
          });
        } else {
          businessObject = createElement(scope.type, null, element, bpmnFactory);

          commands.push({
            cmd: 'element.updateModdleProperties',
            context: {
              element,
              moddleElement: extensionElements,
              properties: { values: [ ...extensionElements.get('values'), businessObject ] }
            }
          });
        }
      }
    }

    // property
    if (type === 'property') {

      if (name === 'conditionExpression') {
        const { scriptFormat } = binding;

        propertyValue = createElement('bpmn:FormalExpression', {
          body: value,
          language: scriptFormat
        }, businessObject, bpmnFactory);
      } else {
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

    // camunda:ErrorEventDefinition
    if (type === CAMUNDA_ERROR_EVENT_DEFINITION_TYPE) {
      const { errorRef } = binding;

      const oldCamundaErrorEventDefinition = findCamundaErrorEventDefinition(businessObject, errorRef);

      if (oldCamundaErrorEventDefinition) {
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: oldCamundaErrorEventDefinition,
            properties: { 'camunda:expression': value }
          }
        });
      } else {
        const newError = createError(binding.errorRef, rootElement, bpmnFactory),
              newCamundaErrorEventDefinition = createCamundaErrorEventDefinition(value, newError, extensionElements, bpmnFactory);

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: rootElement,
            properties: { rootElements: [ ...rootElement.get('rootElements'), newError ] }
          }
        });

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: extensionElements,
            properties: { values: [ ...extensionElements.get('values'), newCamundaErrorEventDefinition ] }
          }
        });
      }
    }

    // camunda:Field
    if (type === CAMUNDA_FIELD_TYPE) {
      const oldCamundaFields = findExtensions(businessObject, [ 'camunda:Field' ]);

      const newCamundaFields = [];

      if (oldCamundaFields.length) {
        oldCamundaFields.forEach((camundaField) => {
          if (camundaField.name === name) {
            newCamundaFields.push(createCamundaFieldInjection(binding, value, bpmnFactory));
          } else {
            newCamundaFields.push(camundaField);
          }
        });
      } else {
        newCamundaFields.push(createCamundaFieldInjection(binding, value, bpmnFactory));
      }

      const values = extensionElements.get('values').filter((value) => !oldCamundaFields.includes(value));

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values:
            [ ...values, ...newCamundaFields ]
          }
        }
      });
    }

    // camunda:Property
    if (type === CAMUNDA_PROPERTY_TYPE) {
      let camundaProperties;

      if (scope) {
        camundaProperties = businessObject.get('properties');
      } else {
        camundaProperties = findExtension(extensionElements, 'camunda:Properties');
      }

      if (!camundaProperties) {
        camundaProperties = createElement('camunda:Properties', null, businessObject, bpmnFactory);

        if (scope) {
          commands.push({
            cmd: 'element.updateModdleProperties',
            context: {
              element,
              moddleElement: businessObject,
              properties: { properties: camundaProperties }
            }
          });
        } else {
          commands.push({
            cmd: 'element.updateModdleProperties',
            context: {
              element,
              moddleElement: extensionElements,
              properties: { values: [ ...extensionElements.get('values'), camundaProperties ] }
            }
          });
        }
      }

      const oldCamundaProperty = findCamundaProperty(camundaProperties, binding);

      const newCamundaProperty = createCamundaProperty(binding, value, bpmnFactory);

      const values = camundaProperties.get('values').filter((value) => value !== oldCamundaProperty);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: camundaProperties,
          properties: { values: [ ...values, newCamundaProperty ] }
        }
      });
    }

    if (IO_BINDING_TYPES.includes(type)) {
      let inputOutput;

      if (scope) {
        inputOutput = businessObject.get('inputOutput');
      } else {
        inputOutput = findExtension(extensionElements, 'camunda:InputOutput');
      }

      if (!inputOutput) {
        inputOutput = createElement('camunda:InputOutput', null, businessObject, bpmnFactory);

        if (scope) {
          commands.push({
            cmd: 'element.updateModdleProperties',
            context: {
              element,
              moddleElement: businessObject,
              properties: { inputOutput }
            }
          });
        }
        else {
          commands.push({
            cmd: 'element.updateModdleProperties',
            context: {
              element,
              moddleElement: extensionElements,
              properties: { values: [ ...extensionElements.get('values'), inputOutput ] }
            }
          });
        }
      }

      // camunda:InputParameter
      if (type === CAMUNDA_INPUT_PARAMETER_TYPE) {
        const oldCamundaInputParameter = findInputParameter(inputOutput, binding);

        const newCamundaInputParameter = createInputParameter(binding, value, bpmnFactory);

        const values = inputOutput.get('camunda:inputParameters').filter((value) => value !== oldCamundaInputParameter);

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: inputOutput,
            properties: { 'camunda:inputParameters': [ ...values, newCamundaInputParameter ] }
          }
        });
      }

      // camunda:OutputParameter
      if (type === CAMUNDA_OUTPUT_PARAMETER_TYPE) {
        const oldCamundaOutputParameter = findOutputParameter(inputOutput, binding);

        const newCamundaOutputParameter = createOutputParameter(binding, value, bpmnFactory);

        const values = inputOutput.get('camunda:outputParameters').filter((value) => value !== oldCamundaOutputParameter);

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: inputOutput,
            properties: { 'camunda:outputParameters': [ ...values, newCamundaOutputParameter ] }
          }
        });
      }
    }

    // camunda:In and camunda:Out
    if (IN_OUT_BINDING_TYPES.includes(type)) {
      const oldCamundaInOut = findCamundaInOut(businessObject, binding);

      let newCamundaInOut;

      if (type === CAMUNDA_IN_TYPE) {
        newCamundaInOut = createCamundaIn(binding, value, bpmnFactory);
      } else
      if (type === CAMUNDA_OUT_TYPE) {
        newCamundaInOut = createCamundaOut(binding, value, bpmnFactory);
      } else {
        newCamundaInOut = createCamundaInWithBusinessKey(value, bpmnFactory);
      }

      const values = extensionElements.get('values').filter((value) => value !== oldCamundaInOut);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: { values: [ ...values, newCamundaInOut ] }
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

function getScopeBusinessObject(businessObject, scope) {
  const {
    id,
    type
  } = scope;

  if (type === 'bpmn:Error') {

    // retrieve error through referenced error event definition
    const errorEventDefinition = findCamundaErrorEventDefinition(businessObject, id);

    if (errorEventDefinition) {
      return errorEventDefinition.get('errorRef');
    }
  }

  return findExtension(businessObject, type);
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