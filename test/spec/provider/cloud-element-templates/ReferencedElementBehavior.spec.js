import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import ReplaceModule from 'bpmn-js/lib/features/replace';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from '../../../TestHelper';

import BpmnPropertiesPanel from 'src/render';
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ElementTemplatesModule from 'src/provider/cloud-element-templates';
import { removeTemplate, unlinkTemplate } from 'src/provider/cloud-element-templates/util/templateUtil';
import { findMessage, getTemplateId, TEMPLATE_ID_ATTR } from 'src/provider/cloud-element-templates/Helper';


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

    it('should unlink templated message when template is unlinked', inject(
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
        expect(message).to.exist;
        expect(message.get(TEMPLATE_ID_ATTR)).not.to.exist;

        expect(getMessages()).to.have.lengthOf(initialMessages.length);
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


  describe('copy element', function() {

    it('should create new message when element copied', inject(
      function(elementRegistry, copyPaste, canvas) {

        // given
        const element = elementRegistry.get('MessageEvent');
        const copiedMessage = findMessage(getBusinessObject(element));
        const initialMessages = getMessages();

        // when
        copyPaste.copy([ element ]);

        const [ pastedShape ] = copyPaste.paste({
          element: canvas.getRootElement(),
          point: { x: 100, y: 100 }
        });
        const pastedMessage = findMessage(getBusinessObject(pastedShape));

        // then
        expect(getMessages()).to.have.lengthOf(initialMessages.length + 1);
        expect(pastedMessage).to.exist;
        expect(pastedMessage).not.to.eql(copiedMessage);
        expect(getTemplateId(pastedMessage)).to.equal(getTemplateId(copiedMessage));
      })
    );


    it('should NOT create new message when non-templated element copied', inject(
      function(elementRegistry, copyPaste, canvas) {

        // given
        const element = elementRegistry.get('MessageEvent_2');
        const copiedMessage = findMessage(getBusinessObject(element));
        const initialMessages = getMessages();

        // when
        copyPaste.copy([ element ]);

        const [ pastedShape ] = copyPaste.paste({
          element: canvas.getRootElement(),
          point: { x: 100, y: 100 }
        });
        const pastedMessage = findMessage(getBusinessObject(pastedShape));

        // then
        expect(getMessages()).to.have.lengthOf(initialMessages.length);
        expect(pastedMessage).to.eql(copiedMessage);
      })
    );
  });
});


// helper //////////////////////
function getMessages() {
  return getBpmnJS().getDefinitions().rootElements.filter(
    e => is(e, 'bpmn:Message'));
}
