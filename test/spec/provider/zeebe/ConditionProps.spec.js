import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './ConditionProps.bpmn';
import { setEditorValue } from '../../../TestHelper';


describe('provider/zeebe - ConditionProps', function() {

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


  describe('bpmn:SequenceFlow#conditionExpression', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'Flow2', 'Flow3', 'Flow4' ];

      elements.forEach(async ele => {
        const sequenceFlow = elementRegistry.get(ele);

        // when
        await act(() => {
          selection.select(sequenceFlow);
        });

        const conditionExpressionInput = domQuery('input[name=conditionExpression]', container);

        // then
        expect(conditionExpressionInput).to.exist;
      });
    }));


    it('should not display', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('Flow1');

      // when
      await act(() => {
        selection.select(sequenceFlow);
      });

      const conditionExpressionInput = domQuery('input[name=conditionExpression]', container);

      // then
      expect(conditionExpressionInput).not.to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('Flow2');

      await act(() => {
        selection.select(sequenceFlow);
      });

      const input = domQuery('[data-entry-id="conditionExpression"] [role="textbox"]', container);

      // when
      await setEditorValue(input, 'myExpression');

      const conditionExpressionVal = getConditionExpression(sequenceFlow);

      // then
      expect(conditionExpressionVal).to.exist;
      expect(conditionExpressionVal).to.equal('=myExpression');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const sequenceFlow = elementRegistry.get('Flow3'),
              originalValue = getConditionExpression(sequenceFlow);

        await act(() => {
          selection.select(sequenceFlow);
        });

        const conditionExpressionInput = domQuery('[data-entry-id="conditionExpression"] [role="textbox"]', container);

        await setEditorValue(conditionExpressionInput, 'myExpression');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect('=' + conditionExpressionInput.textContent).to.eql(originalValue);
      })
    );


    it('should remove default',
      inject(async function(elementRegistry, selection) {

        // given
        const sequenceFlow = elementRegistry.get('Flow5'),
              defaultSourceTask = elementRegistry.get('DefaultSourceTask'),
              defaultSourceTaskBo = getBusinessObject(defaultSourceTask);

        await act(() => {
          selection.select(sequenceFlow);
        });

        const conditionExpressionInput = domQuery('[data-entry-id="conditionExpression"] [role="textbox"]', container);

        // assume
        expect(defaultSourceTaskBo.get('default')).to.exist;

        // when
        await setEditorValue(conditionExpressionInput, 'myExpression');

        const conditionExpressionVal = getConditionExpression(sequenceFlow);

        // then
        expect(conditionExpressionVal).to.exist;
        expect(conditionExpressionVal).to.equal('=myExpression');

        expect(defaultSourceTaskBo.get('default')).not.to.exist;
      })
    );


    it('should remove condition expression',
      inject(async function(elementRegistry, selection) {

        // given
        const sequenceFlow = elementRegistry.get('Flow3'),
              sequenceFlowBo = getBusinessObject(sequenceFlow);

        await act(() => {
          selection.select(sequenceFlow);
        });

        const conditionExpressionInput = domQuery('[data-entry-id="conditionExpression"] [role="textbox"]', container);

        // assume
        expect(sequenceFlowBo.get('conditionExpression')).to.exist;

        // when
        await setEditorValue(conditionExpressionInput, '');

        // then
        expect(sequenceFlowBo.get('conditionExpression')).not.to.exist;
      })
    );

  });

});


// helper //////////////////

/**
 * getConditionExpression - get the body value of a condition expression for a given element
 *
 * @param  {ModdleElement} element
 *
 * @return {string|undefined}
 */
function getConditionExpression(element) {
  const businessObject = getBusinessObject(element);

  const conditionExpression = businessObject.conditionExpression;

  if (conditionExpression) {
    return conditionExpression.get('body');
  }
}
