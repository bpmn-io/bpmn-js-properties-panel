import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import TextArea, { isEdited as textAreaIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextArea';
import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';
import Select, { isEdited as selectIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/Select';

import {
  useService
} from '../../../hooks';

/**
 * Cf. https://docs.camunda.org/manual/latest/user-guide/process-engine/scripting/
 */
export function ScriptProps(props) {
  const {
    element,
    script,
    prefix
  } = props;

  const entries = [];
  const scriptType = getScriptType(script || element);

  const idPrefix = prefix || '';

  // (1) scriptFormat
  entries.push({
    id: idPrefix + 'scriptFormat',
    component: <Format element={ element } idPrefix={ idPrefix } script={ script } />,
    isEdited: textFieldIsEdited
  });


  // (2) type
  entries.push({
    id: idPrefix + 'scriptType',
    component: <Type element={ element } idPrefix={ idPrefix } script={ script } />,
    isEdited: selectIsEdited
  });

  // (3) script
  if (scriptType === 'script') {
    entries.push({
      id: idPrefix + 'scriptValue',
      component: <Script element={ element } idPrefix={ idPrefix } script={ script } />,
      isEdited: textAreaIsEdited
    });
  }

  // (4) resource
  if (scriptType === 'resource') {
    entries.push({
      id: idPrefix + 'scriptResource',
      component: <Resource element={ element } idPrefix={ idPrefix } script={ script } />,
      isEdited: textFieldIsEdited
    });
  }

  return entries;
}

function Format(props) {
  const {
    element,
    idPrefix,
    script
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = script || getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('scriptFormat');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'scriptFormat': value
      }
    });
  };

  return TextField({
    element,
    id: idPrefix + 'scriptFormat',
    label: translate('Format'),
    getValue,
    setValue,
    debounce
  });
}

function Type(props) {
  const {
    element,
    idPrefix,
    script
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const businessObject = script || getBusinessObject(element);
  const scriptProperty = getScriptProperty(businessObject);

  const getValue = () => {
    return getScriptType(businessObject);
  };

  const setValue = (value) => {

    // reset script properties on type change
    const updatedProperties = {
      [scriptProperty]: value === 'script' ? '' : undefined,
      'camunda:resource': value === 'resource' ? '' : undefined
    };

    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: updatedProperties
    });
  };

  const getOptions = () => {

    const options = [
      { value: '', label: translate('<none>') },
      { value: 'resource', label: translate('External resource') },
      { value: 'script', label: translate('Inline script') }
    ];

    return options;
  };

  return Select({
    element,
    id: idPrefix + 'scriptType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

function Script(props) {
  const {
    element,
    idPrefix,
    script
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = script || getBusinessObject(element);
  const scriptProperty = getScriptProperty(businessObject);

  const getValue = () => {
    return getScriptValue(businessObject);
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        [scriptProperty]: value || ''
      }
    });
  };

  return TextArea({
    element,
    id: idPrefix + 'scriptValue',
    label: translate('Script'),
    getValue,
    setValue,
    debounce,
    monospace: true
  });
}

function Resource(props) {
  const {
    element,
    idPrefix,
    script
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = script || getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:resource');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:resource': value || ''
      }
    });
  };

  return TextField({
    element,
    id: idPrefix + 'scriptResource',
    label: translate('Resource'),
    getValue,
    setValue,
    debounce
  });
}


// helper ////////////////////

function getScriptType(element) {
  const businessObject = getBusinessObject(element);

  const scriptValue = getScriptValue(businessObject);
  if (typeof scriptValue !== 'undefined') {
    return 'script';
  }

  const resource = businessObject.get('camunda:resource');
  if (typeof resource !== 'undefined') {
    return 'resource';
  }
}

function getScriptValue(businessObject) {
  return businessObject.get(getScriptProperty(businessObject));
}

function isScript(element) {
  return is(element, 'camunda:Script');
}

function getScriptProperty(businessObject) {
  return isScript(businessObject) ? 'value' : 'script';
}