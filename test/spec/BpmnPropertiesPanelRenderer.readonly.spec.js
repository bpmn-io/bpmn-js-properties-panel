import TestContainer from 'mocha-test-container-support';

import {
  cleanup
} from '@testing-library/preact/pure';

import {
  clearBpmnJS,
  setBpmnJS,
  insertCoreStyles,
  insertBpmnStyles,
  enableLogging
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import Modeler from 'bpmn-js/lib/Modeler';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import {
  insertCSS
} from '../TestHelper';

insertCoreStyles();
insertBpmnStyles();

insertCSS('readonly-properties-panel', `
  .bio-properties-panel-input,
  .bio-properties-panel-checkbox {
    pointer-events: none;
  }
`);


describe('<BpmnPropertiesPanelRenderer>', function() {

  afterEach(() => cleanup());

  let modelerContainer;

  let propertiesContainer;

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
      keyboard: {
        bindTo: document
      },
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

    enableLogging && enableLogging(modeler);

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


  it.only('should work with viewer', async function() {

    // given
    const diagramXml = require('test/fixtures/service-task.bpmn').default;

    const FakeModelingServicesModule = {
      commandStack: [ 'value', {
        registerHandler() { }
      } ],
      bpmnFactory: [ 'value', {} ],
      modeling: [ 'value', {
        updateProperties() { }
      } ]
    };

    // when
    const result = await createModeler(
      diagramXml,
      {
        additionalModules: [
          FakeModelingServicesModule,
          BpmnPropertiesPanel,
          BpmnPropertiesProvider,
          ZeebePropertiesProvider
        ],
        moddleExtensions: {
          zeebe: ZeebeModdle
        },
        tooltip: TooltipProvider
      },
      NavigatedViewer
    );

    // then
    expect(result.error).not.to.exist;
  });

});


// helpers /////////////////////

// eslint-disable-next-line
function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

// eslint-disable-next-line
function getHeaderName(container) {
  return domQuery('.bio-properties-panel-header-label', container).innerText;
}

// eslint-disable-next-line
function getFeelPopup(container) {
  return domQuery('.bio-properties-panel-feel-popup', container);
}

// eslint-disable-next-line
function getOpenFeelPopup(id, container) {
  return container.querySelector(`[data-entry-id="${id}"] .bio-properties-panel-open-feel-popup`);
}
