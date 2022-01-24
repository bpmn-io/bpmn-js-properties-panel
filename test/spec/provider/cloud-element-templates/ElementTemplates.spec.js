import TestContainer from 'mocha-test-container-support';

import { bootstrapModeler, inject } from 'test/TestHelper';

import coreModule from 'bpmn-js/lib/core';
import elementTemplatesModule from 'src/provider/cloud-element-templates';
import modelingModule from 'bpmn-js/lib/features/modeling';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './ElementTemplates.bpmn';

import templates from './fixtures/simple';


describe('provider/cloud-element-templates - ElementTemplates', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    container: container,
    modules: [
      coreModule,
      elementTemplatesModule,
      modelingModule,
      {
        propertiesPanel: [ 'value', { registerProvider() {} } ]
      }
    ],
    moddleExtensions: {
      zeebe: zeebeModdlePackage
    }
  }));

  beforeEach(inject(function(elementTemplates) {
    elementTemplates.set(templates);
  }));


  describe('get', function() {

    it('should get template by ID', inject(function(elementTemplates) {

      // when
      const template = elementTemplates.get('foo');

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).not.to.exist;
    }));


    it('should get template by ID and version', inject(function(elementTemplates) {

      // when
      const template = elementTemplates.get('foo', 1);

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).to.equal(1);
    }));


    it('should get template by element (template ID)', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const template = elementTemplates.get(task);

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).not.to.exist;
    }));


    it('should get template by element (template ID and version)', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_2');

      // when
      const template = elementTemplates.get(task);

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).to.equal(1);
    }));


    it('should not get template (no template with ID)', inject(function(elementTemplates) {

      // when
      const template = elementTemplates.get('oof');

      // then
      expect(template).to.be.null;
    }));


    it('should not get template (no template with ID)', inject(function(elementTemplates) {

      // when
      const template = elementTemplates.get('foo', -1);

      // then
      expect(template).to.be.null;
    }));


    it('should not get template (no template applied to element)', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_3');

      // when
      const template = elementTemplates.get(task);

      // then
      expect(template).to.be.null;
    }));

  });

});