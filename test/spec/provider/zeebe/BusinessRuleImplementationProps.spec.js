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

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './BusinessRuleImplementationProps.bpmn';


describe('provider/zeebe - TargetProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
    ZeebePropertiesProvider,
    BehaviorsModule
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
      expect(implementation.value).to.equal('');
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


    it('should remove taskDefinition and taskHeaders when set to none', inject(
      async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_3');

        await act(() => {
          selection.select(businessRuleTask);
        });

        // when
        const implementationSelect = getImplementationSelect(container);
        changeInput(implementationSelect, '');

        // then
        const taskDefinition = getTaskDefinition(businessRuleTask);
        expect(taskDefinition).to.not.exist;

        const taskHeaders = getTaskHeaders(businessRuleTask);
        expect(taskHeaders).to.not.exist;
      }
    ));


    it('should remove calledDecision when set to none', inject(
      async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_2');

        await act(() => {
          selection.select(businessRuleTask);
        });

        // when
        const implementationSelect = getImplementationSelect(container);
        changeInput(implementationSelect, '');

        // then
        const calledDecision = getCalledDecision(businessRuleTask);
        expect(calledDecision).to.not.exist;
      }
    ));


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
      const businessObject = getBusinessObject(businessRuleTask);

      await act(() => {
        selection.select(businessRuleTask);
      });

      const implementation = getImplementationSelect(container);

      // assume
      expect(getExtensionElementsList(businessObject)).to.have.length(2);

      // when
      changeInput(implementation, 'dmn');

      // then
      expect(getExtensionElementsList(businessObject)).to.have.length(1);
    }));


    it('should undo', inject(async function(elementRegistry, selection, commandStack) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_3');

      await act(() => {
        selection.select(businessRuleTask);
      });

      const implementation = getImplementationSelect(container);

      // when
      changeInput(implementation, 'dmn');
      changeInput(implementation, 'jobWorker');

      await act(() => {
        commandStack.undo();
      });

      // then
      expect(implementation.value).to.eql('dmn');
    }));


    describe('integration', function() {

      it('should remove task definition and task headers when adding called decision', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_3');

        await act(() => selection.select(businessRuleTask));

        // assume
        expect(getTaskDefinition(businessRuleTask)).to.exist;
        expect(getTaskHeaders(businessRuleTask)).to.exist;

        // when
        const implementationSelect = getImplementationSelect(container);

        changeInput(implementationSelect, 'dmn');

        // then
        expect(getTaskDefinition(businessRuleTask)).not.to.exist;
        expect(getTaskHeaders(businessRuleTask)).not.to.exist;

        expect(getCalledDecision(businessRuleTask)).to.exist;
      }));


      it('should remove called decision when adding task definition', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_2');

        await act(() => selection.select(businessRuleTask));

        // assume
        expect(getCalledDecision(businessRuleTask)).to.exist;

        // when
        const implementationSelect = getImplementationSelect(container);

        changeInput(implementationSelect, 'jobWorker');

        // then
        expect(getCalledDecision(businessRuleTask)).not.to.exist;

        expect(getTaskDefinition(businessRuleTask)).to.exist;
      }));

    });

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

function getTaskHeaders(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskHeaders')[ 0 ];
}
