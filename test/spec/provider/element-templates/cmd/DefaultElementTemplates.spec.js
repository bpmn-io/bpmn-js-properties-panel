import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import CoreModule from 'bpmn-js/lib/core';
import ElementTemplatesModule from 'src/provider/element-templates';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import PropertiesPanelCommandsModule from 'src/cmd';

import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

const modules = [
  CoreModule,
  ElementTemplatesModule,
  ModelingModule,
  PropertiesPanelCommandsModule,
  {
    propertiesPanel: [ 'value', { registerProvider() {} } ]
  }
];

const moddleExtensions = {
  camunda: camundaModdlePackage
};

describe('default element templates', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  const diagramXML = require('./default-templates.bpmn').default;

  const elementTemplates = require('./default-templates');

  beforeEach(bootstrapModeler(diagramXML, {
    container: container,
    modules,
    moddleExtensions,
    elementTemplates
  }));


  it('should apply default element template on shape creation', inject(function(canvas, elementFactory, modeling) {

    // given
    const element = elementFactory.createShape({
      id: 'Task_3',
      type: 'bpmn:Task'
    });

    // when
    modeling.createShape(element, { x: 100, y: 100 }, canvas.getRootElement());

    // then
    expect(getBusinessObject(element).get('name')).to.equal('DEFAULT FOO BAR');
  }));


  it('should apply default element template on connection creation', inject(function(elementRegistry, modeling) {

    // given
    const task1 = elementRegistry.get('Task_1'),
          task2 = elementRegistry.get('Task_2');

    // when
    modeling.connect(task1, task2);

    const connection = elementRegistry.find((element) => is(element, 'bpmn:SequenceFlow'));

    // then
    expect(getBusinessObject(connection).get('name')).to.equal('DEFAULT FOO BAR FLOW');
  }));

});
