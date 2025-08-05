import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import { bootstrapPropertiesPanel, changeInput, inject } from 'test/TestHelper';

import { query as domQuery } from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import BpmnPropertiesPanel from 'src/render';
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';
import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './AdHocSubProcessImplementationProps.bpmn';

describe('provider/zeebe - AdHocSubProcessImplementationProps', function() {

  const testModules = [
    CoreModule,
    SelectionModule,
    ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    ZeebePropertiesProvider,
    TooltipProvider
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

  it('should display implementation dropdown for ad-hoc subprocess', inject(async function(elementRegistry, selection) {

    // given
    const adHocSubProcess = elementRegistry.get('AdHocSubProcess_1');

    await act(() => {
      selection.select(adHocSubProcess);
    });

    // when
    const implementationGroup = getGroup(container, 'adHocSubProcessImplementation');
    const implementationSelect = getSelect(implementationGroup, 'adHocImplementation');

    // then
    expect(implementationGroup).to.exist;
    expect(implementationSelect).to.exist;
    expect(implementationSelect.value).to.equal('bpmn');
  }));


  it('should have BPMN and job worker options', inject(async function(elementRegistry, selection) {

    // given
    const adHocSubProcess = elementRegistry.get('AdHocSubProcess_1');

    await act(() => {
      selection.select(adHocSubProcess);
    });

    // when
    const implementationGroup = getGroup(container, 'adHocSubProcessImplementation');
    const implementationSelect = getSelect(implementationGroup, 'adHocImplementation');
    const options = implementationSelect.querySelectorAll('option');

    // then
    expect(options).to.have.length(2);
    expect(options[0]).to.have.property('value', 'bpmn');
    expect(options[0]).to.have.property('textContent', 'BPMN');
    expect(options[1]).to.have.property('value', 'jobWorker');
    expect(options[1]).to.have.property('textContent', 'Job worker');
  }));


  it('should create taskDefinition when setting to job worker', inject(async function(elementRegistry, selection) {

    // given
    const adHocSubProcess = elementRegistry.get('AdHocSubProcess_1');

    await act(() => {
      selection.select(adHocSubProcess);
    });

    const implementationGroup = getGroup(container, 'adHocSubProcessImplementation');
    const implementationSelect = getSelect(implementationGroup, 'adHocImplementation');

    // when
    changeInput(implementationSelect, 'jobWorker');

    // then
    const taskDefinition = getTaskDefinition(adHocSubProcess);
    expect(taskDefinition).to.exist;
  }));


  it('should remove taskDefinition when setting to BPMN', inject(async function(elementRegistry, selection, commandStack) {

    // given
    const adHocSubProcess = elementRegistry.get('AdHocSubProcess_1');

    // first set to job worker to create taskDefinition
    await act(() => {
      selection.select(adHocSubProcess);
    });

    const implementationGroup = getGroup(container, 'adHocSubProcessImplementation');
    const implementationSelect = getSelect(implementationGroup, 'adHocImplementation');

    changeInput(implementationSelect, 'jobWorker');

    // verify taskDefinition exists
    let taskDefinition = getTaskDefinition(adHocSubProcess);
    expect(taskDefinition).to.exist;

    // when
    changeInput(implementationSelect, 'bpmn');

    // then
    taskDefinition = getTaskDefinition(adHocSubProcess);
    expect(taskDefinition).not.to.exist;
  }));


  it('should show job worker as selected when taskDefinition exists', inject(async function(elementRegistry, selection) {

    // given
    const adHocSubProcessWithTask = elementRegistry.get('AdHocSubProcess_2');

    await act(() => {
      selection.select(adHocSubProcessWithTask);
    });

    // when
    const implementationGroup = getGroup(container, 'adHocSubProcessImplementation');
    const implementationSelect = getSelect(implementationGroup, 'adHocImplementation');

    // then
    expect(implementationSelect.value).to.equal('jobWorker');
  }));


  it('should not display for non-ad-hoc subprocess', inject(async function(elementRegistry, selection) {

    // given
    const subprocess = elementRegistry.get('SubProcess_1');

    await act(() => {
      selection.select(subprocess);
    });

    // when
    const implementationGroup = getGroup(container, 'adHocSubProcessImplementation');

    // then
    expect(implementationGroup).not.to.exist;
  }));
});

// helpers ///////////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"]`, container);
}

function getSelect(container, id) {
  return domQuery(`select[name="${id}"]`, container);
}

function getTaskDefinition(element) {
  const businessObject = element.businessObject;
  const extensionElements = businessObject.extensionElements;

  if (!extensionElements) {
    return null;
  }

  return extensionElements.values.find(value => value.$type === 'zeebe:TaskDefinition');
}
