import { html } from 'htm/preact';
import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from '../../../hooks';

// import hooks from the vendored preact package
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

let attributesDataList;

export function AttributesProps(element) {
  if (!isAny(element, ['bpmn:Task', 'bpmn:Process', 'bpmn:Participant' ])) {
    return [];
  }
  return [
    {
      id: 'newAttribute',
      element,
      component: NewAttribute,
      isEdited: isSelectEntryEdited
    }
  ];
}

function NewAttribute(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const process = getProcess(element);

  const getValue = () => {
    return process.newAttribute || '';
  };

  const setValue = value => {
    return modeling.updateModdleProperties(element, process, {
      newAttribute: value
    });
  };

  const [ attriNames, setAttriNames ] = useState([]);

  useEffect(() => {
    function fetchAttriNames() {

      if(attributesDataList){
        setAttriNames(attributesDataList);
        return;
      }

      let dsDataFlowBpmnDto = new naw.dataSet("DataFlowBpmnDto");
      let dsDataFlowBpmnListDto = new naw.dataSet("DataFlowBpmnListDto");

      naw.submit({
        requestDS: dsDataFlowBpmnDto,
        responseDS: dsDataFlowBpmnListDto,
        paramName: "dataFlowBpmnDto",
        before: function (header, dataset) {
            dataset.reset();
            header.set({
                uri: "/bpm/bpm1001/searchCboxForAttrGrNm"
            });
            dataset.autoBind = false;
            return true;
        },
        callback: function (header, dataset) {
            if (onsite.isError(header, dataset)) {
                onsite.messageBox(header, "");
                return;
            }
            attributesDataList = dataset.get("dataFlowBpmnListDto");
            setAttriNames(attributesDataList);
        },
        error: function (header, dataset) {
            onsite.messageBox("", "COM000067");
        }
    }); 


    }

    fetchAttriNames();
  }, [ setAttriNames ]);

  const getOptions = () => {
    return [
      {
        label: '',
        value: undefined
      },
      ...attriNames.map(attri => ({
        label: attri.value01,
        value: attri.value02
      }))
    ];
  };

  return html`<${SelectEntry}
    id=${id}
    element=${element}
    description=${translate('For Attribute Group Name')}
    label=${translate('Attribute Group Name')}
    getValue=${getValue}
    setValue=${setValue}
    getOptions=${getOptions}
    debounce=${debounce}
  />`;
}

// helper /////////////////////
function getProcess(element) {
  return isAny(element, ['bpmn:Process', 'bpmn:Task']) ?
    getBusinessObject(element) :
    getBusinessObject(element).get('processRef');
}