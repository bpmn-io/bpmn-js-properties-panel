import { CheckboxEntry, isCheckboxEntryEdited } from '@bpmn-io/properties-panel';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

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
  getSignalEventDefinition
} from '../../bpmn/utils/EventDefinitionUtil';

import {
  addExtensionElements,
  getExtensionElementsList,
  removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';


/**
 * Cf. https://docs.camunda.org/manual/7.15/reference/bpmn20/subprocesses/call-activity/#passing-variables
 */
export function InMappingPropagationProps(props) {
  const {
    element
  } = props;

  if (!areInMappingsSupported(element)) {
    return [];
  }

  const entries = [
    {
      id: 'inMapping-propagation',
      component: PropagateAll,
      isEdited: isCheckboxEntryEdited
    }
  ];

  if (isPropagateAll(element)) {
    entries.push({
      id: 'inMapping-propagation-local',
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
      addInMapping();
    } else {
      removeInMapping();
    }
  };

  function addInMapping() {
    const businessObject = getSignalEventDefinition(element) || getBusinessObject(element);

    const mapping = createElement(
      'camunda:In',
      {
        variables: 'all'
      },
      null,
      bpmnFactory
    );

    addExtensionElements(element, businessObject, mapping, bpmnFactory, commandStack);
  }

  function removeInMapping() {
    const businessObject = getSignalEventDefinition(element) || getBusinessObject(element);
    const mappings = findRelevantInMappings(element);

    removeExtensionElements(element, businessObject, mappings, commandStack);
  }

  return CheckboxEntry({
    id: 'inMapping-propagation',
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

  const mapping = findRelevantInMappings(element)[0];

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
    id: 'inMapping-propagation-local',
    label: translate('Local'),
    getValue,
    setValue
  });
}


// helper //////////////////////////

function areInMappingsSupported(element) {
  const signalEventDefinition = getSignalEventDefinition(element);

  if (signalEventDefinition) {
    return isAny(element, [
      'bpmn:IntermediateThrowEvent',
      'bpmn:EndEvent'
    ]);
  }

  return is(element, 'bpmn:CallActivity');
}

function getInMappings(element) {
  const businessObject = getBusinessObject(element);
  const signalEventDefinition = getSignalEventDefinition(businessObject);
  return getExtensionElementsList(signalEventDefinition || businessObject, 'camunda:In');
}

function findRelevantInMappings(element) {
  const inMappings = getInMappings(element);
  return filter(inMappings, function(mapping) {
    const variables = mapping.get('variables');
    return variables && variables === 'all';
  });
}

function isPropagateAll(element) {
  const mappings = findRelevantInMappings(element);
  return !!mappings.length;
}
