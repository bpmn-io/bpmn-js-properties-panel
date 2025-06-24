import { SelectEntry, TextFieldEntry } from '@bpmn-io/properties-panel'
import {
    useService
} from '../../../hooks';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

let propertyDataList;
let userNaw = window.naw; // global variable from the bpmn-naw package

export default function Property(props) {

    const {
        idPrefix,
        property
    } = props;

    const entries = [{
        id: idPrefix + '-PropertyValue',
        component: TaskProperty,
        idPrefix,
        property
    }];

    return entries;
}

function TaskProperty(props) {
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
                value: value
            }
        });
    };

    const getValue = () => {
        return property.value;
    };

    const [propertyList, setProperty] = useState([]);

    useEffect(() => {
        function fetchSpells() {

            if(!userNaw){
                propertyDataList = [];
            }
            
            if(propertyDataList){
                setProperty(propertyDataList);
                return;
            }

            let dsDataFlowBpmnDto = new userNaw.dataSet("DataFlowBpmnDto");
            let dsDataFlowBpmnListDto = new userNaw.dataSet("DataFlowBpmnListDto");
            userNaw.submit({
                requestDS: dsDataFlowBpmnDto,
                responseDS: dsDataFlowBpmnListDto,
                paramName: "dataFlowBpmnDto",
                before: function (header, dataset) {
                    dataset.reset();
                    header.set({
                        uri: "/bpm/bpm1001/searchCboxForProp"
                    });
                    dataset.autoBind = false;
                    return true;
                },
                callback: function (header, dataset) {
                    if (onsite.isError(header, dataset)) {
                        onsite.messageBox(header, "");
                        return;
                    }
                    propertyDataList = dataset.get("dataFlowBpmnListDto");
                    setProperty(propertyDataList);
                },
                error: function (header, dataset) {
                    onsite.messageBox("", "COM000067");
                }
            }); 
        }

        fetchSpells();
    }, [setProperty]);

    const getOptions = () => {
        return [
            {
                label: '',
                value: undefined
            },
            ...propertyList.map(spell => ({
                label: spell.value01,
                value: spell.value02
            }))
        ];
    };

    return SelectEntry({
        element: property,
        id: idPrefix + '-PropertyValue',
        getValue,
        setValue,
        getOptions,
        debounce
    });
}
