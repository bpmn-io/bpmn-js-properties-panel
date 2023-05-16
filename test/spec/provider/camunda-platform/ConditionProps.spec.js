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
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { getEventDefinition } from 'src/provider/bpmn/utils/EventDefinitionUtil';

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
      const elements = [
        'Flow3',
        'ConditionalIntermediateEvent',
        'ConditionalStartEvent',
        'Flow_5',
        'Flow_6'
      ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionExpressionInput = domQuery('select[name=conditionType]', container);

        // then
        expect(conditionExpressionInput).to.exist;
      }
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'Flow1', 'NoneEvent', 'Flow_4' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionExpressionInput = domQuery('select[name=conditionType]', container);

        // then
        expect(conditionExpressionInput).not.to.exist;
      }
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


    it('should create condition',
      inject(async function(elementRegistry, selection) {

        // given
        const conditionalEvent = elementRegistry.get('ConditionalStartEvent');

        await act(() => {
          selection.select(conditionalEvent);
        });

        const conditionTypeInput = domQuery('select[name=conditionType]', container);

        // assume
        expect(getConditionExpression(conditionalEvent)).not.to.exist;

        // when
        changeInput(conditionTypeInput, 'expression');

        // then
        expect(getConditionExpression(conditionalEvent)).to.exist;
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


    it('should remove condition',
      inject(async function(elementRegistry, selection) {

        // given
        const conditionalEvent = elementRegistry.get('ConditionExpressionEvent');

        await act(() => {
          selection.select(conditionalEvent);
        });

        const conditionExpressionInput = domQuery('select[name=conditionType]', container);

        // assume
        expect(getConditionExpression(conditionalEvent)).to.exist;

        // when
        changeInput(conditionExpressionInput, '');

        // then
        expect(getConditionExpression(conditionalEvent)).not.to.exist;
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

      for (const ele of elements) {
        const sequenceFlow = elementRegistry.get(ele);

        // when
        await act(() => {
          selection.select(sequenceFlow);
        });

        const conditionExpressionInput = domQuery('input[name=conditionExpression]', container);

        // then
        expect(conditionExpressionInput).not.to.exist;
      }
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


  describe('bpmn:ConditionalEventDefinition#condition', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const conditionalEvent = elementRegistry.get('ConditionExpressionEvent');

      // when
      await act(() => {
        selection.select(conditionalEvent);
      });

      const conditionExpressionInput = domQuery('input[name=conditionExpression]', container);

      // then
      expect(conditionExpressionInput).to.exist;
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'NoneEvent', 'ConditionalStartEvent' ];

      for (const ele of elements) {
        const element = elementRegistry.get(ele);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionExpressionInput = domQuery('input[name=conditionExpression]', container);

        // then
        expect(conditionExpressionInput).not.to.exist;
      }
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const conditionalEvent = elementRegistry.get('ConditionExpressionEvent');

      await act(() => {
        selection.select(conditionalEvent);
      });

      const conditionExpressionInput = domQuery('input[name=conditionExpression]', container);

      // when
      changeInput(conditionExpressionInput, 'myExpression');

      const conditionExpressionVal = getConditionExpressionBody(conditionalEvent);

      // then
      expect(conditionExpressionVal).to.exist;
      expect(conditionExpressionVal).to.equal('myExpression');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const conditionalEvent = elementRegistry.get('ConditionExpressionEvent'),
              originalValue = getConditionExpressionBody(conditionalEvent);

        await act(() => {
          selection.select(conditionalEvent);
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


  describe('bpmn:ConditionalEventDefinition#variableName', function() {

    it('should display (intermediate event)', inject(async function(elementRegistry, selection) {

      // given
      const conditionalEvent = elementRegistry.get('ConditionVariableEvent');

      // when
      await act(() => {
        selection.select(conditionalEvent);
      });

      const conditionVariableNameInput = domQuery('input[name=conditionVariableName]', container);

      // then
      expect(conditionVariableNameInput).to.exist;
    }));


    it('should display (start event)', inject(async function(elementRegistry, selection) {

      // given
      const conditionalEvent = elementRegistry.get('ConditionalStartEvent');

      // when
      await act(() => {
        selection.select(conditionalEvent);
      });

      const conditionVariableNameInput = domQuery('input[name=conditionVariableName]', container);

      // then
      expect(conditionVariableNameInput).to.exist;
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'NoneEvent' ];

      for (const ele of elements) {
        const element = elementRegistry.get(ele);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionVariableNameInput = domQuery('input[name=conditionVariableName]', container);

        // then
        expect(conditionVariableNameInput).not.to.exist;
      }
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const conditionalEvent = elementRegistry.get('ConditionVariableEvent');

      await act(() => {
        selection.select(conditionalEvent);
      });

      const conditionVariableNameInput = domQuery('input[name=conditionVariableName]', container);

      // when
      changeInput(conditionVariableNameInput, 'myVariable');

      const conditionVariableNameVal = getConditionVariableName(conditionalEvent);

      // then
      expect(conditionVariableNameVal).to.exist;
      expect(conditionVariableNameVal).to.equal('myVariable');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const conditionalEvent = elementRegistry.get('ConditionVariableEvent'),
              originalValue = getConditionVariableName(conditionalEvent);

        await act(() => {
          selection.select(conditionalEvent);
        });

        const conditionVariableNameInput = domQuery('input[name=conditionVariableName]', container);
        changeInput(conditionVariableNameInput, 'myVariable');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(conditionVariableNameInput.value).to.eql(originalValue);
      })
    );
  });


  describe('bpmn:ConditionalEventDefinition#variableEvents', function() {

    it('should display (intermediate event)', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'ConditionVariableEvent', 'ConditionalStartEventSubprocess' ];

      for (const ele of elements) {
        const element = elementRegistry.get(ele);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionVariableEventsInput = domQuery('input[name=conditionVariableEvents]', container);

        // then
        expect(conditionVariableEventsInput).to.exist;
      }
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'NoneEvent', 'ConditionalStartEvent', 'ConditionalStartEvent' ];

      for (const ele of elements) {
        const element = elementRegistry.get(ele);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionVariableEventsInput = domQuery('input[name=conditionVariableEvents]', container);

        // then
        expect(conditionVariableEventsInput).not.to.exist;
      }
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const conditionalEvent = elementRegistry.get('ConditionVariableEvent');

      await act(() => {
        selection.select(conditionalEvent);
      });

      const conditionVariableEventsInput = domQuery('input[name=conditionVariableEvents]', container);

      // when
      changeInput(conditionVariableEventsInput, 'myEvent');

      const conditionVariableEvVal = getConditionVariableEvents(conditionalEvent);

      // then
      expect(conditionVariableEvVal).to.exist;
      expect(conditionVariableEvVal).to.equal('myEvent');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const conditionalEvent = elementRegistry.get('ConditionVariableEvent'),
              originalValue = getConditionVariableEvents(conditionalEvent);

        await act(() => {
          selection.select(conditionalEvent);
        });

        const conditionVariableEventsInput = domQuery('input[name=conditionVariableEvents]', container);
        changeInput(conditionVariableEventsInput, 'myEvent');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(conditionVariableEventsInput.value).to.eql(originalValue);
      })
    );
  });


  describe('conditionExpression#language', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionExpressionInput = domQuery('input[name=conditionScriptLanguage]', container);

        // then
        expect(conditionExpressionInput).to.exist;
      }
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'ConditionExpressionFlow', 'ConditionExpressionEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionExpressionInput = domQuery('input[name=conditionScriptLanguage]', container);

        // then
        expect(conditionExpressionInput).not.to.exist;
      }
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name=conditionScriptLanguage]', container);
        changeInput(input, 'newValue');

        // then
        expect(
          getConditionExpression(element).get('language')
        ).to.eql('newValue');
      }
    }));


    it('should NOT set to undefined', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name=conditionScriptLanguage]', container);
        changeInput(input, '');

        // then
        expect(getConditionExpression(element).get('language')).to.exist;
      }
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

        for (const id of elements) {
          const element = elementRegistry.get(id);

          const originalValue = getConditionExpression(element).get('language');

          await act(() => {
            selection.select(element);
          });
          const input = domQuery('input[name=conditionScriptLanguage]', container);
          changeInput(input, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(input.value).to.eql(originalValue);
        }
      })
    );
  });


  describe('conditionExpression#scriptType', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        await act(() => {
          selection.select(element);
        });

        // when
        const select = domQuery('select[name=conditionScriptType]', container);

        // then
        expect(select.value).to.eql('script');
      }
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'ConditionExpressionFlow', 'ConditionExpressionEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        await act(() => {
          selection.select(element);
        });

        // when
        const select = domQuery('select[name=conditionScriptType]', container);

        // then
        expect(select).to.not.exist;
      }
    }));


    it('should update - resource', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        await act(() => {
          selection.select(element);
        });

        // assume
        expect(getConditionExpression(element).get('camunda:resource')).to.be.undefined;

        // when
        const select = domQuery('select[name=conditionScriptType]', container);
        changeInput(select, 'resource');

        // then
        expect(getConditionExpression(element).get('camunda:resource')).to.exist;
      }
    }));


    it('should update - script', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'ExternalResourceFlow', 'ExternalResourceEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        await act(() => {
          selection.select(element);
        });

        // assume
        expect(getConditionExpression(element).get('body')).to.be.undefined;

        // when
        const select = domQuery('select[name=conditionScriptType]', container);
        changeInput(select, 'script');

        // then
        expect(getConditionExpression(element).get('body')).to.exist;
      }
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

        for (const id of elements) {
          const element = elementRegistry.get(id);

          const originalValue = getConditionExpressionBody(element);

          await act(() => {
            selection.select(element);
          });
          const select = domQuery('select[name=conditionScriptType]', container);
          changeInput(select, 'resource');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(getConditionExpressionBody(element)).to.eql(originalValue);
        }
      })
    );

  });


  describe('conditionExpression#body', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionExpressionInput = domQuery('textarea[name=conditionScriptValue]', container);

        // then
        expect(conditionExpressionInput).to.exist;
      }
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'ConditionExpressionFlow', 'ConditionExpressionEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionExpressionInput = domQuery('textarea[name=conditionScriptValue]', container);

        // then
        expect(conditionExpressionInput).not.to.exist;
      }
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('textarea[name=conditionScriptValue]', container);
        changeInput(input, 'newValue');

        // then
        expect(
          getConditionExpressionBody(element)
        ).to.eql('newValue');
      }
    }));


    it('should NOT set to undefined', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('textarea[name=conditionScriptValue]', container);
        changeInput(input, '');

        // then
        expect(getConditionExpressionBody(element)).to.exist;
      }
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const elements = [ 'InlineScriptFlow', 'InlineScriptEvent' ];

        for (const id of elements) {
          const element = elementRegistry.get(id);

          const originalValue = getConditionExpressionBody(element);

          await act(() => {
            selection.select(element);
          });
          const input = domQuery('textarea[name=conditionScriptValue]', container);
          changeInput(input, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(input.value).to.eql(originalValue);
        }
      })
    );
  });


  describe('conditionExpression#camunda:resource', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'ExternalResourceFlow', 'ExternalResourceEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        // when
        await act(() => {
          selection.select(element);
        });

        const conditionExpressionInput = domQuery('input[name=conditionScriptResource]', container);

        // then
        expect(conditionExpressionInput).to.exist;
      }
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        'ConditionExpressionFlow', 'InlineScriptFlow',
        'InlineScriptEvent', 'ConditionExpressionEvent'
      ];

      for (const ele of elements) {
        const sequenceFlow = elementRegistry.get(ele);

        // when
        await act(() => {
          selection.select(sequenceFlow);
        });

        const conditionExpressionInput = domQuery('input[name=conditionScriptResource]', container);

        // then
        expect(conditionExpressionInput).not.to.exist;
      }
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'ExternalResourceFlow', 'ExternalResourceEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name=conditionScriptResource]', container);
        changeInput(input, 'newValue');

        // then
        expect(
          getConditionExpression(element).get('camunda:resource')
        ).to.eql('newValue');
      }
    }));


    it('should NOT set to undefined', inject(async function(elementRegistry, selection) {

      // given
      const elements = [ 'ExternalResourceFlow', 'ExternalResourceEvent' ];

      for (const id of elements) {
        const element = elementRegistry.get(id);

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name=conditionScriptResource]', container);
        changeInput(input, '');

        // then
        expect(getConditionExpression(element).get('camunda:resource')).to.exist;
      }
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const elements = [ 'ExternalResourceFlow', 'ExternalResourceEvent' ];

        for (const id of elements) {
          const element = elementRegistry.get(id);

          const originalValue = getConditionExpression(element).get('camunda:resource');

          await act(() => {
            selection.select(element);
          });
          const input = domQuery('input[name=conditionScriptResource]', container);
          changeInput(input, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(input.value).to.eql(originalValue);
        }
      })
    );
  });
});


// helper //////////////////

function getConditionExpression(element) {
  const businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return businessObject.get('conditionExpression');
  } else if (getConditionalEventDefinition(businessObject)) {
    return getConditionalEventDefinition(businessObject).get('condition');
  }
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

function getConditionalEventDefinition(element) {
  if (!is(element, 'bpmn:Event')) {
    return false;
  }

  return getEventDefinition(element, 'bpmn:ConditionalEventDefinition');
}

function getConditionVariableName(element) {
  const eventDefinition = getConditionalEventDefinition(element);

  return eventDefinition.get('variableName');
}

function getConditionVariableEvents(element) {
  const eventDefinition = getConditionalEventDefinition(element);

  return eventDefinition.get('variableEvents');
}