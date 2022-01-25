import TestContainer from 'mocha-test-container-support';

import {
  bootstrapPropertiesPanel,
  changeInput,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  act
} from '@testing-library/preact';

import { query as domQuery } from 'min-dom';

import {
  findExtension,
  findOutputParameter
} from '../../../../../src/provider/element-templates/Helper';

import coreModule from 'bpmn-js/lib/core';
import modelingModule from 'bpmn-js/lib/features/modeling';
import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import BpmnPropertiesPanel from 'src/render';
import elementTemplatesModule from 'src/provider/element-templates';

import diagramXML from './OutputProperties.bpmn';
import elementTemplates from './OutputProperties.json';

const OUTPUT_GROUP_ID = 'group-ElementTemplates__Output';


describe('provider/element-templates - OutputProperties', function() {

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


  it('should not display add button', async function() {

    // when
    await expectSelected('SimpleTask');

    // then
    const group = findOutputGroup(container),
          button = domQuery('.bio-properties-panel-add-entry', group);

    expect(button).not.to.exist;
  });


  it('should not display remove button', async function() {

    // when
    await expectSelected('SimpleTask');

    // then
    const group = findOutputGroup(container),
          button = domQuery('.bio-properties-panel-remove-entry', group);

    expect(button).not.to.exist;
  });


  it('should display even if all properties are toggled off', async function() {

    // when
    await expectSelected('SimpleTaskWithoutInputOutput');

    // then
    const group = findOutputGroup(container);

    expect(group).to.exist;
  });


  describe('label', function() {

    it('should display label as label', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-outputParameter-0', container);

      expect(entry).to.exist;

      const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', entry);

      expect(label).to.exist;
      expect(label.innerText).to.equal('resultStatus');
    });


    it('should display binding name as label', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-outputParameter-5', container);

      expect(entry).to.exist;

      const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', entry);

      expect(label).to.exist;
      expect(label.innerText).to.equal('missingLabel');
    });


    it('should display <unnamed> if both label and name are missing', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-outputParameter-6', container);

      expect(entry).to.exist;

      const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', entry);

      expect(label).to.exist;
      expect(label.innerText).to.equal('<unnamed>');
    });
  });


  describe('description entry', function() {

    it('should display description entry', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-outputParameter-1', container);

      expect(entry).to.exist;

      const description = findEntry('SimpleTask-outputParameter-1-description', entry);

      expect(description).to.exist;
      expect(description.innerText).to.equal('foo bar');
    });


    it('should render HTML description', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-outputParameter-7', container);

      expect(entry).to.exist;

      const description = findEntry('SimpleTask-outputParameter-7-description', entry);

      expect(description).to.exist;
      expect(description.innerHTML).to.eql(
        '<div class="bio-properties-panel-description">' +
          '<div class="markup">' +
            '<div xmlns="http://www.w3.org/1999/xhtml">' +
              'By the way, you can use ' +
              '<a href="https://freemarker.apache.org/" target="_blank" rel="noopener">freemarker templates</a> ' +
              'here' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    });

  });


  describe('local variable assignment entry', function() {

    describe('toggle on', function() {

      let input;

      async function setup(elementId, propertyIndex) {
        await expectSelected(elementId);

        expandGroup(OUTPUT_GROUP_ID, container);

        expandCollapsibleEntry(`${elementId}-outputParameter-${propertyIndex}`, container);

        const entry = findEntry(
          `${elementId}-outputParameter-${propertyIndex}-local-variable-assignment`, container);

        input = findInput('checkbox', entry);

        // assume
        expect(input.checked).to.be.false;
      }


      it('should <do>', inject(async function(elementRegistry) {

        // given
        await setup('SimpleTask', 4);
        const task = elementRegistry.get('SimpleTask');

        // when
        input.click();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: 'notCreated' });

        expect(outputParameter).to.exist;
        expect(outputParameter.get('camunda:name')).to.equal('foo');
        expect(outputParameter.get('camunda:value')).to.equal('notCreated');
      }));


      it('should <undo>', inject(async function(commandStack, elementRegistry) {

        // given
        await setup('SimpleTask', 4);
        const task = elementRegistry.get('SimpleTask');

        input.click();

        // when
        commandStack.undo();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: 'notCreated' });

        expect(outputParameter).not.to.exist;
      }));


      it('should <redo>', inject(async function(commandStack, elementRegistry) {

        // given
        await setup('SimpleTask', 4);
        const task = elementRegistry.get('SimpleTask');

        input.click();

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: 'notCreated' });

        expect(outputParameter).to.exist;
        expect(outputParameter.get('camunda:name')).to.equal('foo');
        expect(outputParameter.get('camunda:value')).to.equal('notCreated');
      }));


      it('should work if inputOutput is missing', inject(async function(elementRegistry) {

        // given
        await setup('SimpleTaskWithoutInputOutput', 4);
        const task = elementRegistry.get('SimpleTaskWithoutInputOutput');

        // when
        input.click();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: 'notCreated' });

        expect(outputParameter).to.exist;
        expect(outputParameter.get('camunda:name')).to.equal('foo');
        expect(outputParameter.get('camunda:value')).to.equal('notCreated');
      }));


      it('should work if extension elements are missing', inject(async function(elementRegistry) {

        // given
        await setup('SimpleTaskWithoutExtensionElements', 4);
        const task = elementRegistry.get('SimpleTaskWithoutExtensionElements');

        // when
        input.click();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: 'notCreated' });

        expect(outputParameter).to.exist;
        expect(outputParameter.get('camunda:name')).to.equal('foo');
        expect(outputParameter.get('camunda:value')).to.equal('notCreated');
      }));
    });


    describe('toggle off', function() {

      let input;

      beforeEach(async function() {
        await expectSelected('SimpleTask');

        expandGroup(OUTPUT_GROUP_ID, container);

        expandCollapsibleEntry('SimpleTask-outputParameter-0', container);

        const entry = findEntry('SimpleTask-outputParameter-0-local-variable-assignment', container);

        input = findInput('checkbox', entry);

        // assume
        expect(input.checked).to.be.true;
      });


      it('should <do>', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        // when
        input.click();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: '${resultStatus}' });

        expect(outputParameter).not.to.exist;
      }));


      it('should <undo>', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        input.click();

        // when
        commandStack.undo();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: '${resultStatus}' });

        expect(outputParameter).to.exist;
        expect(outputParameter.get('camunda:name')).to.equal('resultStatus');
        expect(outputParameter.get('camunda:value')).to.equal('${resultStatus}');
      }));


      it('should <redo>', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        input.click();

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: '${resultStatus}' });

        expect(outputParameter).not.to.exist;
      }));

    });

  });


  describe('assign to process variable entry', function() {

    it('should display', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-outputParameter-0-assign-to-process-variable', container);

      expect(entry).to.exist;

      const input = findInput('text', entry);

      expect(input).to.exist;
      expect(input.value).to.equal('resultStatus');
    });


    it('should update', async function() {

      // given
      const task = await expectSelected('SimpleTask');

      // when
      const entry = findEntry('SimpleTask-outputParameter-0-assign-to-process-variable', container),
            input = findInput('text', entry);

      changeInput(input, 'bar');

      // then
      expect(input.value).to.equal('bar');

      const inputOutput = findExtension(task, 'camunda:InputOutput'),
            outputParameter = findOutputParameter(inputOutput, { source: '${resultStatus}' });

      expect(outputParameter.get('camunda:name')).to.equal('bar');
    });


    describe('validation', function() {

      it('empty name', async function() {

        // given
        const task = await expectSelected('SimpleTask');

        // when
        const entry = findEntry('SimpleTask-outputParameter-0-assign-to-process-variable', container),
              input = findInput('text', entry);

        changeInput(input, '');

        // then
        expect(input.value).to.equal('');

        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: '${resultStatus}' });

        expect(outputParameter.get('camunda:name')).to.equal('resultStatus');

        expectError(entry, 'Process variable name must not be empty.');
      });


      it('spaces', async function() {

        // given
        const task = await expectSelected('SimpleTask');

        // when
        const entry = findEntry('SimpleTask-outputParameter-0-assign-to-process-variable', container),
              input = findInput('text', entry);

        changeInput(input, 'foo bar');

        // then
        expect(input.value).to.equal('foo bar');

        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: '${resultStatus}' });

        expect(outputParameter.get('camunda:name')).to.equal('resultStatus');

        expectError(entry, 'Process variable name must not contain spaces.');
      });

    });

  });

});


// helpers //////////

function expectError(entry, message) {
  const errorMessage = domQuery('.bio-properties-panel-error', entry);

  const error = errorMessage && errorMessage.textContent;

  expect(error).to.equal(message);
}

function expectSelected(id) {
  return getBpmnJS().invoke(async function(elementRegistry, selection) {
    const element = elementRegistry.get(id);

    await act(() => {
      selection.select(element);
    });

    return element;
  });
}

function expandGroup(id, container) {
  const header = domQuery(`[data-group-id='${ id }'] .bio-properties-panel-group-header`, container);

  header.click();
}

function expandCollapsibleEntry(id, container) {
  const header = domQuery(`[data-entry-id='${ id }'] .bio-properties-panel-collapsible-entry-header`, container);

  header.click();
}

function findEntry(id, container) {
  return domQuery(`[data-entry-id='${ id }']`, container);
}

function findInput(type, container) {
  return domQuery(`input[type='${ type }']`, container);
}

function findOutputGroup(container) {
  return domQuery(`[data-group-id='${OUTPUT_GROUP_ID}']`, container);
}
