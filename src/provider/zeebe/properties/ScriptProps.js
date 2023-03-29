import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  TextFieldEntry, isTextFieldEntryEdited,
  isFeelEntryEdited
} from '@bpmn-io/properties-panel';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import { useService } from '../../../hooks';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';



export function ScriptProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:ScriptTask') || !getScript(element)) {
    return [];
  }

  return [
    {
      id: 'resultVariable',
      component: ResultVariable,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'scriptExpression',
      component: Expression,
      isEdited: isFeelEntryEdited
    }
  ];
}

function Expression(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getScript(element) || {}).get('expression');
  };

  const setValue = (value) => {
    const commands = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure script
    let script = getScript(element);

    if (!script) {
      script = createElement(
        'zeebe:Script',
        { },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), script ]
          }
        }
      });
    }

    // (3) update script.expression
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: script,
        properties: { expression: value }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return FeelEntryWithVariableContext({
    element,
    id,
    label: translate('FEEL expression'),
    feel: 'required',
    getValue,
    setValue,
    debounce
  });
}

function ResultVariable(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getScript(element) || {}).resultVariable;
  };

  const setValue = (value) => {
    const commands = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure script
    let script = getScript(element);

    if (!script) {
      script = createElement(
        'zeebe:Script',
        { },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), script ]
          }
        }
      });
    }

    // (3) update script.resultVariable
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: script,
        properties: { resultVariable: value }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextFieldEntry({
    element,
    id,
    label: translate('Result variable'),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

function getScript(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:Script')[0];
}