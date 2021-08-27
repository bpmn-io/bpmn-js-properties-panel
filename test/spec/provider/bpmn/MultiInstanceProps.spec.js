import {
  act
} from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';

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

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import diagramXML from './MultiInstanceProps.bpmn';

describe('provider/bpmn - MultiInstanceProps', function() {

  const testModules = [
    CoreModule,
    ModelingModule,
    SelectionModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    debounceInput: false
  }));


  describe('bpmn:MultiInstanceLoopCharacteristics#loopCardinality', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const loopCardinalityInput = domQuery('input[name=loopCardinality]', container);

      // then
      expect(loopCardinalityInput).to.exist;
      expect(loopCardinalityInput.value).to.equal(getLoopCardinalityValue(element));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const loopCardinalityInput = domQuery('input[name=loopCardinality]', container);

      // then
      expect(loopCardinalityInput).to.not.exist;
    }));


    it('should update - reusing existing FormalExpression',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('SubProcess_1');

        await act(() => {
          selection.select(element);
        });

        // when
        const loopCardinalityInput = domQuery('input[name=loopCardinality]', container);
        changeInput(loopCardinalityInput, 'newValue');

        // then
        expect(getLoopCardinalityValue(element)).to.equal('newValue');
      }));


    it('should update - creating new FormalExpression',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Task_2');

        await act(() => {
          selection.select(element);
        });

        // when
        const loopCardinalityInput = domQuery('input[name=loopCardinality]', container);
        changeInput(loopCardinalityInput, 'newValue');

        // then
        expect(getLoopCardinalityValue(element)).to.equal('newValue');
      }));


    it('should update - set property to undefined',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(element);
        });

        // when
        const loopCardinalityInput = domQuery('input[name=loopCardinality]', container);
        changeInput(loopCardinalityInput, '');

        // then
        expect(getLoopCardinality(element)).to.be.undefined;
      }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('ServiceTask_1');
        const originalValue = getLoopCardinalityValue(element);

        await act(() => {
          selection.select(element);
        });
        const loopCardinalityInput = domQuery('input[name=loopCardinality]', container);
        changeInput(loopCardinalityInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(loopCardinalityInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:MultiInstanceLoopCharacteristics#completionCondition', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const completionConditionInput = domQuery('input[name=completionCondition]', container);

      // then
      expect(completionConditionInput).to.exist;
      expect(completionConditionInput.value).to.equal(getCompletionConditionValue(element));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const completionConditionInput = domQuery('input[name=completionCondition]', container);

      // then
      expect(completionConditionInput).to.not.exist;
    }));


    it('should update - reusing existing FormalExpression',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('SubProcess_1');

        await act(() => {
          selection.select(element);
        });

        // when
        const completionConditionInput = domQuery('input[name=completionCondition]', container);
        changeInput(completionConditionInput, 'newValue');

        // then
        expect(getCompletionConditionValue(element)).to.equal('newValue');
      }));


    it('should update - creating new FormalExpression',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Task_2');

        await act(() => {
          selection.select(element);
        });

        // when
        const completionConditionInput = domQuery('input[name=completionCondition]', container);
        changeInput(completionConditionInput, 'newValue');

        // then
        expect(getCompletionConditionValue(element)).to.equal('newValue');
      }));


    it('should update - set property to undefined',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(element);
        });

        // when
        const completionConditionInput = domQuery('input[name=completionCondition]', container);
        changeInput(completionConditionInput, '');

        // then
        expect(getCompletionCondition(element)).to.be.undefined;
      }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('ServiceTask_1');
        const originalValue = getCompletionConditionValue(element);

        await act(() => {
          selection.select(element);
        });
        const completionConditionInput = domQuery('input[name=completionCondition]', container);
        changeInput(completionConditionInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(completionConditionInput.value).to.eql(originalValue);
      })
    );

  });

});


// helper ////////////////////////////

/**
 * getProperty - get a property value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 *
 * @return {any} the property value
 */
function getProperty(element, propertyName) {
  const loopCharacteristics = getLoopCharacteristics(element);
  return loopCharacteristics && loopCharacteristics.get(propertyName);
}

/**
 * getLoopCharacteristics - get loopCharacteristics of a given element.
 *
 * @param {djs.model.Base} element
 * @return {ModdleElement<bpmn:MultiInstanceLoopCharacteristics> | undefined}
 */
function getLoopCharacteristics(element) {
  const bo = getBusinessObject(element);
  return bo.loopCharacteristics;
}

/**
 * getLoopCardinality - get the loop cardinality of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the loop cardinality
 */
function getLoopCardinality(element) {
  return getProperty(element, 'loopCardinality');
}

/**
 * getLoopCardinalityValue - get the loop cardinality value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the loop cardinality value
 */
function getLoopCardinalityValue(element) {
  const loopCardinality = getLoopCardinality(element);
  return getBody(loopCardinality);
}

/**
 * getBody - get the body of a given expression.
 *
 * @param {ModdleElement<bpmn:FormalExpression>} expression
 * @return {string} the body (value) of the expression
 */
function getBody(expression) {
  return expression && expression.get('body');
}

/**
 * getCompletionCondition - get the completion condition of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the completion condition
 */
function getCompletionCondition(element) {
  return getProperty(element, 'completionCondition');
}

/**
 * getCompletionConditionValue - get the completion condition value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the completion condition value
 */
function getCompletionConditionValue(element) {
  const completionCondition = getCompletionCondition(element);
  return getBody(completionCondition);
}
