import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import { bootstrapPropertiesPanel, changeInput, clickInput, inject } from 'test/TestHelper';

import { query as domQuery } from 'min-dom';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import BpmnPropertiesPanel from 'src/render';
import BpmnPropertiesProvider from 'src/provider/bpmn';

import diagramXML from './AdHocCompletionProps.bpmn';

describe('provider/bpmn - AdHocCompletion', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule,
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(
    bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      debounceInput: false,
    })
  );


  describe('bpmn:AdHocSubProcess', function() {

    it('should display completion group on ad-hoc subprocess', inject(async function(
        elementRegistry,
        selection
    ) {

      // given
      const subprocess = elementRegistry.get('Subprocess_1');

      // when
      await act(() => {
        selection.select(subprocess);
      });

      // then
      const group = getGroup(container, 'adHocCompletion');
      expect(group).to.exist;
      expect(getCompletionConditionInput(container)).to.exist;
      expect(getCancelRemainingInstancesCheckbox(container)).to.exist;
    }));


    it('should NOT display completion group on a normal subprocess', inject(async function(
        elementRegistry,
        selection
    ) {

      // given
      const subprocess = elementRegistry.get('Subprocess_3');

      // when
      await act(() => {
        selection.select(subprocess);
      });

      // then
      const group = getGroup(container, 'adHocCompletion');
      expect(group).not.to.exist;
    }));


    describe('#completionCondition', function() {

      it('should show the expected value when a condition is configured', inject(async function(elementRegistry, selection) {

        // given
        const subprocess = elementRegistry.get('Subprocess_1');

        // when
        await act(() => {
          selection.select(subprocess);
        });

        // then
        const completionConditionInput = getCompletionConditionInput(container);
        expect(completionConditionInput).to.exist;
        expect(completionConditionInput.value).to.equal(getCompletionConditionValue(subprocess));
      }));


      it('should be empty when no condition is configured', inject(async function(elementRegistry, selection) {

        // given
        const subprocess = elementRegistry.get('Subprocess_2');

        // when
        await act(() => {
          selection.select(subprocess);
        });

        // then
        const completionConditionInput = getCompletionConditionInput(container);
        expect(completionConditionInput).to.exist;
        expect(completionConditionInput.value).to.be.empty;
      }));


      it('should update - reusing existing FormalExpression',
        inject(async function(elementRegistry, selection) {

          // given
          const subprocess = elementRegistry.get('Subprocess_1');

          await act(() => {
            selection.select(subprocess);
          });

          // when
          const completionConditionInput = getCompletionConditionInput(container);
          changeInput(completionConditionInput, 'newValue');

          // then
          expect(getCompletionConditionValue(subprocess)).to.equal('newValue');
        })
      );


      it('should update - creating new FormalExpression',
        inject(async function(elementRegistry, selection) {

          // given
          const subprocess = elementRegistry.get('Subprocess_2');

          await act(() => {
            selection.select(subprocess);
          });

          // when
          const completionConditionInput = getCompletionConditionInput(container);
          changeInput(completionConditionInput, 'newValue');

          // then
          expect(getCompletionConditionValue(subprocess)).to.equal('newValue');
        })
      );


      it('should update - set property to undefined',
        inject(async function(elementRegistry, selection) {

          // given
          const subprocess = elementRegistry.get('Subprocess_1');

          await act(() => {
            selection.select(subprocess);
          });

          // when
          const completionConditionInput = getCompletionConditionInput(container);
          changeInput(completionConditionInput, '');

          // then
          expect(getCompletionCondition(subprocess)).to.be.undefined;
        })
      );


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const subprocess = elementRegistry.get('Subprocess_1');
          const originalValue = getCompletionConditionValue(subprocess);

          await act(() => {
            selection.select(subprocess);
          });
          const completionConditionInput = getCompletionConditionInput(container);
          changeInput(completionConditionInput, 'newValue');
          expect(getCompletionConditionValue(subprocess)).not.to.equal(originalValue);

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(getCompletionConditionValue(subprocess)).to.equal(originalValue);
        })
      );
    });

    describe('#cancelRemainingInstances', function() {

      it('should be checked when not explicitely configured on the process', inject(async function(elementRegistry, selection) {

        // given
        const subprocess = elementRegistry.get('Subprocess_2');
        expect(getCancelRemainingInstancesValue(subprocess)).to.be.true;

        // when
        await act(() => {
          selection.select(subprocess);
        });

        // then
        const cancelRemainingInstancesCheckbox = getCancelRemainingInstancesCheckbox(container);
        expect(cancelRemainingInstancesCheckbox).to.exist;
        expect(cancelRemainingInstancesCheckbox.checked).be.true;
      }));


      it('should be unchecked when set to false on the process', inject(async function(
          elementRegistry, selection
      ) {

        // given
        const subprocess = elementRegistry.get('Subprocess_1');
        expect(getCancelRemainingInstancesValue(subprocess)).to.be.false;

        // when
        await act(() => {
          selection.select(subprocess);
        });

        // then
        const cancelRemainingInstancesCheckbox = getCancelRemainingInstancesCheckbox(container);
        expect(cancelRemainingInstancesCheckbox).to.exist;
        expect(cancelRemainingInstancesCheckbox.checked).be.false;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const subprocess = elementRegistry.get('Subprocess_1');

        // when
        await act(() => {
          selection.select(subprocess);
        });

        const cancelRemainingInstancesCheckbox = getCancelRemainingInstancesCheckbox(container);
        clickInput(cancelRemainingInstancesCheckbox);

        // then
        expect(getCancelRemainingInstancesValue(subprocess)).to.be.true;
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const subprocess = elementRegistry.get('Subprocess_1');
          const originalValue = getCancelRemainingInstancesValue(subprocess);

          await act(() => {
            selection.select(subprocess);
          });

          const cancelRemainingInstancesCheckbox = getCancelRemainingInstancesCheckbox(container);
          clickInput(cancelRemainingInstancesCheckbox);
          expect(getCancelRemainingInstancesValue(subprocess)).not.to.equal(originalValue);

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(getCancelRemainingInstancesValue(subprocess)).to.equal(originalValue);
        })
      );
    });
  });
});

// DOM helpers ////////////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getCompletionConditionInput(container) {
  return domQuery('[name=completionCondition]', container);
}

function getCancelRemainingInstancesCheckbox(container) {
  return domQuery('[name=cancelRemainingInstances]', container);
}

// model helpers ////////////////////////////

/**
 * getCompletionCondition - get the completion condition of of the ad-hoc subprocess.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the completion condition
 */
function getCompletionCondition(element) {
  return getBusinessObject(element).get('completionCondition');
}

/**
 * getCompletionConditionValue - get the completion condition value of of the ad-hoc subprocess.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the completion condition value
 */
function getCompletionConditionValue(element) {
  const completionCondition = getCompletionCondition(element);
  return completionCondition && completionCondition.get('body');
}

/**
 * getCancelRemainingInstancesValue - get the cancel remaining instances value of the ad-hoc subprocess.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} the cancel remaining instances value
 */
function getCancelRemainingInstancesValue(element) {
  return getBusinessObject(element).get('cancelRemainingInstances');
}