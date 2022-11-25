import TestContainer from 'mocha-test-container-support';

import {
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import {
  bootstrapModeler,
  createCanvasEvent as canvasEvent,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import coreModule from 'bpmn-js/lib/core';
import elementTemplatesModule from 'src/provider/cloud-element-templates';
import propertiesCommandsModule from 'src/cmd';
import modelingModule from 'bpmn-js/lib/features/modeling';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './ElementTemplates.bpmn';
import integrationXML from './fixtures/integration.bpmn';

import templates from './fixtures/simple';
import complexTemplates from './fixtures/complex';
import integrationTemplates from './fixtures/integration';
import { findExtensions, findExtension } from 'src/provider/cloud-element-templates/Helper';


describe('provider/cloud-element-templates - ElementTemplates', function() {

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
      propertiesCommandsModule,
      {
        propertiesPanel: [ 'value', { registerProvider() {} } ]
      }
    ],
    moddleExtensions: {
      zeebe: zeebeModdlePackage
    }
  }));

  beforeEach(inject(function(elementTemplates) {
    elementTemplates.set(templates);
  }));


  describe('get', function() {

    it('should get template by ID', inject(function(elementTemplates) {

      // when
      const template = elementTemplates.get('foo');

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).not.to.exist;
    }));


    it('should get template by ID and version', inject(function(elementTemplates) {

      // when
      const template = elementTemplates.get('foo', 1);

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).to.equal(1);
    }));


    it('should get template by element (template ID)', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const template = elementTemplates.get(task);

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).not.to.exist;
    }));


    it('should get template by element (template ID and version)', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_2');

      // when
      const template = elementTemplates.get(task);

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).to.equal(1);
    }));


    it('should not get template (no template with ID)', inject(function(elementTemplates) {

      // when
      const template = elementTemplates.get('oof');

      // then
      expect(template).to.be.null;
    }));


    it('should not get template (no template with version)', inject(function(elementTemplates) {

      // when
      const template = elementTemplates.get('foo', -1);

      // then
      expect(template).to.be.null;
    }));


    it('should not get template (no template applied to element)', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_3');

      // when
      const template = elementTemplates.get(task);

      // then
      expect(template).to.be.null;
    }));

  });


  describe('getAll', function() {

    it('should get all templates', inject(function(elementTemplates) {

      // when
      const templates = elementTemplates.getAll();

      // then
      expectTemplates(templates, [
        [ 'my.mail.Task' ],
        [ 'deprecated' ],
        [ 'default', 1 ],
        [ 'foo' ],
        [ 'foo', 1 ],
        [ 'foo', 2 ],
        [ 'foo', 3 ],
        [ 'bar', 1 ],
        [ 'bar', 2 ],
        [ 'baz' ]
      ]);
    }));


    it('should get all template versions', inject(function(elementTemplates) {

      // when
      const templates = elementTemplates.getAll('foo');

      // then
      expectTemplates(templates, [
        [ 'foo' ],
        [ 'foo', 1 ],
        [ 'foo', 2 ],
        [ 'foo', 3 ],
      ]);
    }));


    it('should get all applicable templates', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_3');

      // when
      const templates = elementTemplates.getAll(task);

      // then
      expectTemplates(templates, [
        [ 'foo' ],
        [ 'foo', 1 ],
        [ 'foo', 2 ],
        [ 'foo', 3 ],
        [ 'bar', 1 ],
        [ 'bar', 2 ],
        [ 'baz' ]
      ]);
    }));


    it('should throw for invalid argument', inject(function(elementTemplates) {

      // then
      expect(function() {
        elementTemplates.getAll(false);
      }).to.throw('argument must be of type {string|djs.model.Base|undefined}');

    }));

  });


  describe('getLatest', function() {

    it('should get all latest templates', inject(function(elementTemplates) {

      // when
      const templates = elementTemplates.getLatest();

      // then
      expectTemplates(templates, [
        [ 'my.mail.Task' ],
        [ 'default', 1 ],
        [ 'foo', 3 ],
        [ 'bar', 2 ],
        [ 'baz' ]
      ]);
    }));


    it('should get all latest templates (including deprecated)', inject(function(elementTemplates) {

      // when
      const templates = elementTemplates.getLatest(null, { deprecated: true });

      // then
      expectTemplates(templates, [
        [ 'my.mail.Task' ],
        [ 'deprecated' ],
        [ 'default', 1 ],
        [ 'foo', 3 ],
        [ 'bar', 2 ],
        [ 'baz' ]
      ]);
    }));


    it('should get latest template version', inject(function(elementTemplates) {

      // when
      const templates = elementTemplates.getLatest('bar');

      // then
      expectTemplates(templates, [
        [ 'bar', 2 ]
      ]);
    }));


    it('should get latest template version (including deprecated)', inject(function(elementTemplates) {

      // when
      const templates = elementTemplates.getLatest('deprecated', { deprecated: true });

      // then
      expectTemplates(templates, [
        [ 'deprecated' ]
      ]);
    }));


    it('should hide deprecated template version', inject(function(elementTemplates) {

      // when
      const templates = elementTemplates.getLatest('deprecated');

      // then
      expectTemplates(templates, []);
    }));


    it('should get latest template version (mixed versions)', inject(function(elementTemplates) {

      // when
      const templates = elementTemplates.getLatest('foo');

      // then
      expectTemplates(templates, [
        [ 'foo', 3 ]
      ]);
    }));


    it('should get latest template version (no version)', inject(function(elementTemplates) {

      // when
      const templates = elementTemplates.getLatest('baz');

      // then
      expectTemplates(templates, [
        [ 'baz' ]
      ]);
    }));


    it('should get all applicable templates', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_3');

      // when
      const templates = elementTemplates.getLatest(task);

      // then
      expectTemplates(templates, [
        [ 'foo', 3 ],
        [ 'bar', 2 ],
        [ 'baz' ]
      ]);
    }));


    it('should throw for invalid argument', inject(function(elementTemplates) {

      // then
      expect(function() {
        elementTemplates.getLatest(false);
      }).to.throw('argument must be of type {string|djs.model.Base|undefined}');

    }));

  });


  describe('createElement', function() {

    it('should create element', inject(function(elementTemplates) {

      // given
      const templates = require('./fixtures/complex.json');

      // when
      const element = elementTemplates.createElement(templates[0]);

      const extensionElements = getBusinessObject(element).get('extensionElements');

      // then
      expect(element.businessObject.get('name')).to.eql('Rest Task');
      expect(extensionElements).to.exist;
      expect(extensionElements.get('values')).to.have.length(3);
    }));


    it('should not create conditional properties', inject(function(elementTemplates) {

      // given
      const template = require('./fixtures/condition.json');

      // when
      const element = elementTemplates.createElement(template);

      const businessObject = getBusinessObject(element);

      // then
      // expect properties
      expect(businessObject.get('customProperty')).to.be.undefined;

      // expect ioMapping
      const ioMapping = findExtension(businessObject, 'zeebe:IoMapping');
      expect(ioMapping).to.be.undefined;

      // expect taskHeaders
      const taskHeaders = findExtension(businessObject, 'zeebe:TaskHeaders');
      expect(taskHeaders).to.be.undefined;

      // expect taskDefinition
      const taskDefinition = findExtension(businessObject, 'zeebe:TaskDefinition');
      expect(taskDefinition).to.be.undefined;
    }));


    it('should throw error - no template', inject(function(elementTemplates) {

      // given
      const emptyTemplate = null;

      // then
      expect(function() {
        elementTemplates.createElement(emptyTemplate);
      }).to.throw(/template is missing/);
    }));


    it('integration', inject(
      function(create, dragging, elementRegistry, elementTemplates) {

        // given
        const templates = require('./fixtures/complex.json');

        const processElement = elementRegistry.get('Process_1');

        const element = elementTemplates.createElement(templates[0]);

        // when
        create.start(canvasEvent({ x: 250, y: 300 }), element);
        dragging.move(canvasEvent({ x: 100, y: 200 }));
        dragging.hover({ element: processElement });
        dragging.end();

        // then
        expect(element).to.exist;
        expect(element.parent).to.eql(processElement);
      })
    );

  });


  describe('applyTemplate', function() {

    it('should set template on element', inject(function(elementRegistry, elementTemplates) {

      // given
      const task = elementRegistry.get('Task_1');

      const template = elementTemplates.getAll().find(
        t => isAny(task, t.appliesTo)
      );

      // assume
      expect(template).to.exist;

      // when
      const updatedTask = elementTemplates.applyTemplate(task, template);

      // then
      expect(updatedTask).to.exist;
      expect(elementTemplates.get(updatedTask)).to.equal(template);
    }));


    it('should only have 1 task definition', inject(function(elementRegistry, elementTemplates) {

      // given
      elementTemplates.set(complexTemplates);
      const task = elementRegistry.get('ConfiguredTask');
      const template = elementTemplates.get('io.camunda.connectors.RestConnector-s1');

      // when
      const updatedTask = elementTemplates.applyTemplate(task, template);

      // then
      expect(updatedTask).to.exist;
      expect(elementTemplates.get(updatedTask)).to.equal(template);

      const taskDefinitions = findExtensions(updatedTask, [ 'zeebe:TaskDefinition' ]);
      expect(taskDefinitions).to.have.length(1);
      expect(taskDefinitions[0].get('type')).to.eql('http');
    }));


    it('should apply valid dynamic property binding', inject(function(elementRegistry, elementTemplates) {

      // given
      elementTemplates.set([
        require('./fixtures/condition-dropdown-dynamic-values.json'),
        require('./fixtures/condition-dropdown-dynamic-values-1.json')
      ]);

      const template = elementTemplates.get('condition-dropdown-dynamic-values');
      const task = elementTemplates.applyTemplate(elementRegistry.get('Task_3'), template);

      // assume
      expect(
        task.businessObject.extensionElements.values[0].inputParameters[0].source
      ).to.eql(
        'action1'
      );

      expect(
        task.businessObject.extensionElements.values[1].type
      ).to.eql(
        'action1-value'
      );

      // when
      const newTemplate = elementTemplates.get('condition-dropdown-dynamic-values-1');
      const updatedTask = elementTemplates.applyTemplate(task, newTemplate);

      // then
      expect(updatedTask).to.exist;

      // assume
      expect(
        updatedTask.businessObject.extensionElements.values[0].inputParameters[0].source
      ).to.eql(
        'action1'
      );

      expect(
        updatedTask.businessObject.extensionElements.values[1].type
      ).to.eql(
        'action1-value-2'
      );
    }));

  });

});


