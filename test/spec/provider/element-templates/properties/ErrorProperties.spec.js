import TestContainer from 'mocha-test-container-support';

import {
  bootstrapPropertiesPanel,
  getBpmnJS
} from 'test/TestHelper';

import {
  act
} from '@testing-library/preact';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import coreModule from 'bpmn-js/lib/core';
import modelingModule from 'bpmn-js/lib/features/modeling';
import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import BpmnPropertiesPanel from 'src/render';
import elementTemplatesModule from 'src/provider/element-templates';

import diagramXML from './ErrorProperties.bpmn';
import elementTemplates from './ErrorProperties.json';


const ERROR_GROUP_ID = 'group-ElementTemplates__Error';


describe('provider/element-templates - ErrorProperties', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    container,
    debounceInput: false,
    elementTemplates,
    moddleExtensions: {
      camunda: camundaModdlePackage
    },
    modules: [
      BpmnPropertiesPanel,
      coreModule,
      elementTemplatesModule,
      modelingModule
    ]
  }));


  it('should display given label', async function() {

    // when
    await expectSelected('ServiceTask_1');

    // then
    const group = findErrorGroup(container),
          headerTitles = domQueryAll(
            '.bio-properties-panel-list .bio-properties-panel-collapsible-entry-header-title', group);

    expect(headerTitles[1].textContent).to.eql('error-name-2');
  });


  it('should display placeholder label if neither label nor code is set', async function() {

    // when
    await expectSelected('ServiceTask_1');

    // then
    const group = findErrorGroup(container),
          headerTitles = domQueryAll(
            '.bio-properties-panel-list .bio-properties-panel-collapsible-entry-header-title', group);

    expect(headerTitles[3].textContent).to.eql('<unnamed>');
  });


  it('should display label based on error name and code', async function() {

    // when
    await expectSelected('ServiceTask_1');

    // then
    const group = findErrorGroup(container),
          headerTitle = domQuery(
            '.bio-properties-panel-list .bio-properties-panel-collapsible-entry-header-title', group);

    expect(headerTitle.textContent).to.eql('error-name-1 (code = error-code-1)');
  });


  it('should not display add button', async function() {

    // when
    await expectSelected('ServiceTask_1');

    // then
    const group = findErrorGroup(container),
          button = domQuery('.bio-properties-panel-add-entry', group);

    expect(button).not.to.exist;
  });


  it('should not display remove button', async function() {

    // when
    await expectSelected('ServiceTask_1');

    // then
    const group = findErrorGroup(container),
          button = domQuery('.bio-properties-panel-remove-entry', group);

    expect(button).not.to.exist;
  });


  describe('global error referenced entry', function() {

    it('should not display global error referenced entry', async function() {

      // when
      await expectSelected('ServiceTask_1');

      // then
      const entry = findEntry('ServiceTask_1-errorEventDefinition-0-errorRef', container);

      expect(entry).not.to.exist;
    });

  });


  describe('throw expression entry', function() {

    it('should display disabled throw expression', async function() {

      // when
      await expectSelected('ServiceTask_1');

      // then
      const entry = findEntry('ServiceTask_1-errorEventDefinition-0-expression', container),
            input = findInput('text', entry);

      expect(input).to.exist;
      expect(input.disabled).to.be.true;
    });

  });


  describe('entries', function() {

    it('should display other entries', async function() {

      // when
      await expectSelected('ServiceTask_1');

      // then
      const errorNameEntry = findEntry('ServiceTask_1-errorEventDefinition-0-errorName', container),
            errorCodeEntry = findEntry('ServiceTask_1-errorEventDefinition-0-errorCode', container),
            errorMessageEntry = findEntry('ServiceTask_1-errorEventDefinition-0-errorMessage', container);

      expect(errorNameEntry).to.exist;
      expect(errorCodeEntry).to.exist;
      expect(errorMessageEntry).to.exist;
    });

  });

});


// helpers //////////

function expectSelected(id) {
  return getBpmnJS().invoke(async function(elementRegistry, selection) {
    const element = elementRegistry.get(id);

    await act(() => {
      selection.select(element);
    });

    return element;
  });
}

function findEntry(id, container) {
  return domQuery(`[data-entry-id='${ id }']`, container);
}

function findInput(type, container) {
  return domQuery(`input[type='${ type }']`, container);
}

function findErrorGroup(container) {
  return domQuery(`[data-group-id='${ERROR_GROUP_ID}']`, container);
}
