import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  clickInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-platform';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './FormField.bpmn';


describe('provider/camunda-platform - FormField', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule,
    BehaviorsModule
  ];

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    debounceInput: false
  }));


  describe('#id', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // when
      const idInput = domQuery('input[name=StartEvent_1-formField-0-formFieldID]', container);

      // then
      expect(idInput).to.exist;
      expect(idInput.value).to.equal(getFormFieldId(event, 0));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      const idInput = domQuery('input[name=StartEvent_1-formField-0-formFieldID]', container);

      // when
      changeInput(idInput, 'newVal');

      // then
      expect(getFormFieldId(event, 0)).to.equal('newVal');
    }));


    it('should update on external change', inject(
      async function(elementRegistry, selection, commandStack) {

        // given
        const event = elementRegistry.get('StartEvent_1');
        const originalValue = getFormFieldId(event, 0);

        await act(() => {
          selection.select(event);
        });

        const idInput = domQuery('input[name=StartEvent_1-formField-0-formFieldID]', container);

        changeInput(idInput, 'newVal');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(idInput.value).to.eql(originalValue);
      }));


    describe('integration', function() {

      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const event = elementRegistry.get('StartEvent_2');

        await act(() => {
          selection.select(event);
        });

        const idInput = domQuery('input[name=StartEvent_2-formField-0-formFieldID]', container);

        // when
        changeInput(idInput, 'bar');

        // then
        expect(getFormData(event).get('camunda:businessKey')).to.equal('bar');
      }));

    });

  });


  describe('#label', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // when
      const labelInput = domQuery('input[name=StartEvent_1-formField-0-formFieldLabel]', container);

      // then
      expect(labelInput).to.exist;
      expect(labelInput.value).to.equal(getFormFieldLabel(event, 0));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      const labelInput = domQuery('input[name=StartEvent_1-formField-0-formFieldLabel]', container);

      // when
      changeInput(labelInput, 'newLabel');

      // then
      expect(getFormFieldLabel(event, 0)).to.equal('newLabel');
    }));


    it('should update on external change', inject(
      async function(elementRegistry, selection, commandStack) {

        // given
        const event = elementRegistry.get('StartEvent_1');
        const originalValue = getFormFieldLabel(event, 0);

        await act(() => {
          selection.select(event);
        });

        const labelInput = domQuery('input[name=StartEvent_1-formField-0-formFieldLabel]', container);

        changeInput(labelInput, 'newLabel');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(labelInput.value).to.eql(originalValue);
      }));

  });


  describe('#type', function() {

    it('should display empty option given undefined type', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // when
      const typeSelect = domQuery('select[name=StartEvent_1-formField-0-formFieldType]', container);
      const firstOption = domQuery('option', typeSelect);

      // then
      expect(firstOption.value).to.equal('');
    }));


    it('should not display empty option given defined type', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const typeSelect = domQuery('select[name=UserTask_1-formField-0-formFieldType]', container);
      const firstOption = domQuery('option', typeSelect);

      // then
      expect(firstOption.value).to.equal('boolean');
    }));


    describe('defined types', function() {

      it('should display for undefined type', inject(async function(elementRegistry, selection) {

        // given
        const event = elementRegistry.get('StartEvent_1');

        await act(() => {
          selection.select(event);
        });

        // when
        const typeSelect = domQuery('select[name=StartEvent_1-formField-0-formFieldType]', container);

        // then
        expect(typeSelect.value).to.equal('');
      }));


      it('should display for defined type', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const typeSelect = domQuery('select[name=UserTask_1-formField-0-formFieldType]', container);

        // then
        expect(typeSelect.value).to.equal(getFormFieldType(task, 0));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const event = elementRegistry.get('StartEvent_1');

        await act(() => {
          selection.select(event);
        });

        const typeSelect = domQuery('select[name=StartEvent_1-formField-0-formFieldType]', container);

        // when
        changeInput(typeSelect, 'enum');

        // then
        expect(getFormFieldType(event, 0)).to.equal('enum');
      }));


      it('should update on external change', inject(
        async function(elementRegistry, selection, commandStack) {

          // given
          const task = elementRegistry.get('UserTask_1');
          const originalValue = getFormFieldType(task, 0);

          await act(() => {
            selection.select(task);
          });

          const typeSelect = domQuery('select[name=UserTask_1-formField-0-formFieldType]', container);

          changeInput(typeSelect, 'enum');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(typeSelect.value).to.eql(originalValue);
        }));

    });


    describe('custom type', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const typeSelect = domQuery('select[name=UserTask_1-formField-1-formFieldType]', container);
        const customTypeInput = domQuery('input[name=UserTask_1-formField-1-formFieldCustomType]', container);

        // then
        expect(typeSelect.value).to.equal('');
        expect(customTypeInput).to.exist;
        expect(customTypeInput.value).to.equal(getFormFieldType(task, 1));
      }));


      it('should not display', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const typeSelect = domQuery('select[name=UserTask_1-formField-0-formFieldType]', container);
        const customTypeInput = domQuery('input[name=UserTask_1-0-formFieldCustomType]', container);

        // then
        expect(typeSelect.value).to.equal(getFormFieldType(task, 0));
        expect(customTypeInput).to.not.exist;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        const customTypeInput = domQuery('input[name=UserTask_1-formField-1-formFieldCustomType]', container);

        // when
        changeInput(customTypeInput, 'myNewVal');

        // then
        expect(getFormFieldType(task, 1)).to.equal('myNewVal');
      }));


      it('should keep select value unchanged', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        const typeSelect = domQuery('select[name=UserTask_1-formField-1-formFieldType]', container);
        const customTypeInput = domQuery('input[name=UserTask_1-formField-1-formFieldCustomType]', container);

        // when
        changeInput(customTypeInput, 'myNewVal');

        // then
        expect(typeSelect.value).to.equal('');
      }));


      it('should update on external change', inject(
        async function(elementRegistry, selection, commandStack) {

          // given
          const task = elementRegistry.get('UserTask_1');
          const originalValue = getFormFieldType(task, 1);

          await act(() => {
            selection.select(task);
          });

          const customTypeInput = domQuery('input[name=UserTask_1-formField-1-formFieldCustomType]', container);

          changeInput(customTypeInput, 'myNewCustomType');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(customTypeInput.value).to.eql(originalValue);
        }));

    });


    describe('integration', function() {

      it('should remove values when type set to boolean', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_2');

        await act(() => {
          selection.select(userTask);
        });

        const typeSelect = domQuery('select[name=UserTask_2-formField-0-formFieldType]', container);

        // when
        changeInput(typeSelect, 'boolean');

        // then
        expect(getFormFieldValues(userTask, 0)).to.be.empty;
      }));

    });

  });


  describe('#defaultValue', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // when
      const defaultValueInput = domQuery('input[name=StartEvent_1-formField-0-formFieldDefaultValue]', container);

      // then
      expect(defaultValueInput).to.exist;
      expect(defaultValueInput.value).to.equal(getFormFieldDefaultValue(event, 0));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      const defaultValueInput = domQuery('input[name=StartEvent_1-formField-0-formFieldDefaultValue]', container);

      // when
      changeInput(defaultValueInput, 'newDefault');

      // then
      expect(getFormFieldDefaultValue(event, 0)).to.equal('newDefault');
    }));


    it('should update on external change', inject(
      async function(elementRegistry, selection, commandStack) {

        // given
        const event = elementRegistry.get('StartEvent_1');
        const originalValue = getFormFieldDefaultValue(event, 0);

        await act(() => {
          selection.select(event);
        });

        const defaultValueInput = domQuery('input[name=StartEvent_1-formField-0-formFieldDefaultValue]', container);

        changeInput(defaultValueInput, 'newLabel');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(defaultValueInput.value).to.eql(originalValue);
      }));

  });


  describe('#validation', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // when
      const constraintsEntry = domQuery('div[data-entry-id=StartEvent_1-formField-0-formFieldConstraints]', container);

      // then
      expect(constraintsEntry).to.exist;
    }));


    it('should add constraint, also adding validation', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // assume
      expect(getFormFieldValidation(event, 0)).to.not.exist;

      // when
      const constraintsEntry = domQuery('div[data-entry-id=StartEvent_1-formField-0-formFieldConstraints]', container);
      const addConstraintButton = domQuery('button.bio-properties-panel-add-entry', constraintsEntry);

      clickInput(addConstraintButton);

      // then
      const validation = getFormFieldValidation(event, 0);
      expect(validation).to.exist;
      expect(validation.get('constraints')).to.have.length(1);
    }));


    it('should add constraint, re-using validation', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      const validation = getFormFieldValidation(task, 0);

      // assume
      expect(validation).to.exist;

      // when
      const constraintsEntry = domQuery('div[data-entry-id=UserTask_1-formField-0-formFieldConstraints]', container);
      const addConstraintButton = domQuery('button.bio-properties-panel-add-entry', constraintsEntry);

      clickInput(addConstraintButton);

      // then
      expect(validation).to.equal(getFormFieldValidation(task, 0));
      expect(validation.get('constraints')).to.have.length(3);
    }));


    it('should add constraint to bottom', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const constraintsEntry = domQuery('div[data-entry-id=UserTask_1-formField-0-formFieldConstraints]', container);
      const addConstraintButton = domQuery('button.bio-properties-panel-add-entry', constraintsEntry);

      clickInput(addConstraintButton);

      // then
      const contraintHeadings = domQueryAll('.bio-properties-panel-list-entry-item', constraintsEntry);
      const bottomContraintHeading = domQuery('.bio-properties-panel-collapsible-entry-header-title', contraintHeadings[2]);
      expect(bottomContraintHeading.innerHTML).to.equal('&lt;empty&gt;');
    }));


    it('should remove constraint', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      // assume
      const validation = getFormFieldValidation(task, 0);
      expect(validation.get('constraints')).to.have.length(2);

      // when
      const constraints = domQuery('div[data-entry-id=UserTask_1-formField-0-formFieldConstraints', container);
      const removeConstraintButton = domQuery('button.bio-properties-panel-remove-entry', constraints);

      clickInput(removeConstraintButton);

      // then
      expect(validation.get('constraints')).to.have.length(1);
    }));


    describe('constraints', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // then
        const validation = getFormFieldValidation(task, 0);
        const constraintEntries = domQueryAll('div[data-entry-id=UserTask_1-formField-0-formFieldConstraints] li', container);

        expect(validation.get('constraints').length).to.equal(constraintEntries.length);
      }));


      it('should display constraint name as label', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // then
        const validation = getFormFieldValidation(task, 0);
        const constraintEntries = domQueryAll('div[data-entry-id=UserTask_1-formField-0-formFieldConstraints] li', container);
        const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', constraintEntries[0]);

        expect(validation.get('constraints')[0].name).to.equal(label.innerHTML);
      }));


      it('should display empty label given no name', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // then
        const constraintEntries = domQueryAll('div[data-entry-id=UserTask_1-formField-0-formFieldConstraints] li', container);
        const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', constraintEntries[1]);

        expect(label.innerHTML).to.equal('&lt;empty&gt;');
      }));


      it('should NOT sort', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_4');

        await act(() => {
          selection.select(task);
        });

        // when
        const heading = domQuery(
          'div[data-entry-id=UserTask_4-formField-0-formFieldConstraints] [title="Constraints"]',
          container
        );
        clickInput(heading);

        // then
        const constraintEntries = Array.from(domQueryAll(
          'div[data-entry-id=UserTask_4-formField-0-formFieldConstraints] .bio-properties-panel-collapsible-entry-header-title',
          container)).map(e => e.innerHTML);

        expect(constraintEntries).to.eql([
          'Constraint3',
          'Constraint1',
          'Constraint2' ]);
      }));

    });

  });


  describe('#properties', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // when
      const propertiesEntry = domQuery('div[data-entry-id=StartEvent_1-formField-0-formFieldProperties]', container);

      // then
      expect(propertiesEntry).to.exist;
    }));


    it('should add property, also adding properties', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // assume
      expect(getFormFieldProperties(event, 0)).to.not.exist;

      // when
      const propertiesEntry = domQuery('div[data-entry-id=StartEvent_1-formField-0-formFieldProperties]', container);
      const addPropertyButton = domQuery('button.bio-properties-panel-add-entry', propertiesEntry);

      clickInput(addPropertyButton);

      // then
      const properties = getFormFieldProperties(event, 0);
      expect(properties).to.exist;
      expect(properties.get('values')).to.have.length(1);
    }));


    it('should add property, re-using properties', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      const properties = getFormFieldProperties(task, 0);

      // assume
      expect(properties).to.exist;

      // when
      const propertiesEntry = domQuery('div[data-entry-id=UserTask_1-formField-0-formFieldProperties]', container);
      const addPropertyButton = domQuery('button.bio-properties-panel-add-entry', propertiesEntry);

      clickInput(addPropertyButton);

      // then
      expect(properties).to.equal(getFormFieldProperties(task, 0));
      expect(properties.get('values')).to.have.length(3);
    }));


    it('should remove property', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      // assume
      const properties = getFormFieldProperties(task, 0);
      expect(properties.get('values')).to.have.length(2);

      // when
      const propertiesEntry = domQuery('div[data-entry-id=UserTask_1-formField-0-formFieldProperties]', container);
      const removePropertyButton = domQuery('button.bio-properties-panel-remove-entry', propertiesEntry);

      clickInput(removePropertyButton);

      // then
      expect(properties.get('values')).to.have.length(1);
    }));


    describe('properties', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // then
        const properties = getFormFieldProperties(task, 0);
        const propertyEntries = domQueryAll('div[data-entry-id=UserTask_1-formField-0-formFieldProperties] li', container);

        expect(properties.get('values').length).to.equal(propertyEntries.length);
      }));


      it('should display property id as label', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // then
        const properties = getFormFieldProperties(task, 0);
        const propertyEntries = domQueryAll('div[data-entry-id=UserTask_1-formField-0-formFieldProperties] li', container);
        const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', propertyEntries[1]);

        expect(properties.get('values')[0].id).to.equal(label.innerHTML);
      }));


      it('should display empty label given no name', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // then
        const propertyEntries = domQueryAll('div[data-entry-id=UserTask_1-formField-0-formFieldProperties] li', container);
        const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', propertyEntries[0]);

        expect(label.innerHTML).to.equal('&lt;empty&gt;');
      }));


      it('should display in the right order', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_4');

        await act(() => {
          selection.select(task);
        });

        // when
        const heading = domQuery(
          'div[data-entry-id=UserTask_4-formField-0-formFieldProperties] [title="Properties"]',
          container
        );
        clickInput(heading);

        // then
        const propertiesEntries = Array.from(domQueryAll(
          'div[data-entry-id=UserTask_4-formField-0-formFieldProperties] .bio-properties-panel-collapsible-entry-header-title',
          container)).map(e => e.innerHTML);

        expect(propertiesEntries).to.eql([
          'Property1',
          'Property2',
          'Property3' ]);
      }));

    });

  });


  describe('#values', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('UserTask_2');

      await act(() => {
        selection.select(event);
      });

      // when
      const valuesEntry = domQuery('div[data-entry-id=UserTask_2-formField-0-formFieldValues]', container);

      // then
      expect(valuesEntry).to.exist;
    }));


    it('should not display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(event);
      });

      // when
      const valuesEntry = domQuery('div[data-entry-id=UserTask_1-formField-0-formFieldValues]', container);

      // then
      expect(valuesEntry).to.not.exist;
    }));


    it('should add value', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_2');

      await act(() => {
        selection.select(task);
      });

      // assume
      expect(getFormFieldValues(task, 0)).to.have.length(2);

      // when
      const valuesEntry = domQuery('div[data-entry-id=UserTask_2-formField-0-formFieldValues]', container);
      const addValueButton = domQuery('button.bio-properties-panel-add-entry', valuesEntry);

      clickInput(addValueButton);

      // then
      expect(getFormFieldValues(task, 0)).to.have.length(3);
    }));


    it('should remove value', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_2');

      await act(() => {
        selection.select(task);
      });

      // assume
      expect(getFormFieldValues(task, 0)).to.have.length(2);

      // when
      const valuesEntry = domQuery('div[data-entry-id=UserTask_2-formField-0-formFieldValues]', container);
      const removeValueButton = domQuery('button.bio-properties-panel-remove-entry', valuesEntry);

      clickInput(removeValueButton);

      // then
      expect(getFormFieldValues(task, 0)).to.have.length(1);
    }));


    describe('values', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_2');

        await act(() => {
          selection.select(task);
        });

        // then
        const values = getFormFieldValues(task, 0);
        const valueEntries = domQueryAll('div[data-entry-id=UserTask_2-formField-0-formFieldValues] li', container);

        expect(values.length).to.equal(valueEntries.length);
      }));


      it('should display value id as label', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_2');

        await act(() => {
          selection.select(task);
        });

        // then
        const values = getFormFieldValues(task, 0);
        const valueEntries = domQueryAll('div[data-entry-id=UserTask_2-formField-0-formFieldValues] li', container);
        const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', valueEntries[0]);

        expect(values[0].id).to.equal(label.innerHTML);
      }));


      it('should display empty label given no id', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_2');

        await act(() => {
          selection.select(task);
        });

        // then
        const valueEntries = domQueryAll('div[data-entry-id=UserTask_2-formField-0-formFieldValues] li', container);
        const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', valueEntries[1]);

        expect(label.innerHTML).to.equal('&lt;empty&gt;');
      }));

    });

  });

});

// helper //////

function getFormData(element) {
  const bo = getBusinessObject(element);

  return getExtensionElementsList(bo, 'camunda:FormData')[0];
}

function getFormFieldsList(element) {
  const businessObject = getBusinessObject(element);

  const formData = getFormData(businessObject);

  return formData && formData.fields;
}

function getFormField(element, idx) {
  return getFormFieldsList(element)[idx];
}

function getFormFieldId(element, formFieldIdx) {
  return getFormField(element, formFieldIdx).get('id');
}

function getFormFieldLabel(element, formFieldIdx) {
  return getFormField(element, formFieldIdx).get('label');
}

function getFormFieldType(element, formFieldIdx) {
  return getFormField(element, formFieldIdx).get('type');
}

function getFormFieldDefaultValue(element, formFieldIdx) {
  return getFormField(element, formFieldIdx).get('defaultValue');
}

function getFormFieldValidation(element, formFieldIdx) {
  return getFormField(element, formFieldIdx).get('validation');
}

function getFormFieldProperties(element, formFieldIdx) {
  return getFormField(element, formFieldIdx).get('properties');
}

function getFormFieldValues(element, formFieldIdx) {
  return getFormField(element, formFieldIdx).get('values');
}
