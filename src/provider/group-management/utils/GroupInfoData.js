
// import hooks from the vendored preact package
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

export default function () {

  return GetGroupManagement();
}

let groupManagementDataList;
let comBizProps = top.comBizProps; // global variable from the bpmn-naw package

function GetGroupManagement(element) {

  const [groupInfoDataList, setGroupInfoData] = useState([]);


  useEffect(() => {
    function fetchGroupData() {

      if (groupManagementDataList) {
        setGroupInfoData(groupManagementDataList);
        return;
      } else {
        var comBizPropVal = comBizProps ? comBizProps['CAMUNDA_GROUP_PROPERTIES_HIDDEN'] : '';
        if (comBizPropVal) {
          groupManagementDataList = comBizPropVal.split(',');
          for (let i = 0; i < groupManagementDataList.length; i++) {
            groupManagementDataList[i] = groupManagementDataList[i].trim();
          }
          setGroupInfoData(groupManagementDataList);
          return;
        }else {
          groupManagementDataList = [''];          
        }
      } 
    }
    fetchGroupData();
  }, [setGroupInfoData]);

  // const getOptions = () => {
  //   groupInfoDataList
  // }

  return groupInfoDataList;
}