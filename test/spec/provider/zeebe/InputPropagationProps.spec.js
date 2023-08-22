import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  clickInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getCalledElement,
  getPropagateAllParentVariables
} from 'src/provider/zeebe/utils/CalledElementUtil.js';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil.js';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './InputPropagationProps.bpmn';


describe('provider/zeebe - InputPropagationProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
    ZeebePropertiesProvider,
    BehaviorsModule
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


  describe('bpmn:CallActivity#calledElement.propagateAllParentVariables', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');

      // when
      await act(() => {
        selection.select(callActivity);
      });

      const propagateAllParentVariablesToggle = domQuery('[data-entry-id=propagateAllParentVariables]', container);

      // then
      expect(propagateAllParentVariablesToggle).to.exist;
    }));


    it('should not display', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('Task_1');

      // when
      await act(() => {
        selection.select(callActivity);
      });

      const propagateAllParentVariablesToggle = domQuery('[data-entry-id=propagateAllParentVariables]', container);

      // then
      expect(propagateAllParentVariablesToggle).to.not.exist;
    }));


    describe('toggle state', function() {

      it('should show value if set to false', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // then
        const input = domQuery('#bio-properties-panel-propagateAllParentVariables', container);

        expect(input.checked).to.be.false;
      }));


      it('should show value if set to true', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_2');

        await act(() => {
          selection.select(callActivity);
        });

        // then
        const input = domQuery('#bio-properties-panel-propagateAllParentVariables', container);

        expect(input.checked).to.be.true;
      }));


      it('should show default value true if not set', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_3');

        await act(() => {
          selection.select(callActivity);
        });

        // then
        const input = domQuery('#bio-properties-panel-propagateAllParentVariables', container);

        expect(input.checked).to.be.true;
      }));

    });


    it('should update to true', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');

      await act(() => {
        selection.select(callActivity);
      });

      // assume
      const originalValue = getPropagateAllParentVariables(callActivity);
      expect(originalValue).to.be.false;

      // when
      const slider = domQuery('[data-entry-id=propagateAllParentVariables] .bio-properties-panel-toggle-switch__slider', container);

      // when
      clickInput(slider);

      // then
      const input = domQuery('#bio-properties-panel-propagateAllParentVariables', container);
      expect(input.checked).to.be.true;

      const newValue = getPropagateAllParentVariables(callActivity);
      expect(newValue).to.be.true;
    }));


    it('should update to false', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_2');

      await act(() => {
        selection.select(callActivity);
      });

      // assume
      const originalValue = getPropagateAllParentVariables(callActivity);
      expect(originalValue).to.be.true;

      // when
      const slider = domQuery('[data-entry-id=propagateAllParentVariables] .bio-properties-panel-toggle-switch__slider', container);
      clickInput(slider);

      // then
      const input = domQuery('#bio-properties-panel-propagateAllParentVariables', container);
      expect(input.checked).to.be.false;

      const newValue = getPropagateAllParentVariables(callActivity);
      expect(newValue).to.be.false;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1'),
              originalValue = getPropagateAllParentVariables(callActivity);

        await act(() => {
          selection.select(callActivity);
        });

        const slider = domQuery('[data-entry-id=propagateAllParentVariables] .bio-properties-panel-toggle-switch__slider', container);
        clickInput(slider);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        const input = domQuery('#bio-properties-panel-propagateAllParentVariables', container);
        expect(input.checked).to.equal(originalValue);
      })
    );


    it('should re-use calledElement', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_4');

      await act(() => {
        selection.select(callActivity);
      });

      // when
      const slider = domQuery('[data-entry-id=propagateAllParentVariables] .bio-properties-panel-toggle-switch__slider', container);
      clickInput(slider);

      // then
      const calledElement = getCalledElement(callActivity),
            processId = calledElement.get('processId');

      expect(processId).to.equal('someProcessId');
    }));


    it('should re-use extensionElements', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_5'),
            businessObject = getBusinessObject(callActivity);

      await act(() => {
        selection.select(callActivity);
      });

      // assume
      expect(getExtensionElementsList(businessObject, 'zeebe:IoMapping')).to.have.length(1);

      // when
      const slider = domQuery('[data-entry-id=propagateAllParentVariables] .bio-properties-panel-toggle-switch__slider', container);
      clickInput(slider);

      // then
      const ioMapping = getExtensionElementsList(businessObject, 'zeebe:IoMapping');

      expect(ioMapping).to.have.length(1);
    }));


    it('should create called element extension element', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_3');

      // assume
      expect(getCalledElement(callActivity)).not.to.exist;

      await act(() => {
        selection.select(callActivity);
      });

      // when
      const slider = domQuery('[data-entry-id=propagateAllParentVariables] .bio-properties-panel-toggle-switch__slider', container);
      clickInput(slider);

      // then
      expect(getCalledElement(callActivity)).to.exist;
    }));

  });

});
