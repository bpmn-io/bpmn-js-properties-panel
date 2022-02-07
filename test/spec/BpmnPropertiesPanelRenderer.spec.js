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

import LegacyModeler from 'bpmn-js-legacy/lib/Modeler';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPropertiesProvider from 'src/provider/camunda-platform';
import ZeebePropertiesProvider from 'src/provider/zeebe';
import ElementTemplatesPropertiesProvider from 'src/provider/element-templates';
import CloudElementTemplatesPropertiesProvider from 'src/provider/cloud-element-templates';

import CamundaModdle from 'camunda-bpmn-moddle/resources/camunda';
import CamundaModdleExtension from 'camunda-bpmn-moddle/lib';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';
import ZeebeModdleExtension from 'zeebe-bpmn-moddle/lib';

import ExamplePropertiesProvider from './extension/ExamplePropertiesProvider';

import DescriptionProvider from 'src/contextProvider/zeebe/DescriptionProvider';

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

  async function createModeler(xml, options = {}, BpmnJS = Modeler) {
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
      },
      description = {}
    } = options;

    clearBpmnJS();

    const modeler = new BpmnJS({
      container: modelerContainer,
      keyboard: {
        bindTo: document
      },
      additionalModules,
      moddleExtensions,
      propertiesPanel: {
        parent: propertiesContainer,
        description
      },
      ...options
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


  (singleStart === 'cloud' ? it.only : it)('should import simple process (cloud)', async function() {

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
        },
        description: DescriptionProvider
      }
    );

    // then
    expect(result.error).not.to.exist;
  });


  (singleStart === 'platform' ? it.only : it)('should import simple process (platform)', async function() {

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


  (singleStart === 'bpmn' ? it.only : it)('should import simple process (bpmn)', async function() {

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


  (singleStart === 'templates' ? it.only : it)('should import simple process (templates)', async function() {

    // given
    const diagramXml = require('test/spec/provider/element-templates/fixtures/complex.bpmn').default;

    const elementTemplates = require('test/spec/provider/element-templates/fixtures/complex.json');

    // when
    const result = await createModeler(
      diagramXml,
      {
        additionalModules: [
          CamundaModdleExtension,
          BpmnPropertiesPanel,
          BpmnPropertiesProvider,
          ElementTemplatesPropertiesProvider
        ],
        moddleExtensions: {
          camunda: CamundaModdle
        },
        elementTemplates
      }
    );

    // then
    expect(result.error).not.to.exist;
  });


  (singleStart === 'cloud-templates' ? it.only : it)('should import simple process (cloud-templates)', async function() {

    // given
    const diagramXml = require('test/spec/provider/cloud-element-templates/fixtures/complex.bpmn').default;

    const elementTemplates = require('test/spec/provider/cloud-element-templates/fixtures/complex.json');

    // when
    const result = await createModeler(
      diagramXml,
      {
        additionalModules: [
          ZeebeModdleExtension,
          BpmnPropertiesPanel,
          BpmnPropertiesProvider,
          CloudElementTemplatesPropertiesProvider
        ],
        moddleExtensions: {
          zeebe: ZeebeModdle
        },
        elementTemplates
      }
    );

    // then
    expect(result.error).not.to.exist;
  });


  describe('bpmn-js@8', function() {

    it('should import simple process (cloud)', async function() {

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
          },
          description: DescriptionProvider
        },
        LegacyModeler
      );

      // then
      expect(result.error).not.to.exist;
    });


    it('should import simple process (platform)', async function() {

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
        },
        LegacyModeler
      );

      // then
      expect(result.error).not.to.exist;
    });


    it('should import simple process (bpmn)', async function() {

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
        },
        LegacyModeler
      );

      // then
      expect(result.error).not.to.exist;
    });


    it('should import simple process (templates)', async function() {

      // given
      const diagramXml = require('test/spec/provider/element-templates/fixtures/complex.bpmn').default;

      const elementTemplates = require('test/spec/provider/element-templates/fixtures/complex.json');

      // when
      const result = await createModeler(
        diagramXml,
        {
          additionalModules: [
            CamundaModdleExtension,
            BpmnPropertiesPanel,
            BpmnPropertiesProvider,
            ElementTemplatesPropertiesProvider
          ],
          moddleExtensions: {
            camunda: CamundaModdle
          },
          elementTemplates
        },
        LegacyModeler
      );

      // then
      expect(result.error).not.to.exist;
    });

  });


  it('should attach on diagram.init', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    await createModeler(diagramXml);

    // then
    expect(domQuery('.bio-properties-panel-container', propertiesContainer)).to.exist;
  });


  it('should detach on diagram.destroy', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    const { modeler } = await createModeler(diagramXml);

    const eventBus = modeler.get('eventBus');

    // when
    eventBus.fire('diagram.destroy');

    // then
    expect(domQuery('.bio-properties-panel-container', propertiesContainer)).to.not.exist;
  });


  it('should render on root.added', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    await createModeler(diagramXml);

    // then
    expect(domQuery('.bio-properties-panel', propertiesContainer)).to.exist;
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


  describe('providers', function() {

    const diagramXML = require('test/fixtures/simple.bpmn').default;

    function inject(fn) {

      return async function() {
        const {
          modeler
        } = await createModeler(diagramXML, {
          additionalModules: [
            BpmnPropertiesPanel,
            BpmnPropertiesProvider
          ]
        });

        await modeler.invoke(fn);
      };
    }


    it('should ignore incompatible provider', inject(function(propertiesPanel) {

      // assume
      expect(propertiesPanel._getProviders()).to.have.length(1);

      // given
      const incompatibleProvider = {
        getTabs: function() {
          return [];
        }
      };

      // when
      propertiesPanel.registerProvider(incompatibleProvider);

      // then
      // incompatible provider was not added
      expect(propertiesPanel._getProviders()).to.have.length(1);
    }));

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


    it('should emit keyboard events for undo/redo when editing', async function() {

      // given
      const spy = sinon.spy();

      const diagramXml = require('test/fixtures/service-task.bpmn').default;

      const { modeler } = await createModeler(diagramXml);

      const eventBus = modeler.get('eventBus');
      const propertiesPanel = modeler.get('propertiesPanel');
      const keyboard = modeler.get('keyboard');
      const inputField = propertiesPanel._container.querySelector('input');

      eventBus.on('keyboard.keydown', 10000, spy);

      // when
      // select all
      keyboard._keyHandler({ key: 'a', ctrlKey: true, target: inputField, preventDefault: () => {} });

      // then
      // use browser default
      expect(spy).to.not.be.called;

      // when
      // undo/redo
      keyboard._keyHandler({ key: 'z', metaKey: true, target: inputField, preventDefault: () => {} });
      keyboard._keyHandler({ key: 'y', ctrlKey: true, target: inputField, preventDefault: () => {} });

      // then
      // fire events
      expect(spy).to.have.been.calledTwice;
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
