'use strict';

var bootstrapModeler = require('../../../../helper').bootstrapModeler,
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    coreModule = require('bpmn-js/lib/core').default,
    inject = require('../../../../helper').inject,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesPanelModule = require('lib'),
    propertiesProviderModule = require('lib/provider/camunda'),
    replaceModule = require('bpmn-js/lib/features/replace').default;


describe('element-templates - replace behavior', function() {

  var testModules = [
    coreModule,
    modelingModule,
    replaceModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var diagramXML = require('./fixtures/replace-behavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    elementTemplates: require('./fixtures/replace-behavior'),
    modules : testModules,
    moddleExtensions: { camunda: camundaModdlePackage }
  }));


  it('should not unlink if template can be applied to type', inject(function(elementRegistry, bpmnReplace) {

    // given
    var task = elementRegistry.get('Task_1');
    var newElementData = {
      type: 'bpmn:CallActivity'
    };

    // when
    var newElement = bpmnReplace.replaceElement(task, newElementData);

    // then
    var businessObject = newElement.businessObject;
    expect(businessObject.modelerTemplate).to.exist;
  }));


  it('should not unlink if template can be applied to parent type', inject(function(elementRegistry, bpmnReplace) {

    // given
    var task = elementRegistry.get('Task_1');
    var newElementData = {
      type: 'bpmn:ServiceTask'
    };

    // when
    var newElement = bpmnReplace.replaceElement(task, newElementData);

    // then
    var businessObject = newElement.businessObject;
    expect(businessObject.modelerTemplate).to.exist;
  }));


  it('should unlink if template cannot be applied to type', inject(function(elementRegistry, bpmnReplace) {

    // given
    var task = elementRegistry.get('Task_1');
    var newElementData = {
      type: 'bpmn:SubProcess'
    };

    // when
    var newElement = bpmnReplace.replaceElement(task, newElementData);

    // then
    var businessObject = newElement.businessObject;
    expect(businessObject.modelerTemplate).not.to.exist;
  }));

});