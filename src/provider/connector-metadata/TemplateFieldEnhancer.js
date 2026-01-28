import { Group } from '@bpmn-io/properties-panel';
import { SelectWithContextEntry } from './SelectWithContextEntry';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

/**
 * Provider that enhances element template fields with context-aware dropdowns.
 * This provider intercepts template properties of type "DropdownWithContext"
 * and renders them using metadata from ConnectorMetadataService.
 */
export default class TemplateFieldEnhancer {

  constructor(propertiesPanel, injector) {
    
    // Register at very high priority to run before other providers
    propertiesPanel.registerProvider(100, this);
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

      // For each DropdownWithContext field, we need to inject it into the appropriate group
      // Since we're running early, we'll add our own group with these fields
      const enhancedEntries = contextDropdowns.map(property => {
        return this._createContextDropdownEntry(element, property);
      });

      // Find or create the group for these entries
      // For the Slack connector, the data.channel field is in the "channel" group
      const groupsToAdd = this._organizeEntriesByGroup(enhancedEntries, template);

      // Add these groups to the groups array
      // We want to add them after the connector actions but before other content
      const connectorActionsIndex = groups.findIndex(g => g.id === 'connector-actions');
      const insertIndex = connectorActionsIndex >= 0 ? connectorActionsIndex + 1 : 0;

      groupsToAdd.forEach((group, i) => {
        groups.splice(insertIndex + i, 0, group);
      });

      return groups;
    };
  }

  _createContextDropdownEntry(element, property) {
    const commandStack = this._injector.get('commandStack');
    const translate = this._injector.get('translate');
    const bpmnFactory = this._injector.get('bpmnFactory');

    const {
      id,
      label,
      description,
      binding,
      group: propertyGroup
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

      const ioMappings = extensionElements.get('values').filter(
        value => value.$type === 'zeebe:IoMapping'
      );

      if (!ioMappings.length) {
        return '';
      }

      const ioMapping = ioMappings[0];
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
      const values = extensionElements.get('values');
      let ioMapping = values.find(value => value.$type === 'zeebe:IoMapping');

      if (!ioMapping) {
        ioMapping = bpmnFactory.create('zeebe:IoMapping', {
          inputParameters: []
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
      group: propertyGroup,
      metadataKey: 'channels', // For Slack, we use channels
      optionValueKey: 'name',
      optionLabelKey: 'name'
    };
  }

  _organizeEntriesByGroup(entries, template) {
    const translate = this._injector.get('translate');
    const groupsMap = {};

    entries.forEach(entry => {
      if (!entry) {
        return;
      }

      const groupId = entry.group || 'context-dropdowns';
      
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
}

TemplateFieldEnhancer.$inject = [ 'propertiesPanel', 'injector' ];
