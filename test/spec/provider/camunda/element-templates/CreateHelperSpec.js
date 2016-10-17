'use strict';

require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var coreModule = require('bpmn-js/lib/core'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var CreateHelper = require('../../../../../lib/provider/camunda/element-templates/CreateHelper');

var createInputParameter = CreateHelper.createInputParameter,
    createOutputParameter = CreateHelper.createOutputParameter,
    createCamundaIn = CreateHelper.createCamundaIn,
    createCamundaOut = CreateHelper.createCamundaOut,
    createCamundaInWithBusinessKey = CreateHelper.createCamundaInWithBusinessKey,
    createCamundaExecutionListenerScript = CreateHelper.createCamundaExecutionListenerScript;


var testModules = [
  coreModule,
  modelingModule
];

function bootstrap(diagramXML) {

  return function(done) {
    bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaModdlePackage
      }
    })(done);
  };
}


describe('element-templates - CreateHelper', function() {

  var diagramXML = require('./CreateHelper.bpmn');

  beforeEach(bootstrap(diagramXML));


  describe('createInputParameter', function() {

    it('should create plain', inject(function(bpmnFactory) {

      // given
      var binding = {
        name: 'foo'
      };

      // when
      var inputParameter = createInputParameter(binding, '${ source }', bpmnFactory);

      // then
      expect(inputParameter).to.jsonEqual({
        $type: 'camunda:InputParameter',
        name: 'foo',
        value: '${ source }'
      });
    }));


    it('should create script', inject(function(bpmnFactory) {

      // given
      var binding = {
        name: 'bar',
        scriptFormat: 'freemarker'
      };

      // when
      var inputParameter = createInputParameter(binding, '${ source }', bpmnFactory);

      // then
      expect(inputParameter).to.jsonEqual({
        $type: 'camunda:InputParameter',
        name: 'bar',
        definition: {
          $type: 'camunda:Script',
          scriptFormat: 'freemarker',
          value: '${ source }'
        }
      });
    }));

  });


  describe('createOutputParameter', function() {

    it('should create plain', inject(function(bpmnFactory) {

      // given
      var binding = {
        source: '${ source }'
      };

      // when
      var outputParameter = createOutputParameter(binding, 'bar', bpmnFactory);

      // then
      expect(outputParameter).to.jsonEqual({
        $type: 'camunda:OutputParameter',
        name: 'bar',
        value: '${ source }'
      });
    }));


    it('should create script', inject(function(bpmnFactory) {

      // given
      var binding = {
        source: '${ source }',
        scriptFormat: 'freemarker'
      };

      // when
      var outputParameter = createOutputParameter(binding, 'foo', bpmnFactory);

      // then
      expect(outputParameter).to.jsonEqual({
        $type: 'camunda:OutputParameter',
        name: 'foo',
        definition: {
          $type: 'camunda:Script',
          scriptFormat: 'freemarker',
          value: '${ source }'
        }
      });
    }));

  });


  describe('createCamundaIn', function() {

    it('should create source', inject(function(bpmnFactory) {

      // given
      var binding = {
        target: 'var_called'
      };

      // when
      var camundaIn = createCamundaIn(binding, 'var', bpmnFactory);

      // then
      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        target: 'var_called',
        source: 'var'
      });
    }));


    it('should create sourceExpression', inject(function(bpmnFactory) {

      // given
      var binding = {
        target: 'var_called',
        expression: true
      };

      // when
      var camundaIn = createCamundaIn(binding, '${ var }', bpmnFactory);

      // then
      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        target: 'var_called',
        sourceExpression: '${ var }'
      });
    }));


    it('should create variables="all"', inject(function(bpmnFactory) {

      // given
      var binding = {
        variables: 'all'
      };

      // when
      var camundaIn = createCamundaIn(binding, null, bpmnFactory);

      // then
      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        variables: 'all'
      });
    }));


    it('should create variables="all" local="true"', inject(function(bpmnFactory) {

      // given
      var binding = {
        variables: 'local'
      };

      // when
      var camundaIn = createCamundaIn(binding, null, bpmnFactory);

      // then
      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        variables: 'all',
        local: true
      });
    }));


    it('should create businessKey', inject(function(bpmnFactory) {

      // given
      var binding = {};

      // when
      var camundaIn = createCamundaInWithBusinessKey(binding, '${ key }', bpmnFactory);

      // then
      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        businessKey: '${ key }'
      });
    }));

  });


  describe('createOut', function() {

    it('should create source', inject(function(bpmnFactory) {

      // given
      var binding = {
        target: 'var'
      };

      // when
      var camundaOut = createCamundaOut(binding, 'var', bpmnFactory);

      // then
      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        target: 'var',
        source: 'var'
      });
    }));


    it('should create sourceExpression', inject(function(bpmnFactory) {

      // given
      var binding = {
        target: 'var',
        expression: true
      };

      // when
      var camundaOut = createCamundaOut(binding, '${ var }', bpmnFactory);

      // then
      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        target: 'var',
        sourceExpression: '${ var }'
      });
    }));


    it('should create variables="all"', inject(function(bpmnFactory) {

      // given
      var binding = {
        variables: 'all'
      };

      // when
      var camundaOut = createCamundaOut(binding, null, bpmnFactory);

      // then
      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        variables: 'all'
      });
    }));


    it('should create variables="all" local="true"', inject(function(bpmnFactory) {

      // given
      var binding = {
        variables: 'local'
      };

      // when
      var camundaOut = createCamundaOut(binding, null, bpmnFactory);

      // then
      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        variables: 'all',
        local: true
      });
    }));

  });


  describe('createExecutionListener', function() {

    it('should create script', inject(function(bpmnFactory) {

      // given
      var binding = {
        type: 'camunda:executionListener',
        event: 'end',
        scriptFormat: 'groovy'
      };

      // when
      var listener = createCamundaExecutionListenerScript(binding, 'println execution.eventName', bpmnFactory);

      // then
      expect(listener).to.jsonEqual({
        $type: 'camunda:ExecutionListener',
        event: 'end',
        script: {
          $type: 'camunda:Script',
          scriptFormat: 'groovy',
          value: 'println execution.eventName'
        }
      });
    }));

  });

});