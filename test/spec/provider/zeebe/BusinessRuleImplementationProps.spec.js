import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil.js';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './BusinessRuleImplementationProps.bpmn';


describe('provider/zeebe - TargetProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
    ZeebePropertiesProvider
  ];

  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
  };

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    debounceInput: false
  }));


  describe('bpmn:BusinessRuleTask#implementation', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

      // when
      await act(() => {
        selection.select(businessRuleTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation).to.exist;
    }));


    it('should not display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      // when
      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation).to.not.exist;
    }));


    it('should display default', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

      // when
      await act(() => {
        selection.select(businessRuleTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation.value).to.equal('dmn');
    }));


    it('should display dmn', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_2');

      // when
      await act(() => {
        selection.select(businessRuleTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation.value).to.equal('dmn');
    }));


    it('should display jobWorker', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_3');

      // when
      await act(() => {
        selection.select(businessRuleTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation.value).to.equal('jobWorker');
    }));


    it('should create taskDefinition', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

      await act(() => {
        selection.select(businessRuleTask);
      });

      const implementation = getImplementationSelect(container);

      // when
      changeInput(implementation, 'jobWorker');

      // then
      const taskDefinition = getTaskDefinition(businessRuleTask);
      expect(taskDefinition).to.exist;
    }));


    it('should create calledDecision', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

      await act(() => {
        selection.select(businessRuleTask);
      });

      const implementation = getImplementationSelect(container);

      // when
      changeInput(implementation, 'dmn');

      // then
      const calledDecision = getCalledDecision(businessRuleTask);
      expect(calledDecision).to.exist;
    }));


    it('should re-use extension elements', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_3');

      await act(() => {
        selection.select(businessRuleTask);
      });

      const implementation = getImplementationSelect(container);

      // assume
      expect(getTaskDefinition(businessRuleTask)).to.exist;

      // when
      changeInput(implementation, 'dmn');

      // then
      expect(getTaskDefinition(businessRuleTask)).to.exist;
    }));

  });

});


// helper /////////////////

function getImplementationSelect(container) {
  return domQuery('select[name=businessRuleImplementation]', container);
}

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}

function getCalledDecision(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:CalledDecision')[0];
}
