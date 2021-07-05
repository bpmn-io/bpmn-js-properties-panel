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
  getTimerEventDefinition
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './TimerEventDefinitionProps.bpmn';


describe('provider/zeebe - TimerEventDefinitionProps', function() {

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


  describe('provider/zeebe - TimerEventDefinition', function() {

    describe('input entries', function() {

      describe('select', function() {

        it('should display if multiple types are possible', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('timerStartEventCycle'),
            elementRegistry.get('nonInterruptingBoundaryEventCycle'),
            elementRegistry.get('timerStartEventEmpty')
          ];

          for (const element of elements) {

            // when
            await act(() => {
              selection.select(element);
            });

            const definitionTypeSelect = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

            // then
            expect(definitionTypeSelect).to.exist;
          }
        }));


        it('should NOT display if only one type is possible', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('intermediateTimerCatchEventDuration'),
            elementRegistry.get('interruptingBoundaryEventDuration')
          ];

          for (const element of elements) {

            // when
            await act(() => {
              selection.select(element);
            });

            const definitionTypeSelect = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

            // then
            expect(definitionTypeSelect).not.to.exist;
          }
        }));

      });


      describe('generic textField', function() {

        it('should display if only duration is available', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('timerStartEventDate'),
            elementRegistry.get('nonInterruptingBoundaryEventDuration')
          ];

          for (const element of elements) {

            // when
            await act(() => {
              selection.select(element);
            });

            const definitionTypeTextField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            // then
            expect(definitionTypeTextField).to.exist;
          }
        }));


        it('should NOT display if multiple options are available', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('intermediateTimerCatchEventDuration'),
            elementRegistry.get('interruptingBoundaryEventDuration')
          ];

          for (const element of elements) {

            // when
            await act(() => {
              selection.select(element);
            });

            const definitionTypeTextField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            // then
            expect(definitionTypeTextField).not.to.exist;
          }
        }));


        it('should NOT display if no type was selected', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('timerStartEventEmpty')
          ];

          for (const element of elements) {

            // when
            await act(() => {
              selection.select(element);
            });

            const definitionTypeTextField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            // then
            expect(definitionTypeTextField).not.to.exist;
          }
        }));

      });


      describe('specific duration textField', function() {

        it('should display if only duration is available', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('intermediateTimerCatchEventDuration'),
            elementRegistry.get('interruptingBoundaryEventDuration')
          ];

          for (const element of elements) {

            // when
            await act(() => {
              selection.select(element);
            });

            const definitionTypeTextField = domQuery('#bio-properties-panel-timerEventDefinitionDurationValue', container);

            // then
            expect(definitionTypeTextField).to.exist;
          }
        }));


        it('should NOT display if multiple types are available', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('timerStartEventDate'),
            elementRegistry.get('nonInterruptingBoundaryEventDuration')
          ];

          for (const element of elements) {

            // when
            await act(() => {
              selection.select(element);
            });

            const definitionTypeTextField = domQuery('#bio-properties-panel-timerEventDefinitionDurationValue', container);

            // then
            expect(definitionTypeTextField).not.to.exist;
          }
        }));

      });

    });


    describe('update', function() {

      describe('select', function() {

        it('should execute', inject(async function(elementRegistry, selection) {

          // given
          const timerStartEvent = elementRegistry.get('timerStartEventDate');

          await act(() => {
            selection.select(timerStartEvent);
          });

          // assume
          const orginalTimer = getTimerEventDefinition(timerStartEvent);
          expect(orginalTimer.timeCycle).not.to.exist;
          expect(orginalTimer.timeDate).to.exist;
          expect(orginalTimer.timeDate.body).to.equal('myDate');

          // when
          const select = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          changeInput(select, 'timeCycle');

          // then
          const newTimer = getTimerEventDefinition(timerStartEvent);
          expect(newTimer.timeDate).not.to.exist;
          expect(newTimer.timeCycle).to.exist;
          expect(newTimer.timeCycle.body).to.be.undefined;
        }));


        it('should execute on external change', inject(async function(elementRegistry, selection, commandStack) {

          // given
          const timerStartEvent = elementRegistry.get('timerStartEventDate');

          await act(() => {
            selection.select(timerStartEvent);
          });

          const select = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          changeInput(select, 'timeCycle');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          const orginalTimer = getTimerEventDefinition(timerStartEvent);
          expect(orginalTimer.timeCycle).not.to.exist;
          expect(orginalTimer.timeDate).to.exist;
          expect(orginalTimer.timeDate.body).to.equal('myDate');
        }));

      });


      describe('generic textField', function() {

        describe('date', function() {

          it('should execute', inject(async function(elementRegistry, selection) {

            // given
            const timerStartEvent = elementRegistry.get('timerStartEventDate');

            await act(() => {
              selection.select(timerStartEvent);
            });

            // assume
            const orginalTimer = getTimerEventDefinition(timerStartEvent);
            expect(orginalTimer.timeDate).to.exist;
            expect(orginalTimer.timeDate.body).to.equal('myDate');

            // when
            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // then
            const newTimer = getTimerEventDefinition(timerStartEvent);
            expect(newTimer.timeDate).to.exist;
            expect(newTimer.timeDate.body).to.equal('fooBar');
          }));


          it('should execute on external change', inject(async function(elementRegistry, selection, commandStack) {

            // given
            const timerStartEvent = elementRegistry.get('timerStartEventDate');

            await act(() => {
              selection.select(timerStartEvent);
            });

            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const orginalTimer = getTimerEventDefinition(timerStartEvent);
            expect(orginalTimer.timeDate).to.exist;
            expect(orginalTimer.timeDate.body).to.equal('myDate');
          }));

        });


        describe('cycle', function() {

          it('should execute', inject(async function(elementRegistry, selection) {

            // given
            const timerStartEvent = elementRegistry.get('timerStartEventCycle');

            await act(() => {
              selection.select(timerStartEvent);
            });

            // assume
            const orginalTimer = getTimerEventDefinition(timerStartEvent);
            expect(orginalTimer.timeCycle).to.exist;
            expect(orginalTimer.timeCycle.body).to.equal('myCycle');

            // when
            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // then
            const newTimer = getTimerEventDefinition(timerStartEvent);
            expect(newTimer.timeCycle).to.exist;
            expect(newTimer.timeCycle.body).to.equal('fooBar');
          }));


          it('should execute on external change', inject(async function(elementRegistry, selection, commandStack) {

            // given
            const timerStartEvent = elementRegistry.get('timerStartEventCycle');

            await act(() => {
              selection.select(timerStartEvent);
            });

            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const orginalTimer = getTimerEventDefinition(timerStartEvent);
            expect(orginalTimer.timeCycle).to.exist;
            expect(orginalTimer.timeCycle.body).to.equal('myCycle');
          }));

        });


        describe('duration', function() {

          it('should execute', inject(async function(elementRegistry, selection) {

            // given
            const timerStartEvent = elementRegistry.get('nonInterruptingBoundaryEventDuration');

            await act(() => {
              selection.select(timerStartEvent);
            });

            // assume
            const orginalTimer = getTimerEventDefinition(timerStartEvent);
            expect(orginalTimer.timeDuration).to.exist;
            expect(orginalTimer.timeDuration.body).to.equal('myDuration');

            // when
            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // then
            const newTimer = getTimerEventDefinition(timerStartEvent);
            expect(newTimer.timeDuration).to.exist;
            expect(newTimer.timeDuration.body).to.equal('fooBar');
          }));


          it('should execute on external change', inject(async function(elementRegistry, selection, commandStack) {

            // given
            const timerStartEvent = elementRegistry.get('nonInterruptingBoundaryEventDuration');

            await act(() => {
              selection.select(timerStartEvent);
            });

            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const orginalTimer = getTimerEventDefinition(timerStartEvent);
            expect(orginalTimer.timeDuration).to.exist;
            expect(orginalTimer.timeDuration.body).to.equal('myDuration');
          }));

        });

      });


      describe('specific duration textField', function() {

        it('should execute', inject(async function(elementRegistry, selection) {

          // given
          const timerStartEvent = elementRegistry.get('intermediateTimerCatchEventDuration');

          await act(() => {
            selection.select(timerStartEvent);
          });

          // assume
          const orginalTimer = getTimerEventDefinition(timerStartEvent);
          expect(orginalTimer.timeDuration).to.exist;
          expect(orginalTimer.timeDuration.body).to.equal('myDuration');

          // when
          const textField = domQuery('#bio-properties-panel-timerEventDefinitionDurationValue', container);

          changeInput(textField, 'fooBar');

          // then
          const newTimer = getTimerEventDefinition(timerStartEvent);
          expect(newTimer.timeDuration).to.exist;
          expect(newTimer.timeDuration.body).to.equal('fooBar');
        }));


        it('should execute on external change', inject(async function(elementRegistry, selection, commandStack) {

          // given
          const timerStartEvent = elementRegistry.get('intermediateTimerCatchEventDuration');

          await act(() => {
            selection.select(timerStartEvent);
          });

          const textField = domQuery('#bio-properties-panel-timerEventDefinitionDurationValue', container);

          changeInput(textField, 'fooBar');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          const orginalTimer = getTimerEventDefinition(timerStartEvent);
          expect(orginalTimer.timeDuration).to.exist;
          expect(orginalTimer.timeDuration.body).to.equal('myDuration');
        }));


        it('should create new formalExpression', inject(async function(elementRegistry, selection) {

          // given
          const timerStartEvent = elementRegistry.get('intermediateTimerCatchEventDurationEmpty');

          await act(() => {
            selection.select(timerStartEvent);
          });

          // assume
          const orginalTimer = getTimerEventDefinition(timerStartEvent);
          expect(orginalTimer.timeDuration).not.to.exist;

          // when
          const textField = domQuery('#bio-properties-panel-timerEventDefinitionDurationValue', container);

          changeInput(textField, 'fooBar');

          // then
          const newTimer = getTimerEventDefinition(timerStartEvent);
          expect(newTimer.timeDuration).to.exist;
          expect(newTimer.timeDuration.body).to.equal('fooBar');
        }));

      });

    });

  });

});
