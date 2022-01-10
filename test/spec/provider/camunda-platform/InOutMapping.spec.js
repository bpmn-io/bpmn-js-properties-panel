import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  clickInput,
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

import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import {
  getSignalEventDefinition
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './InOutMapping.bpmn';


describe('provider/camunda-platform - InOutMapping', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider
  ];

  const moddleExtensions = {
    camunda: camundaModdleExtensions
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


  describe('bpmn:SignalEventDefinition', function() {

    describe('#in.type', function() {

      it('should NOT display for empty in mappings',
        inject(async function(elementRegistry, selection) {

          // given
          const signalEvent = elementRegistry.get('SignalEvent_1');

          await act(() => {
            selection.select(signalEvent);
          });

          // when
          const group = getGroup(container, 'CamundaPlatform__InMapping');
          const select = domQuery('select[name=SignalEvent-inMapping-0-type]', group);

          // then
          expect(select).to.not.exist;
        })
      );


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const select = domQuery('select[name=SignalEvent_1-inMapping-0-type]', group);

        // then
        expect(select.value).to.eql(getInOutType(getInMapping(signalEvent, 0)));
      }));


      it('should update - sourceExpression', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const select = domQuery('select[name=SignalEvent_1-inMapping-0-type]', group);
        changeInput(select, 'sourceExpression');

        // then
        const mapping = getInMapping(signalEvent, 0);
        expect(mapping.get('sourceExpression')).to.exist;
        expect(mapping.get('source')).to.not.exist;
      }));


      it('should update - source', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const select = domQuery('select[name=SignalEvent_1-inMapping-1-type]', group);
        changeInput(select, 'source');

        // then
        const mapping = getInMapping(signalEvent, 1);
        expect(mapping.get('source')).to.exist;
        expect(mapping.get('sourceExpression')).to.not.exist;
      }));


      it('should keep target', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');
        const oldValue = getInMapping(signalEvent, 0).get('target');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const select = domQuery('select[name=SignalEvent_1-inMapping-0-type]', group);
        changeInput(select, 'sourceExpression');

        // then
        expect(getInMapping(signalEvent, 0).get('target')).to.eql(oldValue);
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const signalEvent = elementRegistry.get('SignalEvent_1');
          const originalValue = getInOutType(getInMapping(signalEvent, 0));

          await act(() => {
            selection.select(signalEvent);
          });
          const group = getGroup(container, 'CamundaPlatform__InMapping');
          const select = domQuery('select[name=SignalEvent_1-inMapping-0-type]', group);
          changeInput(select, 'sourceExpression');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(select.value).to.eql(originalValue);
        })
      );

    });


    describe('#in.source', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_1-inMapping-1-source]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_1-inMapping-0-source]', group);

        // then
        expect(input.value).to.eql(getInMapping(signalEvent, 0).get('source'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_1-inMapping-0-source]', group);
        changeInput(input, 'newValue');

        // then
        expect(getInMapping(signalEvent, 0).get('source')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const signalEvent = elementRegistry.get('SignalEvent_1');
          const originalValue = getInMapping(signalEvent, 0).get('source');

          await act(() => {
            selection.select(signalEvent);
          });
          const group = getGroup(container, 'CamundaPlatform__InMapping');
          const input = domQuery('input[name=SignalEvent_1-inMapping-0-source]', group);
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


    describe('#in.sourceExpression', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_1-inMapping-0-sourceExpression]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_1-inMapping-1-sourceExpression]', group);

        // then
        expect(input.value).to.eql(getInMapping(signalEvent, 1).get('sourceExpression'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_1-inMapping-1-sourceExpression]', group);
        changeInput(input, 'newValue');

        // then
        expect(getInMapping(signalEvent, 1).get('sourceExpression')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const signalEvent = elementRegistry.get('SignalEvent_1');
          const originalValue = getInMapping(signalEvent, 1).get('sourceExpression');

          await act(() => {
            selection.select(signalEvent);
          });
          const group = getGroup(container, 'CamundaPlatform__InMapping');
          const input = domQuery('input[name=SignalEvent_1-inMapping-1-sourceExpression]', group);
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


    describe('#in.target', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_empty');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_empty-inMapping-0-target]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_1-inMapping-0-target]', group);

        // then
        expect(input.value).to.eql(getInMapping(signalEvent, 0).get('target'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_1-inMapping-0-target]', group);
        changeInput(input, 'newValue');

        // then
        expect(getInMapping(signalEvent, 0).get('target')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const signalEvent = elementRegistry.get('SignalEvent_1');
          const originalValue = getInMapping(signalEvent, 0).get('target');

          await act(() => {
            selection.select(signalEvent);
          });
          const group = getGroup(container, 'CamundaPlatform__InMapping');
          const input = domQuery('input[name=SignalEvent_1-inMapping-0-target]', group);
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


    describe('#in.local', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_empty');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_empty-inMapping-0-local]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_1-inMapping-0-local]', group);

        // then
        expect(input.checked).to.eql(getInMapping(signalEvent, 0).get('local'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get('SignalEvent_1');

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__InMapping');
        const input = domQuery('input[name=SignalEvent_1-inMapping-0-local]', group);
        clickInput(input);

        // then
        expect(getInMapping(signalEvent, 0).get('local')).to.be.true;
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const signalEvent = elementRegistry.get('SignalEvent_1');
          const originalValue = getInMapping(signalEvent, 0).get('local');

          await act(() => {
            selection.select(signalEvent);
          });
          const group = getGroup(container, 'CamundaPlatform__InMapping');
          const input = domQuery('input[name=SignalEvent_1-inMapping-0-local]', group);
          clickInput(input);

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(input.checked).to.eql(originalValue);
        })
      );

    });

  });


  describe('bpmn:CallActivity', function() {

    describe('#out.type', function() {

      it('should NOT display for empty out mappings',
        inject(async function(elementRegistry, selection) {

          // given
          const callActivity = elementRegistry.get('CallActivity_empty');

          await act(() => {
            selection.select(callActivity);
          });

          // when
          const group = getGroup(container, 'CamundaPlatform__OutMapping');
          const select = domQuery('select[name=CallActivity_empty-outMapping-0-type]', group);

          // then
          expect(select).to.not.exist;
        })
      );


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const select = domQuery('select[name=CallActivity_1-outMapping-0-type]', group);

        // then
        expect(select.value).to.eql(getInOutType(getOutMapping(callActivity, 0)));
      }));


      it('should update - sourceExpression', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const select = domQuery('select[name=CallActivity_1-outMapping-0-type]', group);
        changeInput(select, 'sourceExpression');

        // then
        const mapping = getOutMapping(callActivity, 0);
        expect(mapping.get('sourceExpression')).to.exist;
        expect(mapping.get('source')).to.not.exist;
      }));


      it('should update - source', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const select = domQuery('select[name=CallActivity_1-outMapping-1-type]', group);
        changeInput(select, 'source');

        // then
        const mapping = getOutMapping(callActivity, 1);
        expect(mapping.get('source')).to.exist;
        expect(mapping.get('sourceExpression')).to.not.exist;
      }));


      it('should keep target', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');
        const oldValue = getOutMapping(callActivity, 0).get('target');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const select = domQuery('select[name=CallActivity_1-outMapping-0-type]', group);
        changeInput(select, 'sourceExpression');

        // then
        expect(getOutMapping(callActivity, 0).get('target')).to.eql(oldValue);
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const callActivity = elementRegistry.get('CallActivity_1');
          const originalValue = getInOutType(getOutMapping(callActivity, 0));

          await act(() => {
            selection.select(callActivity);
          });
          const group = getGroup(container, 'CamundaPlatform__OutMapping');
          const select = domQuery('select[name=CallActivity_1-outMapping-0-type]', group);
          changeInput(select, 'sourceExpression');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(select.value).to.eql(originalValue);
        })
      );

    });


    describe('#out.source', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_1-outMapping-1-source]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_1-outMapping-0-source]', group);

        // then
        expect(input.value).to.eql(getOutMapping(callActivity, 0).get('source'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_1-outMapping-0-source]', group);
        changeInput(input, 'newValue');

        // then
        expect(getOutMapping(callActivity, 0).get('source')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const callActivity = elementRegistry.get('CallActivity_1');
          const originalValue = getOutMapping(callActivity, 0).get('source');

          await act(() => {
            selection.select(callActivity);
          });
          const group = getGroup(container, 'CamundaPlatform__OutMapping');
          const input = domQuery('input[name=CallActivity_1-outMapping-0-source]', group);
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


    describe('#out.sourceExpression', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_1-outMapping-0-sourceExpression]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_1-outMapping-1-sourceExpression]', group);

        // then
        expect(input.value).to.eql(getOutMapping(callActivity, 1).get('sourceExpression'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_1-outMapping-1-sourceExpression]', group);
        changeInput(input, 'newValue');

        // then
        expect(getOutMapping(callActivity, 1).get('sourceExpression')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const callActivity = elementRegistry.get('CallActivity_1');
          const originalValue = getOutMapping(callActivity, 1).get('sourceExpression');

          await act(() => {
            selection.select(callActivity);
          });
          const group = getGroup(container, 'CamundaPlatform__OutMapping');
          const input = domQuery('input[name=CallActivity_1-outMapping-1-sourceExpression]', group);
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


    describe('#out.target', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_empty');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_empty-outMapping-0-target]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_1-outMapping-0-target]', group);

        // then
        expect(input.value).to.eql(getOutMapping(callActivity, 0).get('target'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_1-outMapping-0-target]', group);
        changeInput(input, 'newValue');

        // then
        expect(getOutMapping(callActivity, 0).get('target')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const callActivity = elementRegistry.get('CallActivity_1');
          const originalValue = getOutMapping(callActivity, 0).get('target');

          await act(() => {
            selection.select(callActivity);
          });
          const group = getGroup(container, 'CamundaPlatform__OutMapping');
          const input = domQuery('input[name=CallActivity_1-outMapping-0-target]', group);
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


    describe('#out.local', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_empty');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_empty-outMapping-0-local]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_1-outMapping-0-local]', group);

        // then
        expect(input.checked).to.eql(getOutMapping(callActivity, 0).get('local'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__OutMapping');
        const input = domQuery('input[name=CallActivity_1-outMapping-0-local]', group);
        clickInput(input);

        // then
        expect(getOutMapping(callActivity, 0).get('local')).to.be.true;
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const callActivity = elementRegistry.get('CallActivity_1');
          const originalValue = getOutMapping(callActivity, 0).get('local');

          await act(() => {
            selection.select(callActivity);
          });
          const group = getGroup(container, 'CamundaPlatform__OutMapping');
          const input = domQuery('input[name=CallActivity_1-outMapping-0-local]', group);
          clickInput(input);

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(input.checked).to.eql(originalValue);
        })
      );

    });

  });

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getOutMappings(element) {
  const businessObject = getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'camunda:Out');
}

function getOutMapping(element, idx) {
  return (getOutMappings(element) || [])[idx];
}

function getInMappings(element) {
  const businessObject = getBusinessObject(element);
  const signalEventDefinition = getSignalEventDefinition(businessObject);
  return getExtensionElementsList(signalEventDefinition || businessObject, 'camunda:In');
}

function getInMapping(element, idx) {
  return (getInMappings(element) || [])[idx];
}

function getInOutType(mapping) {
  let inOutType = '';

  if (typeof mapping.source !== 'undefined') {
    inOutType = 'source';
  }
  else if (typeof mapping.sourceExpression !== 'undefined') {
    inOutType = 'sourceExpression';
  }

  return inOutType;
}
