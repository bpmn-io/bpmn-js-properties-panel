import { render } from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  Injector as injectorMock,
  ElementRegistry as elementRegistryMock,
  EventBus as eventBusMock
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
    const result = createBpmnPropertiesPanel({ container });

    // then
    expect(domQuery('.bio-properties-panel', result.container)).to.exist;
  });


  it('should render provided groups', function() {

    // given
    const groups = [
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

    // when
    const result = createBpmnPropertiesPanel({ container, groups });

    // then
    expect(domQueryAll('.bio-properties-panel-group', result.container)).to.have.length(3);
  });


  withPropertiesPanel('>=0.14')('should render - empty', async function() {

    // given
    const element = null;

    const eventBus = new eventBusMock();

    // when
    const result = createBpmnPropertiesPanel({ container, eventBus, element });

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

    // when
    const result = createBpmnPropertiesPanel({ container, eventBus, element: newElements });

    // then
    expect(domQuery('.bio-properties-panel-placeholder', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-placeholder-text', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-placeholder-icon', result.container)).to.exist;
  });


  describe('events', function() {

    it('should emit <propertiesPanel.layoutChanged> on layout changed', function() {

      // given
      const updateSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.layoutChanged', updateSpy);

      // when
      createBpmnPropertiesPanel({ container, eventBus });

      // then
      expect(updateSpy).to.have.been.calledOnce;
    });


    it('should emit <propertiesPanel.descriptionLoaded> on description loaded', function() {

      // given
      const loadedSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.descriptionLoaded', loadedSpy);

      // when
      createBpmnPropertiesPanel({ container, eventBus });

      // then
      expect(loadedSpy).to.have.been.called;
    });


    it('should emit <propertiesPanel.tooltipLoaded> on tooltip loaded', function() {

      // given
      const loadedSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.tooltipLoaded', loadedSpy);

      // when
      createBpmnPropertiesPanel({ container, eventBus });

      // then
      expect(loadedSpy).to.have.been.called;
    });

  });

});


// helpers /////////////////////////

function createBpmnPropertiesPanel(options = {}) {

  const {
    element = noopElement,
    groups = [],
    layoutConfig,
    descriptionConfig,
    descriptionLoaded,
    tooltipConfig,
    tooltipLoaded,
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

  return render(
    <BpmnPropertiesPanel
      element={ element }
      groups={ groups }
      injector={ injector }
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
