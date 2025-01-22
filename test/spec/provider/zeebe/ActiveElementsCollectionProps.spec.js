import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  setEditorValue,
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

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './ActiveElementsCollectionProps.bpmn';


describe('provider/zeebe - ActiveElementsCollection', function() {

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


  describe('bpmn:AdHocSubProcess', function() {

    describe('#activeElements', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const subprocess = elementRegistry.get('Subprocess_1');

        // when
        await act(() => {
          selection.select(subprocess);
        });

        // then
        const group = getGroup(container, 'activeElements');
        const input = getInput(container);

        expect(group).to.exist;
        expect(input).to.exist;
      }));


      it('should create extension element', inject(async function(elementRegistry, selection) {

        // given
        const subprocess = elementRegistry.get('Subprocess_1');

        await act(() => {
          selection.select(subprocess);
        });

        // assume
        expect(getAdHocExtensionElements(subprocess)).to.be.empty;

        // when
        const input = getInput(container);
        await setEditorValue(input, 'value');

        // then
        const extensionElements = getAdHocExtensionElements(subprocess);
        expect(extensionElements).to.have.length(1);
        expect(extensionElements[0].get('activeElementsCollection')).to.eql('=value');
      }));


      it('should update existing extension element', inject(async function(elementRegistry, selection) {

        // given
        const subprocess = elementRegistry.get('Subprocess_2');

        await act(() => {
          selection.select(subprocess);
        });

        // assume
        expect(getAdHocExtensionElements(subprocess)).to.have.length(1);

        // when
        const input = getInput(container);
        await setEditorValue(input, 'newValue');

        // then
        const extensionElements = getAdHocExtensionElements(subprocess);
        expect(extensionElements).to.have.length(1);
        expect(extensionElements[0].get('activeElementsCollection')).to.eql('=newValue');
      }));


      it('should update on external change', inject(async function(elementRegistry, selection, commandStack) {

        // given
        const subprocess = elementRegistry.get('Subprocess_2');

        await act(() => {
          selection.select(subprocess);
        });

        // assume
        const initialValue = getAdHocExtensionElements(subprocess)[0].get('activeElementsCollection');

        // when
        const input = getInput(container);
        await setEditorValue(input, 'newValue');

        await act(() => {
          commandStack.undo();
        });

        // then
        const extensionElements = getAdHocExtensionElements(subprocess);
        expect(extensionElements).to.have.length(1);
        expect(extensionElements[0].get('activeElementsCollection')).to.eql(initialValue);
      }));
    });

  });

});

// helpers

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getInput(container) {
  return domQuery('[name=activeElements-activeElementsCollection] [role="textbox"]', container);
}

function getAdHocExtensionElements(element) {
  const bo = getBusinessObject(element);
  return getExtensionElementsList(bo, 'zeebe:AdHoc');
}