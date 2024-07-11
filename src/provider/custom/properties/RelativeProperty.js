import { SelectEntry, TextFieldEntry } from '@bpmn-io/properties-panel'
import {
  useService
} from '../../../hooks';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

let nextProcessDataList;
let prevProcessDataList;

export default function RelativeProperty(props) {

  const {
    idPrefix,
    property
  } = props;

  const entries = [ {
    id: idPrefix + '-NextProcess',
    component: NextProcess,
    idPrefix,
    property
  },{
    id: idPrefix + '-PrevProcess',
    component: PrevProcess,
    idPrefix,
    property
  } ];

  return entries;
}

function NextProcess(props) {
  const {
    idPrefix,
    element,
    property
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        next: value
      }
    });
  };

  const getValue = () => {
    return property.next;
  };

  const [ relates, setRelates ] = useState([]);

  useEffect(() => {
    function fetchSpells() {

      if (nextProcessDataList) {
        setRelates(nextProcessDataList);
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
            uri: "/bpm/bpm1001/searchCboxForAttrGrId"
          });
          dataset.autoBind = false;
          return true;
        },
        callback: function (header, dataset) {
          if (onsite.isError(header, dataset)) {
            onsite.messageBox(header, "");
            return;
          }
          nextProcessDataList = dataset.get("dataFlowBpmnListDto");
          setRelates(nextProcessDataList);
        },
        error: function (header, dataset) {
          onsite.messageBox("", "COM000067");
        }
      }); 

    }

    fetchSpells();
  }, [ setRelates ]);

  const getOptions = () => {
    return [
      {
        label: '',
        value: undefined
      },
      ...relates.map(spell => ({
        label: spell.value01,
        value: spell.value02
      }))
    ];
  };

  return SelectEntry({
    element: property,
    id: idPrefix + '-NextProcess',
    label: translate('Next Process ID'),
    getValue,
    setValue,
    getOptions,
    debounce
  });
}

function PrevProcess(props) {
  const {
    idPrefix,
    element,
    property
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        previous:value
      }
    });
  };

  const getValue = () => {
    return property.previous;
  };

  const [ relates, setRelates ] = useState([]);

  useEffect(() => {
    function fetchSpells() {

      if (prevProcessDataList) {
        setRelates(prevProcessDataList);
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
            uri: "/bpm/bpm1001/searchCboxForAttrGrId"
          });
          dataset.autoBind = false;
          return true;
        },
        callback: function (header, dataset) {
          if (onsite.isError(header, dataset)) {
            onsite.messageBox(header, "");
            return;
          }
          prevProcessDataList = dataset.get("dataFlowBpmnListDto");
          setRelates(prevProcessDataList);
        },
        error: function (header, dataset) {
          onsite.messageBox("", "COM000067");
        }
      }); 

    }

    fetchSpells();
  }, [ setRelates ]);

  const getOptions = () => {
    return [
      {
        label: '',
        value: undefined
      },
      ...relates.map(spell => ({
        label: spell.value01,
        value: spell.value02
      }))
    ];
  };

  return SelectEntry({
    element: property,
    id: idPrefix + '-PrevProcess',
    label: translate('Previous Process ID'),
    getValue,
    setValue,
    getOptions,
    debounce
  });
}