import TestContainer from 'mocha-test-container-support';
import { act, waitFor } from '@testing-library/preact';

import { bootstrapPropertiesPanel, changeInput, inject } from 'test/TestHelper';

import { query as domQuery, queryAll } from 'min-dom';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { getExtensionElementsList } from 'src/utils/ExtensionElementsUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import BpmnPropertiesPanel from 'src/render';
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';
import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './OutputCollectionProps.bpmn';
import { setEditorValue } from '../../../TestHelper';


const GROUP_SELECTOR = '[data-group-id="group-outputCollection"]';

describe('provider/zeebe - OutputCollection', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
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
    propertiesPanel: {
      tooltip: TooltipProvider
    },
    debounceInput: false
  }));


  it('should display output collection group on ad-hoc subprocess', inject(async function(
      elementRegistry,
      selection
  ) {

    // given
    const subprocess = elementRegistry.get('AdHocSubprocess_1');

    // when
    await act(() => {
      selection.select(subprocess);
    });

    // then
    const group = getGroup(container, 'outputCollection');
    expect(group).to.exist;
    expect(getOutputCollectionInput(container)).to.exist;
    expect(getOutputElementInput(container)).to.exist;
  }));


  it('should display isEdited marker on collection group', inject(async function(
      elementRegistry,
      selection
  ) {

    // given
    const subprocess = elementRegistry.get('AdHocSubprocess_1');

    // when
    await act(() => {
      selection.select(subprocess);
    });

    // then
    await expectEdited(container, true);
  }));


  it('should add output collection group before active elements group', inject(async function(
      elementRegistry,
      selection
  ) {

    // given
    const subprocess = elementRegistry.get('AdHocSubprocess_1');

    // when
    await act(() => {
      selection.select(subprocess);
    });

    // then
    const expectedGroupOrder = [
      'group-outputCollection',
      'group-activeElements'
    ];

    expect(getGroupIds(container).filter(id => expectedGroupOrder.includes(id))).to.eql(expectedGroupOrder);
  }));


  it('should display inputs in the expected order', inject(async function(
      elementRegistry,
      selection
  ) {

    // given
    const subprocess = elementRegistry.get('AdHocSubprocess_1');

    // when
    await act(() => {
      selection.select(subprocess);
    });

    // then
    const group = getGroup(container, 'outputCollection');
    expect(getInputNames(group)).to.eql([
      'adHocOutputCollection',
      'adHocOutputElement'
    ]);
  }));


  it('should NOT display output collection group on a regular subprocess', inject(async function(
      elementRegistry,
      selection
  ) {

    // given
    const subprocess = elementRegistry.get('Subprocess_1');

    // when
    await act(() => {
      selection.select(subprocess);
    });

    // then
    const group = getGroup(container, 'outputCollection');
    expect(group).not.to.exist;
  }));


  describe('#outputCollection', function() {

    it('should show the expected value when output collection is configured', inject(async function(
        elementRegistry, selection
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_1');

      // when
      await act(() => {
        selection.select(subprocess);
      });

      // then
      const outputCollectionInput = getOutputCollectionInput(container);
      expect(outputCollectionInput.value).to.equal('results');
    }));


    it('should show empty value when output collection is not configured', inject(async function(
        elementRegistry, selection
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_2');

      // when
      await act(() => {
        selection.select(subprocess);
      });

      // then
      const outputCollectionInput = getOutputCollectionInput(container);
      expect(outputCollectionInput.value).to.equal('');
    }));


    it('should update value on input change', inject(async function(
        elementRegistry, selection
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_2');

      await act(() => {
        selection.select(subprocess);
      });

      // when
      const outputCollectionInput = getOutputCollectionInput(container);
      changeInput(outputCollectionInput, 'myResults');

      // then
      expect(getOutputCollectionValue(subprocess)).to.equal('myResults');
    }));


    it('should update output collection on external change', inject(async function(
        elementRegistry, selection, commandStack
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_2');

      await act(() => {
        selection.select(subprocess);
      });

      const outputCollectionInput = getOutputCollectionInput(container);
      changeInput(outputCollectionInput, 'myResults');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(outputCollectionInput.value).to.equal('');
    }));


    it('should create zeebe:adHoc extension element if it does not exist', inject(async function(
        elementRegistry, selection
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_2');

      await act(() => {
        selection.select(subprocess);
      });

      // assume
      expect(getZeebeAdHocExtension(subprocess)).not.to.exist;

      // when
      const outputCollectionInput = getOutputCollectionInput(container);
      changeInput(outputCollectionInput, 'myResults');

      // then
      expect(getZeebeAdHocExtension(subprocess)).to.exist;
      expect(getOutputCollectionValue(subprocess)).to.equal('myResults');
    }));

  });


  describe('#outputElement', function() {

    it('should show the expected value when output element is configured', inject(async function(
        elementRegistry, selection
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_1');

      // when
      await act(() => {
        selection.select(subprocess);
      });

      // then
      const outputElementInput = getOutputElementInput(container);
      expect(getEditorValue(outputElementInput)).to.equal('result');
    }));


    it('should show empty value when output element is not configured', inject(async function(
        elementRegistry, selection
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_2');

      // when
      await act(() => {
        selection.select(subprocess);
      });

      // then
      const outputElementInput = getOutputElementInput(container);
      expect(getEditorValue(outputElementInput)).to.equal('');
    }));


    it('should update value on input change', inject(async function(
        elementRegistry, selection
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_2');

      await act(() => {
        selection.select(subprocess);
      });

      // when
      const outputElementInput = getOutputElementInput(container);
      await setEditorValue(outputElementInput, 'myResult');

      // then
      expect(getOutputElementValue(subprocess)).to.equal('=myResult');
    }));


    it('should update output element on external change', inject(async function(
        elementRegistry, selection, commandStack
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_2');

      await act(() => {
        selection.select(subprocess);
      });

      const outputElementInput = getOutputElementInput(container);
      await setEditorValue(outputElementInput, 'myResult');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getEditorValue(outputElementInput)).to.equal('');
    }));


    it('should create zeebe:adHoc extension element if it does not exist', inject(async function(
        elementRegistry, selection
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_2');

      await act(() => {
        selection.select(subprocess);
      });

      // assume
      expect(getZeebeAdHocExtension(subprocess)).not.to.exist;

      // when
      const outputElementInput = getOutputElementInput(container);
      await setEditorValue(outputElementInput, 'myResult');

      // then
      expect(getZeebeAdHocExtension(subprocess)).to.exist;
      expect(getOutputElementValue(subprocess)).to.equal('=myResult');
    }));

  });


  describe('undo/redo', function() {

    it('should undo outputCollection', inject(async function(
        elementRegistry, selection, commandStack
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_1');
      const originalValue = getOutputCollectionValue(subprocess);

      await act(() => {
        selection.select(subprocess);
      });

      const outputCollectionInput = getOutputCollectionInput(container);
      changeInput(outputCollectionInput, 'newResults');
      expect(getOutputCollectionValue(subprocess)).not.to.equal(originalValue);

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getOutputCollectionValue(subprocess)).to.equal(originalValue);
    }));


    it('should undo outputElement', inject(async function(
        elementRegistry, selection, commandStack
    ) {

      // given
      const subprocess = elementRegistry.get('AdHocSubprocess_1');
      const originalValue = getOutputElementValue(subprocess);

      await act(() => {
        selection.select(subprocess);
      });

      const outputElementInput = getOutputElementInput(container);
      await setEditorValue(outputElementInput, 'newResult');
      expect(getOutputElementValue(subprocess)).not.to.equal(originalValue);

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getOutputElementValue(subprocess)).to.equal(originalValue);
    }));

  });


});

