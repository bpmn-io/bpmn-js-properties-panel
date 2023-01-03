import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  getVariablesForScope
} from '@bpmn-io/extract-process-variables';

import {
  flatten,
  forEach,
  groupBy,
  keys,
  map,
  sortBy
} from 'min-dash';

import {
  useService
} from '../../../hooks';

import { ListGroup } from '@bpmn-io/properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';


function ProcessVariablesEntry(props) {
  const {
    element
  } = props;


  const [ variables, setVariables ] = useState([]);

  useEffect(async () => {
    const businessObject = getBusinessObject(element);
    const rootElement = getRootElement(businessObject);
    const scope = getScope(element);

    const rawVariables = await getVariablesForScope(scope, rootElement);

    const withName = populateElementNames(sortByName(rawVariables));

    setVariables(withName);
  }, [ element ]);


  if (!variables.length) {
    return null;
  }

  const byScope = groupByScope(variables);
  const multiScope = isMultiScope(byScope);

  let variableItems = [];

  // (2) get variables to display
  if (multiScope) {

    // (2a) multiple scopes, sub scopes first
    // assumption: variables extractor fetches parent variables first
    const reversed = map(reverse(keys(byScope)), (scopeKey) => byScope[scopeKey]);

    variableItems = flatten(reversed);
  } else {

    // (2b) single scope
    variableItems = variables;
  }

  const items = variableItems.map((variable, index) => {
    const id = element.id + '-variable-' + index;

    return {
      id,
      label: variable.name,
      entries: [
        ...ProcessVariableItem({
          idPrefix: id,
          multiScope,
          variable
        })
      ]
    };
  });

  return <ListGroup { ...props } items={ items } shouldSort={ false } />;
}

export function ProcessVariablesProps(props) {

  const {
    element
  } = props;

  if (!canHaveProcessVariables(element)) {
    return null;
  }

  return {
    component: ProcessVariablesEntry,
    shouldSort: false
  };
}

function ProcessVariableItem(props) {
  const {
    idPrefix,
    multiScope,
    variable,
  } = props;

  let entries = [];

  if (multiScope) {
    entries.push({
      id: idPrefix + '-scope',
      component: Scope,
      idPrefix,
      variable
    });
  }

  entries.push({
    id: idPrefix + '-createdIn',
    component: CreatedIn,
    idPrefix,
    variable
  });

  return entries;
}

function Scope(props) {

  const {
    idPrefix,
    variable
  } = props;

  const translate = useService('translate');

  const id = idPrefix + '-scope';

  return (
    <div data-entry-id={ id } class="bio-properties-panel-entry">
      <b style="font-weight: bold" class="bio-properties-panel-label">{ translate('Scope') }</b>
      <label id={ prefixId(id) } class="bio-properties-panel-label">{ variable.scope }</label>
    </div>
  );
}


function CreatedIn(props) {

  const {
    idPrefix,
    variable
  } = props;

  const translate = useService('translate');

  const id = idPrefix + '-createdIn';

  const origin = variable.origin.join(', ');

  return (
    <div data-entry-id={ id } class="bio-properties-panel-entry">
      <b style="font-weight: bold" class="bio-properties-panel-label">{ translate('Created in') }</b>
      <label id={ prefixId(id) } class="bio-properties-panel-label">{ origin }</label>
    </div>
  );
}


// helper //////////////////////

function canHaveProcessVariables(element) {
  const businessObject = getBusinessObject(element);

  return (
    isAny(element, [ 'bpmn:Process', 'bpmn:SubProcess' ]) ||
    (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
  );
}

function getRootElement(element) {
  const businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:Participant')) {
    return businessObject.processRef;
  }

  if (is(businessObject, 'bpmn:Process')) {
    return businessObject;
  }

  let parent = businessObject;

  while (parent.$parent && !is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }

  return parent;
}

function getScope(element) {
  const bo = getBusinessObject(element);

  if (is(element, 'bpmn:Participant')) {
    return bo.processRef.id;
  }

  return bo.id;
}

function sortByName(variables) {
  return sortBy(variables, function(variable) {
    return variable.name;
  });
}

function groupByScope(variables) {
  return groupBy(variables, 'scope');
}

function populateElementNames(variables) {
  forEach(variables, function(variable) {
    const names = map(variable.origin, function(element) {
      return element.name || element.id;
    });

    variable.origin = names;
    variable.scope = variable.scope.name || variable.scope.id;
  });

  return variables;
}

function isMultiScope(scopedVariables) {
  return keys(scopedVariables).length > 1;
}

function reverse(array) {
  return map(array, function(a, i) {
    return array[array.length - 1 - i];
  });
}

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}