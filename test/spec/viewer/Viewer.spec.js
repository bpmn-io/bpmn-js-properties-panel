import { expect } from 'chai';
import * as sinon from 'sinon';
import TestContainer from 'mocha-test-container-support';

import {
  act,
  cleanup
} from '@testing-library/preact/pure';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';
import CamundaModdle from 'camunda-bpmn-moddle/resources/camunda';

import {
  BpmnPropertiesPanelViewerModule,
  BpmnPropertiesProviderViewerModule,
  CamundaPlatformPropertiesProviderViewerModule,
  ZeebePropertiesProviderViewerModule
} from 'src';

import {
  insertBpmnStyles,
  insertCoreStyles
} from 'test/TestHelper';

import zeebeDiagram from './zeebe.bpmn';
import camundaPlatformDiagram from './camunda-platform.bpmn';

insertCoreStyles();
insertBpmnStyles();

/**
 * Anything a user may interact with to modify a value, or to trigger an action.
 */
const EDITABLE_CONTROLS = [
  'input:not(:disabled)',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
  '.bio-properties-panel-feel-icon:not(:disabled):not([title="FEEL expression is mandatory"])',
  '[contenteditable="true"]'
];

const ACTIONS = [
  '.bio-properties-panel-add-entry',
  '.bio-properties-panel-remove-entry',
  '.bio-properties-panel-open-feel-popup',
  '.bio-properties-panel-group-entries button:not(:disabled)'
];


describe('viewer', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  afterEach(function() { return cleanup(); });


  describe('modules', function() {

    let viewer;

    beforeEach(async function() {
      viewer = await createViewer(container, zeebeDiagram, {
        modules: [
          BpmnPropertiesPanelViewerModule,
          BpmnPropertiesProviderViewerModule
        ]
      });
    });

    afterEach(function() { viewer.destroy(); });


    it('should not require editing services', function() {

      // then
      expect(viewer.get('propertiesPanel')).to.exist;

      expect(viewer.get('commandStack', false)).not.to.exist;
      expect(viewer.get('modeling', false)).not.to.exist;
      expect(viewer.get('bpmnFactory', false)).not.to.exist;
      expect(viewer.get('debounceInput', false)).not.to.exist;
    });

  });


  describe('rendering', function() {

    [
      {
        name: 'zeebe',
        diagram: zeebeDiagram,
        moddleExtensions: { zeebe: ZeebeModdle },
        modules: [
          BpmnPropertiesProviderViewerModule,
          ZeebePropertiesProviderViewerModule
        ]
      },
      {
        name: 'camunda platform',
        diagram: camundaPlatformDiagram,
        moddleExtensions: { camunda: CamundaModdle },
        modules: [
          BpmnPropertiesProviderViewerModule,
          CamundaPlatformPropertiesProviderViewerModule
        ]
      }
    ].forEach(function({ name, diagram, moddleExtensions, modules }) {

      describe(name, function() {

        let viewer, panelContainer, consoleError;

        beforeEach(async function() {
          consoleError = sinon.spy(console, 'error');

          viewer = await createViewer(container, diagram, {
            moddleExtensions,
            modules: [
              BpmnPropertiesPanelViewerModule,
              ...modules
            ]
          });

          panelContainer = document.createElement('div');
          container.appendChild(panelContainer);

          await act(() => viewer.get('propertiesPanel').attachTo(panelContainer));
        });

        afterEach(function() {
          consoleError.restore();

          viewer.destroy();
        });


        it('should render every element read-only', async function() {

          // given
          const selection = viewer.get('selection'),
                elements = viewer.get('elementRegistry').filter(element => element.type !== 'label');

          expect(elements.length).to.be.above(15);

          let controlsCount = 0;

          // when
          for (const element of elements) {
            await act(() => selection.select(element));

            await expandAll(panelContainer);

            // then
            const id = element.id;

            expect(domQuery('.bio-properties-panel-group', panelContainer), `groups of <${id}>`).to.exist;

            expect(
              domQueryAll(EDITABLE_CONTROLS.join(', '), panelContainer),
              `editable controls of <${id}>`
            ).to.be.empty;

            expect(
              domQueryAll(ACTIONS.join(', '), panelContainer),
              `actions of <${id}>`
            ).to.be.empty;

            controlsCount += domQueryAll('input, textarea, select, .cm-content', panelContainer).length;
          }

          // assume we actually looked at entries
          expect(controlsCount).to.be.above(100);

          expect(consoleError).not.to.have.been.called;
        });


        it('should not validate', async function() {

          // given
          const selection = viewer.get('selection'),
                elementRegistry = viewer.get('elementRegistry'),
                element = elementRegistry.get('ServiceTask_1');

          // an id that is neither a valid XML ID nor unique
          element.businessObject.id = '1 invalid';

          // when
          await act(() => selection.select(element));

          await expandAll(panelContainer);

          // then
          const idInput = domQuery('[data-entry-id="id"] input', panelContainer);

          expect(idInput.value).to.eql('1 invalid');

          expect(
            domQueryAll('.has-error, .has-warning, .bio-properties-panel-error', panelContainer)
          ).to.be.empty;

          expect(consoleError).not.to.have.been.called;
        });


        it('should render multiple selection', async function() {

          // given
          const elementRegistry = viewer.get('elementRegistry');

          // when
          await act(() => viewer.get('selection').select([
            elementRegistry.get('ServiceTask_1'),
            elementRegistry.get('Gateway_1')
          ]));

          // then
          expect(domQuery('.bio-properties-panel-placeholder', panelContainer)).to.exist;
          expect(consoleError).not.to.have.been.called;
        });


        it('should render list items', async function() {

          // given
          const element = viewer.get('elementRegistry').get('ServiceTask_1');

          // when
          await act(() => viewer.get('selection').select(element));
          await expandAll(panelContainer);

          // then
          expect(domQueryAll('.bio-properties-panel-collapsible-entry', panelContainer)).not.to.be.empty;
        });

      });

    });

  });

});


// helpers //////////

/**
 * @param {HTMLElement} container
 * @param {Object} options
 * @param {Array} options.modules
 * @param {Object} [options.moddleExtensions]
 *
 * @return {Promise<NavigatedViewer>}
 */
async function createViewer(container, diagram, { modules, moddleExtensions }) {
  const viewerContainer = document.createElement('div');
  viewerContainer.style.height = '300px';

  container.appendChild(viewerContainer);

  const viewer = new NavigatedViewer({
    container: viewerContainer,
    additionalModules: modules,
    moddleExtensions
  });

  await act(() => viewer.importXML(diagram));

  return viewer;
}

/**
 * Expand all groups and list items, so that their entries are rendered.
 */
async function expandAll(panelContainer) {
  const headers = domQueryAll(
    '.bio-properties-panel-group-header:not(.open), .bio-properties-panel-collapsible-entry-header:not(.open)',
    panelContainer
  );

  for (const header of headers) {
    await act(() => header.click());
  }
}
