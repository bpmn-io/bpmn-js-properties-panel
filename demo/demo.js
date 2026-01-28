import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
  ConnectorMetadataModule
} from '../src';

import ZeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';
import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './diagram.bpmn';

// Import styles
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import '../src/provider/connector-metadata/connector-metadata.css';

// Mock Element Templates Service
class ElementTemplates {
  constructor() {
    this._templates = {
      'slack-connector': {
        id: 'slack-connector',
        name: 'Slack Connector',
        description: 'Send messages to Slack channels',
        appliesTo: [ 'bpmn:ServiceTask' ],
        properties: []
      }
    };
  }

  get(element) {
    const businessObject = element.businessObject;
    const templateId = businessObject.get('zeebe:modelerTemplate');

    if (templateId && this._templates[templateId]) {
      return this._templates[templateId];
    }

    return null;
  }

  getTemplateId(element) {
    const template = this.get(element);
    return template ? template.id : null;
  }

  getAll() {
    return Object.values(this._templates);
  }
}

ElementTemplates.$inject = [];

// Create the modeler
const modeler = new BpmnModeler({
  container: '#canvas',
  propertiesPanel: {
    parent: '#properties'
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    ZeebePropertiesProviderModule,
    ConnectorMetadataModule,
    ZeebeBehaviorsModule,
    {
      __init__: [ 'elementTemplates' ],
      elementTemplates: [ 'type', ElementTemplates ]
    }
  ],
  moddleExtensions: {
    zeebe: zeebeModdle
  }
});

// Import the diagram
modeler.importXML(diagramXML)
  .then(() => {
    const canvas = modeler.get('canvas');
    canvas.zoom('fit-viewport');

    // Select the service task
    const elementRegistry = modeler.get('elementRegistry');
    const selection = modeler.get('selection');
    const serviceTask = elementRegistry.get('ServiceTask_1');

    if (serviceTask) {
      selection.select(serviceTask);
    }

    console.log('Demo loaded successfully!');
    console.log('Click the Service Task and look for the "Connect" button in the properties panel.');
  })
  .catch(err => {
    console.error('Error loading diagram:', err);
  });

// Listen to connector metadata events
const eventBus = modeler.get('eventBus');

eventBus.on('connectorMetadata.loading', (event) => {
  console.log('Loading metadata for:', event.template.name);
});

eventBus.on('connectorMetadata.fetched', (event) => {
  console.log('Metadata fetched:', event.metadata);
});

eventBus.on('connectorMetadata.error', (event) => {
  console.error('Error fetching metadata:', event.error);
});
