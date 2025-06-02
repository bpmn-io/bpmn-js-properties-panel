import {
  act,
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  Injector as injectorMock,
  ElementRegistry as elementRegistryMock,
  EventBus as eventBusMock,
  getProviders as getProvidersMock
} from './mocks';

import {
  insertCoreStyles,
  withPropertiesPanel
} from 'test/TestHelper';

import BpmnPropertiesPanel from 'src/render/BpmnPropertiesPanel';

insertCoreStyles();

const noop = () => {};

const noopElement = {
  id: 'foo',
  type: 'foo:bar',
  businessObject: {
    get: noop
  }
};


describe('<BpmnPropertiesPanel>', function() {

  let container,
      parent;

  beforeEach(function() {
    parent = TestContainer.get(this);

    container = document.createElement('div');

    container.classList.add('properties-container');

    container.style.position = 'absolute';
    container.style.right = '0';

    parent.appendChild(container);
  });


  it('should render', function() {

    // given
    const result = renderBpmnPropertiesPanel({ container });

    // then
    expect(domQuery('.bio-properties-panel', result.container)).to.exist;
  });


  it('should render provided groups', function() {

    // given
    const groups1 = [
      {
        id: 'group-1',
        label: 'Group 1',
        entries: []
      },
      {
        id: 'group-2',
        label: 'Group 2',
        entries: []
      },
      {
        id: 'group-3',
        label: 'Group 3',
        entries: []
      }
    ];

    const groups2 = [
      {
        id: 'group-4',
        label: 'Group 4',
        entries: []
      }
    ];

    const getProviders = () => {
      return [
        {
          getGroups: () => (groups) => groups.concat(groups1)
        },
        {
          getGroups: () => (groups) => groups.concat(groups2)
        }
      ];
    };

    // when
    const result = renderBpmnPropertiesPanel({ container, getProviders });

    // then
    expect(domQueryAll('.bio-properties-panel-group', result.container)).to.have.length(4);
  });


  withPropertiesPanel('>=0.14')('should render - empty', async function() {

    // given
    const element = null;

    const eventBus = new eventBusMock();

    // when
    const result = renderBpmnPropertiesPanel({ container, eventBus, element });

    // then
    expect(domQuery('.bio-properties-panel-placeholder', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-placeholder-text', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-placeholder-icon', result.container)).to.exist;
  });


  withPropertiesPanel('>=0.14')('should render - multiple', async function() {

    // given
    const newElements = [
      noopElement,
      noopElement
    ];

    const eventBus = new eventBusMock();

    const result = renderBpmnPropertiesPanel({ container, eventBus });

    // when
    await act(() => {
      eventBus.fire('selection.changed', { newSelection:  newElements });
    });

    // then
    expect(domQuery('.bio-properties-panel-placeholder', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-placeholder-text', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-placeholder-icon', result.container)).to.exist;
  });


  it('should update if element prop different from state', function() {

    // given
    const updateSpy = sinon.spy();

    const eventBus = new eventBusMock();

    const element = noopElement;

    const { rerender } = renderBpmnPropertiesPanel({ container, eventBus, element });

    // when
    const newElement = { ...noopElement, id: 'bar' };

    eventBus.on('propertiesPanel.updated', updateSpy);

    renderBpmnPropertiesPanel({ container, eventBus, element: newElement, rerender });

    // then
    expect(updateSpy).to.have.been.calledWith({ element: newElement });
  });


  describe('event emitting', function() {

    it('should update on selection changed', function() {

      // given
      const updateSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.updated', updateSpy);

      renderBpmnPropertiesPanel({ container, eventBus });

      // when
      eventBus.fire('selection.changed', { newSelection: [ noopElement ] });

      // then
      expect(updateSpy).to.have.been.calledWith({
        element: noopElement
      });
    });


    it('should update on selection changed - multiple', async function() {

      // given
      const updateSpy = sinon.spy();

      const eventBus = new eventBusMock();

      const elements = [
        noopElement,
        noopElement
      ];

      eventBus.on('propertiesPanel.updated', updateSpy);

      renderBpmnPropertiesPanel({ container, eventBus });

      // when
      eventBus.fire('selection.changed', { newSelection: elements });

      // then
      expect(updateSpy).to.have.been.calledWith({
        element: elements
      });
    });


    it('should update on element changed', function() {

      // given
      const updateSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.updated', updateSpy);

      renderBpmnPropertiesPanel({ container, eventBus });

      // when
      eventBus.fire('elements.changed', { elements: [ noopElement ] });

      // then
      expect(updateSpy).to.have.been.calledWith({
        element: noopElement
      });
    });


    it('should update on root element changed', function() {

      // given
      const updateSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.updated', updateSpy);

      renderBpmnPropertiesPanel({ container, eventBus });

      // when
      eventBus.fire('root.added', { element: noopElement });

      // then
      expect(updateSpy).to.have.been.calledWith({
        element: noopElement
      });
    });


    it('should update on providers changed', function() {

      // given
      const updateSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.updated', updateSpy);

      renderBpmnPropertiesPanel({ container, eventBus });

      // when
      eventBus.fire('propertiesPanel.providersChanged');

      // then
      expect(updateSpy).to.have.been.calledOnce;
    });


    it('should update on element templates changed', function() {

      // given
      const updateSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.updated', updateSpy);

      renderBpmnPropertiesPanel({ container, eventBus });

      // when
      eventBus.fire('elementTemplates.changed');

      // then
      expect(updateSpy).to.have.been.calledOnce;
    });


    describe('layout', function() {

      it('should notify on layout changed', function() {

        // given
        const updateSpy = sinon.spy();

        const eventBus = new eventBusMock();

        eventBus.on('propertiesPanel.layoutChanged', updateSpy);

        // when
        renderBpmnPropertiesPanel({ container, eventBus });

        // then
        expect(updateSpy).to.have.been.calledOnce;
      });


      withPropertiesPanel('>=1.5.0')('should react to external changes', async function() {

        // given
        const originalLayout = {
          open: false
        };
        const newLayout = {
          open: true
        };

        const updateSpy = sinon.spy();
        const eventBus = new eventBusMock();
        eventBus.on('propertiesPanel.layoutChanged', updateSpy);

        renderBpmnPropertiesPanel({ container, eventBus, layoutConfig: originalLayout });

        // assume
        expect(updateSpy).to.have.been.calledWith(sinon.match({ layout: originalLayout }));

        updateSpy.resetHistory();

        // when
        await act(() => {
          eventBus.fire('propertiesPanel.setLayout', { layout: newLayout });
        });

        // then
        expect(updateSpy).to.have.been.calledOnce;
        expect(updateSpy.lastCall).to.have.been.calledWith(sinon.match({ layout: newLayout }));
      });

    });


    it('should notify on description loaded', function() {

      // given
      const loadedSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.descriptionLoaded', loadedSpy);

      // when
      renderBpmnPropertiesPanel({ container, eventBus });

      // then
      expect(loadedSpy).to.have.been.called;
    });


    it('should notify on tooltip loaded', function() {

      // given
      const loadedSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.tooltipLoaded', loadedSpy);

      // when
      renderBpmnPropertiesPanel({ container, eventBus });

      // then
      expect(loadedSpy).to.have.been.called;
    });


    it('should notify on properties panel changed', function() {

      // given
      const updateSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.updated', updateSpy);

      renderBpmnPropertiesPanel({ container, eventBus });

      // when
      eventBus.fire('propertiesPanel.providersChanged');

      // then
      expect(updateSpy).to.have.been.calledOnce;
    });


    it('should not update deleted element', async function() {

      // given
      const element = {
        ...noopElement,
        id: 'B',
        type: 'foo:Deleted'
      };

      let elements = [
        element,
        noopElement,
        noopElement
      ];

      const elementRegistry = new elementRegistryMock();
      elementRegistry.setElements(elements);

      const updateSpy = sinon.spy();
      const eventBus = new eventBusMock();
      eventBus.on('propertiesPanel.updated', updateSpy);

      renderBpmnPropertiesPanel({
        container,
        element,
        elementRegistry,
        eventBus
      });

      // when --> remove the currently selected element
      elements.splice(0, 1);
      elementRegistry.setElements(elements);

      eventBus.fire('elements.changed', { elements: [ element ] });

      // then
      expect(updateSpy).to.not.have.been.called;
    });

  });

});


