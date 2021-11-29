import {
  bootstrapModeler,
  inject
} from '../../../TestHelper';

import BpmnPropertiesPanel from 'src/render';
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ElementTemplatesModule from 'src/provider/element-templates';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import ReplaceModule from 'bpmn-js/lib/features/replace';

import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './fixtures/replace-behavior.bpmn';

import elementTemplates from './fixtures/replace-behavior.json';


describe('provider/element-templates - ReplaceBehavior', function() {

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
    moddleExtensions: { camunda: camundaModdlePackage }
  }));


  it('should not unlink if template can be applied to type', inject(function(elementRegistry, bpmnReplace) {

    // given
    const task = elementRegistry.get('Task_1');

    const newElementData = { type: 'bpmn:CallActivity' };

    // when
    const newElement = bpmnReplace.replaceElement(task, newElementData);

    // then
    const businessObject = getBusinessObject(newElement);

    expect(businessObject.get('camunda:modelerTemplate')).to.exist;
  }));


  it('should not unlink if template can be applied to parent type', inject(function(elementRegistry, bpmnReplace) {

    // given
    const task = elementRegistry.get('Task_1');

    const newElementData = { type: 'bpmn:ServiceTask' };

    // when
    const newElement = bpmnReplace.replaceElement(task, newElementData);

    // then
    const businessObject = getBusinessObject(newElement);

    expect(businessObject.get('camunda:modelerTemplate')).to.exist;
  }));


  it('should unlink if template cannot be applied to type', inject(function(elementRegistry, bpmnReplace) {

    // given
    const task = elementRegistry.get('Task_1');

    const newElementData = { type: 'bpmn:SubProcess' };

    // when
    const newElement = bpmnReplace.replaceElement(task, newElementData);

    // then
    const businessObject = getBusinessObject(newElement);

    expect(businessObject.get('camunda:modelerTemplate')).not.to.exist;
  }));

});