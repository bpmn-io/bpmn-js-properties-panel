import {
  act,
  fireEvent
} from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';

import {
  bootstrapBpmnJS,
  inject,
  insertCSS
} from 'bpmn-js/test/helper';

import semver from 'semver';

import Modeler from 'bpmn-js/lib/Modeler';

let PROPERTIES_PANEL_CONTAINER;

global.chai.use(function(chai, utils) {

  utils.addMethod(chai.Assertion.prototype, 'jsonEqual', function(comparison) {

    var actual = JSON.stringify(this._obj);
    var expected = JSON.stringify(comparison);

    this.assert(
      actual == expected,
      'expected #{this} to deep equal #{act}',
      'expected #{this} not to deep equal #{act}',
      comparison, // expected
      this._obj, // actual
      true // show diff
    );
  });
});

export * from 'bpmn-js/test/helper';

export {
  createCanvasEvent
} from 'bpmn-js/test/util/MockEvents';

export function bootstrapPropertiesPanel(diagram, options, locals) {
  return async function() {
    const container = TestContainer.get(this);

    insertBpmnStyles();
    insertCoreStyles();

    // (1) create modeler + import diagram
    const createModeler = bootstrapBpmnJS(Modeler, diagram, options, locals);
    await act(() => createModeler.call(this));

    // (2) clean-up properties panel
    clearPropertiesPanelContainer();

    // (3) attach properties panel
    const attachPropertiesPanel = inject(function(propertiesPanel) {
      PROPERTIES_PANEL_CONTAINER = document.createElement('div');
      PROPERTIES_PANEL_CONTAINER.classList.add('properties-container');

      container.appendChild(PROPERTIES_PANEL_CONTAINER);

      return act(() => propertiesPanel.attachTo(PROPERTIES_PANEL_CONTAINER));
    });
    await attachPropertiesPanel();
  };
}

export function clearPropertiesPanelContainer() {
  if (PROPERTIES_PANEL_CONTAINER) {
    PROPERTIES_PANEL_CONTAINER.remove();
  }
}

export function changeInput(input, value) {
  fireEvent.input(input, { target: { value } });
}

export function clickInput(input) {
  fireEvent.click(input);
}

export function insertCoreStyles() {
  insertCSS(
    'properties-panel.css',
    require('@bpmn-io/properties-panel/assets/properties-panel.css').default
  );

  insertCSS(
    'element-templates.css',
    require('../assets/element-templates.css').default
  );

  insertCSS(
    'test.css',
    require('./test.css').default
  );
}

export function insertBpmnStyles() {
  insertCSS(
    'diagram.css',
    require('bpmn-js/dist/assets/diagram-js.css').default
  );

  // @barmac: this fails before bpmn-js@9
  if (bpmnJsSatisfies('>=9')) {
    insertCSS(
      'bpmn-js.css',
      require('bpmn-js/dist/assets/bpmn-js.css').default
    );
  }

  insertCSS(
    'bpmn-font.css',
    require('bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css').default
  );
}

export function bootstrapModeler(diagram, options, locals) {
  return bootstrapBpmnJS(Modeler, diagram, options, locals);
}

/**
 * Execute test only if currently installed bpmn-js is of given version.
 *
 * @param {string} versionRange
 * @param {boolean} only
 */
export function withBpmnJs(versionRange, only = false) {
  if (bpmnJsSatisfies(versionRange)) {
    return only ? it.only : it;
  } else {
    return it.skip;
  }
}

function bpmnJsSatisfies(versionRange) {
  const bpmnJsVersion = require('bpmn-js/package.json').version;

  return semver.satisfies(bpmnJsVersion, versionRange, { includePrerelease: true });
}
