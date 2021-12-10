import { without } from 'min-dash';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry } from '@bpmn-io/properties-panel';

import Error from '../../camunda-platform/properties/Error';
import { getErrorLabel } from '../../camunda-platform/properties/ErrorsProps';

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
    errorRef
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
  // entries.shift();
  entries = removeEntry(entries, '-errorRef');

  // (2) remove throw expression input
  // entries.pop();
  entries = removeEntry(entries, '-expression');

  // (3) add disabled throw expression input
  entries.push({
    id: `${ id }-expression`,
    component: <Expression errorEventDefinition={ errorEventDefinition } id={ `${ id }-expression` } property={ property } />
  });

  const item = {
    id,
    label: label || getErrorLabel(errorEventDefinition),
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

  return TextFieldEntry({
    element: errorEventDefinition,
    id,
    label: translate('Throw expression'),
    getValue,
    setValue,
    debounce,
    disabled: true
  });
}

function removeEntry(entries, suffix) {
  const entry = entries.find(({ id }) => id.endsWith(suffix));

  return without(entries, entry);
}