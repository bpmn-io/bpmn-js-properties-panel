import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import TextField from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import Error from '../../camunda-platform/properties/Error';

import {
  findCamundaErrorEventDefinition,
  findExtensions
} from '../Helper';

import { useService } from '../../../hooks';


export function ErrorProperties(props) {
  const {
    element,
    index,
    property
  } = props;

  const {
    binding,
    label
  } = property;

  const {
    errorRef,
    name
  } = binding;

  const businessObject = getBusinessObject(element),
        errorEventDefinitions = findExtensions(businessObject, [ 'camunda:ErrorEventDefinition' ]);

  if (!errorEventDefinitions.length) {
    return;
  }

  const errorEventDefinition = findCamundaErrorEventDefinition(element, errorRef);

  const id = `${ element.id }-errorEventDefinition-${ index }`;

  let entries = [];

  entries = Error({
    idPrefix: id,
    element,
    errorEventDefinition
  });

  // (1) remove global error referenced entry
  entries.shift();

  // (2) remove throw expression input
  entries.pop();

  // (3) add disabled throw expression input
  entries.push({
    id: `${ id }-expression`,
    component: <Expression errorEventDefinition={ errorEventDefinition } id={ `${ id }-expression` } property={ property } />
  });

  const item = {
    id,
    label: label || name,
    entries
  };

  return item;
}

function Expression(props) {
  const {
    errorEventDefinition,
    id
  } = props;

  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = () => {};

  const getValue = () => {
    return errorEventDefinition.get('camunda:expression');
  };

  return TextField({
    element: errorEventDefinition,
    id,
    label: translate('Throw expression'),
    getValue,
    setValue,
    debounce,
    disabled: true
  });
}