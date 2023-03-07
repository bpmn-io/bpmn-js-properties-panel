import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject,
  setEditorValue
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
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

import diagramXML from './ScriptProps.bpmn';

const INITIAL_EXPRESSION = '=today()';


describe('provider/zeebe - ScriptProps', function() {

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


  describe('bpmn:ScriptTask', function() {

    describe('#script.expression', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_1');

        // assume
        const expression = getExpression(scriptTask);

        expect(expression).to.equal(INITIAL_EXPRESSION);

        // when
        await act(() => {
          selection.select(scriptTask);
        });

        const expressionInput = getExpressionInput(container);

        // then
        expect(expressionInput).to.exist;

        expect(`=${expressionInput.textContent}`).to.equal(INITIAL_EXPRESSION);
      }));


      it('should not display', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        // when
        await act(() => {
          selection.select(task);
        });

        const expressionInput = getExpressionInput(container);

        // then
        expect(expressionInput).not.to.exist;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_1');

        await act(() => {
          selection.select(scriptTask);
        });

        const expressionInput = getExpressionInput(container);

        // when
        await setEditorValue(expressionInput, 'foobar');

        // then
        const expression = getExpression(scriptTask);

        expect(expression).to.equal('=foobar');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const scriptTask = elementRegistry.get('ScriptTask_1'),
                originalValue = getExpression(scriptTask);

          await act(() => {
            selection.select(scriptTask);
          });

          const expressionInput = getExpressionInput(container);
          await setEditorValue(expressionInput, 'fooBar');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(`=${expressionInput.textContent}`).to.eql(originalValue);
        })
      );

    });


    describe('#script.resultVariable', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_1');

        // assume
        const expresion = getExpression(scriptTask);

        expect(expresion).to.equal(INITIAL_EXPRESSION);

        // when
        await act(() => {
          selection.select(scriptTask);
        });

        const resultVariableInput = getResultVariableInput(container);

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

        const resultVariableInput = getResultVariableInput(container);

        // then
        expect(resultVariableInput).not.to.exist;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_1');

        await act(() => {
          selection.select(scriptTask);
        });

        const resultVariableInput = getResultVariableInput(container);

        // when
        changeInput(resultVariableInput, 'foobar');

        // then
        const resultVariable = getResultVariable(scriptTask);

        expect(resultVariable).to.equal('foobar');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const scriptTask = elementRegistry.get('ScriptTask_1'),
                originalValue = getResultVariable(scriptTask);

          await act(() => {
            selection.select(scriptTask);
          });

          const resultVariableInput = getResultVariableInput(container);
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


    it('should show elements in the correct order', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      // when
      await act(() => {
        selection.select(scriptTask);
      });

      const entries = domQueryAll('[data-group-id="group-script"] .bio-properties-panel-entry', container);

      // then
      expect(entries[0].getAttribute('data-entry-id')).to.eql('resultVariable');
      expect(entries[1].getAttribute('data-entry-id')).to.eql('scriptExpression');
    }));

  });

});

// helper //////////////

export function getExpression(element) {
  const script = getScript(element);

  return script ? script.get('expression') : '';
}

function getExpressionInput(container) {
  return domQuery('[name=scriptExpression] [contenteditable]', container);
}

export function getResultVariable(element) {
  const script = getScript(element);

  return script ? script.get('resultVariable') : '';
}

function getResultVariableInput(container) {
  return domQuery('input[name=resultVariable]', container);
}

function getScript(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:Script')[0];
}
