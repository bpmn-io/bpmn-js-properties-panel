import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import CoreModule from 'bpmn-js/lib/core';
import ElementTemplatesModule from 'src/provider/cloud-element-templates';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import PropertiesPanelCommandsModule from 'src/cmd';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

const modules = [
  CoreModule,
  ElementTemplatesModule,
  ModelingModule,
  PropertiesPanelCommandsModule,
  {
    propertiesPanel: [ 'value', { registerProvider() {} } ]
  }
];

const moddleExtensions = {
  zeebe: zeebeModdlePackage
};


describe('cloud-element-templates/cmd - default element templates', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  const diagramXML = require('./default-templates.bpmn').default;

  const elementTemplates = require('./default-templates');

  beforeEach(bootstrapModeler(diagramXML, {
    container: container,
    modules,
    moddleExtensions,
    elementTemplates
  }));


  it('should apply default element template on shape creation', inject(
    function(canvas, elementFactory, modeling, elementTemplates) {

      // given
      const element = elementFactory.createShape({
        id: 'Task_3',
        type: 'bpmn:Task'
      });

      const defaultTemplate = elementTemplates.get('com.foo.bar.default');

      // assume
      expect(defaultTemplate).to.exist;

      // when
      modeling.createShape(element, { x: 100, y: 100 }, canvas.getRootElement());

      // then
      expect(elementTemplates.get(element)).to.eql(defaultTemplate);

      expect(getBusinessObject(element).get('name')).to.equal('DEFAULT FOO BAR');
    })
  );


  it('should apply default element template on connection creation', inject(
    function(elementRegistry, modeling, elementTemplates) {

      // given
      const task1 = elementRegistry.get('Task_1'),
            task2 = elementRegistry.get('Task_2');

      const defaultTemplate = elementTemplates.get('com.foo.bar.default.flow');

      // assume
      expect(defaultTemplate).to.exist;

      // when
      const connection = modeling.connect(task1, task2);

      // then
      expect(elementTemplates.get(connection)).to.eql(defaultTemplate);

      // then
      expect(getBusinessObject(connection).get('name')).to.equal('DEFAULT FOO BAR FLOW');
    })
  );


  it('should not apply default template on shape paste', inject(
    function(canvas, elementRegistry, modeling, elementTemplates, copyPaste) {

      // given
      const noTemplateTask = elementRegistry.get('Task_2');

      const defaultTemplate = elementTemplates.get('com.foo.bar.default');

      // assume
      expect(defaultTemplate).to.exist;

      // when
      copyPaste.copy([ noTemplateTask ]);

      const [ pastedShape ] = copyPaste.paste({
        element: canvas.getRootElement(),
        point: { x: 100, y: 100 }
      });

      // then
      expect(elementTemplates.get(pastedShape)).not.to.exist;

      expect(getBusinessObject(pastedShape).get('name')).to.equal('EXISTING_NAME');
    })
  );


  it('should not apply default template on shape paste', inject(
    function(canvas, elementRegistry, modeling, elementTemplates, copyPaste) {

      // given
      const noTemplateTask = elementRegistry.get('Task_2');

      const defaultTemplate = elementTemplates.get('com.foo.bar.default');

      // assume
      expect(defaultTemplate).to.exist;

      // when
      copyPaste.copy([ noTemplateTask ]);

      const [ pastedShape ] = copyPaste.paste({
        element: canvas.getRootElement(),
        point: { x: 100, y: 100 }
      });

      // then
      expect(elementTemplates.get(pastedShape)).not.to.exist;

      expect(getBusinessObject(pastedShape).get('name')).to.equal('EXISTING_NAME');
    })
  );


  it('should not apply default template on connection paste', inject(
    function(canvas, elementRegistry, modeling, elementTemplates, copyPaste) {

      // given
      const elements = [ 'Task_1', 'Task_2', 'SequenceFlow_1' ].map(id => elementRegistry.get(id));

      const defaultTemplate = elementTemplates.get('com.foo.bar.default');

      // assume
      expect(defaultTemplate).to.exist;

      // when
      copyPaste.copy(elements);

      const pastedElements = copyPaste.paste({
        element: canvas.getRootElement(),
        point: { x: 100, y: 100 }
      });

      const pastedFlow = pastedElements.find(element => is(element, 'bpmn:SequenceFlow'));

      // then
      expect(elementTemplates.get(pastedFlow)).not.to.exist;

      expect(getBusinessObject(pastedFlow).get('name')).to.equal('EXISTING_NAME');
    })
  );

});