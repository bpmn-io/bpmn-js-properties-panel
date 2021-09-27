import TestContainer from 'mocha-test-container-support';

import {
  act,
  cleanup
} from '@testing-library/preact/pure';

import {
  clearBpmnJS,
  setBpmnJS,
  insertCoreStyles,
  insertBpmnStyles
} from 'test/TestHelper';

import {
  query as domQuery,
  domify
} from 'min-dom';

import Modeler from 'bpmn-js/lib/Modeler';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPropertiesProvider from 'src/provider/camunda-platform';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import CamundaModdle from 'camunda-bpmn-moddle/resources/camunda';
import CamundaModdleExtension from 'camunda-bpmn-moddle/lib';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';
import ZeebeModdleExtension from 'zeebe-bpmn-moddle/lib';

import ExamplePropertiesProvider from './extension/ExamplePropertiesProvider';

const singleStart = window.__env__ && window.__env__.SINGLE_START;

insertCoreStyles();
insertBpmnStyles();


describe('<BpmnPropertiesPanelRenderer>', function() {

  let modelerContainer;

  let propertiesContainer;

  afterEach(() => cleanup());

  beforeEach(function() {
    modelerContainer = document.createElement('div');
    modelerContainer.classList.add('modeler-container');

    propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    const container = TestContainer.get(this);

    container.appendChild(modelerContainer);
    container.appendChild(propertiesContainer);
  });

  async function createModeler(xml, options = {}) {
    const {
      shouldImport = true,
      additionalModules = [
        ZeebeModdleExtension,
        BpmnPropertiesPanel,
        BpmnPropertiesProvider,
        ZeebePropertiesProvider
      ],
      moddleExtensions = {
        zeebe: ZeebeModdle
      }
    } = options;

    clearBpmnJS();

    const modeler = new Modeler({
      container: modelerContainer,
      keyboard: {
        bindTo: document
      },
      additionalModules,
      moddleExtensions,
      propertiesPanel: {
        parent: propertiesContainer
      },
      ...options
    });

    modeler.on('commandStack.changed', async () => {
      const { xml } = await modeler.saveXML({ format: true });

      console.log(xml);
    });

    setBpmnJS(modeler);

    if (!shouldImport) {
      return { modeler };
    }

    try {
      const result = await modeler.importXML(xml);

      return { error: null, warnings: result.warnings, modeler: modeler };
    } catch (err) {
      return { error: err, warnings: err.warnings, modeler: modeler };
    }
  }

  ((singleStart && singleStart === 'cloud') ? it.only : it)('should import simple process (cloud)', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    const result = await createModeler(
      diagramXml,
      {
        additionalModules: [
          ZeebeModdleExtension,
          BpmnPropertiesPanel,
          BpmnPropertiesProvider,
          ZeebePropertiesProvider
        ],
        moddleExtensions: {
          zeebe: ZeebeModdle
        }
      }
    );

    // then
    expect(result.error).not.to.exist;
  });


  ((singleStart && singleStart === 'platform') ? it.only : it)('should import simple process (platform)', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    const result = await createModeler(
      diagramXml,
      {
        additionalModules: [
          CamundaModdleExtension,
          BpmnPropertiesPanel,
          BpmnPropertiesProvider,
          CamundaPropertiesProvider
        ],
        moddleExtensions: {
          camunda: CamundaModdle
        }
      }
    );

    // then
    expect(result.error).not.to.exist;
  });


  ((singleStart && singleStart === 'bpmn') ? it.only : it)('should import simple process (bpmn)', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    const result = await createModeler(
      diagramXml,
      {
        additionalModules: [
          CamundaModdleExtension,
          BpmnPropertiesPanel,
          BpmnPropertiesProvider
        ]
      }
    );

    // then
    expect(result.error).not.to.exist;
  });


  it('should render properties panel when root element was added', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    await createModeler(diagramXml);

    // then
    expect(domQuery('.bio-properties-panel', propertiesContainer)).to.exist;
  });


  it('should remove properties panel when root element was deleted', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    const { modeler } = await createModeler(diagramXml);

    const eventBus = modeler.get('eventBus');

    // when
    eventBus.fire('root.removed');

    // then
    expect(domQuery('.bio-properties-panel', propertiesContainer)).to.not.exist;
  });


  it('should allow providing custom entries', async function() {

    // given
    const diagramXml = require('test/fixtures/service-task.bpmn').default;

    const modules = [
      ZeebeModdleExtension,
      BpmnPropertiesPanel,
      BpmnPropertiesProvider,
      ZeebePropertiesProvider,
      ExamplePropertiesProvider
    ];

    // when
    await createModeler(diagramXml, {
      additionalModules: modules
    });

    // then
    expect(getGroup(propertiesContainer, 'foo-group')).to.exist;
  });


  it('should ignore implicit root', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    const { modeler } = await createModeler(diagramXml, {
      shouldImport: false,
      propertiesPanel: {}
    });

    const canvas = modeler.get('canvas');
    const rootElement = canvas.getRootElement();

    // assume
    expect(rootElement.isImplicit).to.be.true;

    // when
    const propertiesPanel = modeler.get('propertiesPanel');
    propertiesPanel.attachTo(propertiesContainer);
    propertiesPanel._render(rootElement);

    // then
    expect(domQuery('.bio-properties-panel', propertiesContainer)).to.not.exist;
  });


  it('should ignore implicit root - legacy', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    const { modeler } = await createModeler(diagramXml, {
      shouldImport: false,
      propertiesPanel: {}
    });

    const implicitRootElement = {
      id: '__implicitroot',
      children: []
    };

    // when
    const propertiesPanel = modeler.get('propertiesPanel');
    propertiesPanel.attachTo(propertiesContainer);
    propertiesPanel._render(implicitRootElement);

    // then
    expect(domQuery('.bio-properties-panel', propertiesContainer)).to.not.exist;
  });


  describe('integration', function() {

    it('should ensure creating + importing -> attaching works', async function() {

      // given
      const diagramXml = require('test/fixtures/simple.bpmn').default;

      // when
      const { modeler } = await createModeler(diagramXml, {
        propertiesPanel: {}
      });

      // assume
      expect(domQuery('.bio-properties-panel', propertiesContainer)).to.not.exist;

      // and when
      const propertiesPanel = modeler.get('propertiesPanel');
      propertiesPanel.attachTo(propertiesContainer);

      // then
      expect(domQuery('.bio-properties-panel', propertiesContainer)).to.exist;
    });


    it('should ensure creating + attaching -> importing works', async function() {

      // given
      const diagramXml = require('test/fixtures/simple.bpmn').default;

      // when
      const { modeler } = await createModeler(null, {
        shouldImport: false,
        propertiesPanel: {
          parent: propertiesContainer
        }
      });

      // assume
      expect(domQuery('.bio-properties-panel', propertiesContainer)).to.not.exist;

      // and when
      await modeler.importXML(diagramXml);

      // then
      expect(domQuery('.bio-properties-panel', propertiesContainer)).to.exist;
    });


    it('should ensure creating -> no import -> attaching -> import works', async function() {

      // given
      const diagramXml = require('test/fixtures/simple.bpmn').default;

      const { modeler } = await createModeler(null, {
        shouldImport: false,
        propertiesPanel: {}
      });

      const propertiesPanel = modeler.get('propertiesPanel');

      // when
      propertiesPanel.attachTo(propertiesContainer);

      // assume
      expect(domQuery('.bio-properties-panel', propertiesContainer)).to.not.exist;

      // and when
      await modeler.importXML(diagramXml);

      // then
      expect(domQuery('.bio-properties-panel', propertiesContainer)).to.exist;
    });


    it('should keep state during detach and attach', async function() {

      // given
      const diagramXml = require('test/fixtures/simple.bpmn').default;

      let modeler;
      await act(async () => {
        const result = await createModeler(diagramXml);
        modeler = result.modeler;
      });

      const elementRegistry = modeler.get('elementRegistry');
      const selection = modeler.get('selection');
      const propertiesPanel = modeler.get('propertiesPanel');

      await act(() => selection.select(elementRegistry.get('StartEvent_1')));

      // assume
      expect(getHeaderName(propertiesContainer)).to.eql('start');

      // when
      propertiesPanel.detach();
      propertiesPanel.attachTo(propertiesContainer);

      // then
      expect(getHeaderName(propertiesContainer)).to.eql('start');
    });

  });


  it('#attachTo', async function() {

    // given
    const container = domify('<div></div>');
    TestContainer.get(this).appendChild(container);

    const modules = [
      BpmnPropertiesPanel,
      BpmnPropertiesProvider
    ];

    const diagramXml = require('test/fixtures/simple.bpmn').default;

    const { modeler } = await createModeler(diagramXml, {
      propertiesPanel: {},
      additionalModules: modules
    });

    const propertiesPanel = modeler.get('propertiesPanel');

    // when
    propertiesPanel.attachTo(container);

    // then
    expect(domQuery('.bio-properties-panel', container)).to.exist;
  });


  it('#detach', async function() {

    // given
    const container = domify('<div></div>');
    TestContainer.get(this).appendChild(container);

    const modules = [
      BpmnPropertiesPanel,
      BpmnPropertiesProvider
    ];

    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    const { modeler } = await createModeler(diagramXml, {
      propertiesPanel: {},
      additionalModules: modules
    });

    const propertiesPanel = modeler.get('propertiesPanel');

    propertiesPanel.attachTo(container);

    // when
    propertiesPanel.detach();

    // then
    expect(domQuery('.bio-properties-panel', container)).to.not.exist;
  });


  describe('event emitting', function() {

    it('should emit <propertiesPanel.attach>', async function() {

      // given
      const spy = sinon.spy();

      const container = domify('<div></div>');
      TestContainer.get(this).appendChild(container);

      const diagramXml = require('test/fixtures/service-task.bpmn').default;

      const { modeler } = await createModeler(diagramXml);

      const eventBus = modeler.get('eventBus');
      const propertiesPanel = modeler.get('propertiesPanel');

      eventBus.on('propertiesPanel.attach', spy);

      // when
      propertiesPanel.attachTo(container);

      // then
      expect(spy).to.have.been.calledOnce;
    });


    it('should emit <propertiesPanel.detach>', async function() {

      // given
      const spy = sinon.spy();

      const diagramXml = require('test/fixtures/service-task.bpmn').default;

      const { modeler } = await createModeler(diagramXml);

      const eventBus = modeler.get('eventBus');
      const propertiesPanel = modeler.get('propertiesPanel');

      eventBus.on('propertiesPanel.detach', spy);

      // when
      propertiesPanel.detach();

      // then
      expect(spy).to.have.been.calledOnce;
    });


    it('should emit <propertiesPanel.rendered>', async function() {

      // given
      const spy = sinon.spy();

      const diagramXml = require('test/fixtures/service-task.bpmn').default;

      const { modeler } = await createModeler(diagramXml);

      const eventBus = modeler.get('eventBus');
      const propertiesPanel = modeler.get('propertiesPanel');

      eventBus.on('propertiesPanel.rendered', spy);

      // when
      propertiesPanel._render();

      // then
      expect(spy).to.have.been.calledOnce;
    });


    it('should NOT emit <propertiesPanel.rendered> on attach', async function() {

      // given
      const spy = sinon.spy();

      const container = domify('<div></div>');
      TestContainer.get(this).appendChild(container);

      const diagramXml = require('test/fixtures/service-task.bpmn').default;

      const { modeler } = await createModeler(diagramXml);

      const eventBus = modeler.get('eventBus');
      const propertiesPanel = modeler.get('propertiesPanel');

      eventBus.on('propertiesPanel.rendered', spy);

      // when
      propertiesPanel.attachTo(container);

      // then
      expect(spy).to.not.have.been.called;
    });


    it('should emit <propertiesPanel.destroyed>', async function() {

      // given
      const spy = sinon.spy();

      const diagramXml = require('test/fixtures/service-task.bpmn').default;

      const { modeler } = await createModeler(diagramXml);

      const eventBus = modeler.get('eventBus');
      const propertiesPanel = modeler.get('propertiesPanel');

      eventBus.on('propertiesPanel.destroyed', spy);

      // when
      propertiesPanel._destroy();

      // then
      expect(spy).to.have.been.calledOnce;
    });

  });

});


// helpers /////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getHeaderName(container) {
  return domQuery('.bio-properties-panel-header-label', container).innerText;
}
