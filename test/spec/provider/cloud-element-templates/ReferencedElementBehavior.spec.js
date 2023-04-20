import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import ReplaceModule from 'bpmn-js/lib/features/replace';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from '../../../TestHelper';

import BpmnPropertiesPanel from 'src/render';
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ElementTemplatesModule from 'src/provider/cloud-element-templates';
import { removeTemplate, unlinkTemplate } from 'src/provider/cloud-element-templates/util/templateUtil';


import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './fixtures/referenced-element-behavior.bpmn';

import templates from './fixtures/referenced-element-behavior.json';


describe('provider/cloud-element-templates - ReferencedElementBehavior', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CoreModule,
    ElementTemplatesModule,
    ModelingModule,
    ReplaceModule
  ];

  beforeEach(bootstrapModeler(diagramXML, {
    elementTemplates: templates,
    modules : testModules,
    moddleExtensions: { zeebe: zeebeModdlePackage }
  }));


  describe('apply template', function() {

    it('should NOT remove message when template is applied', inject(
      function(elementRegistry, elementTemplates) {

        // given
        const event = elementRegistry.get('MessageEvent_2');
        const initialMessages = getMessages();

        // when
        elementTemplates.applyTemplate(event, templates[0]);

        // then
        expect(getMessages()).to.have.lengthOf(initialMessages.length + 1);
      })
    );
  });


  describe('unlink template', function() {

    it('should remove templated message when template is unlinked', inject(
      function(elementRegistry, injector) {

        // given
        const event = elementRegistry.get('MessageEvent');
        const initialMessages = getMessages();

        // when
        unlinkTemplate(event, injector);

        // then
        const eventBo = getBusinessObject(event);

        expect(eventBo.modelerTemplate).not.to.exist;
        expect(eventBo.modelerTemplateVersion).not.to.exist;
        expect(eventBo.name).to.equal('Event');

        const eventDefinitions = eventBo.get('eventDefinitions');
        expect(eventDefinitions).to.have.length(1);

        const message = eventDefinitions[0].get('messageRef');
        expect(message).not.to.exist;

        expect(getMessages()).to.have.lengthOf(initialMessages.length - 1);
      })
    );
  });


  describe('remove template', function() {

    it('should remove template message', inject(function(elementRegistry, injector) {

      // given
      let event = elementRegistry.get('MessageEvent'),
          eventBo = getBusinessObject(event);
      const initialMessages = getMessages();

      // when
      removeTemplate(event, injector);

      // then
      event = elementRegistry.get('MessageEvent');
      eventBo = getBusinessObject(event);

      expect(eventBo.modelerTemplate).not.to.exist;
      expect(eventBo.modelerTemplateVersion).not.to.exist;
      expect(eventBo.name).to.equal('Event');

      const eventDefinitions = eventBo.get('eventDefinitions');
      expect(eventDefinitions).to.have.length(1);

      const message = eventDefinitions[0].get('messageRef');
      expect(message).not.to.exist;

      expect(getMessages()).to.have.lengthOf(initialMessages.length - 1);
    }));
  });


  describe('remove element', function() {

    it('should remove template message', inject(function(elementRegistry, modeling) {

      // given
      const event = elementRegistry.get('MessageEvent');
      const initialMessages = getMessages();

      // when
      modeling.removeShape(event);

      // then
      expect(elementRegistry.get('MessageEvent')).not.to.exist;

      expect(getMessages()).to.have.lengthOf(initialMessages.length - 1);
    }));


    it('should NOT remove template message when label is removed',
      inject(function(elementRegistry, modeling) {

        // given
        const event = elementRegistry.get('MessageEvent');
        const initialMessages = getMessages();

        // when
        modeling.removeShape(event.label);

        // then
        expect(elementRegistry.get('MessageEvent')).to.exist;
        expect(getMessages()).to.have.lengthOf(initialMessages.length);
      })
    );
  });


  describe('replace element', function() {

    it('should remove templated message when element replaced', inject(
      function(elementRegistry, bpmnReplace) {

        // given
        let event = elementRegistry.get('MessageEvent');
        const initialMessages = getMessages();

        // when
        bpmnReplace.replaceElement(event, {
          type: 'bpmn:IntermediateCatchEvent',
          eventDefinitionType: 'bpmn:TimerEventDefinition'
        });

        // then
        event = elementRegistry.get('MessageEvent');
        const eventBo = getBusinessObject(event);

        expect(eventBo.modelerTemplate).not.to.exist;
        expect(eventBo.modelerTemplateVersion).not.to.exist;
        expect(eventBo.name).to.equal('Event');

        const eventDefinitions = eventBo.get('eventDefinitions');
        expect(eventDefinitions).to.have.length(1);

        const message = eventDefinitions[0].get('messageRef');
        expect(message).not.to.exist;

        expect(getMessages()).to.have.lengthOf(initialMessages.length - 1);
      })
    );
  });

});


// helper //////////////////////
function getMessages() {
  return getBpmnJS().getDefinitions().rootElements.filter(
    e => is(e, 'bpmn:Message'));
}
