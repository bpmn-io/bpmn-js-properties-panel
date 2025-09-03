import {
  act,
  fireEvent
} from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';

import {
  bootstrapBpmnJS,
  getBpmnJS,
  inject,
  insertCSS
} from 'bpmn-js/test/helper';

import semver from 'semver';

import fileDrop from 'file-drops';

import download from 'downloadjs';

import Modeler from 'bpmn-js/lib/Modeler';

import axe from 'axe-core';

/**
 * https://www.deque.com/axe/core-documentation/api-documentation/#axe-core-tags
 */
const DEFAULT_AXE_RULES = [
  'best-practice',
  'wcag2a',
  'wcag2aa',
  'cat.semantics'
];

let PROPERTIES_PANEL_CONTAINER;

// eslint-disable-next-line no-undef
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
  createCanvasEvent,
  createEvent
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

export function mouseEnter(element) {
  fireEvent.mouseEnter(element);
}

export function insertCoreStyles() {
  insertCSS(
    'properties-panel.css',
    require('@bpmn-io/properties-panel/dist/assets/properties-panel.css').default
  );

  insertCSS(
    'test.css',
    require('./test.css').default
  );

  insertCSS(
    'element-template-chooser.css',
    require('@bpmn-io/element-template-chooser/dist/element-template-chooser.css').default
  );
}

export function insertBpmnStyles() {
  insertCSS(
    'diagram.css',
    require('bpmn-js/dist/assets/diagram-js.css').default
  );

  insertCSS(
    'bpmn-js.css',
    require('bpmn-js/dist/assets/bpmn-js.css').default
  );

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

/**
 * Execute test only if currently installed @bpmn-io/properties-panel is of given version.
 *
 * @param {string} versionRange
 * @param {boolean} only
 */
export function withPropertiesPanel(versionRange, only = false) {
  if (propertiesPanelSatisfies(versionRange)) {
    return only ? it.only : it;
  } else {
    return it.skip;
  }
}

function propertiesPanelSatisfies(versionRange) {
  const version = require('@bpmn-io/properties-panel/package.json').version;

  return semver.satisfies(version, versionRange, { includePrerelease: true });
}

export async function expectNoViolations(node, options = {}) {
  const {
    rules,
    ...rest
  } = options;

  const results = await axe.run(node, {
    runOnly: rules || DEFAULT_AXE_RULES,
    ...rest
  });

  expect(results.passes).to.be.not.empty;
  expect(results.violations).to.be.empty;
}

export async function setEditorValue(editor, value) {
  await act(() => {
    editor.textContent = value;
  });

  // Requires 2 ticks to propagate the change to bpmn-js
  await act(() => {});
}

// be able to load files into running bpmn-js test cases
document.documentElement.addEventListener('dragover', fileDrop('Drop a BPMN diagram to open it in the currently active test.', function(files) {
  const bpmnJS = getBpmnJS();

  if (bpmnJS && files.length === 1) {
    bpmnJS.importXML(files[0].contents);
  }
}));

insertCSS('file-drops.css', `
  .drop-overlay .box {
    background: orange;
    border-radius: 3px;
    display: inline-block;
    font-family: sans-serif;
    padding: 4px 10px;
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
  }
`);

// be able to download diagrams using CTRL/CMD+S
document.addEventListener('keydown', function(event) {
  const bpmnJS = getBpmnJS();

  if (!bpmnJS) {
    return;
  }

  if (!(event.ctrlKey || event.metaKey) || event.code !== 'KeyS') {
    return;
  }

  event.preventDefault();

  bpmnJS.saveXML({ format: true }).then(function(result) {
    download(result.xml, 'test.bpmn', 'application/xml');
  });
});


// be able to load diagrams using CTRL/CMD+O
// This will open a file dialog and import the selected BPMN file
// into the current bpmn-js modeler instance.
document.addEventListener('keydown', function(event) {
  const bpmnJS = getBpmnJS();

  if (!bpmnJS) {
    return;
  }

  if (!(event.ctrlKey || event.metaKey) || event.code !== 'KeyO') {
    return;
  }

  event.preventDefault();

  // Create a hidden file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.bpmn';
  input.style.display = 'none';

  input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const xml = evt.target.result;
      bpmnJS.importXML(xml);
    };
    reader.readAsText(file);
  });

  document.body.appendChild(input);
  input.click();

  // Clean up after file dialog
  input.addEventListener('blur', function() {
    document.body.removeChild(input);
  });
});
