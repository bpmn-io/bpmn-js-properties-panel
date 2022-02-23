import { CheckboxEntry, isCheckboxEntryEdited } from '@bpmn-io/properties-panel';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  filter
} from 'min-dash';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import {
  addExtensionElements,
  getExtensionElementsList,
  removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';


/**
 * Cf. https://docs.camunda.org/manual/7.15/reference/bpmn20/subprocesses/call-activity/#passing-variables
 */
export function OutMappingPropagationProps(props) {
  const {
    element
  } = props;

  if (!areOutMappingsSupported(element)) {
    return [];
  }

  const entries = [
    {
      id: 'outMapping-propagation',
      component: PropagateAll,
      isEdited: isCheckboxEntryEdited
    }
  ];

  if (isPropagateAll(element)) {
    entries.push({
      id: 'outMapping-propagation-local',
      component: Local,
      isEdited: isCheckboxEntryEdited
    });
  }

  return entries;
}

function PropagateAll(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const getValue = () => {
    return isPropagateAll(element);
  };

  const setValue = value => {
    if (value) {
      addOutMapping();
    } else {
      removeOutMapping();
    }
  };

  function addOutMapping() {
    const businessObject = getBusinessObject(element);

    const mapping = createElement(
      'camunda:Out',
      {
        variables: 'all'
      },
      null,
      bpmnFactory
    );

    addExtensionElements(element, businessObject, mapping, bpmnFactory, commandStack);
  }

  function removeOutMapping() {
    const businessObject = getBusinessObject(element);
    const mappings = findRelevantOutMappings(element);

    removeExtensionElements(element, businessObject, mappings, commandStack);
  }

  return CheckboxEntry({
    id: 'outMapping-propagation',
    label: translate('Propagate all variables'),
    getValue,
    setValue
  });
}

function Local(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const mapping = findRelevantOutMappings(element)[0];

  const getValue = () => {
    return mapping.get('camunda:local');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        local: value
      }
    });
  };

  return CheckboxEntry({
    element,
    id: 'outMapping-propagation-local',
    label: translate('Local'),
    getValue,
    setValue
  });
}


// helper //////////////////////////

function areOutMappingsSupported(element) {
  return is(element, 'bpmn:CallActivity');
}

function getOutMappings(element) {
  const businessObject = getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'camunda:Out');
}

function findRelevantOutMappings(element) {
  const inMappings = getOutMappings(element);
  return filter(inMappings, function(mapping) {
    const variables = mapping.get('variables');
    return variables && variables === 'all';
  });
}

function isPropagateAll(element) {
  const mappings = findRelevantOutMappings(element);
  return !!mappings.length;
}
