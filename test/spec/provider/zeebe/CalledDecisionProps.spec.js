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

export function getDecisionId(element) {
  const calledDecision = getCalledDecision(element);

  return calledDecision ? calledDecision.get('decisionId') : '';
}

export function getResultVariable(element) {
  const calledDecision = getCalledDecision(element);

  return calledDecision ? calledDecision.get('resultVariable') : '';
}

function getCalledDecision(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:CalledDecision')[0];
}
