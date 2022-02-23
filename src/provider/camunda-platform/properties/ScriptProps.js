import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  TextAreaEntry,
  isTextAreaEntryEdited,
  TextFieldEntry,
  isTextFieldEntryEdited,
  SelectEntry,
  isSelectEntryEdited
} from '@bpmn-io/properties-panel';

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
    component: Format,
    isEdited: isTextFieldEntryEdited,
    idPrefix,
    script
  });


  // (2) type
  entries.push({
    id: idPrefix + 'scriptType',
    component: Type,
    isEdited: isSelectEntryEdited,
    idPrefix,
    script
  });

  // (3) script
  if (scriptType === 'script') {
    entries.push({
      id: idPrefix + 'scriptValue',
      component: Script,
      isEdited: isTextAreaEntryEdited,
      idPrefix,
      script
    });
  }

  // (4) resource
  if (scriptType === 'resource') {
    entries.push({
      id: idPrefix + 'scriptResource',
      component: Resource,
      isEdited: isTextFieldEntryEdited,
      idPrefix,
      script
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
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        scriptFormat: value
      }
    });
  };

  return TextFieldEntry({
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
    const properties = {
      [ scriptProperty ]: value === 'script' ? '' : undefined,
      'camunda:resource': value === 'resource' ? '' : undefined
    };

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties
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

  return SelectEntry({
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
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        [ scriptProperty ]: value || ''
      }
    });
  };

  return TextAreaEntry({
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
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:resource': value || ''
      }
    });
  };

  return TextFieldEntry({
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