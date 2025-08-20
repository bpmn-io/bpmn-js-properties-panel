import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import { bootstrapPropertiesPanel, clickInput, inject } from 'test/TestHelper';

import { query as domQuery, queryAll } from 'min-dom';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import BpmnPropertiesPanel from 'src/render';
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';
import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './AdHocCompletionProps.bpmn';
import { setEditorValue } from '../../../TestHelper';

describe('provider/zeebe - AdHocCompletion', function() {

  const testModules = [
    CoreModule,
    ModelingModule,
    SelectionModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
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
    propertiesPanel: {
      tooltip: TooltipProvider
    },
    debounceInput: false
  }));


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


    it('completion group should be added after active elements group', inject(async function(
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
      const expectedGroupOrder = [
        'group-activeElements',
        'group-adHocCompletion'
      ];

      expect(getGroupIds(container).filter(id => expectedGroupOrder.includes(id))).to.eql(expectedGroupOrder);
    }));


    it('inputs should be in the expected order despite overriding BPMN attribute', inject(async function(
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
      expect(getInputNames(group)).to.eql([
        'completionCondition',
        'cancelRemainingInstances'
      ]);
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

      it('should show the expected value when a condition is configured', inject(async function(
          elementRegistry, selection
      ) {

        // given
        const subprocess = elementRegistry.get('Subprocess_1');

        // when
        await act(() => {
          selection.select(subprocess);
        });

        // then
        const completionConditionInput = getCompletionConditionInput(container);
        expect(completionConditionInput).to.exist;
        expect('=' + getEditorValue(completionConditionInput)).to.equal(getCompletionConditionValue(subprocess));
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
        expect(getEditorValue(completionConditionInput)).to.be.empty;
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
          await setEditorValue(completionConditionInput, 'newValue');

          // then
          expect(getCompletionConditionValue(subprocess)).to.equal('=newValue');
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
          await setEditorValue(completionConditionInput, 'newValue');

          // then
          expect(getCompletionConditionValue(subprocess)).to.equal('=newValue');
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
          await setEditorValue(completionConditionInput, '');

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
          await setEditorValue(completionConditionInput, 'newValue');
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

      it('should not be checked when not explicitely configured on the process', inject(async function(
          elementRegistry, selection
      ) {

        // given
        const subprocess = elementRegistry.get('Subprocess_2');
        expect(getCancelRemainingInstancesValue(subprocess)).not.to.exist;

        // when
        await act(() => {
          selection.select(subprocess);
        });

        // then
        const cancelRemainingInstancesCheckbox = getCancelRemainingInstancesCheckbox(container);
        expect(cancelRemainingInstancesCheckbox).to.exist;
        expect(cancelRemainingInstancesCheckbox.checked).to.be.false;
      }));


      it('should be unchecked when set to false on the process', inject(async function(elementRegistry, selection) {

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

function getEditorValue(input) {
  return input.textContent;
}

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getInputNames(container) {
  const inputs = queryAll('[name]', container);
  const inputNames = Array.from(inputs).map(input => input.getAttribute('name'));

  return inputNames;
}

function getGroupIds(container) {
  const groups = queryAll('[data-group-id]', container);
  const groupIds = Array.from(groups).map(group => group.getAttribute('data-group-id'));

  return groupIds;
}

function getCompletionConditionInput(container) {
  return domQuery('[name=completionCondition] [role="textbox"]', container);
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