import TestContainer from 'mocha-test-container-support';

import {
  bootstrapPropertiesPanel,
  changeInput,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  act
} from '@testing-library/preact';

import {
  map
} from 'min-dash';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  findCamundaErrorEventDefinition,
  findCamundaInOut,
  findCamundaProperty,
  findError,
  findExtension,
  findExtensions,
  findInputParameter,
  findOutputParameter
} from '../../../../../src/provider/element-templates/Helper';

import coreModule from 'bpmn-js/lib/core';
import modelingModule from 'bpmn-js/lib/features/modeling';
import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import BpmnPropertiesPanel from 'src/render';
import elementTemplatesModule from 'src/provider/element-templates';

import diagramXML from './CustomProperties.bpmn';
import elementTemplates from './CustomProperties.json';

import descriptionDiagramXML from './CustomProperties.description.bpmn';
import descriptionElementTemplates from './CustomProperties.description.json';

import editableDiagramXML from './CustomProperties.editable.bpmn';
import editableElementTemplates from './CustomProperties.editable.json';

import groupsDiagramXML from './CustomProperties.groups.bpmn';
import groupsElementTemplates from './CustomProperties.groups.json';


describe('provider/element-templates - CustomProperties', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    container,
    debounceInput: false,
    elementTemplates,
    moddleExtensions: {
      camunda: camundaModdlePackage
    },
    modules: [
      BpmnPropertiesPanel,
      coreModule,
      elementTemplatesModule,
      modelingModule
    ]
  }));


  describe('property', function() {

    it('should display', async function() {

      // when
      await expectSelected('AsyncTask');

      // then
      const entry = findEntry('custom-entry-my.awesome.Task-0', container);

      expect(entry).to.exist;

      const input = findInput('checkbox', entry);

      expect(input).to.exist;
      expect(input.checked).to.be.true;
    });


    it('should display (bpmn:conditionExpression)', async function() {

      // when
      await expectSelected('VipOrderPath');

      // then
      const entry = findEntry('custom-entry-e.com.merce.FastPath-0', container);

      expect(entry).to.exist;

      const input = findInput('text', entry);

      expect(input).to.exist;
      expect(input.value).to.equal('${ customer.vip }');
    });


    // TODO(philippfromme): does it make sense to display a value that isn't set on the element?
    it('should display (default value)', async function() {

      // when
      const task = await expectSelected('AsyncTask'),
            businessObject = getBusinessObject(task);

      // assume
      expect(businessObject.get('camunda:jobPriority')).not.to.exist;

      // then
      const entry = findEntry('custom-entry-my.awesome.Task-1', container);

      expect(entry).to.exist;

      const input = findInput('text', entry);

      expect(input).to.exist;
      expect(input.value).to.equal('1000');
    });


    it('should change, updating Boolean property', async function() {

      // given
      const task = await expectSelected('AsyncTask'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.awesome.Task-0', container),
            input = findInput('checkbox', entry);

      input.click();

      // then
      expect(input.checked).to.be.false;

      expect(businessObject.get('camunda:asyncBefore')).to.be.false;
    });


    it('should change String property to empty string when erased', async function() {

      // given
      const task = await expectSelected('AsyncTask_2'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.awesome.Task_2-1', container),
            input = findInput('text', entry);

      changeInput(input, '');

      // then
      expect(input.value).to.eql('');

      expect(businessObject.get('camunda:jobPriority')).to.be.eql('');
    });

  });


  describe('camunda:property', function() {

    it('should display', async function() {

      // when
      await expectSelected('WebserviceTask');

      // then
      const entry = findEntry('custom-entry-com.mycompany.WsCaller-0', container);

      expect(entry).to.exist;

      const input = findInput('text', entry);

      expect(input).to.exist;
      expect(input.value).to.equal('https://foo.bar');
    });


    it('should change, updating camunda:Property', async function() {

      // given
      const task = await expectSelected('WebserviceTask'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-com.mycompany.WsCaller-0', container),
            input = findInput('text', entry);

      changeInput(input, 'https://baba');

      // then
      const camundaProperties = findExtension(businessObject, 'camunda:Properties'),
            camundaProperty = findCamundaProperty(camundaProperties, { name: 'webServiceUrl' });

      expect(camundaProperty).to.exist;
      expect(camundaProperty.get('camunda:value')).to.equal('https://baba');
    });


    it('should change, creating camunda:Property if non-existing', async function() {

      // given
      const task = await expectSelected('WebserviceTask_NoData'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-com.mycompany.WsCaller-0', container),
            input = findInput('text', entry);

      changeInput(input, 'https://baba');

      // then
      const camundaProperties = findExtension(businessObject, 'camunda:Properties'),
            camundaProperty = findCamundaProperty(camundaProperties, { name: 'webServiceUrl' });

      expect(camundaProperty).to.exist;
      expect(camundaProperty.get('camunda:value')).to.equal('https://baba');
    });

  });


  describe('camunda:inputParameter', function() {

    it('should display', async function() {

      // when
      await expectSelected('MailTask');

      // then
      const entry = findEntry('custom-entry-my.mail.Task-0', container),
            input = findInput('text', entry);

      expect(entry).to.exist;
      expect(input).to.exist;
      expect(input.value).to.equal('asdasd');
    });


    it('should hide if type=Hidden', async function() {

      // when
      await expectSelected('MailTask');

      // then
      const entry = findEntry('custom-entry-my.mail.Task-3', container);

      expect(entry).not.to.exist;
    });


    it('should change, setting camunda:InputParameter (plain)', inject(async function(elementRegistry) {

      // given
      const task = await expectSelected('MailTask'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.mail.Task-0', container),
            input = findInput('text', entry);

      changeInput(input, 'foo@bar');

      // then
      var inputOutput = findExtension(businessObject, 'camunda:InputOutput'),
          inputParameter = findInputParameter(inputOutput, { name: 'recipient' });

      expect(inputParameter).to.exist;
      expect(inputParameter).to.jsonEqual({
        $type: 'camunda:InputParameter',
        name: 'recipient',
        value: 'foo@bar'
      });
    }));


    it('should change, setting camunda:InputParameter (script)', async function() {

      // given
      const task = await expectSelected('MailTask'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.mail.Task-1', container),
            textarea = findTextarea(entry);

      changeInput(textarea, 'Hello ${foo}');

      // then
      const inputOutput = findExtension(businessObject, 'camunda:InputOutput'),
            inputParameter = findInputParameter(inputOutput, { name: 'messageBody' });

      expect(inputParameter).to.exist;
      expect(inputParameter).to.jsonEqual({
        $type: 'camunda:InputParameter',
        name: 'messageBody',
        definition: {
          $type: 'camunda:Script',
          scriptFormat: 'freemarker',
          value: 'Hello ${foo}'
        }
      });
    });


    it('should change, creating camunda:InputParameter if non-existing', async function() {

      // given
      const task = await expectSelected('MailTask_NoData'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.mail.Task-0', container),
            input = findInput('text', entry);

      changeInput(input, 'foo@bar');

      // then
      const inputOutput = findExtension(businessObject, 'camunda:InputOutput'),
            inputParameter = findInputParameter(inputOutput, { name: 'recipient' });

      // then
      expect(inputParameter).to.exist;
      expect(inputParameter).to.jsonEqual({
        $type: 'camunda:InputParameter',
        name: 'recipient',
        value: 'foo@bar'
      });
    });

  });


  describe('camunda:outputParameter', function() {

    it('should display', async function() {

      // when
      await expectSelected('MailTask');

      // then
      const entry = findEntry('custom-entry-my.mail.Task-2', container),
            input = findInput('text', entry);

      expect(entry).to.exist;
      expect(input).to.exist;
      expect(input.value).to.equal('mailResult');
    });


    it('should change, setting camunda:OutputParameter (script)', async function() {

      // given
      const task = await expectSelected('MailTask'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.mail.Task-2', container),
            input = findInput('text', entry);

      changeInput(input, 'result');

      // then
      const inputOutput = findExtension(businessObject, 'camunda:InputOutput'),
            outputParameter = findOutputParameter(inputOutput, {
              source: '${mailResult}',
              scriptFormat: 'freemarker'
            });

      // then
      expect(outputParameter).to.exist;
      expect(outputParameter).to.jsonEqual({
        $type: 'camunda:OutputParameter',
        name: 'result',
        definition: {
          $type: 'camunda:Script',
          scriptFormat: 'freemarker',
          value: '${mailResult}'
        }
      });
    });


    it('should change, creating camunda:OutputParameter if non-existing', async function() {

      // given
      const task = await expectSelected('MailTask_NoData'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.mail.Task-2', container),
            input = findInput('text', entry);

      changeInput(input, 'result');

      // then
      const inputOutput = findExtension(businessObject, 'camunda:InputOutput'),
            outputParameter = findOutputParameter(inputOutput, {
              source: '${mailResult}',
              scriptFormat: 'freemarker'
            });

      expect(outputParameter).to.exist;
      expect(outputParameter).to.jsonEqual({
        $type: 'camunda:OutputParameter',
        name: 'result',
        definition: {
          $type: 'camunda:Script',
          scriptFormat: 'freemarker',
          value: '${mailResult}'
        }
      });
    });

  });


  describe('camunda:in', function() {

    it('should display', async function() {

      // when
      await expectSelected('CallActivity');

      // then
      const entry = findEntry('custom-entry-my.Caller-1', container),
            input = findInput('text', entry);

      expect(entry).to.exist;
      expect(input).to.exist;
      expect(input.value).to.equal('var_local');
    });


    it('should change, setting camunda:in (source)', async function() {

      // given
      const task = await expectSelected('CallActivity'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.Caller-1', container),
            input = findInput('text', entry);

      changeInput(input, 'result');

      // then
      const camundaIn = findCamundaInOut(businessObject, {
        target: 'var_called_source',
        type: 'camunda:in'
      });

      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        target: 'var_called_source',
        source: 'result'
      });
    });


    it('should change, setting camunda:in:businessKey', async function() {

      // given
      const task = await expectSelected('CallActivity'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.Caller-9', container),
            input = findInput('text', entry);

      changeInput(input, '${key}');

      // then
      const camundaIn = findCamundaInOut(businessObject, {
        type: 'camunda:in:businessKey'
      });

      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        businessKey: '${key}'
      });
    });


    it('should change, setting camunda:in (sourceExpression)', async function() {

      // given
      const task = await expectSelected('CallActivity'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.Caller-3', container),
            input = findInput('text', entry);

      changeInput(input, '${expr_foo}');

      // then
      const camundaIn = findCamundaInOut(businessObject, {
        target: 'var_called_expr',
        type: 'camunda:in'
      });

      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        target: 'var_called_expr',
        sourceExpression: '${expr_foo}'
      });
    });


    it('should change, creating camunda:in if non-existing', async function() {

      // given
      const task = await expectSelected('CallActivity_NoData'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.Caller-3', container),
            input = findInput('text', entry);

      changeInput(input, '${expr_foo}');

      // then
      const camundaIn = findCamundaInOut(businessObject, {
        target: 'var_called_expr',
        type: 'camunda:in'
      });

      expect(camundaIn).to.jsonEqual({
        $type: 'camunda:In',
        target: 'var_called_expr',
        sourceExpression: '${expr_foo}'
      });
    });

  });


  describe('camunda:out', function() {

    it('should display', async function() {

      // when
      await expectSelected('CallActivity');

      // then
      const entry = findEntry('custom-entry-my.Caller-2', container),
            input = findInput('text', entry);

      expect(entry).to.exist;
      expect(input).to.exist;
      expect(input.value).to.equal('var_called');
    });


    it('should change, setting camunda:out (source)', async function() {

      // given
      const task = await expectSelected('CallActivity'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.Caller-2', container),
            input = findInput('text', entry);

      changeInput(input, 'result');

      // then
      const camundaOut = findCamundaInOut(businessObject, {
        source: 'var_local_source',
        type: 'camunda:out'
      });

      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        target: 'result',
        source: 'var_local_source'
      });
    });


    it('should change, setting camunda:out (sourceExpression)', async function() {

      // given
      const task = await expectSelected('CallActivity'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.Caller-4', container),
            input = findInput('text', entry);

      changeInput(input, 'local_foo');

      // then
      const camundaOut = findCamundaInOut(businessObject, {
        sourceExpression: '${expr_called}',
        type: 'camunda:out'
      });

      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        target: 'local_foo',
        sourceExpression: '${expr_called}'
      });
    });


    it('should change, creating camunda:out if non-existing', async function() {

      // given
      const task = await expectSelected('CallActivity_NoData'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-my.Caller-4', container),
            input = findInput('text', entry);

      changeInput(input, 'local_foo');

      // then
      const camundaOut = findCamundaInOut(businessObject, {
        sourceExpression: '${expr_called}',
        type: 'camunda:out'
      });

      expect(camundaOut).to.jsonEqual({
        $type: 'camunda:Out',
        target: 'local_foo',
        sourceExpression: '${expr_called}'
      });
    });

  });


  describe('camunda:executionListener', function() {

    it('should hide', async function() {

      // when
      await expectSelected('ExecutionListenerTask');

      // then
      const entry = findEntry('custom-entry-my.execution.listener.task-0', container);

      // then
      expect(entry).not.to.exist;
    });

  });


  describe('camunda:field', function() {

    it('should display', async function() {

      // when
      await expectSelected('ServiceTask_FieldInjection');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.CustomServiceTaskFieldInjection-0', container),
            input = findInput('text', entry);

      expect(entry).to.exist;
      expect(input).to.exist;
      expect(input.value).to.equal('buhh');
    });


    it('should change, updating camunda:field', async function() {

      // given
      const task = await expectSelected('ServiceTask_FieldInjection'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-com.camunda.example.CustomServiceTaskFieldInjection-0', container),
            input = findInput('text', entry);

      changeInput(input, 'https://baba');

      // then
      const camundaFields = findExtensions(businessObject, [ 'camunda:Field' ]);

      expect(camundaFields).to.exist;
      expect(camundaFields).to.jsonEqual([
        {
          $type: 'camunda:Field',
          string: 'https://baba',
          name: 'sender'
        },
        {
          $type: 'camunda:Field',
          name: 'sender2',
          string: 'buhh1'
        }
      ]);
    });


    it('should change, creating camunda:field if non-existing', async function() {

      // given
      const task = await expectSelected('ServiceTask_FieldInjection_NoData'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-com.camunda.example.CustomServiceTaskFieldInjection-0', container),
            input = findInput('text', entry);

      changeInput(input, 'https://baba');

      // given
      const camundaFields = findExtensions(businessObject, [ 'camunda:Field' ]);

      // then
      expect(camundaFields).to.exist;
      expect(camundaFields).to.jsonEqual([
        {
          $type: 'camunda:Field',
          string: 'https://baba',
          name: 'sender'
        }
      ]);
    });

  });


  describe('camunda:errorEventDefinition', function() {

    it('should display', async function() {

      // when
      await expectSelected('ExternalErrorTask');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.ExternalErrorTask-1', container),
            input = findInput('text', entry);

      expect(entry).to.exist;
      expect(input).to.exist;
      expect(input.value).to.equal('error-expression');
    });


    it('should change, updating camunda:errorEventDefinition', async function() {

      // given
      const task = await expectSelected('ExternalErrorTask'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-com.camunda.example.ExternalErrorTask-1', container),
            input = findInput('text', entry);

      changeInput(input, '${true}');

      // then
      const camundaErrorEventDefinition = findCamundaErrorEventDefinition(businessObject, 'error-1');

      // then
      expect(camundaErrorEventDefinition).to.exist;
      expect(camundaErrorEventDefinition.get('expression')).to.equal('${true}');
    });


    it('should change, creating camunda:errorEventDefinition if non-existing', async function() {

      // given
      const task = await expectSelected('ExternalErrorTask_NoData'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-com.camunda.example.ExternalErrorTask-1', container),
            input = findInput('text', entry);

      changeInput(input, '${true}');

      // then
      const camundaErrorEventDefinition = findCamundaErrorEventDefinition(businessObject, 'error-1');

      // then
      expect(camundaErrorEventDefinition).to.exist;
      expect(camundaErrorEventDefinition.get('expression')).to.equal('${true}');
    });

  });


  describe('camunda:Connector', function() {

    describe('property', function() {

      it('should display', async function() {

        // when
        await expectSelected('ConnectorTask');

        // then
        const entry = findEntry('custom-entry-camunda-Connector-0', container),
              input = findInput('text', entry);

        expect(entry).to.exist;
        expect(input).to.exist;
        expect(input.value).to.equal('My Connector HTTP');
      });


      it('should change, updating String property', async function() {

        // given
        await expectSelected('ConnectorTask');

        // when
        const entry = findEntry('custom-entry-camunda-Connector-0', container),
              input = findInput('text', entry);

        // assume
        expect(input.value).to.equal('My Connector HTTP');

        expectValid(entry);

        // when
        changeInput(input, '');

        // then
        expect(input.value).to.equal('');

        expectError(entry, 'Must not be empty.');
      });

    });


    describe('camunda:inputParameter', function() {

      it('should display', async function() {

        // given
        await expectSelected('ConnectorTask');

        const entry = findEntry('custom-entry-camunda-Connector-1', container),
              input = findInput('text', entry);

        // assume
        expect(entry).to.exist;
        expect(input).to.exist;
        expect(input.value).to.equal('');
        expectError(entry, 'Must not be empty.');

        // when
        changeInput(input, 'http://camunda-modeler/');

        // then
        expectValid(entry);
        expect(input.value).to.equal('http://camunda-modeler/');
      });


      it('should hide if type=Hidden', async function() {

        // when
        await expectSelected('ConnectorTask');

        // then
        const entry = findEntry('custom-entry-camunda-Connector-3', container);

        expect(entry).not.to.exist;
      });


      it('should change, setting camunda:InputParameter (plain)', async function() {

        // given
        const task = await expectSelected('ConnectorTask'),
              businessObject = getBusinessObject(task);

        // when
        const entry = findEntry('custom-entry-camunda-Connector-1', container),
              input = findInput('text', entry);

        changeInput(input, 'http://camunda-modeler/');

        // then
        const connector = findExtension(businessObject, 'camunda:Connector'),
              inputOutput = connector.get('inputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'url' });

        // then
        expect(inputParameter).to.exist;
        expect(inputParameter).to.jsonEqual({
          $type: 'camunda:InputParameter',
          name: 'url',
          value: 'http://camunda-modeler/'
        });
      });


      it('should change, setting camunda:InputParameter (script)', async function() {

        // given
        const task = await expectSelected('ConnectorTask'),
              businessObject = getBusinessObject(task);

        // when
        const entry = findEntry('custom-entry-camunda-Connector-4', container),
              textarea = findTextarea(entry);

        changeInput(textarea, 'Hello ${foo}');

        // then
        const connector = findExtension(businessObject, 'camunda:Connector'),
              inputOutput = connector.get('inputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'messageBody' });

        expect(inputParameter).to.exist;
        expect(inputParameter).to.jsonEqual({
          $type: 'camunda:InputParameter',
          name: 'messageBody',
          definition: {
            $type: 'camunda:Script',
            scriptFormat: 'freemarker',
            value: 'Hello ${foo}'
          }
        });
      });


      it('should change, setting camunda:InputParameter (Dropdown)', async function() {

        // given
        const task = await expectSelected('ConnectorTask'),
              businessObject = getBusinessObject(task);

        const entry = findEntry('custom-entry-camunda-Connector-2', container),
              select = findSelect(entry);

        // assume
        expect(select.value).to.equal('');

        // TODO(philippfromme): selects can't be validated at the moment
        expectValid(entry);

        // when
        changeInput(select, 'POST');

        // then
        expect(select.value).to.equal('POST');

        expectValid(entry);

        // then
        const connector = findExtension(businessObject, 'camunda:Connector'),
              inputOutput = connector.get('inputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'method' });

        expect(inputParameter).to.exist;
        expect(inputParameter).to.jsonEqual({
          $type: 'camunda:InputParameter',
          name: 'method',
          value: 'POST'
        });
      });


      it('should change, creating camunda:InputParameter if non-existing', async function() {

        // given
        const task = await expectSelected('ConnectorTask_NoData'),
              businessObject = getBusinessObject(task);

        const entry = findEntry('custom-entry-camunda-Connector-1', container),
              input = findInput('text', entry);

        // assume
        expect(input.value).to.equal('');

        expectError(entry, 'Must not be empty.');

        // when
        changeInput(input, 'http://camunda-modeler/');

        // then
        expect(input.value).to.equal('http://camunda-modeler/');

        expectValid(entry);

        const connector = findExtension(businessObject, 'camunda:Connector'),
              inputOutput = connector.get('inputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'url' });

        expect(inputParameter).to.exist;
        expect(inputParameter).to.jsonEqual({
          $type: 'camunda:InputParameter',
          name: 'url',
          value: 'http://camunda-modeler/'
        });
      });

    });


    describe('camunda:outputParameter', function() {

      it('should display', async function() {

        // when
        await expectSelected('ConnectorTask');

        // then
        const entry = findEntry('custom-entry-camunda-Connector-5', container),
              input = findInput('text', entry);

        expect(entry).to.exist;
        expect(input).to.exist;
        expect(input.value).to.equal('${S(response)}');
      });


      it('should change, setting camunda:OutputParameter (plain)', async function() {

        // given
        const task = await expectSelected('ConnectorTask'),
              businessObject = getBusinessObject(task);

        // when
        const entry = findEntry('custom-entry-camunda-Connector-5', container),
              input = findInput('text', entry);

        changeInput(input, 'result');

        // then
        const connector = findExtension(businessObject, 'camunda:Connector'),
              inputOutput = connector.get('inputOutput'),
              outputParameter = findOutputParameter(inputOutput, { source: 'wsResponse' });

        expect(outputParameter).to.exist;
        expect(outputParameter).to.jsonEqual({
          $type: 'camunda:OutputParameter',
          name: 'result',
          value: 'wsResponse'
        });
      });


      it('should change, setting camunda:OutputParameter (script)', async function() {

        // given
        const task = await expectSelected('ConnectorTask'),
              businessObject = getBusinessObject(task);

        // when
        const entry = findEntry('custom-entry-camunda-Connector-6', container),
              input = findInput('text', entry);

        changeInput(input, 'result');

        // then
        const connector = findExtension(businessObject, 'camunda:Connector'),
              inputOutput = connector.get('inputOutput'),
              outputParameter = findOutputParameter(inputOutput, {
                source: '${httpResult}',
                scriptFormat: 'freemarker'
              });

        // then
        expect(outputParameter).to.exist;
        expect(outputParameter).to.jsonEqual({
          $type: 'camunda:OutputParameter',
          name: 'result',
          definition: {
            $type: 'camunda:Script',
            scriptFormat: 'freemarker',
            value: '${httpResult}'
          }
        });
      });


      it('should change, creating camunda:OutputParameter if non-existing', async function() {

        // given
        const task = await expectSelected('ConnectorTask_NoData'),
              businessObject = getBusinessObject(task);

        // when
        const entry = findEntry('custom-entry-camunda-Connector-6', container),
              input = findInput('text', entry);

        changeInput(input, 'result');

        // then
        const connector = findExtension(businessObject, 'camunda:Connector'),
              inputOutput = connector.get('inputOutput'),
              outputParameter = findOutputParameter(inputOutput, {
                source: '${httpResult}',
                scriptFormat: 'freemarker'
              });

        // then
        expect(outputParameter).to.exist;
        expect(outputParameter).to.jsonEqual({
          $type: 'camunda:OutputParameter',
          name: 'result',
          definition: {
            $type: 'camunda:Script',
            scriptFormat: 'freemarker',
            value: '${httpResult}'
          }
        });
      });

    });

  });


  describe('bpmn:Error', function() {

    it('should display', async function() {

      // when
      await expectSelected('ExternalErrorTask');

      // then
      const errorCodeEntry = findEntry('custom-entry-bpmn-Error-0', container),
            errorCodeInput = findInput('text', errorCodeEntry);

      expect(errorCodeEntry).to.exist;
      expect(errorCodeInput).to.exist;
      expect(errorCodeInput.value).to.equal('my-code');

      const errorMessageEntry = findEntry('custom-entry-bpmn-Error-1', container),
            errorMessageInput = findInput('text', errorMessageEntry);

      expect(errorMessageEntry).to.exist;
      expect(errorMessageInput).to.exist;
      expect(errorMessageInput.value).to.equal('foo');

      const errorNameEntry = findEntry('custom-entry-bpmn-Error-2', container),
            errorNameInput = findInput('text', errorNameEntry);

      expect(errorNameEntry).to.exist;
      expect(errorNameInput).to.exist;
      expect(errorNameInput.value).to.equal('error-name');
    });


    it('should change error code, updating bpmn:Error', async function() {

      // given
      const task = await expectSelected('ExternalErrorTask'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-bpmn-Error-0', container),
            input = findInput('text', entry);

      changeInput(input, 'new-error-code');

      // then
      const error = findError(businessObject, 'error-1');

      expect(error).to.exist;
      expect(error.get('errorCode')).to.equal('new-error-code');
    });


    it('should change error message, updating bpmn:Error', async function() {

      // given
      const task = await expectSelected('ExternalErrorTask'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-bpmn-Error-1', container),
            input = findInput('text', entry);

      changeInput(input, 'new-error-message');

      // then
      const error = findError(businessObject, 'error-1');

      expect(error).to.exist;
      expect(error.get('errorMessage')).to.equal('new-error-message');
    });


    it('should change error name, updating bpmn:Error', async function() {

      // given
      const task = await expectSelected('ExternalErrorTask'),
            businessObject = getBusinessObject(task);

      // when
      const entry = findEntry('custom-entry-bpmn-Error-2', container),
            input = findInput('text', entry);

      changeInput(input, 'new-error-name');

      // then
      const error = findError(businessObject, 'error-1');

      expect(error).to.exist;
      expect(error.get('name')).to.equal('new-error-name');
    });


    it('should change, creating bpmn:Error if non-existing', async function() {

      // given
      const task = await expectSelected('ExternalErrorTask_NoError'),
            businessObject = getBusinessObject(task);

      // assume
      expect(findError(businessObject, 'error-simple')).to.not.exist;

      // when
      const entry = findEntry('custom-entry-bpmn-Error-0', container),
            input = findInput('text', entry);

      changeInput(input, '${true}');

      // then
      const error = findError(businessObject, 'error-simple');

      expect(error).to.exist;
      expect(error.get('errorCode')).to.equal('${true}');
    });

  });


  describe('types', function() {

    describe('dropdown', function() {

      beforeEach(bootstrapPropertiesPanel(require('./CustomProperties.dropdown.bpmn').default, {
        container,
        debounceInput: false,
        elementTemplates,
        moddleExtensions: {
          camunda: camundaModdlePackage
        },
        modules: [
          BpmnPropertiesPanel,
          coreModule,
          elementTemplatesModule,
          modelingModule
        ]
      }));


      it('should display options', async function() {

        // when
        await expectSelected('PriorityTask');

        // then
        const entry = findEntry('custom-entry-my.priority.Task-0', container),
              options = domQueryAll('select option', entry);

        expect(Array.from(options).map(({ selected, value }) => {
          return {
            selected,
            value
          };
        })).to.eql([
          { value: '50', selected: true },
          { value: '100', selected: false },
          { value: '150', selected: false }
        ]);
      });


      it('should change, updating binding', async function() {

        // given
        const task = await expectSelected('PriorityTask'),
              businessObject = getBusinessObject(task);

        const entry = findEntry('custom-entry-my.priority.Task-0', container),
              select = findSelect(entry);

        // when
        changeInput(select, '100');

        // then
        expect(businessObject.get('camunda:priority')).to.equal('100');
      });

    });

  });


  describe('description', function() {

    beforeEach(bootstrapPropertiesPanel(descriptionDiagramXML, {
      container,
      debounceInput: false,
      elementTemplates: descriptionElementTemplates,
      moddleExtensions: {
        camunda: camundaModdlePackage
      },
      modules: [
        BpmnPropertiesPanel,
        coreModule,
        elementTemplatesModule,
        modelingModule
      ]
    }));


    it('should display description for string property', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.description-0', container);

      expect(entry.textContent).to.contain('STRING_DESCRIPTION');
    });


    it('should display description for textarea property', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.description-1', container);

      expect(entry.textContent).to.contain('TEXT_DESCRIPTION');
    });


    it('should display description for boolean property', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.description-2', container);

      expect(entry.textContent).to.contain('BOOLEAN_DESCRIPTION');
    });


    it('should display description for dropdown property', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.description-3', container);

      expect(entry.textContent).to.contain('DROPDOWN_DESCRIPTION');
    });


    it('should display HTML descriptions', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.description-4', container);
      const description = domQuery('.bio-properties-panel-description', entry);

      expect(description).to.exist;
      expect(description.innerHTML).to.eql(
        '<div class="markup">' +
          '<div xmlns="http://www.w3.org/1999/xhtml">' +
            'By the way, you can use ' +
            '<a href="https://freemarker.apache.org/" target="_blank" rel="noopener">freemarker templates</a> ' +
            'here' +
          '</div>' +
        '</div>'
      );
    });


    it('should NOT display empty descriptions', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.description-5', container);
      const description = domQuery('.bio-properties-panel-description', entry);

      expect(description).to.not.exist;
    });
  });


  describe('editable', function() {

    beforeEach(bootstrapPropertiesPanel(editableDiagramXML, {
      container,
      debounceInput: false,
      elementTemplates: editableElementTemplates,
      moddleExtensions: {
        camunda: camundaModdlePackage
      },
      modules: [
        BpmnPropertiesPanel,
        coreModule,
        elementTemplatesModule,
        modelingModule
      ]
    }));


    it('should NOT disable input when editable is NOT set', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.editable-4', container),
            input = findInput('text', entry);

      expect(input).not.to.have.property('disabled', true);
    });


    it('should NOT disable input when editable=true', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.editable-5', container),
            input = findInput('text', entry);

      expect(input).not.to.have.property('disabled', true);
    });


    it('should disable string input when editable=false', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.editable-0', container),
            input = findInput('text', entry);

      expect(input).to.have.property('disabled', true);
    });


    it('should disable textarea input when editable=false', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.editable-1', container),
            input = findTextarea(entry);

      expect(input).to.have.property('disabled', true);
    });


    it('should disable boolean input when editable=false', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.editable-2', container),
            input = findInput('checkbox', entry);

      expect(input).to.have.property('disabled', true);
    });


    it('should disable dropdown input when editable=false', async function() {

      // when
      await expectSelected('Task');

      // then
      const entry = findEntry('custom-entry-com.camunda.example.editable-3', container),
            input = findSelect(entry);

      expect(input).to.have.property('disabled', true);
    });
  });


  describe('validation', function() {

    it('should validate nonEmpty', async function() {

      // given
      await expectSelected('ValidateTask');

      const entry = findEntry('custom-entry-com.validated-inputs.Task-0', container),
            input = findInput('text', entry);

      // assume
      expectError(entry, 'Must not be empty.');

      // when
      changeInput(input, 'FOO');

      // then
      expectValid(entry);
    });


    it('should validate minLength', async function() {

      // given
      await expectSelected('ValidateTask');

      const entry = findEntry('custom-entry-com.validated-inputs.Task-1', container),
            input = findInput('text', entry);

      // assume
      expectError(entry, 'Must have min length 5.');

      // when
      changeInput(input, 'FOOOOOOO');

      // then
      expectValid(entry);
    });


    it('should validate maxLength', async function() {

      // given
      await expectSelected('ValidateTask');

      const entry = findEntry('custom-entry-com.validated-inputs.Task-2', container),
            input = findInput('text', entry);

      // assume
      expectValid(entry);

      // when
      changeInput(input, 'FOOOOOOO');

      // then
      expectError(entry, 'Must have max length 5.');
    });


    it('should validate pattern (String)', async function() {

      // given
      await expectSelected('ValidateTask');

      const entry = findEntry('custom-entry-com.validated-inputs.Task-3', container),
            input = findInput('text', entry);

      // assume
      expectError(entry, 'Must match pattern A+B.');

      // when
      changeInput(input, 'AAAB');

      // then
      expectValid(entry);
    });


    it('should validate pattern (String + Message)', async function() {

      // given
      await expectSelected('ValidateTask');

      const entry = findEntry('custom-entry-com.validated-inputs.Task-4', container),
            input = findInput('text', entry);

      // assume
      expectError(entry, 'Must start with https://');

      // when
      changeInput(input, 'https://');

      // then
      expectValid(entry);
    });


    it('should validate pattern (Integer)', async function() {

      // given
      await expectSelected('ValidateTask');

      const entry = findEntry('custom-entry-com.validated-inputs.Task-5', container),
            input = findInput('text', entry);

      // assume
      expectError(entry, 'Must be positive integer');

      // when
      changeInput(input, '20');

      // then
      expectValid(entry);
    });

  });


  describe('default-types', function() {

    beforeEach(bootstrapPropertiesPanel(require('./CustomProperties.missing-types.bpmn').default, {
      container,
      debounceInput: false,
      elementTemplates: require('./CustomProperties.missing-types.json'),
      moddleExtensions: {
        camunda: camundaModdlePackage
      },
      modules: [
        BpmnPropertiesPanel,
        coreModule,
        elementTemplatesModule,
        modelingModule
      ]
    }));


    it('should display String as default - property', async function() {

      // given
      await expectSelected('SimpleTask');

      const entry = findEntry('custom-entry-com.mycompany.whateverdomain.DefaultTypes-2', container),
            input = findInput('text', entry);

      // then
      expect(input).to.exist;
    });


    it('should display String as default - camunda:Property', async function() {

      // given
      await expectSelected('SimpleTask');

      const entry = findEntry('custom-entry-com.mycompany.whateverdomain.DefaultTypes-3', container),
            input = findInput('text', entry);

      // then
      expect(input).to.exist;
    });


    it('should display String as default - camunda:in', async function() {

      // given
      await expectSelected('SimpleTask');

      const entry = findEntry('custom-entry-com.mycompany.whateverdomain.DefaultTypes-4', container),
            input = findInput('text', entry);

      // then
      expect(input).to.exist;
    });


    it('should display String as default - camunda:in:businessKey', async function() {

      // given
      await expectSelected('SimpleTask');

      const entry = findEntry('custom-entry-com.mycompany.whateverdomain.DefaultTypes-5', container),
            input = findInput('text', entry);

      // then
      expect(input).to.exist;
    });


    it('should display String as default - camunda:out', async function() {

      // given
      await expectSelected('SimpleTask');

      const entry = findEntry('custom-entry-com.mycompany.whateverdomain.DefaultTypes-6', container),
            input = findInput('text', entry);

      // then
      expect(input).to.exist;
    });


    it('should display String as default - camunda:field', async function() {

      // given
      await expectSelected('SimpleTask');

      const entry = findEntry('custom-entry-com.mycompany.whateverdomain.DefaultTypes-7', container),
            input = findInput('text', entry);

      // then
      expect(input).to.exist;
    });

  });


  describe('grouping', function() {

    beforeEach(bootstrapPropertiesPanel(groupsDiagramXML, {
      container,
      debounceInput: false,
      elementTemplates: groupsElementTemplates,
      moddleExtensions: {
        camunda: camundaModdlePackage
      },
      modules: [
        BpmnPropertiesPanel,
        coreModule,
        elementTemplatesModule,
        modelingModule
      ]
    }));


    it('should create defined groups', async function() {

      // given
      await expectSelected('ServiceTask_1');

      // when
      const groups = getGroupIds(container);

      // then
      expect(groups).to.contain('ElementTemplates__CustomProperties-one');
      expect(groups).to.contain('ElementTemplates__CustomProperties-two');
      expect(groups).to.contain('ElementTemplates__CustomProperties-three');
      expect(groups).to.contain('ElementTemplates__CustomProperties');
    });


    it('should display in defined properties order', async function() {

      // given
      await expectSelected('ServiceTask_1');

      // when
      const groups = getGroupIds(container);

      // then
      expect(groups).to.eql([
        'ElementTemplates__Template',
        'ElementTemplates__CustomProperties-one',
        'ElementTemplates__CustomProperties-two',
        'ElementTemplates__CustomProperties-three',
        'ElementTemplates__CustomProperties',
      ]);
    });


    it('should not create defined group (no entries)', async function() {

      // given
      await expectSelected('ServiceTask_noEntries');

      // when
      const groups = getGroupIds(container);

      // then
      expect(groups).to.not.contain('ElementTemplates__CustomProperties-two');
    });


    it('should only create default group', async function() {

      // given
      await expectSelected('ServiceTask_noGroups');

      // when
      const groups = getGroupIds(container);

      // then
      expect(groups).to.eql([
        'ElementTemplates__Template',
        'ElementTemplates__CustomProperties'
      ]);
    });


    it('should not create default group', async function() {

      // given
      await expectSelected('ServiceTask_noDefault');

      // when
      const groups = getGroupIds(container);

      // then
      expect(groups).to.not.contain('ElementTemplates__CustomProperties');
    });


    it('should position into defined groups', async function() {

      // given
      await expectSelected('ServiceTask_1');

      // when
      const entry1 = findEntry('custom-entry-example.com.grouping-one-0', container);
      const entry2 = findEntry('custom-entry-example.com.grouping-two-0', container);
      const entry3 = findEntry('custom-entry-example.com.grouping-three-0', container);

      // then
      expect(getGroup(entry1)).to.equal('ElementTemplates__CustomProperties-one');
      expect(getGroup(entry2)).to.equal('ElementTemplates__CustomProperties-two');
      expect(getGroup(entry3)).to.equal('ElementTemplates__CustomProperties-three');
    });


    it('should position into default group (empty group id)', async function() {

      // given
      await expectSelected('ServiceTask_1');

      // when
      const entry = findEntry('custom-entry-example.com.grouping-0', container);

      // then
      expect(getGroup(entry)).to.equal('ElementTemplates__CustomProperties');
    });


    it('should position into default group (non existing group)', async function() {

      // given
      await expectSelected('ServiceTask_nonExisting');

      // when
      const entry = findEntry('custom-entry-example.com.grouping-nonExisting-0', container);

      // then
      expect(getGroup(entry)).to.equal('ElementTemplates__CustomProperties');
    });

  });

});


// helpers //////////

function expectSelected(id) {
  return getBpmnJS().invoke(async function(elementRegistry, selection) {
    const element = elementRegistry.get(id);

    await act(() => {
      selection.select(element);
    });

    return element;
  });
}

function expectError(entry, message) {
  const errorMessage = domQuery('.bio-properties-panel-error', entry);

  const error = errorMessage && errorMessage.textContent;

  expect(error).to.equal(message);
}

function expectValid(entry) {
  expectError(entry, null);
}

function findEntry(id, container) {
  return domQuery(`[data-entry-id='${ id }']`, container);
}

function findInput(type, container) {
  return domQuery(`input[type='${ type }']`, container);
}

function findSelect(container) {
  return domQuery('select', container);
}

function findTextarea(container) {
  return domQuery('textarea', container);
}

function getGroupIds(container) {
  if (!container) {
    throw new Error('container is missing');
  }

  const groups = domQueryAll('[data-group-id]', container);
  const groupIds = map(groups, group => withoutPrefix(group.dataset.groupId));

  return groupIds;
}

function getGroup(entry) {
  const parent = entry.closest('[data-group-id]');
  return parent && withoutPrefix(parent.dataset.groupId);
}

function withoutPrefix(groupId) {
  return groupId.slice(6);
}