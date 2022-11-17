import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
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

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-platform';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './DmnImplementationProps.bpmn';


describe('provider/camunda-platform - DmnImplementationProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule,
    BehaviorsModule
  ];

  let container;

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };


  describe('camunda:DmnCapable#decisionRef', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_class');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRef]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRef]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(businessRuleTask).get('camunda:decisionRef')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRef]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(businessRuleTask).get('camunda:decisionRef')
      ).to.eql('newValue');
    }));


    it('should NOT delete property on empty value', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

      await act(() => {
        selection.select(businessRuleTask);
      });

      const input = domQuery('input[name=decisionRef]', container);
      changeInput(input, 'newValue');

      // when
      changeInput(input, '');

      // then
      const decisionRef = getBusinessObject(businessRuleTask).get('camunda:decisionRef');

      expect(decisionRef).to.exist;
      expect(decisionRef).to.eql('');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

        const originalValue = getBusinessObject(businessRuleTask).get('camunda:decisionRef');

        await act(() => {
          selection.select(businessRuleTask);
        });
        const input = domQuery('input[name=decisionRef]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('camunda:DmnCapable#decisionRefBinding', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_class');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const select = domQuery('select[name=decisionRefBinding]', container);

      // then
      expect(select).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const select = domQuery('select[name=decisionRefBinding]', container);

      // then
      expect(select.value).to.eql(
        getBusinessObject(businessRuleTask).get('camunda:decisionRefBinding')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const select = domQuery('select[name=decisionRefBinding]', container);
      changeInput(select, 'latest');

      // then
      expect(
        getBusinessObject(businessRuleTask).get('camunda:decisionRefBinding')
      ).to.eql('latest');
    }));


    it('should clean up values', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_versionAndVersionTag');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // assume
      expect(getBusinessObject(businessRuleTask).get('camunda:decisionRefVersion')).to.exist;
      expect(getBusinessObject(businessRuleTask).get('camunda:decisionRefVersionTag')).to.exist;

      // when
      const select = domQuery('select[name=decisionRefBinding]', container);
      changeInput(select, '');

      // then
      expect(getBusinessObject(businessRuleTask).get('camunda:decisionRefVersion')).to.be.undefined;
      expect(getBusinessObject(businessRuleTask).get('camunda:decisionRefVersionTag')).to.be.undefined;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

        const originalValue =
          getBusinessObject(businessRuleTask).get('camunda:decisionRefBinding');

        await act(() => {
          selection.select(businessRuleTask);
        });
        const select = domQuery('select[name=decisionRefBinding]', container);
        changeInput(select, 'latest');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(select.value).to.eql(originalValue);
      })
    );

  });


  describe('camunda:DmnCapable#decisionRefVersion', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefVersion]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_version');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefVersion]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(businessRuleTask).get('camunda:decisionRefVersion')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_version');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefVersion]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(businessRuleTask).get('camunda:decisionRefVersion')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_version');

        const originalValue =
          getBusinessObject(businessRuleTask).get('camunda:decisionRefVersion');

        await act(() => {
          selection.select(businessRuleTask);
        });
        const input = domQuery('input[name=decisionRefVersion]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('camunda:DmnCapable#decisionRefVersionTag', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefVersionTag]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_versionTag');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefVersionTag]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(businessRuleTask).get('camunda:decisionRefVersionTag')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_versionTag');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefVersionTag]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(businessRuleTask).get('camunda:decisionRefVersionTag')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_versionTag');

        const originalValue =
          getBusinessObject(businessRuleTask).get('camunda:decisionRefVersionTag');

        await act(() => {
          selection.select(businessRuleTask);
        });
        const input = domQuery('input[name=decisionRefVersionTag]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('camunda:DmnCapable#decisionRefTenantId', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_class');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefTenantId]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefTenantId]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(businessRuleTask).get('camunda:decisionRefTenantId')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefTenantId]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(businessRuleTask).get('camunda:decisionRefTenantId')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

        const originalValue =
          getBusinessObject(businessRuleTask).get('camunda:decisionRefTenantId');

        await act(() => {
          selection.select(businessRuleTask);
        });
        const input = domQuery('input[name=decisionRefTenantId]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('camunda:DmnCapable#resultVariable', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_class');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefResultVariable]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_resultVariable');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefResultVariable]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(businessRuleTask).get('camunda:resultVariable')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_resultVariable');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const input = domQuery('input[name=decisionRefResultVariable]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(businessRuleTask).get('camunda:resultVariable')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_resultVariable');

        const originalValue =
          getBusinessObject(businessRuleTask).get('camunda:resultVariable');

        await act(() => {
          selection.select(businessRuleTask);
        });
        const input = domQuery('input[name=decisionRefResultVariable]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('camunda:DmnCapable#mapDecisionResult', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const select = domQuery('select[name=mapDecisionResult]', container);

      // then
      expect(select).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_resultVariable');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const select = domQuery('select[name=mapDecisionResult]', container);

      // then
      expect(select.value).to.eql(
        getBusinessObject(businessRuleTask).get('camunda:mapDecisionResult')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_resultVariable');

      await act(() => {
        selection.select(businessRuleTask);
      });

      // when
      const select = domQuery('select[name=mapDecisionResult]', container);
      changeInput(select, 'singleEntry');

      // then
      expect(
        getBusinessObject(businessRuleTask).get('camunda:mapDecisionResult')
      ).to.eql('singleEntry');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_resultVariable');

        const originalValue =
          getBusinessObject(businessRuleTask).get('camunda:mapDecisionResult');

        await act(() => {
          selection.select(businessRuleTask);
        });
        const select = domQuery('select[name=mapDecisionResult]', container);
        changeInput(select, 'singleEntry');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(select.value).to.eql(originalValue);
      })
    );


    describe('integration', function() {

      it('should remove map decision result when result variable is removed', inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_resultVariable'),
              businessObject = getBusinessObject(businessRuleTask);

        await act(() => selection.select(businessRuleTask));

        // when
        const input = domQuery('input[name=decisionRefResultVariable]', container);

        changeInput(input, '');

        // then
        // expect default
        expect(businessObject.get('camunda:mapDecisionResult')).to.equal('resultList');
      }));

    });

  });

});
