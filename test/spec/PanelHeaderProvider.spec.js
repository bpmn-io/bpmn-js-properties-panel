import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import BpmnModdle from 'bpmn-moddle';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  insertCoreStyles
} from 'test/TestHelper';

import { Header } from '@bpmn-io/properties-panel';

import {
  PanelHeaderProvider,
  getConcreteType
} from 'src/render/PanelHeaderProvider';

import {
  BpmnPropertiesPanelContext
} from 'src/context';

insertCoreStyles();

const noop = () => {};

const noopElement = {
  id: 'foo',
  type: 'foo:bar',
  businessObject: {
    get: noop
  }
};

const moddle = new BpmnModdle({
  zeebe: ZeebeModdle
});


describe('<PanelHeaderProvider>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('rendering', function() {

    it('should render inside header', function() {

      // when
      const result = createHeader({ container });

      const headerNode = domQuery('.bio-properties-panel-header', result.container);

      // then
      expect(headerNode).to.exist;
    });


    it('should render with icon', function() {

      // given
      const element = createElement('bpmn:Task');

      // when
      const result = createHeader({ container, element });

      const iconNode = domQuery('.bio-properties-panel-header-icon', result.container);

      // then
      expect(iconNode).to.exist;
    });


    it('should render with label', function() {

      // given
      const element = createElement('bpmn:Task', {
        name: 'name'
      });

      // when
      const result = createHeader({ container, element });

      const labelNode = domQuery('.bio-properties-panel-header-label', result.container);

      // then
      expect(labelNode).to.exist;
      expect(labelNode.innerText).to.equal('name');
    });


    it('should render with type', function() {

      // given
      const element = createElement('bpmn:ReceiveTask');

      // when
      const result = createHeader({ container, element });

      const typeNode = domQuery('.bio-properties-panel-header-type', result.container);

      // then
      expect(typeNode).to.exist;
      expect(typeNode.innerText).to.equal('RECEIVE TASK');
    });

  });


  describe('#getElementLabel', function() {

    it('should get label - name', function() {

      // given
      const element = createElement('bpmn:MessageFlow', {
        name: 'foo'
      });

      // when
      const elementLabel = PanelHeaderProvider.getElementLabel(element);

      // then
      expect(elementLabel).to.equal('foo');
    });


    it('should get label - text', function() {

      // given
      const element = createElement('bpmn:TextAnnotation', {
        text: 'foo'
      });

      // when
      const elementLabel = PanelHeaderProvider.getElementLabel(element);

      // then
      expect(elementLabel).to.equal('foo');
    });


    it('should get label - groups', function() {

      // given
      const categoryValue = moddle.create('bpmn:CategoryValue', {
        value: 'foo'
      });

      const element = createElement('bpmn:Group', {
        categoryValueRef: categoryValue
      });

      // when
      const elementLabel = PanelHeaderProvider.getElementLabel(element);

      // then
      expect(elementLabel).to.equal('foo');
    });


    it('should get label - processes', function() {

      // given
      const element = createElement('bpmn:Process', {
        name: 'foo'
      });

      // when
      const elementLabel = PanelHeaderProvider.getElementLabel(element);

      // then
      expect(elementLabel).to.equal('foo');
    });

  });


  describe('#getElementIcon', function() {

    it('should get icon - no template', function() {

      // given
      const element = createElement('bpmn:Task');

      // when
      const result = createHeader({ container, element });

      const iconNode = domQuery('.bio-properties-panel-header-icon', result.container);
      const templateIconNode = domQuery('.bio-properties-panel-header-template-icon', iconNode);

      // then
      expect(iconNode).to.exist;
      expect(templateIconNode).to.not.exist;
    });


    it('should get template icon - data URI', function() {

      // given
      const element = createElement('bpmn:Task', {
        'zeebe:modelerTemplateIcon': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='100' width='100'%3E%3Ccircle cx='50' cy='50' r='40' stroke='black' stroke-width='3' fill='red' /%3E%3C/svg%3E"
      });

      // when
      const result = createHeader({ container, element });

      const iconNode = domQuery('.bio-properties-panel-header-icon', result.container);
      const templateIconNode = domQuery('.bio-properties-panel-header-template-icon', iconNode);

      // then
      expect(templateIconNode).to.exist;
      expect(templateIconNode.src).to.eql(element.businessObject.get('zeebe:modelerTemplateIcon'));
    });


    it('should get template icon - https URI', function() {

      // given
      const element = createElement('bpmn:Task', {
        'zeebe:modelerTemplateIcon': 'https://camunda.com/wp-content/uploads/2020/05/logo-camunda-black.svg'
      });

      // when
      const result = createHeader({ container, element });

      const iconNode = domQuery('.bio-properties-panel-header-icon', result.container);
      const templateIconNode = domQuery('.bio-properties-panel-header-template-icon', iconNode);

      // then
      expect(templateIconNode).to.exist;
      expect(templateIconNode.src).to.eql(element.businessObject.get('zeebe:modelerTemplateIcon'));
    });

  });


  describe('#getTypeLabel', function() {

    it('should get element type - no element templates', function() {

      // given
      const element = createElement('bpmn:Task', {
        name: 'foo'
      });

      // when
      const result = createHeader({ container, element });

      const typeNode = domQuery('.bio-properties-panel-header-type', result.container);

      // then
      expect(typeNode).to.exist;
      expect(typeNode.innerText).to.equal('TASK');
    });


    it('should get element type - no template name', function() {

      // given
      const element = createElement('bpmn:Task', {
        name: 'foo'
      });

      const elementTemplates = {
        get: () => { return { id: 'foo' }; },
        getTemplateId: () => 'foo'
      };

      const context = {
        getService: () => {
          return new ElementTemplates(elementTemplates);
        }
      };

      // when
      const result = createHeader({ container, element, context });

      const typeNode = domQuery('.bio-properties-panel-header-type', result.container);

      // then
      expect(typeNode).to.exist;
      expect(typeNode.innerText).to.equal('TASK');
    });


    it('should get element template name', function() {

      // given
      const element = createElement('bpmn:Task', {
        name: 'foo'
      });

      const elementTemplates = {
        get: () => { return { id: 'foo', name: 'Template Task' }; },
        getTemplateId: () => 'foo'
      };

      const context = {
        getService: () => {
          return new ElementTemplates(elementTemplates);
        }
      };

      // when
      const result = createHeader({ container, element, context });

      const typeNode = domQuery('.bio-properties-panel-header-type', result.container);

      // then
      expect(typeNode).to.exist;
      expect(typeNode.innerText).to.equal('TEMPLATE TASK');
    });


    it('should get element template name - versioned', function() {

      // given
      const element = createElement('bpmn:Task', {
        name: 'foo'
      });

      const elementTemplates = {
        get: () => { return { id: 'foo', version: 1, name: 'Template Task' }; },
        getTemplateId: () => 'foo',
        getTemplateVersion: () => '1'
      };

      const context = {
        getService: () => {
          return new ElementTemplates(elementTemplates);
        }
      };

      // when
      const result = createHeader({ container, element, context });

      const typeNode = domQuery('.bio-properties-panel-header-type', result.container);

      // then
      expect(typeNode).to.exist;
      expect(typeNode.innerText).to.equal('TEMPLATE TASK');
    });

  });


  describe('#getConcreteType', function() {

    it('should get type - task', async function() {

      // given
      const element = createElement('bpmn:Task');

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('Task');
    });


    it('should get type - start event', async function() {

      // given
      const element = createElement('bpmn:StartEvent');

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('StartEvent');
    });


    it('should get type - end event', async function() {

      // given
      const element = createElement('bpmn:EndEvent');

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('EndEvent');
    });


    it('should get type - collapsed sub process', async function() {

      // given
      const element = createElement('bpmn:SubProcess');

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('CollapsedSubProcess');
    });


    it('should get type - collapsed sub process plane', async function() {

      // given
      const element = createElement('bpmn:SubProcess');
      element.di = moddle.create('bpmndi:BPMNPlane');

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('CollapsedSubProcess');
    });


    it('should get type - expanded sub process', async function() {

      // given
      const di = moddle.create('bpmndi:BPMNShape', { isExpanded: true });
      const element = createElement('bpmn:SubProcess');

      element.businessObject.di = di; // bpmn-js@8
      element.di = di; // bpmn-js@9

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('ExpandedSubProcess');
    });


    it('should get type - event sub process', async function() {

      // given
      const element = createElement('bpmn:SubProcess', {
        triggeredByEvent: true
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('EventSubProcess');
    });


    it('should get type - message start event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:MessageEventDefinition');

      const element = createElement('bpmn:StartEvent', {
        eventDefinitions: [ eventDefinition ]
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('MessageStartEvent');
    });


    it('should get type - message intermediate catch event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:MessageEventDefinition');

      const element = createElement('bpmn:IntermediateCatchEvent', {
        eventDefinitions: [ eventDefinition ]
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('MessageIntermediateCatchEvent');
    });


    it('should get type - message intermediate throw event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:MessageEventDefinition');

      const element = createElement('bpmn:IntermediateThrowEvent', {
        eventDefinitions: [ eventDefinition ]
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('MessageIntermediateThrowEvent');
    });


    it('should get type - signal event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:SignalEventDefinition');

      const element = createElement('bpmn:IntermediateCatchEvent', {
        eventDefinitions: [ eventDefinition ]
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('SignalIntermediateCatchEvent');
    });


    it('should get type - error event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:ErrorEventDefinition');

      const element = createElement('bpmn:IntermediateCatchEvent', {
        eventDefinitions: [ eventDefinition ]
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('ErrorIntermediateCatchEvent');
    });


    it('should get type - escalation event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:EscalationEventDefinition');

      const element = createElement('bpmn:IntermediateCatchEvent', {
        eventDefinitions: [ eventDefinition ]
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('EscalationIntermediateCatchEvent');
    });


    it('should get type - link event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:LinkEventDefinition');

      const element = createElement('bpmn:IntermediateCatchEvent', {
        eventDefinitions: [ eventDefinition ]
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('LinkIntermediateCatchEvent');
    });


    it('should get type - conditional event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:ConditionalEventDefinition');

      const element = createElement('bpmn:IntermediateCatchEvent', {
        eventDefinitions: [ eventDefinition ]
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('ConditionalIntermediateCatchEvent');
    });


    it('should get type - timer event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:TimerEventDefinition');

      const element = createElement('bpmn:IntermediateCatchEvent', {
        eventDefinitions: [ eventDefinition ]
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('TimerIntermediateCatchEvent');
    });


    it('should get type - non interrupting boundary event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:MessageEventDefinition');

      const element = createElement('bpmn:BoundaryEvent', {
        eventDefinitions: [ eventDefinition ],
        cancelActivity: false
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('MessageBoundaryEventNonInterrupting');
    });


    it('should get type - non interrupting start event', async function() {

      // given
      const eventDefinition = moddle.create('bpmn:MessageEventDefinition');

      const element = createElement('bpmn:StartEvent', {
        eventDefinitions: [ eventDefinition ],
        isInterrupting: false
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('MessageStartEventNonInterrupting');
    });


    it('should get type - parallel task', async function() {

      // given
      const loopCharacteristics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

      const element = createElement('bpmn:Task', {
        loopCharacteristics
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('Task');
    });


    it('should get type - sequential task', async function() {

      // given
      const loopCharacteristics = moddle.create('bpmn:MultiInstanceLoopCharacteristics', {
        isSequential: true
      });

      const element = createElement('bpmn:Task', {
        loopCharacteristics
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('Task');
    });


    it('should get type - loop sub process', async function() {

      // given
      const loopCharacteristics = moddle.create('bpmn:StandardLoopCharacteristics');

      const element = createElement('bpmn:SubProcess', {
        loopCharacteristics
      });

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('CollapsedSubProcess');
    });


    it('should get type - transaction', async function() {

      // given
      const element = createElement('bpmn:Transaction');

      // when
      const type = getConcreteType(element);

      // then
      expect(type).to.equal('Transaction');
    });


    it('should get type - sequence flow', async function() {

      // given
      const sequenceFlow = createElement('bpmn:SequenceFlow');

      // when
      const type = getConcreteType(sequenceFlow);

      // then
      expect(type).to.equal('SequenceFlow');
    });


    it('should get type - default flow', async function() {

      // given
      const sequenceFlow = createElement('bpmn:SequenceFlow');
      const task = moddle.create('bpmn:Task');

      task.default = sequenceFlow.businessObject;
      sequenceFlow.source = task;

      // when
      const type = getConcreteType(sequenceFlow);

      // then
      expect(type).to.equal('DefaultFlow');
    });


    it('should get type - conditional flow', async function() {

      // given
      const conditionExpression = moddle.create('bpmn:FormalExpression', {
        body: 'foo'
      });
      const task = moddle.create('bpmn:Task');
      const sequenceFlow = createElement('bpmn:SequenceFlow', {
        conditionExpression,
        sourceRef: task
      });

      sequenceFlow.source = task;

      // when
      const type = getConcreteType(sequenceFlow);

      // then
      expect(type).to.equal('ConditionalFlow');
    });

  });


  describe('#getDocumentationRef', function() {

    it('should NOT get documentationRef - no element templates', function() {

      // given
      const element = createElement('bpmn:Task', {
        name: 'foo'
      });

      // when
      const result = createHeader({ container, element });

      const documentationNode = domQuery('.bio-properties-panel-header-link', result.container);

      // then
      expect(documentationNode).to.not.exist;
    });


    it('should NOT get documentationRef - no value', function() {

      // given
      const element = createElement('bpmn:Task', {
        name: 'foo'
      });

      const elementTemplates = {
        get: () => { return { id: 'foo' }; },
        getTemplateId: () => true
      };

      const context = {
        getService: () => {
          return new ElementTemplates(elementTemplates);
        }
      };

      // when
      const result = createHeader({ container, element, context });

      const documentationNode = domQuery('.bio-properties-panel-header-link', result.container);

      // then
      expect(documentationNode).to.not.exist;
    });


    it('should get element template documentationRef', function() {

      // given
      const element = createElement('bpmn:Task', {
        name: 'foo'
      });

      const elementTemplates = {
        get: () => { return { id: 'foo', documentationRef: 'https://example.com/' }; },
        getTemplateId: () => true
      };

      const context = {
        getService: () => {
          return new ElementTemplates(elementTemplates);
        }
      };

      // when
      const result = createHeader({ container, element, context });

      const documentationNode = domQuery('.bio-properties-panel-header-link', result.container);

      // then
      expect(documentationNode).to.exist;
      expect(documentationNode.href).to.eql('https://example.com/');
    });


    it('should get element template documentationRef - versioned', function() {

      // given
      const element = createElement('bpmn:Task', {
        name: 'foo'
      });

      const elementTemplates = {
        get: () => { return { id: 'foo', version: 1, documentationRef: 'https://example.com/' }; },
        getTemplateId: () => true,
        getTemplateVersion: () => '1'
      };

      const context = {
        getService: () => {
          return new ElementTemplates(elementTemplates);
        }
      };

      // when
      const result = createHeader({ container, element, context });

      const documentationNode = domQuery('.bio-properties-panel-header-link', result.container);

      // then
      expect(documentationNode).to.exist;
      expect(documentationNode.href).to.eql('https://example.com/');
    });

  });

});


// helpers //////////////////////////

class ElementTemplates {
  constructor(options = {}) {
    const {
      get,
      getTemplateId,
      getTemplateVersion
    } = options;

    this._getFn = get;
    this._getTemplateIdFn = getTemplateId;
    this._getTemplateVersionFn = getTemplateVersion;
  }

  get(element) {
    return this._getFn ? this._getFn(element) : null;
  }

  _getTemplateId(element) {
    return this._getTemplateIdFn ? this._getTemplateIdFn(element) : null;
  }

  _getTemplateVersion(element) {
    return this._getTemplateVersionFn ? this._getTemplateVersionFn(element) : null;
  }
}

function createHeader(options = {}) {
  const {
    element = noopElement,
    headerProvider = PanelHeaderProvider,
    context = { getService: noop },
    container
  } = options;

  return render(
    <BpmnPropertiesPanelContext.Provider value={ context }>
      <Header
        element={ element }
        headerProvider={ headerProvider } />
    </BpmnPropertiesPanelContext.Provider>,
    {
      container
    }
  );
}

function createElement(type, attrs) {
  const businessObject = moddle.create(type, attrs);

  const element = {
    type,
    businessObject
  };

  return element;
}