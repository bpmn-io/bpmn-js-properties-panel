import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject,
  mouseEnter,
  TOOLTIP_OPEN_DELAY
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import processDiagramXML from './VersionTagProps-process.bpmn';
import collaborationDiagramXML from './VersionTagProps-collaboration.bpmn';


describe('provider/zeebe - VersionTagProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    ZeebePropertiesProvider
  ];

  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
  };

  let container, clock;

  beforeEach(function() {
    container = TestContainer.get(this);
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock.restore();
  });

  function openTooltip() {
    return act(() => {
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);
      mouseEnter(wrapper);
      clock.tick(TOOLTIP_OPEN_DELAY);
    });
  }

  [
    [ 'process', 'Process_1', processDiagramXML ],
    [ 'collaboration', 'Participant_1', collaborationDiagramXML ]
  ].forEach(([ title, elementId, diagramXML ]) => {

    describe(title, function() {

      beforeEach(bootstrapPropertiesPanel(diagramXML, {
        modules: testModules,
        moddleExtensions,
        propertiesPanel: {
          tooltip: TooltipProvider
        },
        debounceInput: false
      }));


      it('should NOT display for task', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const versionTagInput = domQuery('input[name=versionTag]', container);

        // then
        expect(versionTagInput).to.not.exist;
      }));


      it('should display for process', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get(elementId);

        await act(() => {
          selection.select(element);
        });

        // when
        const versionTagInput = domQuery('input[name=versionTag]', container);

        // then
        expect(versionTagInput).to.exist;
        expect(versionTagInput.value).to.eql(getVersionTag(element).get('value'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get(elementId);

        await act(() => {
          selection.select(element);
        });

        // when
        const versionTagInput = domQuery('input[name=versionTag]', container);

        changeInput(versionTagInput, 'v2.0.0');

        // then
        expect(getVersionTag(element).get('value')).to.eql('v2.0.0');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const element = elementRegistry.get(elementId);

          const originalValue = getVersionTag(element).get('value');

          await act(() => {
            selection.select(element);
          });

          const versionTagInput = domQuery('input[name=versionTag]', container);

          changeInput(versionTagInput, 'v2.0.0');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(versionTagInput.value).to.eql(originalValue);
        })
      );


      it('should create non existing extension elements',
        inject(async function(elementRegistry, modeling, selection) {

          // given
          const element = elementRegistry.get(elementId);

          modeling.updateModdleProperties(element, getProcess(element), { extensionElements: undefined });

          // assume
          expect(getProcess(element).get('extensionElements')).to.not.exist;

          await act(() => {
            selection.select(element);
          });

          // when
          const versionTagInput = domQuery('input[name=versionTag]', container);

          changeInput(versionTagInput, 'v1.0.0');

          // then
          expect(getProcess(element).get('extensionElements')).to.exist;
          expect(getVersionTag(element).get('value')).to.eql('v1.0.0');
        })
      );


      it('should create non existing version tag',
        inject(async function(elementRegistry, modeling, selection) {

          // given
          const element = elementRegistry.get(elementId);

          modeling.updateModdleProperties(
            element,
            getProcess(element).get('extensionElements'),
            { values: [] }
          );

          // assume
          expect(getProcess(element).get('extensionElements')).to.exist;
          expect(getVersionTag(element)).not.to.exist;

          await act(() => {
            selection.select(element);
          });

          // when
          const versionTagInput = domQuery('input[name=versionTag]', container);

          changeInput(versionTagInput, 'v1.0.0');

          // then
          expect(getVersionTag(element)).to.exist;
          expect(getVersionTag(element).get('value')).to.eql('v1.0.0');
        })
      );


      it('should display correct documentation', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get(elementId);

        await act(() => {
          selection.select(element);
        });

        // when
        await openTooltip();

        const documentationLinkGroup = domQuery('.bio-properties-panel-tooltip-content p', container);

        // then
        expect(documentationLinkGroup).to.exist;
        expect(documentationLinkGroup.textContent).to.equal('Version tag by which this process can be referenced.');
      }));

    });

  });

});


// helper //////////////////

function getProcess(element) {
  return is(element, 'bpmn:Process') ?
    getBusinessObject(element) :
    getBusinessObject(element).get('processRef');
}

function getVersionTag(element) {
  const businessObject = getProcess(element);

  return getExtensionElementsList(businessObject, 'zeebe:VersionTag')[ 0 ];
}