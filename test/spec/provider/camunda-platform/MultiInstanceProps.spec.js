import {
  act
} from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';

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

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';
import BpmnPropertiesProvider from 'src/provider/bpmn';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './MultiInstanceProps.bpmn';

describe('provider/camunda-platform - MultiInstanceProps', function() {

  const testModules = [
    CoreModule,
    ModelingModule,
    SelectionModule,
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


  describe('camunda:Collectable#collection', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const collectionInput = domQuery('input[name=collection]', container);

      // then
      expect(collectionInput).to.exist;
      expect(collectionInput.value).to.equal(getCollection(element));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const collectionInput = domQuery('input[name=collection]', container);

      // then
      expect(collectionInput).to.not.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('SubProcess_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const collectionInput = domQuery('input[name=collection]', container);
      changeInput(collectionInput, 'newValue');

      // then
      expect(getCollection(element)).to.equal('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('ServiceTask_1');
        const originalValue = getCollection(element);

        await act(() => {
          selection.select(element);
        });
        const collectionInput = domQuery('input[name=collection]', container);
        changeInput(collectionInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(collectionInput.value).to.eql(originalValue);
      })
    );

  });


  describe('camunda:Collectable#elementVariable', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const elementVariableInput = domQuery('input[name=elementVariable]', container);

      // then
      expect(elementVariableInput).to.exist;
      expect(elementVariableInput.value).to.equal(getElementVariable(element));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const elementVariableInput = domQuery('input[name=elementVariable]', container);

      // then
      expect(elementVariableInput).to.not.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('SubProcess_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const elementVariableInput = domQuery('input[name=elementVariable]', container);
      changeInput(elementVariableInput, 'newValue');

      // then
      expect(getElementVariable(element)).to.equal('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('ServiceTask_1');
        const originalValue = getElementVariable(element);

        await act(() => {
          selection.select(element);
        });
        const elementVariableInput = domQuery('input[name=elementVariable]', container);
        changeInput(elementVariableInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(elementVariableInput.value).to.eql(originalValue);
      })
    );

  });


  describe('camunda:Collectable#asyncBefore', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_4');

      await act(() => {
        selection.select(element);
      });

      // when
      const asyncBeforeCheckbox = domQuery('input[name=multiInstanceAsynchronousBefore]', container);

      // then
      expect(asyncBeforeCheckbox).to.exist;
      expect(asyncBeforeCheckbox.checked).to.equal(isAsyncBefore(getLoopCharacteristics(element)));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const asyncBeforeCheckbox = domQuery('input[name=multiInstanceAsynchronousBefore]', container);

      // then
      expect(asyncBeforeCheckbox).to.not.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_4');

      await act(() => {
        selection.select(element);
      });

      // when
      const asyncBeforeCheckbox = domQuery('input[name=multiInstanceAsynchronousBefore]', container);
      clickInput(asyncBeforeCheckbox);

      // then
      expect(isAsyncBefore(getLoopCharacteristics(element))).to.equal(false);
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('Task_4');
        const originalValue = isAsyncBefore(getLoopCharacteristics(element));

        await act(() => {
          selection.select(element);
        });
        const asyncBeforeCheckbox = domQuery('input[name=multiInstanceAsynchronousBefore]', container);
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


  describe('camunda:Collectable#asyncAfter', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_4');

      await act(() => {
        selection.select(element);
      });

      // when
      const asyncAfterCheckbox = domQuery('input[name=multiInstanceAsynchronousAfter]', container);

      // then
      expect(asyncAfterCheckbox).to.exist;
      expect(asyncAfterCheckbox.checked).to.equal(isAsyncAfter(getLoopCharacteristics(element)));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const asyncAfterCheckbox = domQuery('input[name=multiInstanceAsynchronousAfter]', container);

      // then
      expect(asyncAfterCheckbox).to.not.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_4');

      await act(() => {
        selection.select(element);
      });

      // when
      const asyncAfterCheckbox = domQuery('input[name=multiInstanceAsynchronousAfter]', container);
      clickInput(asyncAfterCheckbox);

      // then
      expect(isAsyncAfter(getLoopCharacteristics(element))).to.equal(false);
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('Task_4');
        const originalValue = isAsyncAfter(getLoopCharacteristics(element));

        await act(() => {
          selection.select(element);
        });
        const asyncAfterCheckbox = domQuery('input[name=multiInstanceAsynchronousAfter]', container);
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


  describe('camunda:Collectable#exclusive', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_4');

      await act(() => {
        selection.select(element);
      });

      // when
      const exclusiveCheckbox = domQuery('input[name=multiInstanceExclusive]', container);

      // then
      expect(exclusiveCheckbox).to.exist;
      expect(exclusiveCheckbox.checked).to.equal(isExclusive(getLoopCharacteristics(element)));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const exclusiveCheckbox = domQuery('input[name=multiInstanceExclusive]', container);

      // then
      expect(exclusiveCheckbox).to.not.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_4');

      await act(() => {
        selection.select(element);
      });

      // when
      const exclusiveCheckbox = domQuery('input[name=multiInstanceExclusive]', container);
      clickInput(exclusiveCheckbox);

      // then
      expect(isExclusive(getLoopCharacteristics(element))).to.equal(false);
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('Task_4');
        const originalValue = isExclusive(getLoopCharacteristics(element));

        await act(() => {
          selection.select(element);
        });
        const exclusiveCheckbox = domQuery('input[name=multiInstanceExclusive]', container);
        clickInput(exclusiveCheckbox);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(exclusiveCheckbox.checked).to.eql(originalValue);
      })
    );

  });


  describe('camunda:Collectable#failedJobRetryTimeCycle', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_4');

      await act(() => {
        selection.select(element);
      });

      // when
      const retryTimeCycleInput = domQuery('input[name=multiInstanceRetryTimeCycle]', container);

      // then
      expect(retryTimeCycleInput).to.exist;
      expect(retryTimeCycleInput.value).to.equal(getRetryTimeCycleValue(
        getLoopCharacteristics(element)));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const retryTimeCycleInput = domQuery('input[name=multiInstanceRetryTimeCycle]', container);

      // then
      expect(retryTimeCycleInput).to.not.exist;
    }));


    it('should update, re-using extension elements', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Task_4');

      await act(() => {
        selection.select(element);
      });

      // when
      const retryTimeCycleInput = domQuery('input[name=multiInstanceRetryTimeCycle]', container);
      changeInput(retryTimeCycleInput, 'newVal');

      // then
      expect(getRetryTimeCycleValue(getLoopCharacteristics(element))).to.equal('newVal');
    }));


    it('should update, creating new extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Task_5');

        await act(() => {
          selection.select(element);
        });

        // when
        const retryTimeCycleInput = domQuery('input[name=multiInstanceRetryTimeCycle]', container);
        changeInput(retryTimeCycleInput, 'newVal');

        // then
        expect(getRetryTimeCycleValue(getLoopCharacteristics(element))).to.equal('newVal');
      }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('Task_4');
        const originalValue = getRetryTimeCycleValue(getLoopCharacteristics(element));

        await act(() => {
          selection.select(element);
        });
        const retryTimeCycleInput = domQuery('input[name=multiInstanceRetryTimeCycle]', container);
        changeInput(retryTimeCycleInput, 'newVal');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(retryTimeCycleInput.value).to.eql(originalValue);
      })
    );

  });

});


