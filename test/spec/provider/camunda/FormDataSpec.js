'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    coreModule = require('bpmn-js/lib/core');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    find = require('lodash/collection/find');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    getExtensionElements = require('../../../../lib/helper/ExtensionElementsHelper').getExtensionElements,
    formHelper = require('../../../../lib/helper/FormHelper');

var camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

function deleteConstraint(idx, container) {
  var query = '[data-entry="constraints-list"] [data-index="'+idx+'"] [data-action="deleteElement"]',
      deleteButton = domQuery(query, container);

  // remove the first constraint
  TestHelper.triggerEvent(deleteButton, 'click');
}

describe('form-data', function() {

  var diagramXML = require('./FormData.bpmn');

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules,
    moddleExtensions: { camunda: camundaModdlePackage }
  }));

  var shape,
      getInputField,
      getSelectBox;

  beforeEach(inject(function(commandStack, propertiesPanel, elementRegistry, selection) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);

    shape = elementRegistry.get('StartEvent_1');

    selection.select(shape);

    getInputField = function(id) {
      return domQuery('input[id=camunda-'+id+']', propertiesPanel._container);
    };

    getSelectBox = function(id) {
      return domQuery('[data-entry="form-field-type"] select', propertiesPanel._container);
    };

  }));

  it('should fetch form fields of an element', inject(function(propertiesPanel) {

    // when
    var formFieldSelectBox = domQuery('select[name=selectedExtensionElement]', propertiesPanel._container);

    // then
    expect(formFieldSelectBox.options).to.have.length(3);
    expect(formFieldSelectBox.options[0].value).to.equal('firstname');
    expect(formFieldSelectBox.options[1].value).to.equal('lastname');
    expect(formFieldSelectBox.options[2].value).to.equal('dateOfBirth');
  }));

  it('should fetch the properties of the first form field of an element', inject(function(propertiesPanel) {

    // when selecting the first form field
    TestHelper.triggerFormFieldSelection(0, propertiesPanel._container);

    // then
    expect(getInputField('form-field-id').value).to.equal('firstname');
    expect(getInputField('form-field-label').value).to.equal('Firstname');
    expect(getSelectBox('form-field-type').value).to.equal('string');
    expect(getInputField('form-field-defaultValue').value).to.equal('myDefault');
    expect(domClasses(getInputField('form-field-id')).has('invalid')).to.be.false;
  }));

  it('should fetch the properties of the third form field of an element', inject(function(propertiesPanel) {

    // when selecting the first form field
    TestHelper.triggerFormFieldSelection(2, propertiesPanel._container);

    // then
    expect(getInputField('form-field-id').value).to.equal('dateOfBirth');
    expect(getInputField('form-field-label').value).to.equal('Date of Birth');
    expect(getSelectBox('form-field-type').value).to.equal('date');
    expect(getInputField('form-field-defaultValue').value).is.empty;
  }));

  describe('change properties on first form field of an element', function() {

    var label,
        formFields;

    beforeEach(function() {
      // select first form field
      TestHelper.triggerFormFieldSelection(0, container);

      label = getInputField('form-field-label');
      formFields = getBusinessObject(shape).extensionElements.values[0].fields;

      // when
      TestHelper.triggerValue(label, 'newLabel', 'change');
    });

    describe('in the DOM', function() {

      it('should execute', function() {
        // then
        expect(label.value).to.equal('newLabel');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(label.value).to.equal('Firstname');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(getInputField('form-field-label').value).to.equal('newLabel');
      }));
    });

    describe('on the business object', function() {

      it('should execute', function() {
        // then
        expect(formFields[0].label).to.equal('newLabel');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(formFields[0].label).to.equal('Firstname');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(formFields[0].label).to.equal('newLabel');
      }));
    });
  });

  describe('add form field', function() {

    it('should add form fields to element without extenstion elements', inject(
      function(elementRegistry, selection) {
        // given
        var userTask_4 = elementRegistry.get('UserTask_4');

        // when
        selection.select(userTask_4);

        var addButton = domQuery('[data-entry="form-fields"] [data-action="createElement"]', container);

        TestHelper.triggerEvent(addButton, 'click');
        TestHelper.triggerEvent(addButton, 'click');

        // then
        // on business object
        var formFields = formHelper.getFormFields(userTask_4);
        expect(formFields).to.have.length(2);

        // in DOM
        var formFieldSelectBox = domQuery('#cam-extensionElements-form-fields', container);
        expect(formFieldSelectBox.childNodes).to.have.length(2);
      })
    );


    it('should add form field to element with existing extenstion elements', inject(
      function(elementRegistry, selection) {
        // given
        var userTask_3 = elementRegistry.get('UserTask_3');

        // when
        selection.select(userTask_3);

        var addButton = domQuery('[data-entry="form-fields"] [data-action="createElement"]', container);

        TestHelper.triggerEvent(addButton, 'click');
        TestHelper.triggerEvent(addButton, 'click');

        // then
        // on business object
        var formFields = formHelper.getFormFields(userTask_3);
        expect(formFields).to.have.length(2);

        // in DOM
        var formFieldSelectBox = domQuery('#cam-extensionElements-form-fields', container);
        expect(formFieldSelectBox.childNodes).to.have.length(2);
      })
    );

  });


  describe('set spaces as form field id', function() {

    var id,
        formFields;

    beforeEach(function() {
      // select first form field
      TestHelper.triggerFormFieldSelection(0, container);

      id = getInputField('form-field-id');
      formFields = getBusinessObject(shape).extensionElements.values[0].fields;

      TestHelper.triggerValue(id, '  ', 'change');
    });

    describe('in the DOM', function() {

      it('should execute', function() {

        // then
        // should show the invalid id in the text field
        expect(id.value).to.equal('  ');
        // should show an invalid error
        expect(domClasses(id).has('invalid')).to.be.true;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        // should show the previous id in the text field
        expect(id.value).to.equal('firstname');
        // should not show an invalid error
        expect(domClasses(id).has('invalid')).to.be.false;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        // cannot redo to invalid state
        expect(id.value).to.equal('firstname');
        expect(domClasses(id).has('invalid')).to.be.false;
      }));

    });

    describe('on the business object', function() {

      it('should not execute', function() {

        // then
        // should not set an invalid id on the business object
        expect(formFields[0].id).to.equal('firstname');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        // should not set an invalid id on the business object
        expect(formFields[0].id).to.equal('firstname');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        // should not set an invalid id on the business object
        expect(formFields[0].id).to.equal('firstname');
      }));

    });

  });

  describe('set a non unique form field id (globally)', function() {

    var id,
        formFields;

    beforeEach(inject(function(elementRegistry, selection) {

      shape = elementRegistry.get('UserTask_2');

      selection.select(shape);

      // select first form field

      var formFieldContainer = domQuery('[data-entry="form-fields"]');

      TestHelper.triggerFormFieldSelection(0, formFieldContainer);

      id = getInputField('form-field-id');
      formFields = getBusinessObject(shape).extensionElements.values[0].fields;

      // set an id used in another scope (StartEvent_1)
      TestHelper.triggerValue(id, 'firstname', 'change');
    }));

    describe('on the business object', function() {

      it('should execute', function() {
        expect(formFields[0].id).to.equal('firstname');
      });

    });

    describe('in the DOM', function() {

      it('should execute', function() {
        expect(id.value).to.equal('firstname');
        expect(domClasses(id).has('invalid')).to.be.false;
      });

    });

  });

  describe('set a non unique form field id (in the start event scope)', function() {

    var id,
        formFields;

    beforeEach(inject(function(elementRegistry, selection) {

      // select first form field

      var formFieldContainer = domQuery('[data-entry="form-fields"]');

      TestHelper.triggerFormFieldSelection(1, formFieldContainer);

      id = getInputField('form-field-id');

      formFields = getBusinessObject(shape).extensionElements.values[0].fields;

      // set an id used in another scope (StartEvent_1)
      TestHelper.triggerValue(id, 'firstname', 'change');
    }));


    describe('on the business object', function() {

      it('should not execute', function() {
        expect(formFields[1].id).to.equal('lastname');
      });

    });

    describe('in the DOM', function() {

      it('should not execute', function() {
        expect(id.value).to.equal('firstname');
        expect(domClasses(id).has('invalid')).to.be.true;
      });

    });

  });

  describe('delete form field', function() {

    beforeEach(inject(function() {

      // select the third form field 'dateOfBirth'
      TestHelper.triggerFormFieldSelection(2, container);

      var removeButton = domQuery('button[id=cam-extensionElements-remove-form-fields]', container);

      TestHelper.triggerEvent(removeButton, 'click');
    }));


    describe('on the business object', function() {

      var getFormFields;

      var isContainedIn = function(fields, value) {
        return find(fields, function(field) {
          return field.id === value;
        });
      };

      beforeEach(function() {
        getFormFields = function() {
          return getBusinessObject(shape).extensionElements.values[0].fields;
        };
      });


      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(isContainedIn(getFormFields(), 'firstname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'lastname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'dateOfBirth')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(isContainedIn(getFormFields(), 'firstname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'lastname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'dateOfBirth')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        expect(isContainedIn(getFormFields(), 'firstname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'lastname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'dateOfBirth')).not.to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var formFieldSelectBox;
      var formBusinessKeySelectBox;

      var isContainedIn = function(selectBox, value) {
        return find(selectBox, function(node) {
          return node.value === value;
        });
      };

      beforeEach(inject(function() {
        formFieldSelectBox = domQuery('select[name=selectedExtensionElement]', container);
        formBusinessKeySelectBox = domQuery('select[name=businessKey]', container);

      }));


      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(isContainedIn(formFieldSelectBox, 'firstname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'lastname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'dateOfBirth')).not.to.be.ok;
        expect(isContainedIn(formBusinessKeySelectBox, 'dateOfBirth')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(isContainedIn(formFieldSelectBox, 'firstname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'lastname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'dateOfBirth')).to.be.ok;
        expect(isContainedIn(formBusinessKeySelectBox, 'dateOfBirth')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(isContainedIn(formFieldSelectBox, 'firstname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'lastname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'dateOfBirth')).not.to.be.ok;
        expect(isContainedIn(formBusinessKeySelectBox, 'dateOfBirth')).not.to.be.ok;
      }));

    });

  });


  describe('camunda:validation', function() {

    var getConstraintNodes,
        constraintsList;

    var getConstraints = function(shape, idx) {
      return getBusinessObject(shape).extensionElements.values[0].fields[0].validation.constraints;
    };

    beforeEach(function() {
      // select first form field
      TestHelper.triggerFormFieldSelection(0, container);

      constraintsList = domQuery('[data-entry="constraints-list"]', container);

      // get all constraints from the DOM
      getConstraintNodes = function() {
        return domQuery('[data-list-entry-container]', constraintsList).childNodes;
      };
    });

    it('should show constraints', function() {

      // when selecting first form field
      // then
      var constraintNodes = getConstraintNodes();

      expect(constraintNodes).to.have.length(2);

      expect(constraintNodes[0].childNodes[0].value).to.equal('maxlength');
      expect(constraintNodes[0].childNodes[1].value).to.equal('25');

      expect(constraintNodes[1].childNodes[0].value).to.equal('required');
    });


    describe('add constraint', function() {

      beforeEach(inject(function(propertiesPanel) {
        var addButton = domQuery('[data-action="addElement"]', constraintsList);

        TestHelper.triggerEvent(addButton, 'click');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {

          // when selecting first form field
          // then
          var constraintNodes = getConstraintNodes();

          expect(constraintNodes).to.have.length(3);
          expect(constraintNodes[2].childNodes[0].value).to.equal('');
          expect(constraintNodes[2].childNodes[1].value).to.equal('');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var constraintNodes = getConstraintNodes();

          expect(constraintNodes).to.have.length(2);
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var constraintNodes = getConstraintNodes();

          expect(constraintNodes).to.have.length(3);
          expect(constraintNodes[2].childNodes[0].value).to.equal('');
          expect(constraintNodes[2].childNodes[1].value).to.equal('');
        }));

      });


      describe('on the business Object', function() {

        it('should execute', function() {

          // when selecting first form field
          // then
          var constraints = getConstraints(shape, 0),
              lastConstraint = constraints[constraints.length-1];

          expect(constraints).to.have.length(3);
          expect(is(lastConstraint, 'camunda:Constraint')).to.be.true;
          expect(lastConstraint.name).to.be.undefined;
          expect(lastConstraint.config).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var constraints = getConstraints(shape, 0),
              lastConstraint = constraints[constraints.length-1];

          expect(constraints).to.have.length(2);
          expect(lastConstraint.name).to.equal('required');
          expect(lastConstraint.config).to.be.undefined;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var constraints = getConstraints(shape, 0),
              lastConstraint = constraints[constraints.length-1];

          expect(constraints).to.have.length(3);
          expect(is(lastConstraint, 'camunda:Constraint')).to.be.true;
          expect(lastConstraint.name).to.be.undefined;
          expect(lastConstraint.config).to.be.undefined;
        }));

      });

    });


    describe('update constraint', function() {

      var textField;

      beforeEach(function() {
        textField = domQuery('[data-entry="constraints-list"] [data-index="1"] .bpp-table-row-columns-2', container);

        TestHelper.triggerValue(textField, 'minlength', 'change');
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(textField.value).to.equal('minlength');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(textField.value).to.equal('required');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(textField.value).to.equal('minlength');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var constraints = getConstraints(shape, 0);

          expect(constraints[1].name).to.equal('minlength');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var constraints = getConstraints(shape, 0);

          expect(constraints[1].name).to.equal('required');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var constraints = getConstraints(shape, 0);

          expect(constraints[1].name).to.equal('minlength');
        }));

      });

    });


    describe('remove constraint', function() {

      beforeEach(inject(function(propertiesPanel) {
        var query = '[data-entry="constraints-list"] [data-index="0"] [data-action="deleteElement"]',
            deleteButton = domQuery(query, container);

        // remove the first constraint
        TestHelper.triggerEvent(deleteButton, 'click');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          // when deleting the first constraint
          // then
          var constraintNodes = getConstraintNodes();

          expect(constraintNodes).to.have.length(1);
          expect(constraintNodes[0].childNodes[0].value).to.equal('required');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var constraintNodes = getConstraintNodes();

          expect(constraintNodes).to.have.length(2);
          expect(constraintNodes[0].childNodes[0].value).to.equal('maxlength');
          expect(constraintNodes[1].childNodes[0].value).to.equal('required');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var constraintNodes = getConstraintNodes();

          expect(constraintNodes).to.have.length(1);
          expect(constraintNodes[0].childNodes[0].value).to.equal('required');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var constraints = getConstraints(shape, 0);

          expect(constraints).to.have.length(1);
          expect(constraints[0].name).to.equal('required');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var constraints = getConstraints(shape, 0);

          expect(constraints).to.have.length(2);
          expect(constraints[0].name).to.equal('maxlength');
          expect(constraints[1].name).to.equal('required');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var constraints = getConstraints(shape, 0);

          expect(constraints).to.have.length(1);
          expect(constraints[0].name).to.equal('required');
        }));

      });

    });


    describe('remove all constraints', function() {

      beforeEach(inject(function(propertiesPanel) {
        deleteConstraint(0, propertiesPanel._container);
        deleteConstraint(0, propertiesPanel._container);
      }));

      describe('on the business object', function() {

        it('should remove camunda:validation', function() {

          // then
          var formData = getExtensionElements(getBusinessObject(shape), 'camunda:FormData'),
              formField = formData[0].fields[0];

          expect(formField.validation).to.be.undefined;
        });


        it('should remove camunda:validation - undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var constraints = getConstraints(shape, 0);

          expect(constraints).to.have.length(1);
          expect(constraints[0].name).to.equal('required');
        }));


        it('should remove camunda:validation - redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var formData = getExtensionElements(getBusinessObject(shape), 'camunda:FormData'),
              formField = formData[0].fields[0];

          expect(formField.validation).to.be.undefined;
        }));

      });

    });

  });

  describe('integration', function() {

    it('should add constraint on bo without existing extension elements', inject(function(elementRegistry, selection) {

      var shape = elementRegistry.get('UserTask_1');

      // when
      // select user task with form key
      selection.select(shape);


      // add form field
      var createFormFieldButton = domQuery('[data-entry="form-fields"] [data-action="createElement"]', container);

      TestHelper.triggerEvent(createFormFieldButton, 'click');

      // add constraint
      var addConstraintButton = domQuery('[data-entry="constraints-list"] [data-action="addElement"]', container);

      TestHelper.triggerEvent(addConstraintButton, 'click');

      var formData = getExtensionElements(getBusinessObject(shape), 'camunda:FormData');

      var formField = formData[0].fields[0];

      // then
      expect(is(formField.validation, 'camunda:Validation')).to.be.true;

      var constraints = formField.validation.constraints;

      expect(constraints).to.have.length(1);
      expect(is(constraints[0], 'camunda:Constraint'));
      expect(constraints[0].name).to.be.undefined;
      expect(constraints[0].config).to.be.undefined;
    }));

  });


  describe('businessKey', function() {
    var businessKeySelectBox;
    beforeEach(inject(function(elementRegistry) {

      // select first form field
      businessKeySelectBox = domQuery('select[name=businessKey]', container);
    }));

    describe ('on select value', function() {

      beforeEach(inject(function(propertiesPanel) {
        businessKeySelectBox.options[1].selected = 'selected';
        TestHelper.triggerEvent(businessKeySelectBox, 'change');
      }));

      describe ('in DOM', function() {
        it('should execute', function() {
          expect(businessKeySelectBox.value).to.be.equal(businessKeySelectBox.options[1].value);
        });

        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(businessKeySelectBox.value).not.to.be.ok;
        }));

        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(businessKeySelectBox.value).to.be.equal(businessKeySelectBox.options[1].value);
        }));

      });

      describe('on the business Object', function() {
        it('should execute', function() {
          expect(getBusinessObject(shape).extensionElements.values[0].get('businessKey')).to.be.equal(businessKeySelectBox.options[1].value);
        });

        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getBusinessObject(shape).extensionElements.values[0].get('businessKey')).not.to.be.ok;
        }));

        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(getBusinessObject(shape).extensionElements.values[0].get('businessKey')).to.be.equal(businessKeySelectBox.options[1].value);
        }));
      });

    });

    describe ('on select empty value', function() {

      beforeEach(inject(function(propertiesPanel) {
        businessKeySelectBox.options[1].selected = 'selected';
        TestHelper.triggerEvent(businessKeySelectBox, 'change');

        businessKeySelectBox.options[0].selected = 'selected';
        TestHelper.triggerEvent(businessKeySelectBox, 'change');
      }));

      describe ('in DOM', function() {
        it('should execute', function() {
          expect(businessKeySelectBox.value).not.to.be.ok;
        });

        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(businessKeySelectBox.value).to.be.equal(businessKeySelectBox.options[1].value);
        }));

        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(businessKeySelectBox.value).not.to.be.ok;
        }));

      });

      describe('on the business Object', function() {
        it('should execute', function() {
          expect(getBusinessObject(shape).extensionElements.values[0].get('businessKey')).not.to.be.ok;
        });

        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getBusinessObject(shape).extensionElements.values[0].get('businessKey')).to.be.equal(businessKeySelectBox.options[1].value);
        }));

        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(getBusinessObject(shape).extensionElements.values[0].get('businessKey')).not.to.be.ok;
        }));
      });

    });


    describe ('on field type change to boolean', function() {
      it ('should be empty if same field changed', function() {
        //when
        businessKeySelectBox.options[1].selected = 'selected';
        TestHelper.triggerEvent(businessKeySelectBox, 'change');
        TestHelper.triggerFormFieldSelection(0, container);

        var typeSelectBox = domQuery('select[name=type]', container);
        typeSelectBox.options[2].selected = 'selected';
        TestHelper.triggerEvent(typeSelectBox, 'change');

        //then
        expect(getBusinessObject(shape).extensionElements.values[0].get('businessKey')).not.to.be.ok;
      });

      it ('should not be cleared if another field type changes', function() {
        //when
        businessKeySelectBox.options[1].selected = 'selected';
        TestHelper.triggerEvent(businessKeySelectBox, 'change');
        TestHelper.triggerFormFieldSelection(2, container);

        var typeSelectBox = domQuery('select[name=type]', container);
        typeSelectBox.options[2].selected = 'selected';
        TestHelper.triggerEvent(typeSelectBox, 'change');

        //then
        expect(getBusinessObject(shape).extensionElements.values[0].get('businessKey')).to.be.ok;
      });
    });



    it ('should be disabled if no fields available for selection', function() {
      businessKeySelectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(businessKeySelectBox, 'change');
      // delete all fields
      TestHelper.triggerFormFieldSelection(2, container);
      var removeButton = domQuery('button[id=cam-extensionElements-remove-form-fields]', container);
      TestHelper.triggerEvent(removeButton, 'click');
      TestHelper.triggerFormFieldSelection(1, container);
      TestHelper.triggerEvent(removeButton, 'click');
      TestHelper.triggerFormFieldSelection(0, container);
      TestHelper.triggerEvent(removeButton, 'click');

      //then
      expect(getBusinessObject(shape).extensionElements.values[0].get('businessKey')).not.to.be.ok;
      expect(businessKeySelectBox.className).to.be.equal('bpp-hidden');
    });

  });


  describe('remove', function() {

    describe('defaultValue', function() {

      var inputField,
          formFields;

      beforeEach(function() {
        // select first form field
        TestHelper.triggerFormFieldSelection(0, container);

        inputField = getInputField('form-field-defaultValue');
        formFields = getBusinessObject(shape).extensionElements.values[0].fields;

        // when
        TestHelper.triggerValue(inputField, '', 'change');
      });

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(inputField.value).to.equal('');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(inputField.value).to.equal('myDefault');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(inputField.value).to.equal('');
        }));
      });

      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(formFields[0].defaultValue).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(formFields[0].defaultValue).to.equal('myDefault');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(formFields[0].defaultValue).to.be.undefined;
        }));
      });

    });


    describe('label', function() {

      var inputField,
          formFields;

      beforeEach(function() {
        // select first form field
        TestHelper.triggerFormFieldSelection(0, container);

        inputField = getInputField('form-field-label');
        formFields = getBusinessObject(shape).extensionElements.values[0].fields;

        // when
        TestHelper.triggerValue(inputField, '', 'change');
      });

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(inputField.value).to.equal('');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(inputField.value).to.equal('Firstname');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(inputField.value).to.equal('');
        }));
      });

      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(formFields[0].label).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(formFields[0].label).to.equal('Firstname');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(formFields[0].label).to.be.undefined;
        }));
      });

    });


  });

});
