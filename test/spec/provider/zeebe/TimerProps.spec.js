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

import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './TimerProps.bpmn';


describe('provider/zeebe - TimerProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
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
    debounceInput: false
  }));


  describe('provider/zeebe - TimerProps', function() {

    describe('Type entry', function() {

      describe('display', function() {

        it('should display', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('StartEvent_Empty'),
            elementRegistry.get('IntermediateCatchEvent_Empty'),
            elementRegistry.get('BoundaryEvent_Empty'),
            elementRegistry.get('NonInterruptingBoundaryEvent_Empty'),
            elementRegistry.get('EventSubProcess_StartEvent_Empty'),
            elementRegistry.get('EventSubProcess_NonInterruptingStartEvent_Empty')
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


        it('should NOT display', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('StartEvent_Blank'),
            elementRegistry.get('IntermediateCatchEvent_Blank'),
            elementRegistry.get('BoundaryEvent_Blank'),
            elementRegistry.get('EndEvent_Blank')
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


      describe('behavior', function() {

        it('should set <do>', inject(async function(elementRegistry, selection) {

          // given
          const startEvent = elementRegistry.get('StartEvent_Date');

          await act(() => {
            selection.select(startEvent);
          });

          // assume
          const timerEventDefinition = getTimerEventDefinition(startEvent);

          expect(timerEventDefinition.get('timeCycle')).not.to.exist;
          expect(timerEventDefinition.get('timeDuration')).not.to.exist;

          expect(timerEventDefinition.get('timeDate')).to.exist;
          expect(timerEventDefinition.get('timeDate').get('body')).to.equal('2019-10-01T12:00:00Z');

          // when
          const select = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          changeInput(select, 'timeCycle');

          // then
          expect(timerEventDefinition.get('timeDate')).not.to.exist;
          expect(timerEventDefinition.get('timeDuration')).not.to.exist;

          expect(timerEventDefinition.get('timeCycle')).to.exist;
        }));


        it('should set <undo>', inject(async function(elementRegistry, selection, commandStack) {

          // given
          const startEvent = elementRegistry.get('StartEvent_Date');

          await act(() => {
            selection.select(startEvent);
          });

          const select = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          changeInput(select, 'timeCycle');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          const timerEventDefinition = getTimerEventDefinition(startEvent);

          expect(timerEventDefinition.get('timeCycle')).not.to.exist;
          expect(timerEventDefinition.get('timeDuration')).not.to.exist;

          expect(timerEventDefinition.get('timeDate')).to.exist;
          expect(timerEventDefinition.get('timeDate').get('body')).to.equal('2019-10-01T12:00:00Z');
        }));


        it('should not set (no change)', inject(async function(elementRegistry, selection, eventBus) {

          // given
          const startEvent = elementRegistry.get('StartEvent_Date');

          await act(() => {
            selection.select(startEvent);
          });

          const eventBusSpy = sinon.spy();

          eventBus.on('propertiesPanel.updated', eventBusSpy);

          // when
          const select = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          changeInput(select, 'timeDate');

          // then
          expect(eventBusSpy).to.not.have.been.called;
        }));


        it('should unset', inject(async function(elementRegistry, selection, eventBus) {

          // given
          const startEvent = elementRegistry.get('StartEvent_Date');

          await act(() => {
            selection.select(startEvent);
          });

          const eventBusSpy = sinon.spy();

          eventBus.on('propertiesPanel.updated', eventBusSpy);

          // when
          const select = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          changeInput(select, '');

          // then
          const timerEventDefinition = getTimerEventDefinition(startEvent);

          expect(timerEventDefinition.get('timeCycle')).not.to.exist;
          expect(timerEventDefinition.get('timeDuration')).not.to.exist;
          expect(timerEventDefinition.get('timeDate')).not.to.exist;

          expect(Object.keys(timerEventDefinition.$attrs)).to.be.empty;
        }));

      });

    });


    describe('Value entry', function() {

      describe('display', function() {

        it('should display if type set', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('StartEvent_Cycle'),
            elementRegistry.get('EventSubProcess_NonInterruptingStartEvent_Cycle'),
            elementRegistry.get('StartEvent_CycleCron'),
            elementRegistry.get('EventSubProcess_NonInterruptingStartEvent_CycleCron'),
            elementRegistry.get('StartEvent_Date'),
            elementRegistry.get('IntermediateCatchEvent_Date'),
            elementRegistry.get('BoundaryEvent_Date'),
            elementRegistry.get('NonInterruptingBoundaryEvent_Date'),
            elementRegistry.get('EventSubProcess_StartEvent_Date'),
            elementRegistry.get('EventSubProcess_NonInterruptingStartEvent_Date'),
            elementRegistry.get('IntermediateCatchEvent_Duration'),
            elementRegistry.get('BoundaryEvent_Duration'),
            elementRegistry.get('NonInterruptingBoundaryEvent_Duration'),
            elementRegistry.get('EventSubProcess_StartEvent_Duration'),
            elementRegistry.get('EventSubProcess_NonInterruptingStartEvent_Duration')
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


        it('should not display if no type set', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('StartEvent_Empty'),
            elementRegistry.get('IntermediateCatchEvent_Empty'),
            elementRegistry.get('BoundaryEvent_Empty'),
            elementRegistry.get('NonInterruptingBoundaryEvent_Empty'),
            elementRegistry.get('EventSubProcess_StartEvent_Empty'),
            elementRegistry.get('EventSubProcess_NonInterruptingStartEvent_Empty')
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


      describe('behavior', function() {

        describe('cycle', function() {

          it('should set <do>', inject(async function(elementRegistry, selection) {

            // given
            const startEvent = elementRegistry.get('StartEvent_Cycle');

            await act(() => {
              selection.select(startEvent);
            });

            // assume
            const timerEventDefinition = getTimerEventDefinition(startEvent);

            expect(timerEventDefinition.get('timeCycle')).to.exist;
            expect(timerEventDefinition.get('timeCycle').get('body')).to.equal('R/P1D');

            // when
            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'foo');

            // then
            expect(timerEventDefinition.get('timeCycle')).to.exist;
            expect(timerEventDefinition.get('timeCycle').get('body')).to.equal('foo');
          }));


          it('should set <undo>', inject(async function(elementRegistry, selection, commandStack) {

            // given
            const startEvent = elementRegistry.get('StartEvent_Cycle');

            await act(() => {
              selection.select(startEvent);
            });

            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'foo');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const timerEventDefinition = getTimerEventDefinition(startEvent);

            expect(timerEventDefinition.get('timeCycle')).to.exist;
            expect(timerEventDefinition.get('timeCycle').get('body')).to.equal('R/P1D');
          }));

        });


        describe('date', function() {

          it('should set <do>', inject(async function(elementRegistry, selection) {

            // given
            const startEvent = elementRegistry.get('StartEvent_Date');

            await act(() => {
              selection.select(startEvent);
            });

            // assume
            const timerEventDefinition = getTimerEventDefinition(startEvent);

            expect(timerEventDefinition.get('timeDate')).to.exist;
            expect(timerEventDefinition.get('timeDate').get('body')).to.equal('2019-10-01T12:00:00Z');

            // when
            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'foo');

            // then
            expect(timerEventDefinition.get('timeDate')).to.exist;
            expect(timerEventDefinition.get('timeDate').get('body')).to.equal('foo');
          }));


          it('should set <undo>', inject(async function(elementRegistry, selection, commandStack) {

            // given
            const startEvent = elementRegistry.get('StartEvent_Date');

            await act(() => {
              selection.select(startEvent);
            });

            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'foo');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const timerEventDefinition = getTimerEventDefinition(startEvent);

            expect(timerEventDefinition.get('timeDate')).to.exist;
            expect(timerEventDefinition.get('timeDate').get('body')).to.equal('2019-10-01T12:00:00Z');
          }));

        });


        describe('duration', function() {

          it('should set <do>', inject(async function(elementRegistry, selection) {

            // given
            const intermediateCatchEvent = elementRegistry.get('IntermediateCatchEvent_Duration');

            await act(() => {
              selection.select(intermediateCatchEvent);
            });

            // assume
            const timerEventDefinition = getTimerEventDefinition(intermediateCatchEvent);

            expect(timerEventDefinition.get('timeDuration')).to.exist;
            expect(timerEventDefinition.get('timeDuration').get('body')).to.equal('P14D');

            // when
            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'foo');

            // then
            expect(timerEventDefinition.get('timeDuration')).to.exist;
            expect(timerEventDefinition.get('timeDuration').get('body')).to.equal('foo');
          }));


          it('should set <undo>', inject(async function(elementRegistry, selection, commandStack) {

            // given
            const intermediateCatchEvent = elementRegistry.get('IntermediateCatchEvent_Duration');

            await act(() => {
              selection.select(intermediateCatchEvent);
            });

            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'foo');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const timerEventDefinition = getTimerEventDefinition(intermediateCatchEvent);

            expect(timerEventDefinition.get('timeDuration')).to.exist;
            expect(timerEventDefinition.get('timeDuration').get('body')).to.equal('P14D');
          }));

        });

      });

    });

  });

});
