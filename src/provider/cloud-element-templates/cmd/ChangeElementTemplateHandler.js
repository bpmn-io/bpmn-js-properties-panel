import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  find
} from 'min-dash';

/**
 * Applies an element template to an element. Sets `zeebe:modelerTemplate` and
 * `zeebe:modelerTemplateVersion`.
 */
export default class ChangeElementTemplateHandler {
  constructor(bpmnFactory, commandStack, modeling) {
    this._bpmnFactory = bpmnFactory;
    this._commandStack = commandStack;
    this._modeling = modeling;
  }

  /**
   * Change an element's template and update its properties as specified in `newTemplate`. Specify
   * `oldTemplate` to update from one template to another. If `newTemplate` isn't specified the
   * `zeebe:modelerTemplate` and `zeebe:modelerTemplateVersion` properties will be removed from
   * the element.
   *
   * @param {Object} context
   * @param {Object} context.element
   * @param {Object} [context.oldTemplate]
   * @param {Object} [context.newTemplate]
   */
  preExecute(context) {
    const element = context.element,
          newTemplate = context.newTemplate,
          oldTemplate = context.oldTemplate;

    // update zeebe:modelerTemplate attribute
    this._updateZeebeModelerTemplate(element, newTemplate);

    if (newTemplate) {

      // update properties
      this._updateProperties(element, oldTemplate, newTemplate);
    }
  }

  _getOrCreateExtensionElements(element) {
    const bpmnFactory = this._bpmnFactory,
          modeling = this._modeling;

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    if (!extensionElements) {
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
        values: []
      });

      extensionElements.$parent = businessObject;

      modeling.updateProperties(element, {
        extensionElements: extensionElements
      });
    }

    return extensionElements;
  }

  _updateZeebeModelerTemplate(element, newTemplate) {
    const modeling = this._modeling;

    modeling.updateProperties(element, {
      'zeebe:modelerTemplate': newTemplate && newTemplate.id,
      'zeebe:modelerTemplateVersion': newTemplate && newTemplate.version
    });
  }

  _updateProperties(element, oldTemplate, newTemplate) {
    const commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'property';
    });

    if (!newProperties.length) {
      return;
    }

    const businessObject = getBusinessObject(element);

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            newBinding = newProperty.binding,
            newBindingName = newBinding.name,
            newPropertyValue = newProperty.value,
            changedElement = businessObject;

      let properties = {};

      if (oldProperty && propertyChanged(changedElement, oldProperty)) {
        return;
      }

      properties[ newBindingName ] = newPropertyValue;

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties
      });
    });
  }
}

ChangeElementTemplateHandler.$inject = [
  'bpmnFactory',
  'commandStack',
  'modeling'
];


// helpers //////////

/**
 * Find old property matching specified new property.
 *
 * @param {Object} oldTemplate
 * @param {Object} newProperty
 *
 * @returns {Object}
 */
function findOldProperty(oldTemplate, newProperty) {
  if (!oldTemplate) {
    return;
  }

  const oldProperties = oldTemplate.properties,
        newBinding = newProperty.binding,
        newBindingName = newBinding.name,
        newBindingType = newBinding.type;

  if (newBindingType === 'property') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingName = oldBinding.name,
            oldBindingType = oldBinding.type;

      return oldBindingType === 'property' && oldBindingName === newBindingName;
    });
  }
}

/**
 * Check whether property was changed after being set by template.
 *
 * @param {djs.model.Base|ModdleElement} element
 * @param {Object} oldProperty
 *
 * @returns {boolean}
 */
function propertyChanged(element, oldProperty) {
  const businessObject = getBusinessObject(element);

  const oldBinding = oldProperty.binding,
        oldBindingName = oldBinding.name,
        oldBindingType = oldBinding.type,
        oldPropertyValue = oldProperty.value;

  if (oldBindingType === 'property') {
    return businessObject.get(oldBindingName) !== oldPropertyValue;
  }
}