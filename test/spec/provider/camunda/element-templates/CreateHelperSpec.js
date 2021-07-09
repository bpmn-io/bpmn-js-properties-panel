'use strict';

require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var coreModule = require('bpmn-js/lib/core').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var getRoot = require('lib/Utils').getRoot;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var CreateHelper = require('lib/provider/camunda/element-templates/CreateHelper');

var createInputParameter = CreateHelper.createInputParameter,
    createOutputParameter = CreateHelper.createOutputParameter,
    createCamundaIn = CreateHelper.createCamundaIn,
    createCamundaOut = CreateHelper.createCamundaOut,
    createCamundaInWithBusinessKey = CreateHelper.createCamundaInWithBusinessKey,
    createCamundaExecutionListenerScript = CreateHelper.createCamundaExecutionListenerScript,
    createError = CreateHelper.createError;


var testModules = [
  coreModule,
  modelingModule
];

function bootstrap(diagramXML) {

  return function() {
    return bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaModdlePackage
      }
    })();
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
        type: 'camunda:in',
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
        type: 'camunda:in',
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
        type: 'camunda:in',
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
        type: 'camunda:in',
        variables: 'local'
      };

      // when
      var camundaIn = createCamundaIn(binding, null, bpmnFactory);

      // then
      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        local: true,
        variables: 'all'
      });
    }));


    it('should create variables="local" and target', inject(function(bpmnFactory) {

      // given
      var binding = {
        type: 'camunda:in',
        variables: 'local',
        target: 'var_called'
      };

      // when
      var camundaIn = createCamundaIn(binding, 'foobar', bpmnFactory);

      // then
      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        local: true,
        source: 'foobar',
        target: 'var_called'
      });
    }));


    it('should create variables="local", target and expression', inject(function(bpmnFactory) {

      // given
      var binding = {
        type: 'camunda:in',
        variables: 'local',
        target: 'var_called',
        expression: true
      };

      // when
      var camundaIn = createCamundaIn(binding, 'foobar', bpmnFactory);

      // then
      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        local: true,
        sourceExpression: 'foobar',
        target: 'var_called'
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


    it('should throw when configuration is invalid', inject(function(bpmnFactory) {

      // given
      var binding = {
        type: 'camunda:in',
        variables: 'invalidValue',
        target: 'var_called',
        expression: true
      };

      var err;

      // when
      try {
        createCamundaIn(binding, 'foobar', bpmnFactory);
      } catch (error) {
        err = error;
      }

      // then
      expect(err).to.exist;
      expect(err.message).to.equal('invalid configuration for camunda:in element template binding');
    }));

  });


  describe('createOut', function() {

    it('should create source', inject(function(bpmnFactory) {

      // given
      var binding = {
        type: 'camunda:out',
        source: 'var'
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
        type: 'camunda:out',
        sourceExpression: '${ var }'
      };

      // when
      var camundaOut = createCamundaOut(binding, 'var_local_expr', bpmnFactory);

      // then
      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        target: 'var_local_expr',
        sourceExpression: '${ var }'
      });
    }));


    it('should create variables="all"', inject(function(bpmnFactory) {

      // given
      var binding = {
        type: 'camunda:out',
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
        type: 'camunda:out',
        variables: 'local'
      };

      // when
      var camundaOut = createCamundaOut(binding, null, bpmnFactory);

      // then
      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        local: true,
        variables: 'all'
      });
    }));


    it('should create local="true" and source', inject(function(bpmnFactory) {

      // given
      var binding = {
        type: 'camunda:out',
        variables: 'local',
        source: 'mySource'
      };

      // when
      var camundaOut = createCamundaOut(binding, 'foobar', bpmnFactory);

      // then
      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        local: true,
        source: 'mySource',
        target: 'foobar'
      });
    }));


    it('should create local="true" and sourceExpression', inject(function(bpmnFactory) {

      // given
      var binding = {
        type: 'camunda:out',
        variables: 'local',
        sourceExpression: '${ mySource }'
      };

      // when
      var camundaOut = createCamundaOut(binding, 'foobar', bpmnFactory);

      // then
      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        local: true,
        sourceExpression: '${ mySource }',
        target: 'foobar'
      });
    }));


    it('should throw when configuration is invalid', inject(function(bpmnFactory) {

      // given
      var binding = {
        type: 'camunda:out',
        variables: 'invalidValue',
        sourceExpression: '${ mySource }'
      };

      var err;

      // when
      try {
        createCamundaOut(binding, 'foobar', bpmnFactory);
      } catch (error) {
        err = error;
      }

      // then
      expect(err).to.exist;
      expect(err.message).to.equal('invalid configuration for camunda:out element template binding');
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


  describe('createError', function() {

    it('should create error', inject(function(bpmnFactory, elementRegistry) {

      // given
      var binding = {
        type: 'camunda:errorEventDefinition',
        errorRef: 'error-1'
      };

      var process = elementRegistry.get('Process_1');

      var rootElement = getRoot(getBusinessObject(process));

      // when
      var error = createError(binding.errorRef, rootElement, bpmnFactory);

      // then
      expect(error).to.exist;
      expect(error.$type).to.eql('bpmn:Error');
      expect(error.id.indexOf('Error_' + binding.errorRef)).to.equal(0);
    }));
  });

});
