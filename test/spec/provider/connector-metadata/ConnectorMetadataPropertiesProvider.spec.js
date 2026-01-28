import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import {
  act
} from '@testing-library/preact';

import {
  query as domQuery
} from 'min-dom';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ConnectorMetadataModule
} from 'src';

import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './ConnectorMetadata.bpmn';


describe('provider/connector-metadata - ConnectorMetadataPropertiesProvider', function() {

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    debounceInput: false,
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      ConnectorMetadataModule,
      {
        __init__: [ 'elementTemplates' ],
        elementTemplates: [ 'value', new MockElementTemplates() ]
      }
    ],
    moddleExtensions: {
      zeebe: zeebeModdle
    }
  }));


  it('should render Connect button for element with template', inject(
    async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      // when
      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const connectButton = domQuery('.bio-properties-panel-connect-button');
      expect(connectButton).to.exist;
      expect(connectButton.textContent).to.equal('Connect');
    }
  ));


  it('should NOT render Connect button for element without template', inject(
    async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      // when
      await act(() => {
        selection.select(startEvent);
      });

      // then
      const connectButton = domQuery('.bio-properties-panel-connect-button');
      expect(connectButton).not.to.exist;
    }
  ));


  it('should fetch metadata when Connect button is clicked', inject(
    async function(elementRegistry, selection, connectorMetadata) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const connectButton = domQuery('.bio-properties-panel-connect-button');

      // when
      await act(() => {
        connectButton.click();
      });

      // wait for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // then
      const metadata = connectorMetadata.getMetadata('slack-connector');
      expect(metadata).to.exist;
      expect(metadata.channels).to.exist;
      expect(metadata.channels).to.have.length(5);
    }
  ));


  it('should show success message after fetching metadata', inject(
    async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const connectButton = domQuery('.bio-properties-panel-connect-button');

      // when
      await act(() => {
        connectButton.click();
      });

      // wait for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // then
      const message = domQuery('.bio-properties-panel-connect-message');
      expect(message).to.exist;
      expect(message.textContent).to.contain('successfully');
    }
  ));

});


// helpers /////////////////////////

class MockElementTemplates {
  constructor() {
    this._templates = {
      'slack-connector': {
        id: 'slack-connector',
        name: 'Slack Connector',
        description: 'Send messages to Slack channels'
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
}
