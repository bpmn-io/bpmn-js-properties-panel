
// import hooks from the vendored preact package
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

export default function () {

  return GetGroupManagement();
}

let groupManagementDataList;

function GetGroupManagement(element) {

  const [groupInfoDataList, setGroupInfoData] = useState([]);


  useEffect(() => {
    function fetchGroupData() {

      if(groupManagementDataList){
        setGroupInfoData(groupManagementDataList);
      }

      let dsBusinessPropertyCondDto = new naw.dataSet("BusinessPropertyCondDto");
      let dsBusinessPropertyListDto = new naw.dataSet("BusinessPropertyListDto");

      naw.submit({
        requestDS: dsBusinessPropertyCondDto,
        responseDS: dsBusinessPropertyListDto,
        paramName: "businessPropertyCondDto",
        before: function (header, dataset) {
            dataset.reset();
            header.set({
                uri: "/bcm/bcm7001/searchBusinessPropertyList"
            });
            dataset.set("constCd", "CAMUNDA_GROUP_PROPERTIES_HIDDEN");
            dataset.autoBind = false;
            return true;
        },
        callback: function (header, dataset) {
            if (onsite.isError(header, dataset)) {
                onsite.messageBox(header, "");
                return;
            }
            let groupList = [];
            let businessPropertyCount = dataset.get("businessPropertyCount");
            if (businessPropertyCount > 0) {
              let groupList = dataset.get("businessPropertyList")[0].constValCntn.split(',');

              for (let i = 0; i < groupList.length; i++) {
                groupList[i] = groupList[i].trim();
              }
              groupManagementDataList = groupList;
            }else{
              groupManagementDataList.push('');
            }
            setGroupInfoData(groupManagementDataList);
        },
        error: function (header, dataset) {
            onsite.messageBox("", "COM000067");
        }
    }); 


    }
    fetchGroupData();
  }, [setGroupInfoData]);

  // const getOptions = () => {
  //   groupInfoDataList
  // }

  return groupInfoDataList;
}