describe('provider/cloud-element-templates - ElementTemplates - integration', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('applyTemplate', function() {

    /*
      These Tests confirm that our assumptions for keeping bindings hold true
      over differnt scenrios. The basic assumptions are:

       * Existing values will be kept, if they are valid in the new template
       * Hidden values defined in the new template override existing values
       * New default values override old (unchanged) default values

      For unit tests over all possbile values, see `./cmd/ChangeElementTemplateHandler.spec.js`
      cf. https://github.com/bpmn-io/bpmn-js-properties-panel/issues/638
    */


    beforeEach(bootstrapModeler(integrationXML, {
      container: container,
      modules: [
        coreModule,
        elementTemplatesModule,
        modelingModule,
        propertiesCommandsModule,
        {
          propertiesPanel: [ 'value', { registerProvider() {} } ]
        }
      ],
      moddleExtensions: {
        zeebe: zeebeModdlePackage
      }
    }));


    beforeEach(inject(function(elementTemplates) {
      elementTemplates.set(integrationTemplates);
    }));


    it('Service Task => Template', inject(
      function(elementRegistry, elementTemplates) {
        let task = elementRegistry.get('configuredTask');
        const template = elementTemplates.get('templateA', 1);

        // assume
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'existing'
          },
          {
            target: 'changedDefaultValue',
            source: 'existing'
          },
          {
            target: 'hiddenValue',
            source: 'existing'
          }
        ]);

        // when
        task = elementTemplates.applyTemplate(task, template);

        // then
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'existing'
          },
          {
            target: 'defaultValue',
            source: 'A1'
          },
          {
            target: 'changedDefaultValue',
            source: 'existing'
          },
          {
            target: 'hiddenValue',
            source: 'A1'
          }
        ]);
      }
    ));


    it('Template v1 => Template v2', inject(
      function(elementRegistry, elementTemplates) {
        let task = elementRegistry.get('templateTask');
        const template = elementTemplates.get('templateA', 2);

        // assume
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'A1'
          },
          {
            target: 'defaultValue',
            source: 'A1'
          },
          {
            target: 'changedDefaultValue',
            source: 'A1-changed'
          },
          {
            target: 'hiddenValue',
            source: 'A1'
          }
        ]);

        // when
        task = elementTemplates.applyTemplate(task, template);

        // then
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'A1'
          },
          {
            target: 'defaultValue',
            source: 'A2'
          },
          {
            target: 'changedDefaultValue',
            source: 'A1-changed'
          },
          {
            target: 'hiddenValue',
            source: 'A2'
          }
        ]);
      }
    ));


    it('Template A => Template B', inject(
      function(elementRegistry, elementTemplates) {
        let task = elementRegistry.get('templateTask');
        const template = elementTemplates.get('templateB');

        // assume
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'A1'
          },
          {
            target: 'defaultValue',
            source: 'A1'
          },
          {
            target: 'changedDefaultValue',
            source: 'A1-changed'
          },
          {
            target: 'hiddenValue',
            source: 'A1'
          }
        ]);

        // when
        task = elementTemplates.applyTemplate(task, template);

        // then
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'A1'
          },
          {
            target: 'defaultValue',
            source: 'B'
          },
          {
            target: 'changedDefaultValue',
            source: 'A1-changed'
          },
          {
            target: 'hiddenValue',
            source: 'B'
          }
        ]);
      }
    ));


    it('Template => ServiceTask (unlink)', inject(
      function(elementRegistry, elementTemplates) {
        let task = elementRegistry.get('templateTask');

        // assume
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'A1'
          },
          {
            target: 'defaultValue',
            source: 'A1'
          },
          {
            target: 'changedDefaultValue',
            source: 'A1-changed'
          },
          {
            target: 'hiddenValue',
            source: 'A1'
          }
        ]);

        // when
        task = elementTemplates.applyTemplate(task, null);

        // then
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'A1'
          },
          {
            target: 'defaultValue',
            source: 'A1'
          },
          {
            target: 'changedDefaultValue',
            source: 'A1-changed'
          },
          {
            target: 'hiddenValue',
            source: 'A1'
          }
        ]);
      }
    ));


    it('Template => ServiceTask => Template', inject(
      function(elementRegistry, elementTemplates) {
        let task = elementRegistry.get('templateTask');
        const template = elementTemplates.get(task);

        // when
        task = elementTemplates.applyTemplate(task, null);
        task = elementTemplates.applyTemplate(task, template);


        // then
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'A1'
          },
          {
            target: 'defaultValue',
            source: 'A1'
          },
          {
            target: 'changedDefaultValue',
            source: 'A1-changed'
          },
          {
            target: 'hiddenValue',
            source: 'A1'
          }
        ]);
      }
    ));


    it('REST Connector (Basic auth) => REST Connector', inject(
      function(elementRegistry, elementTemplates) {
        let task = elementRegistry.get('REST_TASK');
        const template = elementTemplates.get('io.camunda.connectors.HttpJson.v2');

        // assume
        expectInputs(task, [
          {
            target: 'authentication.type',
            source: 'basic'
          },
          {
            target: 'url',
            source: 'https://foo'
          },
          {
            target: 'authentication.username',
            source: 'aaa'
          }
        ]);

        // when
        task = elementTemplates.applyTemplate(task, template);

        // then
        expectInputs(task, [
          {
            target: 'authentication.type',
            source: 'basic'
          },
          {
            target: 'url',
            source: 'https://foo'
          },
          {
            target: 'authentication.username',
            source: 'aaa'
          }
        ]);
      }
    ));


    /**
     * Dropdowns should always keep the last existing value if it is a valid
     * option in the dropdown.
     */
    it('Template A => Template B (with dropdowns)', inject(
      function(elementRegistry, elementTemplates) {
        let task = elementRegistry.get('templateTask');
        const template = elementTemplates.get('TemplateBDropdown');

        // assume
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'A1'
          },
          {
            target: 'defaultValue',
            source: 'A1'
          },
          {
            target: 'changedDefaultValue',
            source: 'A1-changed'
          },
          {
            target: 'hiddenValue',
            source: 'A1'
          }
        ]);


        // when
        task = elementTemplates.applyTemplate(task, template);

        // then
        expectInputs(task, [
          {
            target: 'normalValue',
            source: 'A1'
          },
          {
            target: 'defaultValue',
            source: 'A1'
          },
          {
            target: 'changedDefaultValue',
            source: 'B' // existing value is not a valid option, take the default
          },
          {
            target: 'hiddenValue',
            source: 'A1'
          }
        ]);

      }
    ));

  });

});


// helpers //////////////////////

function expectTemplates(templates, expected) {

  expect(templates).to.exist;
  expect(templates).to.have.length(expected.length);

  expected.forEach(function([ id, version ]) {
    expect(templates.find(t => t.id === id && t.version === version)).to.exist;
  });
}

function expectInputs(element, expected) {
  const ioMapping = findExtension(element, 'zeebe:IoMapping');
  expect(ioMapping).to.exist;

  const inputs = ioMapping.get('zeebe:inputParameters');
  expect(inputs).to.have.length(expected.length);

  expected.forEach(function({ source, target }) {
    const input = inputs.find(i => {
      return i.get('source') === source && i.get('target') === target;
    });

    expect(input, `<${source}> -> <${target}> binding`).to.exist;
  });
}