import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  clickInput,
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

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './CallActivityProps.bpmn';


describe('provider/camunda-platform - CallActivityProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule
  ];

  let container;

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    debounceInput: false
  }));


  describe('called element type', function() {

    const inputName = 'calledElementType';


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('NoType');

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

      // then
      expect(input).to.exist;
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Process');

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

      // then
      expect(input).to.not.exist;
    }));


    it('should switch to BPMN', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('CMMN');

      await act(() => {
        selection.select(element);
      });

      const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

      // when
      changeInput(input, 'bpmn');

      // then
      expect(getBusinessObject(element).get('calledElement')).to.eql('');
      expect(getBusinessObject(element).get('camunda:caseRef')).not.to.exist;
    }));


    it('should switch to CMMN', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('BPMN');

      await act(() => {
        selection.select(element);
      });

      const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

      // when
      changeInput(input, 'cmmn');

      // then
      expect(getBusinessObject(element).get('camunda:caseRef')).to.eql('');
      expect(getBusinessObject(element).get('calledElement')).not.to.exist;
    }));


    it('should switch to <none>', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('BPMN');

      await act(() => {
        selection.select(element);
      });

      const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

      // when
      changeInput(input, '');

      // then
      expect(getBusinessObject(element).get('camunda:caseRef')).not.to.exist;
      expect(getBusinessObject(element).get('calledElement')).not.to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, modeling) {

        // given
        const element = elementRegistry.get('NoType');

        await act(() => {
          selection.select(element);
        });

        const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

        // when
        await act(() => {
          modeling.updateProperties(element, { 'camunda:caseRef': 'caseRef' });
        });

        // then
        expect(input.value).to.eql('cmmn');
      })
    );
  });


  describe('camunda:businessKey', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('WithBusinessKey');

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery(':is(input, select)[name=calledElementBusinessKeyExpression]', container);

      // then
      expect(input.value).to.eql(
        getBusinessKey(element)
      );
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('WithoutBusinessKey');

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery(':is(input, select)[name=calledElementBusinessKeyExpression]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('WithBusinessKey');

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery(':is(input, select)[name=calledElementBusinessKeyExpression]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessKey(element)
      ).to.eql('newValue');
    }));


    it('should update on external change', inject(async function(elementRegistry, selection, commandStack) {

      // given
      const element = elementRegistry.get('WithBusinessKey');

      const originalValue = getBusinessKey(element);

      await act(() => {
        selection.select(element);
      });

      const input = domQuery(':is(input, select)[name=calledElementBusinessKeyExpression]', container);
      changeInput(input, 'newValue');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(input.value).to.eql(originalValue);
    }));


    it('should add business key with default value',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('WithoutBusinessKey');

        await act(() => {
          selection.select(element);
        });

        const input = domQuery(':is(input, select)[name=calledElementBusinessKey]', container);

        // when
        clickInput(input);

        // then
        expect(getBusinessKey(element)).to.eql('#{execution.processBusinessKey}');
      })
    );


    it('should add business key as a separate camunda:In element',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('WithCamundaIn');

        await act(() => {
          selection.select(element);
        });

        const input = domQuery(':is(input, select)[name=calledElementBusinessKey]', container);

        // when
        clickInput(input);

        // then
        expect(getBusinessKey(element)).to.eql('#{execution.processBusinessKey}');
        expect(
          getBusinessObject(element).get('extensionElements').get('values')).to.have.lengthOf(2);
      })
    );

  });


  describe('bpmn:calledElement', function() {

    it('should display', shouldDisplay('BPMN', 'calledElement', 'calledElement'));


    it('should NOT display', shouldNotDisplay('CMMN', 'calledElement'));


    it('should update', shouldUpdate('BPMN', 'calledElement', 'calledElement'));


    it('should update on external change', shouldUpdateOnExternalChange(
      'BPMN', 'calledElement', 'calledElement'
    ));
  });


  describe('camunda:calledElementBinding', function() {

    it('should display', shouldDisplay(
      'BPMN', 'calledElementBinding', 'camunda:calledElementBinding'
    ));


    it('should NOT display', shouldNotDisplay('CMMN', 'calledElementBinding'));


    it('should update', shouldUpdate(
      'BPMN', 'calledElementBinding', 'camunda:calledElementBinding', 'deployment'
    ));


    it('should update on external change', shouldUpdateOnExternalChange(
      'BPMN', 'calledElementBinding', 'camunda:calledElementBinding', 'deployment'
    ));
  });


  describe('camunda:calledElementVersion', function() {

    it('should display', shouldDisplay(
      'BPMN_Version', 'calledElementVersion', 'camunda:calledElementVersion'
    ));


    it('should NOT display', shouldNotDisplay('BPMN', 'calledElementVersion'));


    it('should update', shouldUpdate(
      'BPMN_Version', 'calledElementVersion', 'camunda:calledElementVersion'
    ));


    it('should update on external change', shouldUpdateOnExternalChange(
      'BPMN_Version', 'calledElementVersion', 'camunda:calledElementVersion'
    ));
  });


  describe('camunda:calledElementVersionTag', function() {

    it('should display', shouldDisplay(
      'BPMN_VersionTag', 'calledElementVersionTag', 'camunda:calledElementVersionTag'
    ));


    it('should NOT display', shouldNotDisplay('BPMN', 'calledElementVersionTag'));


    it('should update', shouldUpdate(
      'BPMN_VersionTag', 'calledElementVersionTag', 'camunda:calledElementVersionTag'
    ));


    it('should update on external change', shouldUpdateOnExternalChange(
      'BPMN_VersionTag', 'calledElementVersionTag', 'camunda:calledElementVersionTag'
    ));
  });


  describe('camunda:calledElementTenantId', function() {

    it('should display', shouldDisplay(
      'BPMN', 'calledElementTenantId', 'camunda:calledElementTenantId'
    ));


    it('should NOT display', shouldNotDisplay('CMMN', 'calledElementTenantId'));


    it('should update', shouldUpdate(
      'BPMN', 'calledElementTenantId', 'camunda:calledElementTenantId', 'deployment'
    ));


    it('should update on external change', shouldUpdateOnExternalChange(
      'BPMN', 'calledElementTenantId', 'camunda:calledElementTenantId', 'deployment'
    ));
  });


  describe('camunda:caseRef', function() {

    it('should display', shouldDisplay(
      'CMMN', 'calledElementCaseRef', 'camunda:caseRef'
    ));


    it('should NOT display', shouldNotDisplay('BPMN', 'calledElementCaseRef'));


    it('should update', shouldUpdate(
      'CMMN', 'calledElementCaseRef', 'camunda:caseRef'
    ));


    it('should update on external change', shouldUpdateOnExternalChange(
      'CMMN', 'calledElementCaseRef', 'camunda:caseRef'
    ));
  });


  describe('camunda:caseBinding', function() {

    it('should display', shouldDisplay(
      'CMMN', 'calledElementCaseBinding', 'camunda:caseBinding'
    ));


    it('should NOT display', shouldNotDisplay('BPMN', 'calledElementCaseBinding'));


    it('should update', shouldUpdate(
      'CMMN', 'calledElementCaseBinding', 'camunda:caseBinding', 'deployment'
    ));


    it('should update on external change', shouldUpdateOnExternalChange(
      'CMMN', 'calledElementCaseBinding', 'camunda:caseBinding', 'deployment'
    ));
  });


  describe('camunda:caseVersion', function() {

    it('should display', shouldDisplay(
      'CMMN_Version', 'calledElementCaseVersion', 'camunda:caseVersion'
    ));


    it('should NOT display', shouldNotDisplay('CMMN', 'calledElementCaseVersion'));


    it('should update', shouldUpdate(
      'CMMN_Version', 'calledElementCaseVersion', 'camunda:caseVersion'
    ));


    it('should update on external change', shouldUpdateOnExternalChange(
      'CMMN_Version', 'calledElementCaseVersion', 'camunda:caseVersion'
    ));
  });


  describe('camunda:caseTenantId', function() {

    it('should display', shouldDisplay(
      'CMMN', 'calledElementCaseTenantId', 'camunda:caseTenantId'
    ));


    it('should NOT display', shouldNotDisplay('BPMN', 'calledElementCaseTenantId'));


    it('should update', shouldUpdate(
      'CMMN', 'calledElementCaseTenantId', 'camunda:caseTenantId'
    ));


    it('should update on external change', shouldUpdateOnExternalChange(
      'CMMN', 'calledElementCaseTenantId', 'camunda:caseTenantId'
    ));
  });


  describe('variable mapping type', function() {

    const inputName = 'calledElementDelegateVariableMappingType';


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('BPMN_DelegateVariableMappingClass');

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

      // then
      expect(input).to.exist;
    }));


    it('should NOT display', shouldNotDisplay('NoType', inputName));


    it('should switch to camunda:variableMappingClass',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('BPMN_DelegateVariableMappingDelegateExpression');

        await act(() => {
          selection.select(element);
        });

        const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

        // when
        changeInput(input, 'class');

        // then
        expect(getBusinessObject(element).get('camunda:variableMappingClass')).to.eql('');
        expect(getBusinessObject(element).get('camunda:variableMappingDelegateExpression')).not.to.exist;
      })
    );


    it('should switch to camunda:variableMappingDelegateExpression',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('BPMN_DelegateVariableMappingClass');

        await act(() => {
          selection.select(element);
        });

        const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

        // when
        changeInput(input, 'delegateExpression');

        // then
        expect(getBusinessObject(element).get('camunda:variableMappingDelegateExpression')).to.eql('');
        expect(getBusinessObject(element).get('camunda:variableMappingClass')).not.to.exist;
      })
    );


    it('should switch to <none>',
      inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('BPMN_DelegateVariableMappingClass');

        await act(() => {
          selection.select(element);
        });

        const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

        // when
        changeInput(input, 'none');

        // then
        expect(getBusinessObject(element).get('camunda:variableMappingDelegateExpression')).not.to.exist;
        expect(getBusinessObject(element).get('camunda:variableMappingClass')).not.to.exist;
      })
    );


    it('should update on external change',
      inject(async function(elementRegistry, selection, modeling) {

        // given
        const element = elementRegistry.get('BPMN_DelegateVariableMappingClass');

        await act(() => {
          selection.select(element);
        });

        const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

        // when
        await act(() => {
          modeling.updateProperties(element, { 'camunda:variableMappingClass': undefined });
        });

        // then
        expect(input.value).to.eql('none');
      })
    );
  });


  describe('camunda:variableMappingClass', function() {

    const property = 'camunda:variableMappingClass',
          input = 'calledElementVariableMappingClass';


    it('should display', shouldDisplay(
      'BPMN_DelegateVariableMappingClass', input, property
    ));


    it('should NOT display', shouldNotDisplay('BPMN', input));


    it('should update', shouldUpdate(
      'BPMN_DelegateVariableMappingClass', input, property
    ));


    it('should update on external change', shouldUpdateOnExternalChange(
      'BPMN_DelegateVariableMappingClass', input, property
    ));
  });


  describe('camunda:variableMappingDelegateExpression', function() {

    const property = 'camunda:variableMappingDelegateExpression',
          input = 'calledElementVariableMappingDelegateExpression';


    it('should display', shouldDisplay(
      'BPMN_DelegateVariableMappingDelegateExpression', input, property
    ));


    it('should NOT display', shouldNotDisplay('BPMN', input));


    it('should update', shouldUpdate(
      'BPMN_DelegateVariableMappingDelegateExpression', input, property
    ));


    it('should update on external change', shouldUpdateOnExternalChange(
      'BPMN_DelegateVariableMappingDelegateExpression', input, property
    ));
  });



  function shouldDisplay(elementId, inputName, propertyName) {
    return inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get(elementId);

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(element).get(propertyName)
      );
    });
  }

  function shouldNotDisplay(elementId, inputName) {
    return inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get(elementId);

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery(`:is(input, select)[name=${inputName}]`, container);

      // then
      expect(input).to.not.exist;
    });
  }

  function shouldUpdate(elementId, inputName, propertyName, newValue = 'newValue') {
    return inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get(elementId);

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery(`:is(input, select)[name=${inputName}]`, container);
      changeInput(input, newValue);

      // then
      expect(getBusinessObject(element).get(propertyName)).to.eql(newValue);
    });
  }

  function shouldUpdateOnExternalChange(elementId, inputName, propertyName, newValue = 'newValue') {
    return inject(async function(elementRegistry, selection, commandStack) {

      // given
      const element = elementRegistry.get(elementId);

      const originalValue = getBusinessObject(element).get(propertyName);

      await act(() => {
        selection.select(element);
      });

      const input = domQuery(`:is(input, select)[name=${inputName}]`, container);
      changeInput(input, newValue);

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(input.value).to.eql(originalValue);
    });
  }
});


// helper

function getBusinessKey(element) {
  const bo = getBusinessObject(element);
  const camundaInList = getExtensionElementsList(bo, 'camunda:In');

  return (
    camundaInList.find(el => el.get('businessKey') !== undefined)
      .get('businessKey')
  );
}
