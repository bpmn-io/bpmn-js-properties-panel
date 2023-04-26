import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getInputParameters,
  getIoMapping
} from 'src/provider/zeebe/utils/InputOutputUtil';

import diagramXML from './InputProps.bpmn';


describe('provider/zeebe - InputProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
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


  it('should NOT display for receive task', inject(async function(elementRegistry, selection) {

    // given
    const receiveTask = elementRegistry.get('ReceiveTask_1');

    await act(() => {
      selection.select(receiveTask);
    });

    // when
    const inputGroup = getGroup(container, 'inputs');

    // then
    expect(inputGroup).to.not.exist;
  }));


  [
    [ 'service task', 'ServiceTask_1' ],
    [ 'signal intermediate throw event', 'SignalIntermediateThrowEvent_1' ],
    [ 'signal end event', 'SignalEndEvent_1' ]
  ].forEach(([ label, id ]) => {

    it(`should display - ${ label }`, inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get(id);

      await act(() => {
        selection.select(element);
      });

      // when
      const inputGroup = getGroup(container, 'inputs');
      const inputListItems = getInputListItems(inputGroup);

      // then
      expect(inputGroup).to.exist;
      expect(inputListItems.length).to.equal(getInputParameters(element).length);
    }));


    it(`should add new input - ${ label }`, inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get(id);

      await act(() => {
        selection.select(serviceTask);
      });

      const inputGroup = getGroup(container, 'inputs');
      const addEntry = domQuery('.bio-properties-panel-add-entry', inputGroup);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getInputParameters(serviceTask)).to.have.length(5);
    }));


    it(`should delete input - ${ label }`, inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get(id);

      await act(() => {
        selection.select(serviceTask);
      });

      const inputListItems = getInputListItems(getGroup(container, 'inputs'));
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', inputListItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getInputParameters(serviceTask)).to.have.length(3);
    }));


    it(`should update on external change - ${ label }`,
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get(id);
        const originalInputs = getInputParameters(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const addEntry = domQuery('.bio-properties-panel-add-entry', container);
        await act(() => {
          addEntry.click();
        });

        // when
        await act(() => {
          commandStack.undo();
        });

        const inputListItems = getInputListItems(getGroup(container, 'inputs'));

        // then
        expect(inputListItems.length).to.equal(originalInputs.length);
      })
    );

  });


  it('should add new input to bottom', inject(async function(elementRegistry, selection) {

    // given
    const serviceTask = elementRegistry.get('ServiceTask_2');

    await act(() => {
      selection.select(serviceTask);
    });

    const inputGroup = getGroup(container, 'inputs');
    const addEntry = domQuery('.bio-properties-panel-add-entry', inputGroup);

    // when
    await act(() => {
      addEntry.click();
    });

    // then
    const inputItemLabel = getInputItemLabel(container, 0);

    expect(inputItemLabel.innerHTML).to.equal('inputTargetValue1');
  }));


  it('should sort input items according to XML', inject(async function(elementRegistry, selection) {

    // given
    const serviceTask = elementRegistry.get('ServiceTask_Unsorted');

    await act(() => {
      selection.select(serviceTask);
    });

    // then
    const inputParameters = getInputParameters(serviceTask);

    for (let idx = 0; idx < inputParameters.length; idx++) {
      const inputItemLabel = getInputItemLabel(container, idx).innerHTML;

      expect(inputParameters[idx].target).to.equal(inputItemLabel);
    }
  }));


  it('should create non existing extension elements',
    inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_NoExtensionElements');

      await act(() => {
        selection.select(serviceTask);
      });

      // assume
      expect(getBusinessObject(serviceTask).get('extensionElements')).not.to.exist;

      const inputGroup = getGroup(container, 'inputs');
      const addEntry = domQuery('.bio-properties-panel-add-entry', inputGroup);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
    })
  );


  it('should create non existing ioMapping',
    inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_NoIoMapping');

      await act(() => {
        selection.select(serviceTask);
      });

      // assume
      expect(getIoMapping(serviceTask)).not.to.exist;

      const inputGroup = getGroup(container, 'inputs');
      const addEntry = domQuery('.bio-properties-panel-add-entry', inputGroup);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getIoMapping(serviceTask)).to.exist;
    })
  );


  it('should remove ioMapping on last delete', inject(async function(elementRegistry, selection) {

    // given
    const serviceTask = elementRegistry.get('ServiceTask_2');

    await act(() => {
      selection.select(serviceTask);
    });

    // assume
    expect(getIoMapping(serviceTask)).to.exist;

    const inputListItems = getInputListItems(getGroup(container, 'inputs'));
    const removeEntry = domQuery('.bio-properties-panel-remove-entry', inputListItems[0]);

    // when
    await act(() => {
      removeEntry.click();
    });

    // then
    expect(getIoMapping(serviceTask)).not.to.exist;
  }));

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getListItems(container, type) {
  return domQueryAll(`div[data-entry-id*="-${type}-"].bio-properties-panel-collapsible-entry`, container);
}

function getInputListItems(container) {
  return getListItems(container, 'input');
}

function getInputItemLabel(container, id) {
  return domQueryAll('.bio-properties-panel-collapsible-entry-header-title', container)[id];
}