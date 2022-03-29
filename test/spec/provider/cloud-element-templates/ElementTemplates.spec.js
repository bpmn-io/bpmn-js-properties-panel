import TestContainer from 'mocha-test-container-support';

import {
  bootstrapModeler,
  createCanvasEvent as canvasEvent,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import coreModule from 'bpmn-js/lib/core';
import elementTemplatesModule from 'src/provider/cloud-element-templates';
import modelingModule from 'bpmn-js/lib/features/modeling';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './ElementTemplates.bpmn';

import templates from './fixtures/simple';

import compatibilityDiagramXML from './fixtures/compatibility.bpmn';

import compatibilityTemplates from './fixtures/compatibility';


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


  describe('createElement', function() {

    it('should create element', inject(function(elementTemplates) {

      // given
      const templates = require('./fixtures/complex.json');

      // when
      const element = elementTemplates.createElement(templates[0]);

      const extensionElements = getBusinessObject(element).get('extensionElements');

      // then
      expect(element.businessObject.get('name')).to.eql('Rest Task');
      expect(extensionElements).to.exist;
      expect(extensionElements.get('values')).to.have.length(3);
    }));


    it('should throw error - no template', inject(function(elementTemplates) {

      // given
      const emptyTemplate = null;

      // then
      expect(function() {
        elementTemplates.createElement(emptyTemplate);
      }).to.throw(/template is missing/);
    }));


    it('integration', inject(
      function(create, dragging, elementRegistry, elementTemplates) {

        // given
        const templates = require('./fixtures/complex.json');

        const processElement = elementRegistry.get('Process_1');

        const element = elementTemplates.createElement(templates[0]);

        // when
        create.start(canvasEvent({ x: 250, y: 300 }), element);
        dragging.move(canvasEvent({ x: 100, y: 200 }));
        dragging.hover({ element: processElement });
        dragging.end();

        // then
        expect(element).to.exist;
        expect(element.parent).to.eql(processElement);
      })
    );

  });

});


describe('provider/cloud-element-templates - ElementTemplates', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(compatibilityDiagramXML, {
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
    elementTemplates.set(compatibilityTemplates);
  }));


  describe('applyTemplate', function() {

    function expectTemplate(element, template) {

      return getBpmnJS().invoke(function(elementTemplates) {
        expect(elementTemplates.get(element)).to.eql(template);

        const bo = getBusinessObject(element);
        expect(bo.get('zeebe:modelerTemplate')).to.eql(template && template.id);
        expect(bo.get('zeebe:modelerTemplateVersion')).to.eql(template && template.version);
      });
    }

    function getInputBinding(element, target) {

      const bo = getBusinessObject(element);

      const extensionElements = bo.get('extensionElements');

      if (!extensionElements) {
        return null;
      }

      const ioMapping = extensionElements.values.find(function(extension) {
        return is(extension, 'zeebe:IoMapping');
      });

      return (
        ioMapping && ioMapping.inputParameters.find(function(parameter) {
          return parameter.target === target;
        }) || {}
      ).source;
    }


    it('should set template on element', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('NON_TASK');

      const template = elementTemplates.getAll().find(
        t => t.id === 'test.Basic'
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


    describe('should replace template on element', function() {

      it('keep compatible attribute', inject(
        function(elementRegistry, elementTemplates) {

          // given
          const task = elementRegistry.get('BASIC_V1');
          const aValue = getInputBinding(task, 'a');

          const basicV2Template = elementTemplates.getAll().find(
            t => t.id === 'test.Basic' && t.version === 2
          );

          // assume
          expect(basicV2Template).to.exist;
          expect(aValue).to.eql('= abba');
          expect(elementTemplates.get(task)).to.exist;

          // when
          const updatedTask = elementTemplates.applyTemplate(task, basicV2Template);

          // then
          expect(updatedTask).to.exist;
          expectTemplate(updatedTask, basicV2Template);

          // <a> is kept
          expect(getInputBinding(task, 'a'), '<a> kept').to.eql(aValue);

          // <b> is established
          expect(getInputBinding(task, 'b'), '<b> added').to.eql('b');
        }
      ));


      it('remove incompatible attribute', inject(
        function(elementRegistry, elementTemplates) {

          // given
          const task = elementRegistry.get('BASIC_V2');
          const bValue = getInputBinding(task, 'b');

          const otherTemplate = elementTemplates.getAll().find(
            t => t.id === 'test.Other'
          );

          // assume
          expect(otherTemplate).to.exist;
          expect(bValue).to.eql('= beatles');
          expect(elementTemplates.get(task)).to.exist;

          // when
          const updatedTask = elementTemplates.applyTemplate(task, otherTemplate);

          // then
          expect(updatedTask).to.exist;
          expectTemplate(updatedTask, otherTemplate);

          // <a> (incompatible) is removed
          expect(getInputBinding(task, 'a'), '<a> removed').not.to.exist;

          // <b> (compatible) is kept
          expect(getInputBinding(task, 'b'), '<b> kept').to.eql(bValue);
        }
      ));

    });


    it('should remove template from element', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('BASIC_V2');
      const aValue = getInputBinding(task, 'a');
      const bValue = getInputBinding(task, 'b');

      // assume
      expect(elementTemplates.get(task)).to.exist;
      expect(aValue).to.exist;
      expect(bValue).to.exist;

      // when
      const updatedTask = elementTemplates.applyTemplate(task, null);

      // then
      expect(updatedTask).to.exist;

      // template unlinked
      expectTemplate(updatedTask, null);

      // attributes are kept
      expect(getInputBinding(task, 'a')).to.eql(aValue);
      expect(getInputBinding(task, 'b')).to.eql(bValue);
    }));

  });

});