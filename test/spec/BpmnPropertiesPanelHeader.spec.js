import { expect } from 'chai';

import {
  cleanup,
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import { BpmnModdle } from 'bpmn-moddle';

import {
  insertCoreStyles
} from 'test/TestHelper';

import BpmnPropertiesPanelHeader from 'src/render/BpmnPropertiesPanelHeader';

insertCoreStyles();

const moddle = new BpmnModdle();


describe('<BpmnPropertiesPanelHeader>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  afterEach(function() { return cleanup(); });


  it('should render nothing without an element', function() {

    // given
    const injector = createInjector();

    // when
    render(<BpmnPropertiesPanelHeader injector={ injector } element={ null } />, { container });

    // then
    expect(domQuery('.bio-properties-panel-header', container)).to.not.exist;
  });


  it('should render element', function() {

    // given
    const element = createElement('bpmn:Task', { name: 'Task' });
    const injector = createInjector();

    // when
    render(<BpmnPropertiesPanelHeader injector={ injector } element={ element } />, { container });

    // then
    expect(domQuery('.bio-properties-panel-header', container)).to.exist;
  });


  it('should render nothing for multi-select', function() {

    // given
    const elements = [
      createElement('bpmn:Task', {}),
      createElement('bpmn:Task', {})
    ];
    const injector = createInjector();

    // when
    render(<BpmnPropertiesPanelHeader injector={ injector } element={ elements } />, { container });

    // then
    expect(domQuery('.bio-properties-panel-header', container)).to.not.exist;
  });

});


// helpers //////////////////////////

function createElement(type, attrs) {
  const businessObject = moddle.create(type, attrs);

  return {
    type,
    businessObject
  };
}

function createInjector() {
  const services = {
    translate: (text) => text
  };

  return {
    get(type, strict) {
      const service = services[type];

      if (!service && strict !== false) {
        throw new Error(`service ${type} not found`);
      }

      return service || null;
    }
  };
}
