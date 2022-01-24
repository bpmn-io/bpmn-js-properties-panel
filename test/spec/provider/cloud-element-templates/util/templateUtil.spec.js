import {
  getVersionOrDateFromTemplate,
  removeTemplate,
  unlinkTemplate,
  updateTemplate
} from 'src/provider/cloud-element-templates/util/templateUtil';

import TestContainer from 'mocha-test-container-support';

import { bootstrapModeler, inject } from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import coreModule from 'bpmn-js/lib/core';
import elementTemplatesModule from 'src/provider/cloud-element-templates';
import modelingModule from 'bpmn-js/lib/features/modeling';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from '../fixtures/template-util.bpmn';
import templates from '../fixtures/template-util.json';


describe('provider/cloud-element-template - templateUtil', function() {

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
    },
    elementTemplates: templates
  }));


  it('should unlink task template', inject(function(elementRegistry, injector) {

    // given
    const task = elementRegistry.get('Task_1');

    // when
    unlinkTemplate(task, injector);

    // then
    const taskBo = getBusinessObject(task);

    expect(taskBo.modelerTemplate).not.to.exist;
    expect(taskBo.modelerTemplateVersion).not.to.exist;
    expect(taskBo.name).to.equal('foo');
  }));


  it('should remove task template', inject(function(elementRegistry, injector) {

    // given
    let task = elementRegistry.get('Task_1');

    // when
    removeTemplate(task, injector);

    // then
    task = elementRegistry.get('Task_1');
    const taskBo = getBusinessObject(task);

    expect(taskBo.modelerTemplate).not.to.exist;
    expect(taskBo.modelerTemplateVersion).not.to.exist;
    expect(taskBo.name).to.not.exist;
  }));


  it('should remove conditional event template', inject(function(elementRegistry, injector) {

    // given
    let event = elementRegistry.get('ConditionalEvent');

    // when
    removeTemplate(event, injector);

    // then
    event = elementRegistry.get('ConditionalEvent');
    const eventBo = getBusinessObject(event);

    expect(eventBo.modelerTemplate).not.to.exist;
    expect(eventBo.modelerTemplateVersion).not.to.exist;
    expect(eventBo.eventDefinitions).to.have.length(1);
  }));


  it('should update template', inject(function(elementRegistry, injector) {

    // given
    const newTemplate = templates.find(
      template => template.id === 'foo' && template.version === 2);
    const task = elementRegistry.get('Task_1');

    // when
    updateTemplate(task, newTemplate, injector);

    // then
    const taskBo = getBusinessObject(task);

    expect(taskBo.modelerTemplate).to.eql('foo');
    expect(taskBo.modelerTemplateVersion).to.eql(2);
  }));


  describe('#getVersionOrDateFromTemplate', function() {

    it('should return readable date from metadata.created', function() {

      // given
      const template = { metadata: { created: 0 } };

      // when
      const date = getVersionOrDateFromTemplate(template);

      // then
      expect(date).to.eql('01.01.1970');
    });


    it('should return readable date from metadata.updated', function() {

      // given
      const template = { metadata: { updated: 0 } };

      // when
      const date = getVersionOrDateFromTemplate(template);

      // then
      expect(date).to.eql('01.01.1970');
    });


    it('should return version if metadata is not present', function() {

      // given
      const template = { version: 0 };

      // when
      const version = getVersionOrDateFromTemplate(template);

      // then
      expect(version).to.eql(0);
    });


    it('should return null if neither version nor metadate is present', function() {

      // given
      const template = {};

      // when
      const result = getVersionOrDateFromTemplate(template);

      // then
      expect(result).to.be.null;
    });
  });


  describe('selection', function() {

    it('should select task after template is removed', inject(
      function(elementRegistry, injector, selection) {

        // given
        let task = elementRegistry.get('Task_1');

        // when
        removeTemplate(task, injector);

        // then
        task = elementRegistry.get('Task_1');

        expect(selection.get()).to.deep.equal([ task ]);
      }));
  });
});
