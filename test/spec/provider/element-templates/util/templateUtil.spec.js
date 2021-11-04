import {
  removeTemplate,
  unlinkTemplate,
  updateTemplate
} from 'src/provider/element-templates/util/templateUtil';

import TestContainer from 'mocha-test-container-support';

import { bootstrapModeler, inject } from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import coreModule from 'bpmn-js/lib/core';
import elementTemplatesModule from 'src/provider/element-templates';
import modelingModule from 'bpmn-js/lib/features/modeling';

import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import diagramXML from '../fixtures/template-util.bpmn';
import templates from '../fixtures/template-util.json';


describe('provider/element-template - templateUtil', function() {

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
    expect(taskBo.asyncBefore).to.be.true;
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
    expect(taskBo.asyncBefore).to.be.false;
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
    expect(eventBo.asyncBefore).to.be.false;
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
