import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { find } from 'min-dash';

import PropertyBindingProvider from './PropertyBindingProvider';
import TaskDefinitionTypeBindingProvider from './TaskDefinitionTypeBindingProvider';
import InputBindingProvider from './InputBindingProvider';
import OutputBindingProvider from './OutputBindingProvider';
import TaskHeaderBindingProvider from './TaskHeaderBindingProvider';
import ZeebePropertiesProvider from './ZeebePropertiesProvider';
import { MessagePropertyBindingProvider } from './MessagePropertyBindingProvider';
import { MessageZeebeSubscriptionBindingProvider } from './MessageZeebeSubscriptionBindingProvider';

import {
  MESSAGE_PROPERTY_TYPE,
  MESSAGE_ZEEBE_SUBSCRIPTION_PROPERTY_TYPE,
  PROPERTY_TYPE,
  ZEEBE_TASK_DEFINITION_TYPE_TYPE,
  ZEBBE_INPUT_TYPE,
  ZEEBE_OUTPUT_TYPE,
  ZEEBE_TASK_HEADER_TYPE,
  ZEBBE_PROPERTY_TYPE
} from '../util/bindingTypes';

import {
  isConditionMet
} from '../Condition';

export default class TemplateElementFactory {

  constructor(bpmnFactory, elementFactory) {
    this._bpmnFactory = bpmnFactory;
    this._elementFactory = elementFactory;

    this._providers = {
      [PROPERTY_TYPE]: PropertyBindingProvider,
      [ZEEBE_TASK_DEFINITION_TYPE_TYPE]: TaskDefinitionTypeBindingProvider,
      [ZEBBE_PROPERTY_TYPE]: ZeebePropertiesProvider,
      [ZEBBE_INPUT_TYPE]: InputBindingProvider,
      [ZEEBE_OUTPUT_TYPE]: OutputBindingProvider,
      [ZEEBE_TASK_HEADER_TYPE]: TaskHeaderBindingProvider,
      [MESSAGE_PROPERTY_TYPE]: MessagePropertyBindingProvider,
      [MESSAGE_ZEEBE_SUBSCRIPTION_PROPERTY_TYPE]: MessageZeebeSubscriptionBindingProvider
    };
  }

  /**
   * Create an element based on an element template.
   *
   * @param {ElementTemplate} template
   * @returns {djs.model.Base}
   */
  create(template) {

    const {
      properties
    } = template;

    // (1) base shape
    const element = this._createShape(template);

    // (2) apply template
    this._setModelerTemplate(element, template);

    // (3) apply icon
    if (hasIcon(template)) {
      this._setModelerTemplateIcon(element, template);
    }

    // (4) apply properties
    this._applyProperties(element, properties);

    return element;
  }

  _createShape(template) {
    const {
      appliesTo,
      elementType = {}
    } = template;
    const elementFactory = this._elementFactory;

    const attrs = {
      type: elementType.value || appliesTo[0]
    };

    // apply eventDefinition
    if (elementType.eventDefinition) {
      attrs.eventDefinitionType = elementType.eventDefinition;
    }

    const element = elementFactory.createShape(attrs);

    return element;
  }

  _ensureExtensionElements(element) {
    const bpmnFactory = this._bpmnFactory;
    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    if (!extensionElements) {
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
        values: []
      });

      extensionElements.$parent = businessObject;
      businessObject.set('extensionElements', extensionElements);
    }

    return extensionElements;
  }

  _setModelerTemplate(element, template) {
    const {
      id,
      version
    } = template;

    const businessObject = getBusinessObject(element);

    businessObject.set('zeebe:modelerTemplate', id);
    businessObject.set('zeebe:modelerTemplateVersion', version);
  }

  _setModelerTemplateIcon(element, template) {
    const {
      icon
    } = template;

    const {
      contents
    } = icon;

    const businessObject = getBusinessObject(element);

    businessObject.set('zeebe:modelerTemplateIcon', contents);
  }

  /**
   * Apply properties to a given element.
   *
   * @param {djs.model.Base} element
   * @param {Array<Object>} properties
   */
  _applyProperties(element, properties) {
    const processedProperties = [];

    properties.forEach(
      property => this._applyProperty(element, property, properties, processedProperties)
    );
  }

  /**
   * Apply a property and its parent properties to an element based on conditions.
   *
   * @param {djs.model.Base} element
   * @param {Object} property
   * @param {Array<Object>} properties
   * @param {Array<Object>} processedProperties
   */
  _applyProperty(element, property, properties, processedProperties) {

    // skip if already processed
    if (processedProperties.includes(property)) {
      return;
    }

    // apply dependant property first if not already applied
    const dependentProperties = findDependentProperties(property, properties);

    dependentProperties.forEach(
      property => this._applyProperty(element, property, properties, processedProperties)
    );

    // check condition and apply property if condition is met
    if (isConditionMet(element, properties, property)) {
      this._bindProperty(property, element);
    }

    processedProperties.push(property);
  }

  /**
   * Bind property to element.
   * @param {Object} property
   * @param {djs.Model.Base} element
   */
  _bindProperty(property, element) {
    const {
      binding
    } = property;

    const {
      type: bindingType
    } = binding;

    const bindingProvider = this._providers[bindingType];

    bindingProvider.create(element, {
      property,
      bpmnFactory: this._bpmnFactory
    });
  }
}

TemplateElementFactory.$inject = [ 'bpmnFactory', 'elementFactory' ];


// helper ////////////////

function hasIcon(template) {
  const {
    icon
  } = template;

  return !!(icon && icon.contents);
}

function findDependentProperties(property, properties) {

  const {
    condition
  } = property;

  if (!condition) {
    return [];
  }

  const dependentProperty = findProperyById(properties, condition.property);

  if (dependentProperty) {
    return [ dependentProperty ];
  }

  return [];
}

function findProperyById(properties, id) {
  return find(properties, function(property) {
    return property.id === id;
  });
}