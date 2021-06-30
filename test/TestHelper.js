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

import Modeler from 'bpmn-js/lib/Modeler';

export * from 'bpmn-js/test/helper';

export function bootstrapPropertiesPanel(diagram, options, locals) {
  return async function() {
    const container = TestContainer.get(this);

    insertBpmnStyles();
    insertCoreStyles();

    const createModeler = bootstrapBpmnJS(Modeler, diagram, options, locals);
    await createModeler.call(this);

    const attachPropertiesPanel = inject(function(propertiesPanel) {
      const propertiesPanelContainer = document.createElement('div');
      propertiesPanelContainer.classList.add('properties-container');

      container.appendChild(propertiesPanelContainer);

      return act(() => propertiesPanel.attachTo(propertiesPanelContainer));
    });
    await attachPropertiesPanel();
  };
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
    'test.css',
    require('./test.css').default
  );
}

export function insertBpmnStyles() {
  insertCSS(
    'diagram.css',
    require('bpmn-js/dist/assets/diagram-js.css').default
  );

  insertCSS(
    'bpmn-font.css',
    require('bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css').default
  );
}

export function bootstrapModeler(diagram, options, locals) {
  return bootstrapBpmnJS(Modeler, diagram, options, locals);
}