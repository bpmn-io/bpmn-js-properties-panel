import * as sinon from 'sinon';
import { expect } from 'chai';
import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  Injector as injectorMock,
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
    const result = createBpmnPropertiesPanel({ container });

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
    const result = createBpmnPropertiesPanel({ container, getProviders });

    // then
    expect(domQueryAll('.bio-properties-panel-group', result.container)).to.have.length(4);
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
    const element = [
      noopElement,
      noopElement
    ];

    // when
    const result = createBpmnPropertiesPanel({ container, element });

    // then
    expect(domQuery('.bio-properties-panel-placeholder', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-placeholder-text', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-placeholder-icon', result.container)).to.exist;
  });


  describe('header provider', function() {

    const customHeaderProvider = {
      getElementLabel: () => 'CUSTOM HEADER LABEL',
      getTypeLabel: () => 'CUSTOM TYPE',
      getElementIcon: () => null
    };


    it('should render header through a custom `headerProvider` prop', function() {

      // when
      const result = createBpmnPropertiesPanel({
        container,
        headerProvider: customHeaderProvider
      });

      // then
      const header = domQuery('.bio-properties-panel-header', result.container);

      expect(header).to.exist;
      expect(header.textContent).to.contain('CUSTOM HEADER LABEL');
    });


    it('should render header through a `propertiesPanelHeaderProvider` service', function() {

      // when
      const result = createBpmnPropertiesPanel({
        container,
        propertiesPanelHeaderProvider: customHeaderProvider
      });

      // then
      const header = domQuery('.bio-properties-panel-header', result.container);

      expect(header).to.exist;
      expect(header.textContent).to.contain('CUSTOM HEADER LABEL');
    });


    it('should prefer the `headerProvider` prop over the service', function() {

      // when
      const result = createBpmnPropertiesPanel({
        container,
        headerProvider: customHeaderProvider,
        propertiesPanelHeaderProvider: {
          getElementLabel: () => 'SERVICE LABEL',
          getTypeLabel: () => 'SERVICE TYPE',
          getElementIcon: () => null
        }
      });

      // then
      const header = domQuery('.bio-properties-panel-header', result.container);

      expect(header.textContent).to.contain('CUSTOM HEADER LABEL');
      expect(header.textContent).not.to.contain('SERVICE LABEL');
    });

  });


  describe('event emitting', function() {

    describe('layout', function() {

      it('should notify on layout changed', function() {

        // given
        const updateSpy = sinon.spy();

        const eventBus = new eventBusMock();

        eventBus.on('propertiesPanel.layoutChanged', updateSpy);

        // when
        createBpmnPropertiesPanel({ container, eventBus });

        // then
        expect(updateSpy).to.have.been.calledOnce;
      });

    });


    it('should notify on description loaded', function() {

      // given
      const loadedSpy = sinon.spy();

      const eventBus = new eventBusMock();

      eventBus.on('propertiesPanel.descriptionLoaded', loadedSpy);

      // when
      createBpmnPropertiesPanel({ container, eventBus });

      // then
      expect(loadedSpy).to.have.been.called;
    });


    it('should notify on tooltip loaded', function() {

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
    getProviders = getProvidersMock,
    layoutConfig,
    descriptionConfig,
    descriptionLoaded,
    tooltipConfig,
    tooltipLoaded,
    headerProvider,
    container
  } = options;

  const injector = new injectorMock(options);

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
      headerProvider={ headerProvider }
    />,
    {
      container
    }
  );
}
