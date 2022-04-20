import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
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

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import processDiagramXML from './AsynchronousContinuationsProps.bpmn';


describe('provider/camunda-platform - AsynchronousContinuationsProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule,
    BehaviorsModule
  ];

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };

  let container;


  describe('camunda:AsyncCapable#async', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const asyncBeforeCheckbox = domQuery('input[name=asynchronousContinuationBefore]', container);

      // then
      expect(asyncBeforeCheckbox).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_2');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const asyncBeforeCheckbox = domQuery('input[name=asynchronousContinuationBefore]', container);

      // then
      expect(asyncBeforeCheckbox.checked).to.be.true;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_2');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const asyncBeforeCheckbox = domQuery('input[name=asynchronousContinuationBefore]', container);
      clickInput(asyncBeforeCheckbox);

      // then
      expect(isAsyncBefore(startEvent)).to.be.false;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent_2'),
              originalValue = isAsyncBefore(startEvent);

        await act(() => {
          selection.select(startEvent);
        });

        const asyncBeforeCheckbox = domQuery('input[name=asynchronousContinuationBefore]', container);
        clickInput(asyncBeforeCheckbox);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(asyncBeforeCheckbox.checked).to.eql(originalValue);
      })
    );

  });


  describe('camunda:AsyncCapable#asyncBefore', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const asyncBeforeCheckbox = domQuery('input[name=asynchronousContinuationBefore]', container);

      // then
      expect(asyncBeforeCheckbox).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const asyncBeforeCheckbox = domQuery('input[name=asynchronousContinuationBefore]', container);

      // then
      expect(asyncBeforeCheckbox.checked).to.be.false;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const asyncBeforeCheckbox = domQuery('input[name=asynchronousContinuationBefore]', container);
      clickInput(asyncBeforeCheckbox);

      // then
      expect(isAsyncBefore(startEvent)).to.be.true;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1'),
              originalValue = isAsyncBefore(startEvent);

        await act(() => {
          selection.select(startEvent);
        });

        const asyncBeforeCheckbox = domQuery('input[name=asynchronousContinuationBefore]', container);
        clickInput(asyncBeforeCheckbox);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(asyncBeforeCheckbox.checked).to.eql(originalValue);
      })
    );

  });


  describe('camunda:AsyncCapable#asyncAfter', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const asyncAfterCheckbox = domQuery('input[name=asynchronousContinuationAfter]', container);

      // then
      expect(asyncAfterCheckbox).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const asyncAfterCheckbox = domQuery('input[name=asynchronousContinuationAfter]', container);

      // then
      expect(asyncAfterCheckbox.checked).to.be.false;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const asyncAfterCheckbox = domQuery('input[name=asynchronousContinuationAfter]', container);
      clickInput(asyncAfterCheckbox);

      // then
      expect(isAsyncAfter(startEvent)).to.be.true;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1'),
              originalValue = isAsyncAfter(startEvent);

        await act(() => {
          selection.select(startEvent);
        });

        const asyncAfterCheckbox = domQuery('input[name=asynchronousContinuationAfter]', container);
        clickInput(asyncAfterCheckbox);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(asyncAfterCheckbox.checked).to.eql(originalValue);
      })
    );

  });


  describe('camunda:AsyncCapable#exclusive', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display when not supported', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const exclusiveCheckbox = domQuery('input[name=exclusive]', container);

      // then
      expect(exclusiveCheckbox).to.not.exist;
    }));


    it('should NOT display when not async', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const exclusiveCheckbox = domQuery('input[name=exclusive]', container);

      // then
      expect(exclusiveCheckbox).to.not.exist;
    }));



    it('should display true when undefined', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const exclusiveCheckbox = domQuery('input[name=exclusive]', container);

      // then
      expect(exclusiveCheckbox.checked).to.be.true;
    }));


    it('should display false when explicitly set', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const exclusiveCheckbox = domQuery('input[name=exclusive]', container);

      // then
      expect(exclusiveCheckbox.checked).to.be.false;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const exclusiveCheckbox = domQuery('input[name=exclusive]', container);
      clickInput(exclusiveCheckbox);

      // then
      expect(isExclusive(serviceTask)).to.be.true;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1'),
              originalValue = isExclusive(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const exclusiveCheckbox = domQuery('input[name=exclusive]', container);
        clickInput(exclusiveCheckbox);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(exclusiveCheckbox.checked).to.eql(originalValue);
      })
    );


    describe('integration', function() {

      it('should set to true if async before set to false', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_2');

        await act(() => {
          selection.select(task);
        });

        // assume
        expect(isExclusive(task)).to.be.false;

        // when
        const asyncBeforeCheckbox = domQuery('input[name=asynchronousContinuationBefore]', container);

        clickInput(asyncBeforeCheckbox);

        // then
        expect(isExclusive(task)).to.be.true;
      }));


      it('should set to true if async after set to false', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_3');

        await act(() => {
          selection.select(task);
        });

        // assume
        expect(isExclusive(task)).to.be.false;

        // when
        const asyncAfterCheckbox = domQuery('input[name=asynchronousContinuationAfter]', container);

        clickInput(asyncAfterCheckbox);

        // then
        expect(isExclusive(task)).to.be.true;
      }));

    });

  });

});


// helper //////////////////

function isAsyncBefore(element) {
  const bo = getBusinessObject(element);

  return !!(bo.get('camunda:asyncBefore') || bo.get('camunda:async'));
}

function isAsyncAfter(element) {
  const bo = getBusinessObject(element);

  return !!bo.get('camunda:asyncAfter');
}

function isExclusive(element) {
  const bo = getBusinessObject(element);

  return !!bo.get('camunda:exclusive');
}
