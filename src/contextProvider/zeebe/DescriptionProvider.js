/* eslint-disable react-hooks/rules-of-hooks */

import {
  useService
} from '../../hooks';

const DescriptionProvider = {
  id: (element) => {
    const translate = useService('translate');

    return translate('some descriptions able to access the element data of currently selected element: ' + element.businessObject.$type);
  }
};

export default DescriptionProvider;