// helpers /////////////////////////

function renderBpmnPropertiesPanel(options = {}) {

  const {
    element = noopElement,
    getProviders = getProvidersMock,
    layoutConfig,
    descriptionConfig,
    descriptionLoaded,
    tooltipConfig,
    tooltipLoaded,
    rerender,
    container
  } = options;

  let {
    elementRegistry
  } = options;

  if (!elementRegistry) {
    elementRegistry = new elementRegistryMock();
    elementRegistry.setElements([ element ]);
  }

  const injector = new injectorMock({
    ...options,
    elementRegistry
  });

  if (rerender) {
    rerender(
      <BpmnPropertiesPanel
        element={ element }
        injector={ injector }
        getProviders={ getProviders }
        layoutConfig={ layoutConfig }
        descriptionConfig={ descriptionConfig }
        descriptionLoaded={ descriptionLoaded }
        tooltipConfig={ tooltipConfig }
        tooltipLoaded={ tooltipLoaded }
      />
    );
  }

  return render(
    <BpmnPropertiesPanel
      element={ element }
      injector={ injector }
      getProviders={ getProviders }
      layoutConfig={ layoutConfig }
      descriptionConfig={ descriptionConfig }
      descriptionLoaded={ descriptionLoaded }
      tooltipConfig={ tooltipConfig }
      tooltipLoaded={ tooltipLoaded }
    />,
    {
      container
    }
  );
}
