import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  query as domQuery
} from 'min-dom';

import coreModule from 'bpmn-js/lib/core';
import modelingModule from 'bpmn-js/lib/features/modeling';
import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import BpmnPropertiesPanel from 'src/render';
import elementTemplatesModule from 'src/provider/element-templates';

import diagramXML from './fixtures/template-props.bpmn';
import templates from './fixtures/template-props.json';


describe('provider/element-templates - TemplateProps', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    container,
    modules: [
      BpmnPropertiesPanel,
      coreModule,
      elementTemplatesModule,
      modelingModule
    ],
    moddleExtensions: {
      camunda: camundaModdlePackage
    },
    debounceInput: false,
    elementTemplates: templates
  }));


  describe('name', function() {

    it('should display template name', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        const element = elementRegistry.get('Template_2');
        const template = elementTemplates.get(element);

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-name"]', container);

        expect(entry).to.exist;
        expect(entry.children[1].textContent).to.eql(template.name);
      })
    );


    it('should display for an outdated template', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        const element = elementRegistry.get('Template_3');
        const template = elementTemplates.get(element);

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-name"]', container);

        expect(entry).to.exist;
        expect(entry.children[1].textContent).to.eql(template.name);
      })
    );


    it('should NOT display if no template is applied', inject(
      async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Template_1');

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-name"]', container);

        expect(entry).not.to.exist;
      })
    );
  });


  describe('version', function() {

    it('should display template version according to metadata', inject(
      async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Template_2');

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-version"]', container);

        expect(entry).to.exist;
        expect(entry.children[1].textContent).to.eql('02.01.2000');
      })
    );


    it('should display for an outdated template', inject(
      async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Template_3');

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-version"]', container);

        expect(entry).to.exist;
        expect(entry.children[1].textContent).to.eql('01.01.2000');
      })
    );


    it('should display template bare version if metadata is missing', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        const element = elementRegistry.get('TemplateWithoutMetadata');
        const template = elementTemplates.get(element);

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-version"]', container);

        expect(entry).to.exist;
        expect(entry.children[1].textContent).to.eql(String(template.version));
      })
    );


    it('should NOT display if version is missing', inject(
      async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('TemplateWithoutVersion');

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-version"]', container);

        expect(entry).not.to.exist;
      })
    );


    it('should NOT display if no template is applied', inject(
      async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Template_1');

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-version"]', container);

        expect(entry).not.to.exist;
      })
    );
  });


  describe('description', function() {

    it('should display template description', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        const element = elementRegistry.get('Template_2');
        const template = elementTemplates.get(element);

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-description"]', container);

        expect(entry).to.exist;
        expect(entry.children[1].textContent).to.eql(template.description);
      })
    );


    it('should display for an outdated template', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        const element = elementRegistry.get('Template_3');
        const template = elementTemplates.get(element);

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-description"]', container);

        expect(entry).to.exist;
        expect(entry.children[1].textContent).to.eql(template.description);
      })
    );


    it('should NOT display if description is missing', inject(
      async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('TemplateWithoutDescription');

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-description"]', container);

        expect(entry).not.to.exist;
      })
    );


    it('should NOT display if no template is applied', inject(
      async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Template_1');

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const entry = domQuery('[data-group-id="group-template"] [data-entry-id="template-description"]', container);

        expect(entry).not.to.exist;
      })
    );
  });
});
