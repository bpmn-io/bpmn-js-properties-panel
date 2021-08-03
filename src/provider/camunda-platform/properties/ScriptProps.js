import {
  getBusinessObject
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
    prefix
  } = props;

  const entries = [];
  const scriptType = getScriptType(element);

  const idPrefix = prefix || '';

  // (1) scriptFormat
  entries.push({
    id: idPrefix + 'scriptFormat',
    component: <Format element={ element } idPrefix={ idPrefix } />,
    isEdited: textFieldIsEdited
  });


  // (2) type
  entries.push({
    id: idPrefix + 'scriptType',
    component: <Type element={ element } idPrefix={ idPrefix } />,
    isEdited: selectIsEdited
  });

  // (3) script
  if (scriptType === 'script') {
    entries.push({
      id: idPrefix + 'scriptValue',
      component: <Script element={ element } idPrefix={ idPrefix } />,
      isEdited: textAreaIsEdited
    });
  }

  // (4) resource
  if (scriptType === 'resource') {
    entries.push({
      id: idPrefix + 'scriptResource',
      component: <Resource element={ element } idPrefix={ idPrefix } />,
      isEdited: textFieldIsEdited
    });
  }

  return entries;
}

function Format(props) {
  const {
    element,
    idPrefix
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

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
    idPrefix
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    return getScriptType(element);
  };

  const setValue = (value) => {
    const businessObject = getBusinessObject(element);

    // reset script properties on type change
    const updatedProperties = {
      'script': value === 'script' ? '' : undefined,
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
      { value: 'resource', label: translate('External Resource') },
      { value: 'script', label: translate('Inline Script') }
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
    idPrefix
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('script');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'script': value || ''
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
    idPrefix
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

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

  const script = getScript(businessObject);
  if (typeof script !== 'undefined') {
    return 'script';
  }

  const resource = businessObject.get('camunda:resource');
  if (typeof resource !== 'undefined') {
    return 'resource';
  }
}

function getScript(businessObject) {
  return businessObject.get('script');
}