import TestContainer from 'mocha-test-container-support';

import {
  act,
  cleanup
} from '@testing-library/preact/pure';

import {
  clearBpmnJS,
  expectNoViolations,
  setBpmnJS,
  insertCoreStyles,
  insertBpmnStyles,
  withPropertiesPanel,
  enableLogging,
  getBpmnJS
} from 'test/TestHelper';

import {
  createKeyEvent
} from 'test/util/KeyEvents';

import {
  query as domQuery,
  queryAll as domQueryAll,
  domify
} from 'min-dom';

import Modeler from 'bpmn-js/lib/Modeler';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPropertiesProvider from 'src/provider/camunda-platform';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import {
  CreateAppendAnythingModule
} from 'bpmn-js-create-append-anything';

import {
  ZeebeVariableResolverModule
} from '@bpmn-io/variable-resolver';

import CamundaBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-platform';
import ZeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import CamundaModdle from 'camunda-bpmn-moddle/resources/camunda';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import ExamplePropertiesProvider from './extension/ExamplePropertiesProvider';

import ZeebeTooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';
import CamundaPlatformTooltipProvider from 'src/contextProvider/camunda-platform/TooltipProvider';

const singleStart = window.__env__ && window.__env__.SINGLE_START;

insertCoreStyles();
insertBpmnStyles();


