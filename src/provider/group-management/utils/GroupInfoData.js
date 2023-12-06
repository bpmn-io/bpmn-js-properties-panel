
// import hooks from the vendored preact package
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

export default function () {

  return GetGroupManagement();
}

function GetGroupManagement() {

  const [groupInfoDataList, setGroupInfoData] = useState([]);


  useEffect(() => {
    function fetchGroupData() {
      fetch("/oceans/api/bcm/bcm7001/searchBusinessPropertyList", {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json",
          "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "/oceans/BPM_M1001.do",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"header\":{\"programNr\":\"BPM_M1001\",\"programAuthNr\":\"BPM_M1001\",\"uri\":\"/bcm/bcm7001/searchBusinessPropertyList\"},\"businessPropertyCondDto\":{\"constCd\":\"CAMUNDA_GROUP_PROPERTIES_HIDDEN\"}}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
      }).then(
        res => res.json()
      ).then(
        response => function () {
          let groupList = [];
          if (response.result.businessPropertyCount > 0) {
            groupList = response.result.business_property_list[0].const_val_cntn.split(',');
            for (let i = 0; i < groupList.length; i++) {
              groupList[i] = groupList[i].trim();
            }
          }
          return groupList;
        }
      ).then(
        groupNm => setGroupInfoData(groupNm)
      ).catch(error => console.error(error));
    }
    fetchGroupData();
  }, [setGroupInfoData]);

  const getOptions = () => {
    return groupInfoDataList.map(groupNm => (
      groupNm
    ));
  }

  return getOptions();
}