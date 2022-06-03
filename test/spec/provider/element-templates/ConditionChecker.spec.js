import TestContainer from 'mocha-test-container-support';

import { bootstrapModeler, inject } from 'test/TestHelper';

import coreModule from 'bpmn-js/lib/core';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import modelingModule from 'bpmn-js/lib/features/modeling';

import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import diagramXML from './fixtures/condition.bpmn';
import conditionalTemplate from './fixtures/condition.json';

import elementTemplatesModule from 'src/provider/element-templates';
import {
  findCamundaProperty,
  findExtension
} from 'src/provider/element-templates/Helper';


describe('provider/element-templates - ConditionChecker', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    container: container,
    modules: [
      coreModule,
      elementTemplatesModule,
      modelingModule,
      {
        propertiesPanel: [ 'value', { registerProvider() {} } ]
      }
    ],
    moddleExtensions: {
      camunda: camundaModdlePackage
    }
  }));

  beforeEach(inject(function(elementTemplates) {
    elementTemplates.set([ conditionalTemplate ]);
  }));


  describe('applying template', function() {

    it('should apply only the properties for which conditions are met', inject(
      function(elementRegistry, elementTemplates) {

        // given
        const element = elementRegistry.get('WithoutTemplate');

        // when
        elementTemplates.applyTemplate(element, conditionalTemplate);

        // then
        expectCamundaProperties(element, [
          { name: 'input1', value: '' }
        ]);
      }
    ));
  });


  describe('updating element', function() {

    it('should add properties for which conditions are met', inject(
      function(elementRegistry, modeling) {

        // given
        const element = elementRegistry.get('Condition');
        const input1 = findCamundaPropertyByName(element, 'input1');

        // when
        modeling.updateModdleProperties(element, input1, { value: 'text' });

        // then
        expectCamundaProperties(element, [
          { name: 'input1', value: 'text' },
          { name: 'input2', value: '' },
          { name: 'input5', value: '' }
        ]);
      }
    ));


    it('should remove properties for which conditions are not met', inject(
      function(elementRegistry, modeling) {

        // given
        const element = elementRegistry.get('Condition');
        const input1 = findCamundaPropertyByName(element, 'input1');

        // when
        modeling.updateModdleProperties(element, input1, { value: '' });

        // then
        expectCamundaProperties(element, [
          { name: 'input1', value: '' }
        ]);
      }
    ));
  });

});



// helpers ///////////////////////////////
function expectCamundaProperties(element, expectedProperties) {
  const bo = getBusinessObject(element);

  const camundaProperties = findExtension(bo, 'camunda:Properties');

  const remainingExpected = [ ...expectedProperties ];
  for (const camundaProperty of camundaProperties.get('values')) {
    const expected = expectedProperties.find(
      property => property.name === camundaProperty.get('name'));

    expect(expected, `property should NOT exist: name=${camundaProperty.get('name')}`).to.exist;
    expect(camundaProperty.get('value')).to.eql(expected.value);

    remainingExpected.splice(expectedProperties.indexOf(expected), 1);
  }

  const remainingAsString = remainingExpected.map(property => property.name).join(', ');
  expect(remainingExpected).to.have.lengthOf(0, `properties should exist (names): ${remainingAsString}`);
}

function findCamundaPropertyByName(element, name) {
  const bo = getBusinessObject(element);

  const camundaProperties = findExtension(bo, 'camunda:Properties');

  return findCamundaProperty(camundaProperties, { name });
}
