'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */


var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var testModules = [
  coreModule,
  selectionModule,
  modelingModule,
  propertiesPanelModule,
  propertiesProviderModule
];


describe('sequence-flow-properties', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('editing', function() {

    var diagramXML = require('./SequenceFlow.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: { camunda: camundaModdlePackage }
    }));

    beforeEach(inject(function(propertiesPanel) {
      propertiesPanel.attachTo(container);
    }));


    it('should fetch the condition of a sequence flow',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('SequenceFlow_2');
        selection.select(shape);

        var conditionType = TestHelper.selectedByIndex(domQuery('select[name=conditionType]', propertiesPanel._container)),
            conditionInput = domQuery('input[name="condition"]', propertiesPanel._container);

        // then
        expect(conditionType.value).to.equal('expression');
        expect(conditionInput.value).to.equal('${foo.id()}');
      })
    );


    it('should change the condition of a sequence flow',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('SequenceFlow_2');
        selection.select(shape);

        var businessObject = getBusinessObject(shape),
            conditionType = TestHelper.selectedByIndex(domQuery('select[name=conditionType]', propertiesPanel._container)),
            conditionInput = domQuery('input[name="condition"]', propertiesPanel._container);

        // assume
        expect(conditionType.value).to.equal('expression');
        expect(conditionInput.value).to.equal('${foo.id()}');
        expect(businessObject.conditionExpression.get('body')).to.equal(conditionInput.value);

        // when
        TestHelper.triggerValue(conditionInput, 'test');

        // then
        expect(conditionInput.value).to.equal('test');
        expect(businessObject.conditionExpression.get('body')).to.equal(conditionInput.value);
      })
    );


    it('should remove the condition of a condition expression sequence flow',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('SequenceFlow_2');
        selection.select(shape);

        var businessObject = getBusinessObject(shape),
            conditionType = TestHelper.selectedByIndex(domQuery('select[name=conditionType]', propertiesPanel._container)),
            conditionInput = domQuery('input[name="condition"]', propertiesPanel._container);

        // assume
        expect(conditionType.value).to.equal('expression');
        expect(conditionInput.value).to.equal('${foo.id()}');
        expect(businessObject.conditionExpression.get('body')).to.equal(conditionInput.value);

        // when
        TestHelper.triggerValue(conditionInput, '');

        // then
        expect(conditionInput.value).to.be.empty;
        expect(conditionInput.className).to.equal('invalid');
        expect(businessObject.conditionExpression.get('body')).to.equal('');
      })
    );


    it('should change condition type from expression to <>',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('SequenceFlow_2');
        selection.select(shape);

        var businessObject = getBusinessObject(shape),
            conditionType = domQuery('select[name=conditionType]', propertiesPanel._container),
            conditionInput = domQuery('input[name="condition"]', propertiesPanel._container);

        // assume
        expect(conditionType.value).to.equal('expression');
        expect(conditionInput.value).to.equal('${foo.id()}');
        expect(businessObject.conditionExpression.get('body')).to.equal(conditionInput.value);

        // when
        // select <>
        conditionType.options[2].selected = 'selected';
        TestHelper.triggerEvent(conditionType, 'change');

        // then
        expect(conditionType.value).to.equal('');
        expect(conditionInput.parentElement.className).to.contain('bpp-hidden');
        expect(businessObject.conditionExpression).to.be.undefined;
      })
    );


    it('should unset default flow property when setting condition',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('SequenceFlow_6');
        selection.select(shape);

        var businessObject = getBusinessObject(shape),
            source = getBusinessObject(shape.source),
            conditionType = domQuery('select[name=conditionType]', propertiesPanel._container);

        // assume
        expect(conditionType.value).to.be.equal('');
        expect(businessObject.conditionExpression).to.be.undefined;
        expect(source.default).to.equal(businessObject);

        // when
        // select condition
        conditionType.options[0].selected = 'selected';
        TestHelper.triggerEvent(conditionType, 'change');

        // then
        expect(conditionType.value).to.equal('expression');
        expect(source.default).to.be.undefined;
      })
    );


    it('should keep default flow property, if a condition is set on non-default flow',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('SequenceFlow_7');
        selection.select(shape);

        var businessObject = getBusinessObject(shape),
            source = getBusinessObject(shape.source),
            defaultFlow = getBusinessObject(source.default),
            conditionType = domQuery('select[name=conditionType]', propertiesPanel._container);

        // assume
        expect(conditionType.value).to.be.equal('');
        expect(businessObject.conditionExpression).to.be.undefined;
        expect(source.default).to.be.equal(defaultFlow);

        // when
        // select condition
        conditionType.options[0].selected = 'selected';
        TestHelper.triggerEvent(conditionType, 'change');

        // then
        // default flow has to remain
        expect(conditionType.value).to.equal('expression');
        expect(source.default).to.be.equal(defaultFlow);
      })
    );

  });


  describe('control visibility', function() {

    var diagramXML = require('./SequenceFlow_Visibility.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: { camunda: camundaModdlePackage }
    }));

    beforeEach(inject(function(propertiesPanel) {
      propertiesPanel.attachTo(container);
    }));


    function expectVisible(flowId, visible) {

      return inject(function(propertiesPanel, propertiesProvider, selection, elementRegistry) {

        // given
        var flow = elementRegistry.get(flowId);

        // when
        selection.select(flow);
        var conditionType = domQuery('select[name=conditionType]', propertiesPanel._container);

        // then
        if (visible) {
          expect(conditionType).to.exist;
        } else {
          expect(conditionType).not.to.exist;
        }
      });
    }


    describe('should show behind', function() {

      it('ExclusiveGateway', expectVisible('Flow_ExclusiveGateway', true));
      it('InclusiveGateway', expectVisible('Flow_InclusiveGateway', true));
      it('ComplexGateway', expectVisible('Flow_ComplexGateway', true));

      it('UserTask', expectVisible('Flow_UserTask', true));
      it('Transaction', expectVisible('Flow_Transaction', true));

    });


    describe('should hide behind', function() {

      it('EventBasedGateway', expectVisible('Flow_EventBasedGateway', false));
      it('ParallelGateway', expectVisible('Flow_ParallelGateway', false));

      it('StartEvent', expectVisible('Flow_StartEvent', false));

    });

  });

});