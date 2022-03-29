import {
  bootstrapModeler,
  inject
} from '../../../TestHelper';

import BpmnPropertiesPanel from 'src/render';
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ElementTemplatesModule from 'src/provider/cloud-element-templates';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import ReplaceModule from 'bpmn-js/lib/features/replace';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './fixtures/replace-behavior.bpmn';

import elementTemplates from './fixtures/replace-behavior.json';


describe('provider/cloud-element-templates - ReplaceBehavior', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CoreModule,
    ElementTemplatesModule,
    ModelingModule,
    ReplaceModule
  ];

  beforeEach(bootstrapModeler(diagramXML, {
    elementTemplates,
    modules : testModules,
    moddleExtensions: { zeebe: zeebeModdlePackage }
  }));


  describe('without version', function() {

    it('should not unlink if template can be applied to type', inject(function(elementRegistry, bpmnReplace) {

      // given
      const task = elementRegistry.get('Task_1');

      const newElementData = { type: 'bpmn:CallActivity' };

      // when
      const newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      const businessObject = getBusinessObject(newElement);

      expect(businessObject.get('zeebe:modelerTemplate')).to.exist;
    }));


    it('should not unlink if template can be applied to parent type', inject(function(elementRegistry, bpmnReplace) {

      // given
      const task = elementRegistry.get('Task_1');

      const newElementData = { type: 'bpmn:ServiceTask' };

      // when
      const newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      const businessObject = getBusinessObject(newElement);

      expect(businessObject.get('zeebe:modelerTemplate')).to.exist;
    }));


    it('should unlink if template cannot be applied to type', inject(function(elementRegistry, bpmnReplace) {

      // given
      const task = elementRegistry.get('Task_1');

      const newElementData = { type: 'bpmn:SubProcess' };

      // when
      const newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      const businessObject = getBusinessObject(newElement);

      expect(businessObject.get('zeebe:modelerTemplate')).not.to.exist;
    }));


    it('should unlink if elementType is set', inject(function(elementRegistry, bpmnReplace) {

      // given
      const task = elementRegistry.get('Task_elementType_1');

      const newElementData = { type: 'bpmn:CallActivity' };

      // when
      const newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      const businessObject = getBusinessObject(newElement);

      expect(businessObject.get('zeebe:modelerTemplate')).not.to.exist;
    }));

  });


  describe('with version', function() {

    it('should not unlink if template can be applied to type', inject(function(elementRegistry, bpmnReplace) {

      // given
      const task = elementRegistry.get('Task_2');

      const newElementData = { type: 'bpmn:CallActivity' };

      // when
      const newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      const businessObject = getBusinessObject(newElement);

      expect(businessObject.get('zeebe:modelerTemplate')).to.exist;
      expect(businessObject.get('zeebe:modelerTemplateVersion')).to.exist;
    }));


    it('should not unlink if template can be applied to parent type', inject(function(elementRegistry, bpmnReplace) {

      // given
      const task = elementRegistry.get('Task_2');

      const newElementData = { type: 'bpmn:ServiceTask' };

      // when
      const newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      const businessObject = getBusinessObject(newElement);

      expect(businessObject.get('zeebe:modelerTemplate')).to.exist;
      expect(businessObject.get('zeebe:modelerTemplateVersion')).to.exist;
    }));


    it('should unlink if template cannot be applied to type', inject(function(elementRegistry, bpmnReplace) {

      // given
      const task = elementRegistry.get('Task_2');

      const newElementData = { type: 'bpmn:SubProcess' };

      // when
      const newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      const businessObject = getBusinessObject(newElement);

      expect(businessObject.get('zeebe:modelerTemplate')).not.to.exist;
      expect(businessObject.get('zeebe:modelerTemplateVersion')).not.to.exist;
    }));


    it('should unlink if elementType is set', inject(function(elementRegistry, bpmnReplace) {

      // given
      const task = elementRegistry.get('Task_elementType_2');

      const newElementData = { type: 'bpmn:CallActivity' };

      // when
      const newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      const businessObject = getBusinessObject(newElement);

      expect(businessObject.get('zeebe:modelerTemplate')).not.to.exist;
      expect(businessObject.get('zeebe:modelerTemplateVersion')).not.to.exist;
    }));

  });

});