// helper ////////////////////////////

/**
 * getProperty - get a property value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 *
 * @return {any} the property value
 */
function getProperty(element, propertyName) {
  var loopCharacteristics = getLoopCharacteristics(element);
  return loopCharacteristics && loopCharacteristics.get(propertyName);
}

/**
 * getLoopCharacteristics - get loopCharacteristics of a given element.
 *
 * @param {djs.model.Base} element
 * @return {ModdleElement<bpmn:MultiInstanceLoopCharacteristics> | undefined}
 */
function getLoopCharacteristics(element) {
  const bo = getBusinessObject(element);
  return bo.loopCharacteristics;
}

// collection

/**
 * getCollection - get the 'camunda:collection' attribute value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the 'camunda:collection' value
 */
function getCollection(element) {
  return getProperty(element, 'camunda:collection');
}

// elementVariable

/**
 * getElementVariable - get the 'camunda:elementVariable' attribute value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the 'camunda:elementVariable' value
 */
function getElementVariable(element) {
  return getProperty(element, 'camunda:elementVariable');
}

/**
 * Returns true if the attribute 'camunda:asyncBefore' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncBefore(bo) {
  return !!(bo.get('camunda:asyncBefore') || bo.get('camunda:async'));
}

/**
 * Returns true if the attribute 'camunda:asyncAfter' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncAfter(bo) {
  return !!bo.get('camunda:asyncAfter');
}

/**
 * Returns true if the attribute 'camunda:exclusive' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isExclusive(bo) {
  return !!bo.get('camunda:exclusive');
}

function getRetryTimeCycleValue(element) {
  const failedJobRetryTimeCycle = getExtensionElementsList(element,
    'camunda:FailedJobRetryTimeCycle')[0];
  return failedJobRetryTimeCycle && failedJobRetryTimeCycle.body;
}
