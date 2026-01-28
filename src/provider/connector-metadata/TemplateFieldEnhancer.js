import { Group } from '@bpmn-io/properties-panel';
import { SelectWithContextEntry } from './SelectWithContextEntry';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

/**
 * Provider that adds context-aware dropdown fields for element templates.
 * This provider adds additional fields for template properties of type "DropdownWithContext".
 */
export default class TemplateFieldEnhancer {

  constructor(propertiesPanel, injector) {
    
    // Register at lower priority to run after template providers
    propertiesPanel.registerProvider(600, this);
    this._injector = injector;
  }

  getGroups(element) {
    return (groups) => {
      
      const elementTemplates = this._injector.get('elementTemplates', false);
      
      if (!elementTemplates) {
        return groups;
      }

      const template = elementTemplates.get(element);
      
      if (!template || !template.properties) {
        return groups;
      }

      // Find properties that are DropdownWithContext type
      const contextDropdowns = template.properties.filter(
        prop => prop.type === 'DropdownWithContext'
      );

      if (contextDropdowns.length === 0) {
        return groups;
      }

      // Create entries for each DropdownWithContext field
      const enhancedGroups = this._createEnhancedGroups(element, template, contextDropdowns);

      // Add enhanced groups after connector actions but before other groups
      const connectorActionsIndex = groups.findIndex(g => g.id === 'connector-actions');
      const insertIndex = connectorActionsIndex >= 0 ? connectorActionsIndex + 1 : 0;

      enhancedGroups.forEach((group, i) => {
        groups.splice(insertIndex + i, 0, group);
      });

      return groups;
    };
  }

  _createEnhancedGroups(element, template, contextDropdowns) {
    const translate = this._injector.get('translate');
    const groupsMap = {};

    contextDropdowns.forEach(property => {
      const entry = this._createContextDropdownEntry(element, property);
      
      if (!entry) {
        return;
      }

      const groupId = property.group || 'context-fields';
      
      if (!groupsMap[groupId]) {
        // Find the group definition in the template
        const groupDef = template.groups ? 
          template.groups.find(g => g.id === groupId) : null;

        groupsMap[groupId] = {
          id: `context-enhanced-${groupId}`,
          label: groupDef ? translate(groupDef.label) : translate('Context Fields'),
          entries: [],
          component: Group
        };
      }

      groupsMap[groupId].entries.push(entry);
    });

    return Object.values(groupsMap);
  }

  _createContextDropdownEntry(element, property) {
    const commandStack = this._injector.get('commandStack');
    const translate = this._injector.get('translate');
    const bpmnFactory = this._injector.get('bpmnFactory');

    const {
      id,
      label,
      description,
      binding
    } = property;

    // For now, we'll focus on zeebe:input bindings
    if (binding.type !== 'zeebe:input') {
      return null;
    }

    const targetName = binding.name;

    // Create getValue function
    const getValue = () => {
      const businessObject = getBusinessObject(element);
      const extensionElements = businessObject.get('extensionElements');
      
      if (!extensionElements) {
        return '';
      }

      const values = extensionElements.get('values') || [];
      const ioMapping = values.find(value => value.$type === 'zeebe:IoMapping');

      if (!ioMapping) {
        return '';
      }

      const inputParameters = ioMapping.get('inputParameters') || [];
      const parameter = inputParameters.find(
        param => param.get('target') === targetName
      );

      return parameter ? parameter.get('source') : '';
    };

    // Create setValue function
    const setValue = (value) => {
      const businessObject = getBusinessObject(element);
      let extensionElements = businessObject.get('extensionElements');

      // Create extension elements if they don't exist
      if (!extensionElements) {
        extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
          values: []
        });
        
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        });
      }

      // Find or create IoMapping
      const values = extensionElements.get('values') || [];
      let ioMapping = values.find(value => value.$type === 'zeebe:IoMapping');

      if (!ioMapping) {
        ioMapping = bpmnFactory.create('zeebe:IoMapping', {
          inputParameters: [],
          outputParameters: []
        });

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...values, ioMapping ]
          }
        });
      }

      // Find or create the input parameter
      const inputParameters = ioMapping.get('inputParameters') || [];
      let parameter = inputParameters.find(
        param => param.get('target') === targetName
      );

      if (!parameter) {
        // Create new parameter
        parameter = bpmnFactory.create('zeebe:Input', {
          target: targetName,
          source: value
        });

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: ioMapping,
          properties: {
            inputParameters: [ ...inputParameters, parameter ]
          }
        });
      } else {
        // Update existing parameter
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: parameter,
          properties: {
            source: value
          }
        });
      }
    };

    return {
      id: `dropdown-context-${id}`,
      component: SelectWithContextEntry,
      label: translate(label),
      description: description ? translate(description) : undefined,
      getValue,
      setValue,
      element,
      metadataKey: 'channels',
      optionValueKey: 'name',
      optionLabelKey: 'name'
    };
  }
}

TemplateFieldEnhancer.$inject = [ 'propertiesPanel', 'injector' ];
