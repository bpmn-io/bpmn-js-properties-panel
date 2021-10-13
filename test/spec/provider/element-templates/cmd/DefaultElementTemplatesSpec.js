'use strict';

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var coreModule = require('bpmn-js/lib/core').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesPanelCommandsModule = require('lib/cmd'),
    elementTemplatesModule = require('lib/provider/camunda/element-templates'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('default element templates', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  var diagramXML = require('./default-templates.bpmn');

  var templateDescriptors = require('./default-templates');

  beforeEach(bootstrapModeler(diagramXML, {
    container: container,
    modules: [
      coreModule,
      modelingModule,
      propertiesPanelCommandsModule,
      elementTemplatesModule
    ],
    moddleExtensions: {
      camunda: camundaModdlePackage
    },
    elementTemplates: templateDescriptors
  }));

  it('should apply default element template on shape creation', inject(function(canvas, elementFactory, modeling) {

    // given
    var element = elementFactory.createShape({
      id: 'Task_3',
      type: 'bpmn:Task'
    });

    // when
    modeling.createShape(element, { x: 100, y: 100 }, canvas.getRootElement());

    // then
    expect(getBusinessObject(element).name).to.equal('DEFAULT FOO BAR');

  }));

  it('should apply default element template on connection creation', inject(function(elementFactory, elementRegistry, modeling) {

    // given
    var task1 = elementRegistry.get('Task_1'),
        task2 = elementRegistry.get('Task_2');

    // when
    modeling.connect(task1, task2);

    var connection = elementRegistry.filter(function(element) {
      return element.type === 'bpmn:SequenceFlow';
    })[0];

    // then
    expect(getBusinessObject(connection).name).to.equal('DEFAULT FOO BAR FLOW');

  }));

});
