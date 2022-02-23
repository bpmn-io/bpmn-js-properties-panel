import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  useService
} from '../../../hooks';

import {
  TextFieldEntry,
  isTextFieldEntryEdited,
  SelectEntry,
  isSelectEntryEdited
} from '@bpmn-io/properties-panel';

/**
 * Defines entries for calling a CMMN diagram.
 * Cf. https://docs.camunda.org/manual/7.15/reference/bpmn20/subprocesses/call-activity/#create-a-case-instance
 */
export function CalledCmmnProps(props) {
  const { element } = props;

  const entries = [
    {
      id: 'calledElementCaseRef',
      component: CaseRef,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'calledElementCaseBinding',
      component: CaseBinding,
      isEdited: isSelectEntryEdited
    },
    {
      id: 'calledElementCaseTenantId',
      component: CaseTenantId,
      isEdited: isTextFieldEntryEdited
    }
  ];

  if (getBusinessObject(element).get('camunda:caseBinding') === 'version') {
    entries.splice(-1, 0,
      {
        id: 'calledElementCaseVersion',
        component: CaseVersion,
        isEdited: isTextFieldEntryEdited
      }
    );
  }

  return entries;
}

function CaseRef(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getBusinessObject(element).get('camunda:caseRef');
  };

  const setValue = value => {
    modeling.updateProperties(element, { caseRef: value || '' });
  };

  return <TextFieldEntry
    element={ element }
    id="calledElementCaseRef"
    label={ translate('Case ref') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function CaseBinding(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');

  const getValue = () => {
    return getBusinessObject(element).get('camunda:caseBinding') || 'latest';
  };

  const setValue = value => {
    modeling.updateProperties(element,
      {
        caseBinding: value === 'latest' ? undefined : value,
        caseVersion: undefined
      }
    );
  };

  const getOptions = () => ([
    { value: 'latest', label: translate('latest') },
    { value: 'deployment', label: translate('deployment') },
    { value: 'version', label: translate('version') }
  ]);


  return <SelectEntry
    element={ element }
    id="calledElementCaseBinding"
    label={ translate('Binding') }
    getValue={ getValue }
    setValue={ setValue }
    getOptions={ getOptions }
  />;
}

function CaseVersion(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getBusinessObject(element).get('camunda:caseVersion');
  };

  const setValue = value => {
    modeling.updateProperties(element, { caseVersion: value });
  };

  return <TextFieldEntry
    element={ element }
    id="calledElementCaseVersion"
    label={ translate('Version') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function CaseTenantId(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getBusinessObject(element).get('camunda:caseTenantId');
  };

  const setValue = value => {
    modeling.updateProperties(element, { caseTenantId: value });
  };

  return <TextFieldEntry
    element={ element }
    id="calledElementCaseTenantId"
    label={ translate('Tenant ID') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}
