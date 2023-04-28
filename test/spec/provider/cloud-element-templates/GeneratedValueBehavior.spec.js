import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import ReplaceModule from 'bpmn-js/lib/features/replace';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  bootstrapModeler,
  inject
} from '../../../TestHelper';

import BpmnPropertiesPanel from 'src/render';
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ElementTemplatesModule from 'src/provider/cloud-element-templates';
import {
  findExtension,
  findInputParameter,
  findMessage,
  findOutputParameter,
  findTaskHeader,
  findZeebeProperty,
  findZeebeSubscription
} from 'src/provider/cloud-element-templates/Helper';

import diagramXML from './GeneratedValueBehavior.bpmn';
import templates from './GeneratedValueBehavior.json';


describe('provider/cloud-element-templates - GeneratedValueBehavior', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CoreModule,
    ElementTemplatesModule,
    ModelingModule,
    ReplaceModule
  ];

  beforeEach(bootstrapModeler(diagramXML, {
    elementTemplates: templates,
    modules : testModules,
    moddleExtensions: { zeebe: zeebeModdlePackage }
  }));


  describe('paste', function() {

    it('should regenerate uuid on task', inject(function(elementRegistry, copyPaste, canvas) {

      // given
      const uuidRegex = /^[\w\d]{8}(-[\w\d]{4}){3}-[\w\d]{12}$/;
      const element = elementRegistry.get('Task_1');
      const oldBo = getBusinessObject(element);

      // when
      copyPaste.copy([ element ]);

      const [ pastedShape ] = copyPaste.paste({
        element: canvas.getRootElement(),
        point: { x: 100, y: 100 }
      });

      // then
      const pastedBo = getBusinessObject(pastedShape);
      expect(pastedBo.get('name')).to.match(uuidRegex);
      expect(pastedBo.get('name')).not.to.eql(oldBo.get('name'));

      const zeebeProperties = findExtension(pastedShape, 'zeebe:Properties');
      const property = findZeebeProperty(zeebeProperties, { name: 'property' });
      const oldProperties = findExtension(element, 'zeebe:Properties');
      const oldProperty = findZeebeProperty(oldProperties, { name: 'property' });
      expect(property.get('value')).to.match(uuidRegex);
      expect(property.get('value')).not.to.eql(oldProperty.get('value'));

      const ioMapping = findExtension(pastedShape, 'zeebe:IoMapping');
      const input = findInputParameter(ioMapping, { name: 'input' });
      const oldIoMapping = findExtension(element, 'zeebe:IoMapping');
      const oldInput = findInputParameter(oldIoMapping, { name: 'input' });
      expect(input.get('source')).to.match(uuidRegex);
      expect(input.get('source')).not.to.eql(oldInput.get('source'));

      const output = findOutputParameter(ioMapping, { source: 'source' });
      const oldOutput = findOutputParameter(oldIoMapping, { source: 'source' });
      expect(output.get('target')).to.match(uuidRegex);
      expect(output.get('target')).not.to.eql(oldOutput.get('target'));

      const taskHeaders = findExtension(pastedShape, 'zeebe:TaskHeaders');
      const taskHeader = findTaskHeader(taskHeaders, { key: 'header' });
      const oldTaskHeaders = findExtension(element, 'zeebe:TaskHeaders');
      const oldTaskHeader = findTaskHeader(oldTaskHeaders, { key: 'header' });
      expect(taskHeader.get('value')).to.match(uuidRegex);
      expect(taskHeader.get('value')).not.to.eql(oldTaskHeader.get('value'));

      const taskDefinition = findExtension(pastedShape, 'zeebe:TaskDefinition');
      const oldTaskDefinition = findExtension(element, 'zeebe:TaskDefinition');
      expect(taskDefinition.get('type')).to.match(uuidRegex);
      expect(taskDefinition.get('type')).not.to.eql(oldTaskDefinition.get('type'));
    }));


    it('should regenerate uuid on message', inject(function(elementRegistry, copyPaste, canvas) {

      // given
      const uuidRegex = /^[\w\d]{8}(-[\w\d]{4}){3}-[\w\d]{12}$/;
      const element = elementRegistry.get('Event_1');
      const oldMessage = findMessage(getBusinessObject(element)),
            oldSubscription = findZeebeSubscription(oldMessage);

      // when
      copyPaste.copy([ element ]);

      const [ pastedShape ] = copyPaste.paste({
        element: canvas.getRootElement(),
        point: { x: 100, y: 100 }
      });

      // then
      const bo = getBusinessObject(pastedShape);

      const pastedMessage = findMessage(bo);
      const name = pastedMessage.get('name');
      expect(name).to.match(uuidRegex);
      expect(name).not.to.eql(oldMessage.get('name'));

      const subscription = findZeebeSubscription(pastedMessage);
      const correlationKey = subscription.get('correlationKey');
      expect(correlationKey).to.match(uuidRegex);
      expect(correlationKey).not.to.eql(oldSubscription.get('correlationKey'));
    }));
  });
});
