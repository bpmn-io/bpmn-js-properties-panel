'use strict';

require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var coreModule = require('bpmn-js/lib/core'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var CreateHelper = require('../../../../../lib/provider/camunda/element-templates/CreateHelper');

var createInputParameter = CreateHelper.createInputParameter,
    createOutputParameter = CreateHelper.createOutputParameter;


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
        target: 'foo'
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
        target: 'bar',
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

});