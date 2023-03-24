import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isObject } from 'min-dash';
import { applyConditions } from './Condition';
import { findExtension } from './Helper';

/**
 * Restores the original order of the template properties
 * on the moddle element.
 */
export default class UpdateTemplatePropertiesOrder extends CommandInterceptor {
  constructor(eventBus, elementTemplates, commandStack, bpmnFactory) {
    super(eventBus);

    this._eventBus = eventBus;
    this._elementTemplates = elementTemplates;
    this._commandStack = commandStack;
    this._bpmnFactory = bpmnFactory;

    this.postExecute([
      'element.updateProperties', 'element.updateModdleProperties'
    ], this._updatePropertiesOrder, true, this);
  }

  _updatePropertiesOrder(context) {
    const {
      element
    } = context;

    const template = this._elementTemplates.get(element);
    const businessObject = element.businessObject;
    const commands = [];

    if (!template) {
      return;
    }

    const templateProperties = applyConditions(element, template).properties;

    // zeebe:Property
    const zeebeProperties = findExtension(businessObject, 'zeebe:Properties');

    if (zeebeProperties) {
      this._updateZeebePropertiesOrder(zeebeProperties, templateProperties, commands, context);
    }

    // zeebe:IoMapping
    const ioMapping = findExtension(businessObject, 'zeebe:IoMapping');

    if (ioMapping) {

      // zeebe:Input
      this._updateInputOrder(ioMapping, templateProperties, commands, context);

      // zeebe:Output
      this._updateOutputOrder(ioMapping, templateProperties, commands, context);
    }

    // zeebe:TaskHeaders
    const taskHeaders = findExtension(businessObject, 'zeebe:TaskHeaders');

    if (taskHeaders) {
      this._updateTaskHeadersOrder(taskHeaders, templateProperties, commands, context);
    }


    if (commands.length) {
      const commandsToExecute = commands.filter((command) => command !== null);

      commandsToExecute.length && this._commandStack.execute(
        'properties-panel.multi-command-executor',
        commandsToExecute
      );

      return;
    }
  }

  _updateZeebePropertiesOrder(zeebeProperties, templateProperties, commands, context) {
    const findIndex = (properties, propertyToFind) =>
      properties.findIndex(prop =>
        prop.binding.type == 'zeebe:property' && prop.binding.name === propertyToFind.get('name')
      );

    const properties = zeebeProperties.get('properties');

    if (properties.length < 1)
      return;

    let newPropertiesOrder = [ ...properties ];

    sortProperties(newPropertiesOrder, findIndex, templateProperties);

    if (!arrayEquals(newPropertiesOrder, properties)) {

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: zeebeProperties,
          properties: {
            properties: newPropertiesOrder
          }
        }
      });
    }
  }

  _updateInputOrder(ioMapping, templateProperties, commands, context) {

    const findIndex = (properties, propertyToFind) =>
      properties.findIndex(prop =>
        prop.binding.type == 'zeebe:input' && prop.binding.name === propertyToFind.get('target')
      );

    const inputParameters = ioMapping.get('inputParameters');

    if (inputParameters.length < 1)
      return;

    let newInputOrder = [ ...inputParameters ];

    sortProperties(newInputOrder, findIndex, templateProperties);

    if (!arrayEquals(newInputOrder,inputParameters)) {

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: ioMapping,
          properties: { inputParameters: newInputOrder }
        }
      });
    }
  }

  _updateOutputOrder(ioMapping, templateProperties, commands, context) {

    const findIndex = (properties, propertyToFind) =>
      properties.findIndex(prop =>
        prop.binding.type == 'zeebe:output' && prop.binding.source === propertyToFind.get('source')
      );

    const outputParameters = ioMapping.get('outputParameters');

    if (outputParameters.length < 1)
      return;

    let newOutputOrder = [ ...outputParameters ];

    sortProperties(newOutputOrder, findIndex, templateProperties);

    if (!arrayEquals(newOutputOrder, outputParameters)) {

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: ioMapping,
          properties: { outputParameters: newOutputOrder }
        }
      });
    }
  }

  _updateTaskHeadersOrder(taskHeaders, templateProperties, commands, context) {

    const findIndex = (properties, propertyToFind) =>
      properties.findIndex(prop =>
        prop.binding.type == 'zeebe:taskHeader' && prop.binding.key === propertyToFind.get('key')
      );

    const headers = taskHeaders.get('zeebe:values');

    if (headers.length < 1)
      return;

    let newHeadersOrder = [ ...headers ];

    sortProperties(newHeadersOrder, findIndex, templateProperties);

    if (!arrayEquals(newHeadersOrder, headers)) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: taskHeaders,
          properties: { values: newHeadersOrder }
        }
      });
    }
  }

}

UpdateTemplatePropertiesOrder.$inject = [
  'eventBus',
  'elementTemplates',
  'commandStack',
  'bpmnFactory'
];


// helpers

function normalizeReplacer(key, value) {

  if (isObject(value)) {
    const keys = Object.keys(value).sort();

    return keys.reduce((obj, key) => {
      obj[key] = value[key];

      return obj;
    }, {});
  }

  return value;
}

function objectEquals(a, b) {
  return JSON.stringify(a, normalizeReplacer) === JSON.stringify(b, normalizeReplacer);
}

function arrayEquals(a, b) {
  return a.every((element, idx) => objectEquals(element, b[idx]));
}

function sortProperties(array, findIndex, templateProperties) {
  return array.sort((a, b) => {
    const aIndex = findIndex(templateProperties, a);
    const bIndex = findIndex(templateProperties, b);

    return aIndex - bIndex;
  });
}