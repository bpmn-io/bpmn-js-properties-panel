import TestContainer from 'mocha-test-container-support';

import { bootstrapModeler, inject, getBpmnJS } from 'test/TestHelper';

import {
  getBusinessObject,
} from 'bpmn-js/lib/util/ModelUtil';

import coreModule from 'bpmn-js/lib/core';
import elementTemplatesModule from 'src/provider/element-templates';
import modelingModule from 'bpmn-js/lib/features/modeling';

import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import diagramXML from './ElementTemplates.bpmn';

import templates from './fixtures/simple';
import falsyVersionTemplate from './fixtures/falsy-version';


describe('provider/element-templates - ElementTemplates', function() {

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
      camunda: camundaModdlePackage
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


  describe('getDefault', function() {

    it('should get default template for element', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('ServiceTask');

      // when
      const template = elementTemplates.getDefault(task);

      // then
      expect(template.id).to.equal('default');
      expect(template.version).to.equal(1);
      expect(template.isDefault).to.be.true;
    }));

  });


  describe('getAll', function() {

    it('should get all templates', inject(function(elementTemplates) {

      // when
      // then
      expect(elementTemplates.getAll()).to.have.length(templates.length);
    }));


    it('should get all templates with ID', inject(function(elementTemplates) {

      // when
      const templates = elementTemplates.getAll('foo');

      // then
      expect(templates).to.have.length(4);
      expect(templates[ 0 ].id).to.equal('foo');
      expect(templates[ 1 ].id).to.equal('foo');
      expect(templates[ 2 ].id).to.equal('foo');
      expect(templates[ 3 ].id).to.equal('foo');
    }));

  });


  describe('set', function() {

    it('should set templates', inject(function(elementTemplates) {

      // when
      elementTemplates.set(templates.slice(0, 3));

      // then
      expect(elementTemplates.getAll()).to.have.length(3);
    }));


    it('should not ignore version set to 0', inject(function(elementTemplates) {

      // when
      elementTemplates.set(falsyVersionTemplate);

      // then
      expect(elementTemplates.get(falsyVersionTemplate[0].id, 0)).to.exist;
    }));

  });


  describe('applyTemplate', function() {

    function expectTemplate(element, template) {

      return getBpmnJS().invoke(function(elementTemplates) {
        expect(elementTemplates.get(element)).to.eql(template);

        const bo = getBusinessObject(element);
        expect(bo.get('camunda:modelerTemplate')).to.eql(template && template.id);
        expect(bo.get('camunda:modelerTemplateVersion')).to.eql(template && template.version);
      });
    }


    it('should set template on element', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_3');

      const template = elementTemplates.getAll().find(
        t => t.id === 'my.mail.Task2'
      );

      // assume
      expect(template).to.exist;
      expect(elementTemplates.get(task)).not.to.exist;

      // when
      const updatedTask = elementTemplates.applyTemplate(task, template);

      // then
      expect(updatedTask).to.exist;
      expectTemplate(updatedTask, template);
    }));


    it('should replace template on element', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('MAIL_TASK');
      const asyncBefore = getBusinessObject(task).get('camunda:asyncBefore');

      const template = elementTemplates.getAll().find(
        t => t.id === 'my.mail.Task2'
      );

      // assume
      expect(template).to.exist;
      expect(asyncBefore).to.be.true;
      expect(elementTemplates.get(task)).to.exist;

      // when
      const updatedTask = elementTemplates.applyTemplate(task, template);

      // then
      expect(updatedTask).to.exist;
      expectTemplate(updatedTask, template);

      // <camunda:asyncBefore> is kept
      expect(getBusinessObject(updatedTask).get('camunda:asyncBefore')).to.eql(asyncBefore);
    }));


    it('should remove template from element', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_1');

      // assume
      expect(elementTemplates.get(task)).to.exist;

      // when
      const updatedTask = elementTemplates.applyTemplate(task, null);

      // then
      expect(updatedTask).to.exist;

      expectTemplate(updatedTask, null);
    }));

  });

});