describe('<BpmnPropertiesPanelRenderer>', function() {

  let modelerContainer;

  let propertiesContainer;

  afterEach(function() { return cleanup(); });

  let container;

  beforeEach(function() {
    modelerContainer = document.createElement('div');
    modelerContainer.classList.add('modeler-container');

    propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    container = TestContainer.get(this);

    container.appendChild(modelerContainer);
    container.appendChild(propertiesContainer);
  });

  async function createModeler(xml, options = {}, BpmnJS = Modeler) {
    const {
      shouldImport = true,
      additionalModules = [
        ZeebeBehaviorsModule,
        BpmnPropertiesPanel,
        BpmnPropertiesProvider,
        ZeebePropertiesProvider
      ],
      moddleExtensions = {
        zeebe: ZeebeModdle
      },
      description = {},
      tooltip = {},
      layout = {}
    } = options;

    clearBpmnJS();

    const modeler = new BpmnJS({
      container: modelerContainer,
      additionalModules,
      moddleExtensions,
      propertiesPanel: {
        parent: propertiesContainer,
        feelTooltipContainer: container,
        description,
        tooltip,
        layout
      },
      ...options
    });

    enableLogging && enableLogging(modeler, !!singleStart);

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
          ZeebeBehaviorsModule,
          BpmnPropertiesPanel,
          BpmnPropertiesProvider,
          ZeebePropertiesProvider,
          CreateAppendAnythingModule,
          ZeebeVariableResolverModule
        ],
        moddleExtensions: {
          zeebe: ZeebeModdle
        },
        tooltip: ZeebeTooltipProvider,
        propertiesPanel: {
          parent: propertiesContainer,
          getCompletions: (value, id, element) => {
            console.log('getCompletions', value, id);

            if (id !== 'targetProcessId') {
              return [];
            }

            if (value === '') {
              return [
                { value: 'foo', text: 'Foo Process' },
                { value: 'bar', text: 'Bar Process' },
                { value: 'foobar' }
              ];
            } else if ('foo'.includes(value)) {
              return [
                { value: 'foo', text: 'Foo Process' },
                { value: 'foobar' }
              ];
            } else if ('bar'.includes(value)) {
              return [
                { value: 'bar', text: 'Bar Process' },
                { value: 'foobar' }
              ];
            } else if ('foobar'.includes(value)) {
              return [
                { value: 'foobar' }
              ];
            }

            return [];
          }
        }
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
          CamundaBehaviorsModule,
          BpmnPropertiesPanel,
          BpmnPropertiesProvider,
          CamundaPropertiesProvider,
          CreateAppendAnythingModule
        ],
        moddleExtensions: {
          camunda: CamundaModdle
        },
        tooltip: CamundaPlatformTooltipProvider
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
          CamundaBehaviorsModule,
          BpmnPropertiesPanel,
          BpmnPropertiesProvider,
          CreateAppendAnythingModule
        ]
      }
    );

    // then
    expect(result.error).not.to.exist;
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


  describe('keyboard bindings (undo/redo)', function() {

    it('should NOT bind with keyboard binding deactivated', async function() {
      const diagramXml = require('test/fixtures/simple.bpmn').default;

      const { modeler } = await createModeler(diagramXml, {
        keyboard: {
          bind: false
        }
      });

      modeler.invoke(function(eventBus, elementRegistry, modeling) {

        // given
        modeling.updateLabel(elementRegistry.get('Task_1'), 'FOOBAR');

        const executeSpy = sinon.spy();
        const undoSpy = sinon.spy();

        eventBus.on('commandStack.execute', executeSpy);
        eventBus.on('commandStack.reverted', undoSpy);

        const panelParent = domQuery('.bio-properties-panel-container', propertiesContainer);

        // when
        panelParent.dispatchEvent(createKeyEvent('z', {
          ctrlKey: true
        }));

        // then
        // undo got executed
        expect(undoSpy).not.to.have.been.called;

        // but when
        panelParent.dispatchEvent(createKeyEvent('y', {
          ctrlKey: true
        }));

        // then
        // redo got executed
        expect(executeSpy).not.to.have.been.called;
      });

    });

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
      ZeebeBehaviorsModule,
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


    withPropertiesPanel('>=0.16')('should show error', async function() {

      // given
      const diagramXml = require('test/fixtures/simple.bpmn').default;

      let modeler;

      await act(async () => {
        const result = await createModeler(diagramXml);

        modeler = result.modeler;
      });

      const eventBus = modeler.get('eventBus');
      const elementRegistry = modeler.get('elementRegistry');
      const selection = modeler.get('selection');

      await act(() => {
        selection.select(elementRegistry.get('StartEvent_1'));

        eventBus.fire('propertiesPanel.setErrors', {
          errors: {
            name: 'foo'
          }
        });
      });

      // then
      const error = domQuery('div[data-entry-id="name"] .bio-properties-panel-error', propertiesContainer);

      expect(error).to.exist;
      expect(error.textContent).to.equal('foo');
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


  it('#setLayout', async function() {

    // given
    const newLayout = {
      myCustomLayout: 'foo'
    };
    const spy = sinon.spy();

    const container = domify('<div></div>');
    TestContainer.get(this).appendChild(container);

    const diagramXml = require('test/fixtures/service-task.bpmn').default;

    const { modeler } = await createModeler(diagramXml);

    const eventBus = modeler.get('eventBus');
    const propertiesPanel = modeler.get('propertiesPanel');

    eventBus.on('propertiesPanel.setLayout', spy);

    // when
    propertiesPanel.setLayout(newLayout);

    // then
    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith(sinon.match({ layout: newLayout }));
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


  // TODO: fix propertiesPanel.showEntry behavior
  describe.skip('showEntry integration', function() {

    it('should show and focus entry', async function() {

      // given
      const diagramXml = require('test/fixtures/service-task.bpmn').default;

      let modeler;

      await act(async () => {
        ({ modeler } = await createModeler(diagramXml, {
          propertiesPanel: {
            parent: propertiesContainer
          }
        }));
      });

      await act(() => {
        const elementRegistry = modeler.get('elementRegistry'),
              eventBus = modeler.get('eventBus'),
              selection = modeler.get('selection');

        // when
        selection.select(elementRegistry.get('ServiceTask_1'));

        eventBus.fire('propertiesPanel.showEntry', {
          id: 'name'
        });
      });

      // then
      expect(document.activeElement).to.exist;
      expect(document.activeElement.closest('.bio-properties-panel-entry')).to.exist;
      expect(document.activeElement.closest('.bio-properties-panel-entry').getAttribute('data-entry-id')).to.equal('name');
    });


    it('should show and focus entry (nested)', async function() {

      // given
      const diagramXml = require('test/fixtures/service-task.bpmn').default;

      let modeler;

      await act(async () => {
        ({ modeler } = await createModeler(diagramXml, {
          propertiesPanel: {
            parent: propertiesContainer
          }
        }));
      });

      await act(() => {
        const elementRegistry = modeler.get('elementRegistry'),
              eventBus = modeler.get('eventBus'),
              selection = modeler.get('selection');

        // when
        selection.select(elementRegistry.get('ServiceTask_1'));

        eventBus.fire('propertiesPanel.showEntry', {
          id: 'ServiceTask_1-input-0-target'
        });
      });

      // then
      expect(document.activeElement).to.exist;
      expect(document.activeElement.closest('.bio-properties-panel-entry')).to.exist;
      expect(document.activeElement.closest('.bio-properties-panel-entry').getAttribute('data-entry-id')).to.equal('ServiceTask_1-input-0-target');
    });

  });


  describe('feel popup', function() {

    withPropertiesPanel('>=3.5')('should render feel popup in given container', async function() {

      // given
      const diagramXml = require('test/fixtures/service-task.bpmn').default;

      let modeler;

      await act(async () => {
        ({ modeler } = await createModeler(diagramXml, {
          propertiesPanel: {
            parent: propertiesContainer,
            feelPopupContainer: container
          }
        }));
      });

      await act(() => {
        const elementRegistry = modeler.get('elementRegistry'),
              selection = modeler.get('selection');

        selection.select(elementRegistry.get('ServiceTask_1'));
      });

      // when
      await triggerPopupOpen('ServiceTask_1-input-0-source', container);

      const feelPopup = getFeelPopupElement(container);

      // then
      expect(feelPopup).to.exist;
      expect(feelPopup.parentNode).to.eql(container);
    });


    it('should render links', async function() {

      // given
      const diagramXml = require('test/fixtures/service-task.bpmn').default;

      let modeler;

      await act(async () => {
        ({ modeler } = await createModeler(diagramXml, {
          propertiesPanel: {
            parent: propertiesContainer,
            feelPopupContainer: container,
            getFeelPopupLinks: (type) => {
              if (type === 'feel') {
                return [
                  { href: 'https://foo.com/', title: 'Foo' },
                  { href: 'https://bar.com/', title: 'Bar' }
                ];
              }

              return [];
            }
          }
        }));
      });

      await act(() => {
        const elementRegistry = modeler.get('elementRegistry'),
              selection = modeler.get('selection');

        selection.select(elementRegistry.get('ServiceTask_1'));
      });

      // when
      await triggerPopupOpen('ServiceTask_1-input-0-source', container);

      const feelPopup = getFeelPopupElement(container);

      // then
      expect(feelPopup).to.exist;

      const links = domQueryAll('.bio-properties-panel-feel-popup__title-link', container);

      expect(links.length).to.equal(2);

      expect(links[0].href).to.equal('https://foo.com/');
      expect(links[0].textContent).to.equal('Foo');

      expect(links[1].href).to.equal('https://bar.com/');
      expect(links[1].textContent).to.equal('Bar');
    });


    describe('module support', function() {

      let modeler;

      beforeEach(async function() {

        const diagramXml = require('test/fixtures/service-task.bpmn').default;

        await act(async () => {
          ({ modeler } = await createModeler(diagramXml, {
            propertiesPanel: {
              parent: propertiesContainer,
              feelPopupContainer: container
            }
          }));
        });

        await act(() => {
          const elementRegistry = modeler.get('elementRegistry'),
                selection = modeler.get('selection');

          selection.select(elementRegistry.get('ServiceTask_1'));
        });
      });


      withPropertiesPanel('>=3.7')('should listen on <feelPopup.opened>', async function() {

        // given
        const spy = sinon.spy();

        const eventBus = modeler.get('eventBus');

        // assume
        eventBus.fire('propertiesPanel.showEntry', {
          id: 'ServiceTask_1-input-0-source'
        });

        eventBus.on('feelPopup.opened', spy);

        // when
        await triggerPopupOpen('ServiceTask_1-input-0-source', container);

        // then
        expect(getFeelPopupElement(container)).to.exist;

        expect(spy).to.have.been.calledOnce;
      });


      withPropertiesPanel('>=3.7')('should listen on <feelPopup.closed>', async function() {

        // given
        const spy = sinon.spy();

        const eventBus = modeler.get('eventBus');

        eventBus.on('feelPopup.closed', spy);

        // assume
        await showEntry('ServiceTask_1-input-0-source');

        await triggerPopupOpen('ServiceTask_1-input-0-source', container);

        // assume
        expect(getFeelPopupElement(container)).to.exist;

        await triggerPopupClose(container);

        // then
        expect(spy).to.have.been.calledOnce;
      });


      withPropertiesPanel('>=3.7')('#open', async function() {

        // given
        const feelPopup = modeler.get('feelPopup');

        // when
        await act(() => {
          feelPopup.open(
            'ServiceTask_1-input-0-source',
            { type: 'feel' },
            document.body
          );
        });

        // then
        expect(getFeelPopupElement(container)).to.exist;
      });


      withPropertiesPanel('>=3.7')('#close', async function() {

        // given
        const feelPopup = modeler.get('feelPopup');

        await act(() => {
          feelPopup.open(
            'ServiceTask_1-input-0-source',
            { type: 'feel' },
            document.body
          );
        });

        // assume
        expect(getFeelPopupElement(container)).to.exist;

        // when
        await act(() => {
          feelPopup.close();
        });

        // then
        expect(getFeelPopupElement(container)).to.not.exist;
      });


      withPropertiesPanel('>=3.7')('#isOpen', async function() {

        // given
        const feelPopup = modeler.get('feelPopup');

        await act(() => {
          feelPopup.open(
            'ServiceTask_1-input-0-source',
            { type: 'feel' },
            document.body
          );
        });

        // assume
        expect(feelPopup.isOpen()).to.be.true;

        // when
        await act(() => {
          feelPopup.close();
        });

        // then
        expect(feelPopup.isOpen()).to.be.false;
      });
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given

      // (0) this test needs some time
      this.timeout(5000);

      const diagramXml = require('test/fixtures/a11y.bpmn').default;

      // (1) ensure fully opened properties panel
      let modeler;
      await act(async () => {
        const result = await createModeler(
          diagramXml,
          {
            additionalModules: [
              CamundaBehaviorsModule,
              BpmnPropertiesPanel,
              BpmnPropertiesProvider,
              CamundaPropertiesProvider
            ],
            moddleExtensions: {
              camunda: CamundaModdle
            },
            layout: {
              groups: {
                'general': { open: true },
                'documentation': { open: true },
                'multiInstance': { open: true },
                'CamundaPlatform__Implementation': { open: true },
                'CamundaPlatform__AsynchronousContinuations': { open: true },
                'CamundaPlatform__JobExecution': { open: true },
                'CamundaPlatform__Input': { open: true },
                'CamundaPlatform__Output': { open: true },
                'CamundaPlatform__ConnectorInput': { open: true },
                'CamundaPlatform__ConnectorOutput': { open: true },
                'CamundaPlatform__ExecutionListener': { open: true },
                'CamundaPlatform__ExtensionProperties': { open: true },
                'CamundaPlatform__FieldInjection': { open: true }
              }
            }
          }
        );
        modeler = result.modeler;
      });

      const selection = modeler.get('selection');
      const elementRegistry = modeler.get('elementRegistry');

      await act(() => selection.select(elementRegistry.get('ServiceTask_1')));

      // (2) open nested lists
      const input1 = domQuery('[data-entry-id="ServiceTask_1-inputParameter-0"]', propertiesContainer);
      const inputHeader = domQuery('.bio-properties-panel-collapsible-entry-header', input1);
      const inputMapHeader = domQuery('.bio-properties-panel-list-entry-header', input1);
      const entry = domQuery('[data-entry-id="ServiceTask_1-inputParameter-0-mapEntry-0"]', input1);
      const entryHeader = domQuery('.bio-properties-panel-collapsible-entry-header', entry);

      await act(() => {
        inputHeader.click();
        inputMapHeader.click();
        entryHeader.click();
      });

      // when
      await expectNoViolations(propertiesContainer);
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

function getFeelPopupElement(container) {
  return domQuery('.bio-properties-panel-feel-popup', container);
}

function triggerPopupOpen(id, container) {
  const openButton = container.querySelector(`[data-entry-id="${id}"] .bio-properties-panel-open-feel-popup`);

  expect(openButton, `<${id}> popup open el`).to.exist;

  return act(() => openButton.click());
}

function triggerPopupClose(container) {
  const closeButton = domQuery('.bio-properties-panel-popup__close', container);

  expect(closeButton, 'popup close button').to.exist;

  return act(() => closeButton.click());
}

function showEntry(id) {

  return act(() => getBpmnJS().invoke(eventBus => {
    eventBus.fire('propertiesPanel.showEntry', {
      id
    });
  }));
}