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

import diagramXML from './CalledDecisionProps.bpmn';


describe('provider/zeebe - CalledDecisionProps', function() {

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


  describe('bpmn:BusinessRuleTask', function() {

    describe('#calledDecision.decisionId', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

        // assume
        const decisionId = getDecisionId(businessRuleTask);

        expect(decisionId).to.equal('myDecisionId');

        // when
        await act(() => {
          selection.select(businessRuleTask);
        });

        const decisonIdInput = domQuery('input[name=decisionId]', container);

        // then
        expect(decisonIdInput).to.exist;

        expect(decisonIdInput.value).to.equal('myDecisionId');
      }));


      it('should not display', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        // when
        await act(() => {
          selection.select(task);
        });

        const decisonIdInput = domQuery('input[name=decisionId]', container);

        // then
        expect(decisonIdInput).not.to.exist;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

        await act(() => {
          selection.select(businessRuleTask);
        });

        const decisonIdInput = domQuery('input[name=decisionId]', container);

        // when
        changeInput(decisonIdInput, 'foobar');

        // then
        const decisionId = getDecisionId(businessRuleTask);

        expect(decisionId).to.equal('foobar');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const businessRuleTask = elementRegistry.get('BusinessRuleTask_1'),
                originalValue = getDecisionId(businessRuleTask);

          await act(() => {
            selection.select(businessRuleTask);
          });

          const decisonIdInput = domQuery('input[name=decisionId]', container);
          changeInput(decisonIdInput, 'fooBar');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(decisonIdInput.value).to.eql(originalValue);
        })
      );

    });


    describe('#calledDecision.bindingType', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

        // assume
        const bindingType = getBindingType(businessRuleTask);

        expect(bindingType).to.equal('latest');

        // when
        await act(() => {
          selection.select(businessRuleTask);
        });

        const bindingTypeSelect = domQuery('select[name=bindingType]', container);

        // then
        expect(bindingTypeSelect).to.exist;

        expect(bindingTypeSelect.value).to.equal('latest');
      }));


      it('should not display', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        // when
        await act(() => {
          selection.select(task);
        });

        const bindingTypeSelect = domQuery('select[name=bindingType]', container);

        // then
        expect(bindingTypeSelect).not.to.exist;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

        await act(() => {
          selection.select(businessRuleTask);
        });

        const bindingTypeSelect = domQuery('select[name=bindingType]', container);

        // when
        changeInput(bindingTypeSelect, 'deployment');

        // then
        const bindingType = getBindingType(businessRuleTask);

        expect(bindingType).to.equal('deployment');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const businessRuleTask = elementRegistry.get('BusinessRuleTask_1'),
                originalValue = getBindingType(businessRuleTask);

          await act(() => {
            selection.select(businessRuleTask);
          });

          const bindingTypeSelect = domQuery('select[name=bindingType]', container);

          changeInput(bindingTypeSelect, 'deployment');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(getBindingType(businessRuleTask)).to.eql(originalValue);
        })
      );

    });


    describe('#calledDecision.versionTag', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_2');

        // assume
        const versionTag = getVersionTag(businessRuleTask);

        expect(versionTag).to.equal('v1.0.0');

        // when
        await act(() => {
          selection.select(businessRuleTask);
        });

        const versionTagInput = domQuery('input[name=versionTag]', container);

        // then
        expect(versionTagInput).to.exist;

        expect(versionTagInput.value).to.equal('v1.0.0');
      }));


      it('should not display', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        // when
        await act(() => {
          selection.select(task);
        });

        const versionTagInput = domQuery('input[name=versionTag]', container);

        // then
        expect(versionTagInput).not.to.exist;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_2');

        await act(() => {
          selection.select(businessRuleTask);
        });

        const versionTagInput = domQuery('input[name=versionTag]', container);

        // when
        changeInput(versionTagInput, 'v2.0.0');

        // then
        const versionTag = getVersionTag(businessRuleTask);

        expect(versionTag).to.equal('v2.0.0');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const businessRuleTask = elementRegistry.get('BusinessRuleTask_2'),
                originalValue = getVersionTag(businessRuleTask);

          await act(() => {
            selection.select(businessRuleTask);
          });

          const versionTagInput = domQuery('input[name=versionTag]', container);

          changeInput(versionTagInput, 'v2.0.0');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(getVersionTag(businessRuleTask)).to.eql(originalValue);
        })
      );

    });


    describe('#calledDecision.resultVariable', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

        // assume
        const decisionId = getDecisionId(businessRuleTask);

        expect(decisionId).to.equal('myDecisionId');

        // when
        await act(() => {
          selection.select(businessRuleTask);
        });

        const resultVariableInput = domQuery('input[name=resultVariable]', container);

        // then
        expect(resultVariableInput).to.exist;

        expect(resultVariableInput.value).to.equal('myResultVariable');
      }));


      it('should not display', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        // when
        await act(() => {
          selection.select(task);
        });

        const resultVariableInput = domQuery('input[name=resultVariable]', container);

        // then
        expect(resultVariableInput).not.to.exist;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

        await act(() => {
          selection.select(businessRuleTask);
        });

        const resultVariableInput = domQuery('input[name=resultVariable]', container);

        // when
        changeInput(resultVariableInput, 'foobar');

        // then
        const resultVariable = getResultVariable(businessRuleTask);

        expect(resultVariable).to.equal('foobar');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const businessRuleTask = elementRegistry.get('BusinessRuleTask_1'),
                originalValue = getResultVariable(businessRuleTask);

          await act(() => {
            selection.select(businessRuleTask);
          });

          const resultVariableInput = domQuery('input[name=resultVariable]', container);
          changeInput(resultVariableInput, 'fooBar');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(resultVariableInput.value).to.eql(originalValue);
        })
      );

    });

  });

});

// helper //////////////

function getDecisionId(element) {
  const calledDecision = getCalledDecision(element);

  return calledDecision ? calledDecision.get('decisionId') : '';
}

function getBindingType(element) {
  const calledDecision = getCalledDecision(element);

  return calledDecision ? calledDecision.get('bindingType') : '';
}

function getVersionTag(element) {
  const calledDecision = getCalledDecision(element);

  return calledDecision ? calledDecision.get('versionTag') : '';
}

function getResultVariable(element) {
  const calledDecision = getCalledDecision(element);

  return calledDecision ? calledDecision.get('resultVariable') : '';
}

function getCalledDecision(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:CalledDecision')[0];
}
