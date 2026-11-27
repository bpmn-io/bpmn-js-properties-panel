import { expect } from 'chai';
import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
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

import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe.json';

import { getExtensionElementsList } from 'src/utils/ExtensionElementsUtil';

import diagramXML from './StageProps.bpmn';

const testModules = [
  CoreModule,
  SelectionModule,
  ModelingModule,
  BpmnPropertiesPanel,
  ZeebePropertiesProvider
];

const moddleExtensions = {
  zeebe: zeebeModdleExtensions
};


describe('provider/zeebe - StageProps', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    debounceInput: false
  }));


  [
    'Stage',
    'NoStage',
    'AdHocNoStage',
    'EventSubProcess'
  ].forEach(function(id) {

    it('should display for ' + id, inject(async function(elementRegistry, selection) {

      // when
      await act(() => {
        selection.select(elementRegistry.get(id));
      });

      // then
      expect(domQuery('[data-group-id="group-stage"]', container)).to.exist;
      expect(domQuery('[data-entry-id="stage"]', container)).to.exist;
    }));

  });


  [
    'Task_1',
    'Transaction_1'
  ].forEach(function(id) {

    it('should NOT display for ' + id, inject(async function(elementRegistry, selection) {

      // when
      await act(() => {
        selection.select(elementRegistry.get(id));
      });

      // then
      expect(domQuery('[data-group-id="group-stage"]', container)).not.to.exist;
    }));

  });


  it('should be on for stage', inject(async function(elementRegistry, selection) {

    // when
    await act(() => {
      selection.select(elementRegistry.get('Stage'));
    });

    // then
    expect(domQuery('#bio-properties-panel-stage', container).checked).to.be.true;
  }));


  it('should be off for sub-process without marker', inject(async function(elementRegistry, selection) {

    // when
    await act(() => {
      selection.select(elementRegistry.get('NoStage'));
    });

    // then
    expect(domQuery('#bio-properties-panel-stage', container).checked).to.be.false;
  }));


  it('should add marker', inject(async function(elementRegistry, selection) {

    // given
    const subProcess = elementRegistry.get('AdHocNoStage');

    await act(() => {
      selection.select(subProcess);
    });

    // when
    await act(() => {
      domQuery('#bio-properties-panel-stage', container).click();
    });

    // then
    expect(getExtensionElementsList(getBusinessObject(subProcess), 'zeebe:Stage')).to.have.length(1);
  }));


  it('should remove marker', inject(async function(elementRegistry, selection) {

    // given
    const subProcess = elementRegistry.get('Stage');

    await act(() => {
      selection.select(subProcess);
    });

    // when
    await act(() => {
      domQuery('#bio-properties-panel-stage', container).click();
    });

    // then
    expect(getExtensionElementsList(getBusinessObject(subProcess), 'zeebe:Stage')).to.be.empty;
  }));


  it('should keep other extension elements', inject(async function(elementRegistry, selection, bpmnFactory, commandStack) {

    // given
    const subProcess = elementRegistry.get('Stage'),
          businessObject = getBusinessObject(subProcess);

    const adHoc = bpmnFactory.create('zeebe:AdHoc', {}),
          extensionElements = businessObject.get('extensionElements');

    commandStack.execute('element.updateModdleProperties', {
      element: subProcess,
      moddleElement: extensionElements,
      properties: { values: [ ...extensionElements.get('values'), adHoc ] }
    });

    await act(() => {
      selection.select(subProcess);
    });

    // when
    await act(() => {
      domQuery('#bio-properties-panel-stage', container).click();
    });

    // then
    expect(getExtensionElementsList(businessObject, 'zeebe:AdHoc')).to.have.length(1);
  }));


  it('should undo', inject(async function(elementRegistry, selection, commandStack) {

    // given
    const subProcess = elementRegistry.get('NoStage');

    await act(() => {
      selection.select(subProcess);
    });

    await act(() => {
      domQuery('#bio-properties-panel-stage', container).click();
    });

    // when
    await act(() => {
      commandStack.undo();
    });

    // then
    expect(getExtensionElementsList(getBusinessObject(subProcess), 'zeebe:Stage')).to.be.empty;
  }));

});
