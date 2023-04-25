import {
  getVersionOrDateFromTemplate,
  removeTemplate,
  unlinkTemplate,
  updateTemplate
} from 'src/provider/cloud-element-templates/util/templateUtil';
import { findMessage } from 'src/provider/cloud-element-templates/Helper';

import TestContainer from 'mocha-test-container-support';

import { bootstrapModeler, inject } from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import coreModule from 'bpmn-js/lib/core';
import elementTemplatesModule from 'src/provider/cloud-element-templates';
import modelingModule from 'bpmn-js/lib/features/modeling';
import { getLabel } from 'bpmn-js/lib/features/label-editing/LabelUtil';

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


  describe('#unlinkTemplate', function() {

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


    it('should remove template icon', inject(function(elementRegistry, injector) {

      // given
      let task = elementRegistry.get('Task_2');

      // assume
      expect(getBusinessObject(task).get('zeebe:modelerTemplateIcon')).to.exist;

      // when
      unlinkTemplate(task, injector);

      // then
      task = elementRegistry.get('Task_1');
      expect(getBusinessObject(task).get('zeebe:modelerTemplateIcon')).to.not.exist;
    }));
  });


  describe('#removeTemplate', function() {

    it('should remove task template', inject(function(elementRegistry, injector) {

      // given
      let task = elementRegistry.get('Task_1');

      // when
      removeTemplate(task, injector);

      // then
      task = elementRegistry.get('Task_1');
      const taskBo = getBusinessObject(task);
      const label = getLabel(task);

      expect(taskBo.modelerTemplate).not.to.exist;
      expect(taskBo.modelerTemplateVersion).not.to.exist;
      expect(label).to.eql('foo');
    }));


    it('should remove group template', inject(function(elementRegistry, injector) {

      // given
      let group = elementRegistry.get('Group_1');

      // when
      removeTemplate(group, injector);

      // then
      group = elementRegistry.get('Group_1');
      const groupBo = getBusinessObject(group);
      const label = getLabel(group);

      expect(groupBo.modelerTemplate).not.to.exist;
      expect(groupBo.modelerTemplateVersion).not.to.exist;
      expect(label).to.eql('Group Name');
    }));


    it('should remove annotation template', inject(function(elementRegistry, injector) {

      // given
      let group = elementRegistry.get('TextAnnotation_1');

      // when
      removeTemplate(group, injector);

      // then
      group = elementRegistry.get('TextAnnotation_1');
      const groupBo = getBusinessObject(group);
      const label = getLabel(group);

      expect(groupBo.modelerTemplate).not.to.exist;
      expect(groupBo.modelerTemplateVersion).not.to.exist;
      expect(label).to.eql('Text Annotation');
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
  });


  describe('#updateTemplate', function() {

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


    it('should update message event template', inject(function(elementRegistry, injector) {

      // given
      const newTemplate = templates.find(
        template => template.id === 'updateTemplate' && template.version === 2);
      let event = elementRegistry.get('MessageEvent_2');

      // when
      updateTemplate(event, newTemplate, injector);

      // then
      event = elementRegistry.get('MessageEvent_2');
      const eventBo = getBusinessObject(event);

      expect(eventBo.modelerTemplate).to.eql('updateTemplate');
      expect(eventBo.modelerTemplateVersion).to.eql(2);

      const message = findMessage(eventBo);
      expect(message.name).to.eql('version_2');
    }));


    it('should update message event template but keep user-edited name',
      inject(function(elementRegistry, modeling, injector) {

        // given
        const newTemplate = templates.find(
          template => template.id === 'updateTemplate' && template.version === 2);
        let event = elementRegistry.get('MessageEvent_2'),
            eventBo = getBusinessObject(event);
        modeling.updateModdleProperties(event, findMessage(eventBo), { name: 'user_edited' });

        // when
        updateTemplate(event, newTemplate, injector);

        // then
        event = elementRegistry.get('MessageEvent_2');
        eventBo = getBusinessObject(event);

        expect(eventBo.modelerTemplate).to.eql('updateTemplate');
        expect(eventBo.modelerTemplateVersion).to.eql(2);

        const message = findMessage(eventBo);
        expect(message.name).to.eql('user_edited');
      })
    );
  });


  describe('#getVersionOrDateFromTemplate', function() {

    it('should return readable date from metadata.created', function() {

      // given
      const template = { metadata: { created: 0 } };

      // when
      const date = getVersionOrDateFromTemplate(template);

      // then
      expect(date).to.eql('01.01.1970 01:00');
    });


    it('should return readable date from metadata.updated', function() {

      // given
      const template = { metadata: { updated: 0 } };

      // when
      const date = getVersionOrDateFromTemplate(template);

      // then
      expect(date).to.eql('01.01.1970 01:00');
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
