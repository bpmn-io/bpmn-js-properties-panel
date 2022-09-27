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
import CamundaPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda';

import diagramXML from './TimerProps.bpmn';


describe('provider/camunda-platform - TimerProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
    BpmnPropertiesProvider,
    CamundaPropertiesProvider
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


  describe('provider/camunda - TimerEventDefinition', function() {

    describe('input entries', function() {

      describe('select', function() {

        it('should display', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('TimerStartEvent_1'),
            elementRegistry.get('TimerCatchEvent_1'),
            elementRegistry.get('TimerBoundaryEvent_1'),
            elementRegistry.get('TimerBoundaryEvent_2')
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
          const element = elementRegistry.get('StartEvent_1');

          // when
          await act(() => {
            selection.select(element);
          });

          const definitionTypeSelect = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          // then
          expect(definitionTypeSelect).not.to.exist;
        }));


        it('should NOT attribute timer definition when type is not set', inject(async function(elementRegistry, selection) {

          // given
          const element = elementRegistry.get('TimerStartEvent_1');

          await act(() => {
            selection.select(element);
          });

          // assume
          const orginalTimer = getTimerEventDefinition(element);

          // when
          const select = domQuery('select[name*=timerEventDefinitionType]', container);
          changeInput(select, 'timeout');
          changeInput(select, '');

          expect(orginalTimer.$attrs).to.be.empty;
        }));

      });


      describe('textField', function() {

        it('should display', inject(async function(elementRegistry, selection) {

          // given
          const elements = [
            elementRegistry.get('TimerCatchEvent_1'),
            elementRegistry.get('TimerBoundaryEvent_1'),
            elementRegistry.get('TimerBoundaryEvent_2')
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


        it('should NOT display if not a timerEventDefinition', inject(async function(elementRegistry, selection) {

          // given
          const element = elementRegistry.get('StartEvent_1');

          // when
          await act(() => {
            selection.select(element);
          });

          const definitionTypeTextField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

          // then
          expect(definitionTypeTextField).not.to.exist;
        }));


        it('should NOT display if no type was selected', inject(async function(elementRegistry, selection) {

          // given
          const element = elementRegistry.get('TimerStartEvent_1');

          // when
          await act(() => {
            selection.select(element);
          });

          const definitionTypeTextField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

          // then
          expect(definitionTypeTextField).not.to.exist;
        }));

      });

    });


    describe('update', function() {

      describe('select', function() {

        it('should execute', inject(async function(elementRegistry, selection) {

          // given
          const element = elementRegistry.get('TimerCatchEvent_1');

          await act(() => {
            selection.select(element);
          });

          // assume
          const orginalTimer = getTimerEventDefinition(element);
          expect(orginalTimer.timeCycle).not.to.exist;
          expect(orginalTimer.timeDate).to.exist;
          expect(orginalTimer.timeDate.body).to.equal('myDate');

          // when
          const select = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          changeInput(select, 'timeCycle');

          // then
          const newTimer = getTimerEventDefinition(element);
          expect(newTimer.timeDate).not.to.exist;
          expect(newTimer.timeCycle).to.exist;
          expect(newTimer.timeCycle.body).to.be.undefined;
        }));


        it('should execute on external change', inject(async function(elementRegistry, selection, commandStack) {

          // given
          const element = elementRegistry.get('TimerCatchEvent_1');

          await act(() => {
            selection.select(element);
          });

          const select = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          changeInput(select, 'timeCycle');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          const orginalTimer = getTimerEventDefinition(element);
          expect(orginalTimer.timeCycle).not.to.exist;
          expect(orginalTimer.timeDate).to.exist;
          expect(orginalTimer.timeDate.body).to.equal('myDate');
        }));


        it('should not execute given no value change', inject(async function(elementRegistry, selection, eventBus) {

          // given
          const element = elementRegistry.get('TimerCatchEvent_1');

          await act(() => {
            selection.select(element);
          });

          const eventBusSpy = sinon.spy();

          eventBus.on('propertiesPanel.updated', eventBusSpy);

          // when
          const select = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          changeInput(select, 'timeDate');

          // then
          expect(eventBusSpy).to.not.have.been.called;
        }));


        it('should unset correctly', inject(async function(elementRegistry, selection, eventBus) {

          // given
          const element = elementRegistry.get('TimerCatchEvent_1');

          await act(() => {
            selection.select(element);
          });

          const eventBusSpy = sinon.spy();

          eventBus.on('propertiesPanel.updated', eventBusSpy);

          // when
          const select = domQuery('#bio-properties-panel-timerEventDefinitionType', container);

          changeInput(select, 'timeCycle');
          changeInput(select, '');

          // then
          const timerEventDefiniton = getTimerEventDefinition(element);

          expect(Object.keys(timerEventDefiniton.$attrs)).to.be.empty;
        }));
      });


      describe('textField', function() {

        describe('date', function() {

          it('should execute', inject(async function(elementRegistry, selection) {

            // given
            const element = elementRegistry.get('TimerCatchEvent_1');

            await act(() => {
              selection.select(element);
            });

            // assume
            const orginalTimer = getTimerEventDefinition(element);
            expect(orginalTimer.timeDate).to.exist;
            expect(orginalTimer.timeDate.body).to.equal('myDate');

            // when
            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // then
            const newTimer = getTimerEventDefinition(element);
            expect(newTimer.timeDate).to.exist;
            expect(newTimer.timeDate.body).to.equal('fooBar');
          }));


          it('should execute on external change', inject(async function(elementRegistry, selection, commandStack) {

            // given
            const element = elementRegistry.get('TimerCatchEvent_1');

            await act(() => {
              selection.select(element);
            });

            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const orginalTimer = getTimerEventDefinition(element);
            expect(orginalTimer.timeDate).to.exist;
            expect(orginalTimer.timeDate.body).to.equal('myDate');
          }));

        });


        describe('cycle', function() {

          it('should execute', inject(async function(elementRegistry, selection) {

            // given
            const element = elementRegistry.get('TimerBoundaryEvent_1');

            await act(() => {
              selection.select(element);
            });

            // assume
            const orginalTimer = getTimerEventDefinition(element);
            expect(orginalTimer.timeCycle).to.exist;
            expect(orginalTimer.timeCycle.body).to.equal('myCycle');

            // when
            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // then
            const newTimer = getTimerEventDefinition(element);
            expect(newTimer.timeCycle).to.exist;
            expect(newTimer.timeCycle.body).to.equal('fooBar');
          }));


          it('should execute on external change', inject(async function(elementRegistry, selection, commandStack) {

            // given
            const element = elementRegistry.get('TimerBoundaryEvent_1');

            await act(() => {
              selection.select(element);
            });

            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const orginalTimer = getTimerEventDefinition(element);
            expect(orginalTimer.timeCycle).to.exist;
            expect(orginalTimer.timeCycle.body).to.equal('myCycle');
          }));

        });


        describe('duration', function() {

          it('should execute', inject(async function(elementRegistry, selection) {

            // given
            const element = elementRegistry.get('TimerBoundaryEvent_2');

            await act(() => {
              selection.select(element);
            });

            // assume
            const orginalTimer = getTimerEventDefinition(element);
            expect(orginalTimer.timeDuration).to.exist;
            expect(orginalTimer.timeDuration.body).to.equal('myDuration');

            // when
            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // then
            const newTimer = getTimerEventDefinition(element);
            expect(newTimer.timeDuration).to.exist;
            expect(newTimer.timeDuration.body).to.equal('fooBar');
          }));


          it('should execute on external change', inject(async function(elementRegistry, selection, commandStack) {

            // given
            const element = elementRegistry.get('TimerBoundaryEvent_2');

            await act(() => {
              selection.select(element);
            });

            const textField = domQuery('#bio-properties-panel-timerEventDefinitionValue', container);

            changeInput(textField, 'fooBar');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const orginalTimer = getTimerEventDefinition(element);
            expect(orginalTimer.timeDuration).to.exist;
            expect(orginalTimer.timeDuration.body).to.equal('myDuration');
          }));

        });

      });

    });

  });

});