// helpers ////////////////////////////

function getEditorValue(input) {
  return input.textContent;
}

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getInputNames(container) {
  const inputs = queryAll('[name]', container);
  const inputNames = Array.from(inputs).map(input => input.getAttribute('name'));

  return inputNames;
}

function getGroupIds(container) {
  const groups = queryAll('[data-group-id]', container);
  const groupIds = Array.from(groups).map(group => group.getAttribute('data-group-id'));

  return groupIds;
}

function getOutputCollectionInput(container) {
  return domQuery('[name=adHocOutputCollection]', container);
}

function getOutputElementInput(container) {
  return domQuery('[name=adHocOutputElement] [role="textbox"]', container);
}

// model helpers ////////////////////////////

/**
 * getZeebeAdHocExtension - get the zeebe:adHoc extension element.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<zeebe:AdHoc>} the zeebe:adHoc extension element
 */
function getZeebeAdHocExtension(element) {
  const businessObject = getBusinessObject(element);
  const extensions = getExtensionElementsList(businessObject, 'zeebe:AdHoc');
  return extensions[0];
}

/**
 * getOutputCollectionValue - get the output collection value of the ad-hoc subprocess.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the output collection value
 */
function getOutputCollectionValue(element) {
  const extension = getZeebeAdHocExtension(element);
  return extension?.get('outputCollection');
}

/**
 * getOutputElementValue - get the output element value of the ad-hoc subprocess.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the output element value
 */
function getOutputElementValue(element) {
  const extension = getZeebeAdHocExtension(element);
  return extension?.get('outputElement');
}

function expectEdited(container, exists) {
  return waitFor(() => {
    const indicator = domQuery(`${GROUP_SELECTOR} .bio-properties-panel-dot`, container);

    if (exists) {
      expect(indicator).to.exist;
    } else {
      expect(indicator).not.to.exist;
    }
  });
}
