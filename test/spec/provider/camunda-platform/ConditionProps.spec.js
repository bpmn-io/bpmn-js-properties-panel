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

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtension from 'camunda-bpmn-moddle/resources/camunda';

import diagramXML from './ConditionProps.bpmn';


describe('provider/camunda-platform - ConditionProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
    CamundaPlatformPropertiesProvider
  ];

  const moddleExtensions = {
    camunda: camundaModdleExtension
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


  describe('conditionType', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('Flow3');

      // when
      await act(() => {
        selection.select(sequenceFlow);
      });

      const conditionExpressionInput = domQuery('select[name=conditionType]', container);

      // then
      expect(conditionExpressionInput).to.exist;
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('Flow1');

      // when
      await act(() => {
        selection.select(sequenceFlow);
      });

      const conditionExpressionInput = domQuery('select[name=conditionType]', container);

      // then
      expect(conditionExpressionInput).not.to.exist;
    }));


    it('should create condition expression',
      inject(async function(elementRegistry, selection) {

        // given
        const sequenceFlow = elementRegistry.get('Flow2'),
              businessObject = getBusinessObject(sequenceFlow);

        await act(() => {
          selection.select(sequenceFlow);
        });

        const conditionTypeInput = domQuery('select[name=conditionType]', container);

        // assume
        expect(businessObject.get('conditionExpression')).not.to.exist;

        // when
        changeInput(conditionTypeInput, 'expression');

        // then
        expect(businessObject.get('conditionExpression')).to.exist;
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

        const conditionTypeInput = domQuery('select[name=conditionType]', container);

        // assume
        expect(defaultSourceTaskBo.get('default')).to.exist;

        // when
        changeInput(conditionTypeInput, 'expression');

        // then
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

        const conditionExpressionInput = domQuery('select[name=conditionType]', container);

        // assume
        expect(sequenceFlowBo.get('conditionExpression')).to.exist;

        // when
        changeInput(conditionExpressionInput, '');

        // then
        expect(sequenceFlowBo.get('conditionExpression')).not.to.exist;
      })
    );
  });


  describe('bpmn:SequenceFlow#conditionExpression', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('Flow3');

      // when
      await act(() => {
        selection.select(sequenceFlow);
      });

      const conditionExpressionInput = domQuery('input[name=conditionExpression]', container);

      // then
      expect(conditionExpressionInput).to.exist;
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'Flow1', 'Flow2' ];

      elements.forEach(async ele => {
        const sequenceFlow = elementRegistry.get(ele);

        // when
        await act(() => {
          selection.select(sequenceFlow);
        });

        const conditionExpressionInput = domQuery('input[name=conditionExpression]', container);

        // then
        expect(conditionExpressionInput).not.to.exist;
      });
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('Flow3');

      await act(() => {
        selection.select(sequenceFlow);
      });

      const conditionExpressionInput = domQuery('input[name=conditionExpression]', container);

      // when
      changeInput(conditionExpressionInput, 'myExpression');

      const conditionExpressionVal = getConditionExpressionBody(sequenceFlow);

      // then
      expect(conditionExpressionVal).to.exist;
      expect(conditionExpressionVal).to.equal('myExpression');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const sequenceFlow = elementRegistry.get('Flow3'),
              originalValue = getConditionExpressionBody(sequenceFlow);

        await act(() => {
          selection.select(sequenceFlow);
        });

        const conditionExpressionInput = domQuery('input[name=conditionExpression]', container);
        changeInput(conditionExpressionInput, 'myExpression');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(conditionExpressionInput.value).to.eql(originalValue);
      })
    );
  });


  describe('conditionExpression#language', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('InlineScriptFlow');

      // when
      await act(() => {
        selection.select(sequenceFlow);
      });

      const conditionExpressionInput = domQuery('input[name=conditionScriptLanguage]', container);

      // then
      expect(conditionExpressionInput).to.exist;
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('ConditionExpressionFlow');

      // when
      await act(() => {
        selection.select(sequenceFlow);
      });

      const conditionExpressionInput = domQuery('input[name=conditionScriptLanguage]', container);

      // then
      expect(conditionExpressionInput).not.to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('InlineScriptFlow');

      await act(() => {
        selection.select(sequenceFlow);
      });

      // when
      const input = domQuery('input[name=conditionScriptLanguage]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getConditionExpression(sequenceFlow).get('language')
      ).to.eql('newValue');
    }));


    it('should NOT set to undefined', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('InlineScriptFlow');

      await act(() => {
        selection.select(sequenceFlow);
      });

      // when
      const input = domQuery('input[name=conditionScriptLanguage]', container);
      changeInput(input, '');

      // then
      expect(getConditionExpression(sequenceFlow).get('language')).to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const sequenceFlow = elementRegistry.get('InlineScriptFlow');

        const originalValue = getConditionExpression(sequenceFlow).get('language');

        await act(() => {
          selection.select(sequenceFlow);
        });
        const input = domQuery('input[name=conditionScriptLanguage]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );
  });


  describe('conditionExpression#scriptType', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('InlineScriptFlow');

      await act(() => {
        selection.select(sequenceFlow);
      });

      // when
      const select = domQuery('select[name=conditionScriptType]', container);

      // then
      expect(select.value).to.eql('script');
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('ConditionExpressionFlow');

      await act(() => {
        selection.select(task);
      });

      // when
      const select = domQuery('select[name=conditionScriptType]', container);

      // then
      expect(select).to.not.exist;
    }));


    it('should update - resource', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('InlineScriptFlow');

      await act(() => {
        selection.select(sequenceFlow);
      });

      // assume
      expect(getConditionExpression(sequenceFlow).get('camunda:resource')).to.be.undefined;

      // when
      const select = domQuery('select[name=conditionScriptType]', container);
      changeInput(select, 'resource');

      // then
      expect(getConditionExpression(sequenceFlow).get('camunda:resource')).to.exist;
    }));


    it('should update - script', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('ExternalResourceFlow');

      await act(() => {
        selection.select(sequenceFlow);
      });

      // assume
      expect(getConditionExpression(sequenceFlow).get('body')).to.be.undefined;

      // when
      const select = domQuery('select[name=conditionScriptType]', container);
      changeInput(select, 'script');

      // then
      expect(getConditionExpression(sequenceFlow).get('body')).to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const sequenceFlow = elementRegistry.get('InlineScriptFlow');

        const originalValue = getConditionExpressionBody(sequenceFlow);

        await act(() => {
          selection.select(sequenceFlow);
        });
        const select = domQuery('select[name=conditionScriptType]', container);
        changeInput(select, 'resource');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(getConditionExpressionBody(sequenceFlow)).to.eql(originalValue);
      })
    );

  });


  describe('conditionExpression#body', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('InlineScriptFlow');

      // when
      await act(() => {
        selection.select(sequenceFlow);
      });

      const conditionExpressionInput = domQuery('textarea[name=conditionScriptValue]', container);

      // then
      expect(conditionExpressionInput).to.exist;
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('ConditionExpressionFlow');

      // when
      await act(() => {
        selection.select(sequenceFlow);
      });

      const conditionExpressionInput = domQuery('textarea[name=conditionScriptValue]', container);

      // then
      expect(conditionExpressionInput).not.to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('InlineScriptFlow');

      await act(() => {
        selection.select(sequenceFlow);
      });

      // when
      const input = domQuery('textarea[name=conditionScriptValue]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getConditionExpressionBody(sequenceFlow)
      ).to.eql('newValue');
    }));


    it('should NOT set to undefined', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('InlineScriptFlow');

      await act(() => {
        selection.select(sequenceFlow);
      });

      // when
      const input = domQuery('textarea[name=conditionScriptValue]', container);
      changeInput(input, '');

      // then
      expect(getConditionExpressionBody(sequenceFlow)).to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const sequenceFlow = elementRegistry.get('InlineScriptFlow');

        const originalValue = getConditionExpressionBody(sequenceFlow);

        await act(() => {
          selection.select(sequenceFlow);
        });
        const input = domQuery('textarea[name=conditionScriptValue]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );
  });


  describe('conditionExpression#camunda:resource', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('ExternalResourceFlow');

      // when
      await act(() => {
        selection.select(sequenceFlow);
      });

      const conditionExpressionInput = domQuery('input[name=conditionScriptResource]', container);

      // then
      expect(conditionExpressionInput).to.exist;
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'ConditionExpressionFlow', 'InlineScriptFlow' ];

      elements.forEach(async ele => {
        const sequenceFlow = elementRegistry.get(ele);

        // when
        await act(() => {
          selection.select(sequenceFlow);
        });

        const conditionExpressionInput = domQuery('input[name=conditionScriptResource]', container);

        // then
        expect(conditionExpressionInput).not.to.exist;
      });
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('ExternalResourceFlow');

      await act(() => {
        selection.select(sequenceFlow);
      });

      // when
      const input = domQuery('input[name=conditionScriptResource]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getConditionExpression(sequenceFlow).get('camunda:resource')
      ).to.eql('newValue');
    }));


    it('should NOT set to undefined', inject(async function(elementRegistry, selection) {

      // given
      const sequenceFlow = elementRegistry.get('ExternalResourceFlow');

      await act(() => {
        selection.select(sequenceFlow);
      });

      // when
      const input = domQuery('input[name=conditionScriptResource]', container);
      changeInput(input, '');

      // then
      expect(getConditionExpression(sequenceFlow).get('camunda:resource')).to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const sequenceFlow = elementRegistry.get('ExternalResourceFlow');

        const originalValue = getConditionExpression(sequenceFlow).get('camunda:resource');

        await act(() => {
          selection.select(sequenceFlow);
        });
        const input = domQuery('input[name=conditionScriptResource]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );
  });
});


// helper //////////////////

function getConditionExpression(element) {
  const businessObject = getBusinessObject(element);

  return businessObject.get('conditionExpression');
}

/**
 * getConditionExpressionBody - get the body value of a condition expression for a given element
 *
 * @param  {ModdleElement} element
 *
 * @return {string|undefined}
 */
function getConditionExpressionBody(element) {
  const conditionExpression = getConditionExpression(element);

  if (conditionExpression) {
    return conditionExpression.get('body');
  }
}
