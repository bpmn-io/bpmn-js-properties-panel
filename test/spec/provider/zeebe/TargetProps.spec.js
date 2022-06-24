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

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil.js';

import {
  getCalledElement,
  getProcessId
} from 'src/provider/zeebe/utils/CalledElementUtil.js';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './TargetProps.bpmn';


describe('provider/zeebe - TargetProps', function() {

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


  describe('bpmn:CallActivity#calledElement.processId', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');

      // assume
      const processId = getProcessId(callActivity);

      expect(processId).to.equal('someProcessId');

      // when
      await act(() => {
        selection.select(callActivity);
      });

      const targetProcessIdInput = domQuery('input[name=targetProcessId]', container);

      // then
      expect(targetProcessIdInput).to.exist;

      expect(targetProcessIdInput.value).to.equal('someProcessId');
    }));


    it('should not display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      await act(() => {
        selection.select(task);
      });

      const targetProcessIdInput = domQuery('input[name=targetProcessId]', container);

      // then
      expect(targetProcessIdInput).not.to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');

      await act(() => {
        selection.select(callActivity);
      });

      const targetProcessIdInput = domQuery('input[name=targetProcessId]', container);

      // when
      changeInput(targetProcessIdInput, 'someOtherProcessId');

      // then
      const processId = getProcessId(callActivity);

      expect(processId).to.equal('someOtherProcessId');
    }));


    it('should re-use calledElement', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');

      await act(() => {
        selection.select(callActivity);
      });

      const targetProcessIdInput = domQuery('input[name=targetProcessId]', container);

      // when
      changeInput(targetProcessIdInput, 'someOtherProcessId');

      // then
      const calledElement = getCalledElement(callActivity),
            propagateAllChildVariables = calledElement.get('propagateAllChildVariables');

      expect(propagateAllChildVariables).to.equal(false);
    }));


    it('should re-use extension elements', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_3'),
            businessObject = getBusinessObject(callActivity);

      await act(() => {
        selection.select(callActivity);
      });

      const targetProcessIdInput = domQuery('input[name=targetProcessId]', container);

      // assume
      expect(getExtensionElementsList(businessObject, 'zeebe:IoMapping')).to.have.length(1);

      // when
      changeInput(targetProcessIdInput, 'someOtherProcessId');

      // then
      const ioMapping = getExtensionElementsList(businessObject, 'zeebe:IoMapping');

      expect(ioMapping).to.have.length(1);
    }));


    it('should create called element extension element', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_2');

      // assume
      expect(getCalledElement(callActivity)).not.to.exist;

      await act(() => {
        selection.select(callActivity);
      });

      const targetProcessIdInput = domQuery('input[name=targetProcessId]', container);

      // when
      changeInput(targetProcessIdInput, 'someOtherProcessId');

      // then
      expect(getCalledElement(callActivity)).to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1'),
              originalValue = getProcessId(callActivity);

        await act(() => {
          selection.select(callActivity);
        });

        const targetProcessIdInput = domQuery('input[name=targetProcessId]', container);
        changeInput(targetProcessIdInput, 'fooBar');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(targetProcessIdInput.value).to.eql(originalValue);
      })
    );

  });

});
