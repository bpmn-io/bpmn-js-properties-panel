import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  add as collectionAdd
} from 'diagram-js/lib/util/Collections';

import TextField from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import {
  useService
} from '../../../hooks';


export default function NameProperty(props) {
  const {
    element
  } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const canvas = useService('canvas');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  if (is(element, 'bpmn:Collaboration')) {
    return;
  }

  // (1) default: name
  let options = {
    element,
    id: 'name',
    label: translate('Name'),
    debounce,
    setValue: (value) => {
      modeling.updateProperties(element, {
        name: value
      });
    },
    getValue: (element) => {
      return element.businessObject.name;
    }
  };

  // (2) text annotations
  if (is(element, 'bpmn:TextAnnotation')) {
    options = {
      ...options,
      setValue: (value) => {
        modeling.updateProperties(element, {
          text: value
        });
      },
      getValue: (element) => {
        return element.businessObject.text;
      }
    };
  }

  // (3) groups
  else if (is(element, 'bpmn:Group')) {
    options = {
      ...options,
      setValue: (value) => {
        const businessObject = getBusinessObject(element),
              categoryValueRef = businessObject.categoryValueRef;

        if (!categoryValueRef) {
          initializeCategory(businessObject, canvas.getRootElement(), bpmnFactory);
        }

        modeling.updateLabel(element, value);
      },
      getValue: (element) => {
        const businessObject = getBusinessObject(element),
              categoryValueRef = businessObject.categoryValueRef;

        return categoryValueRef && categoryValueRef.value;
      }
    };
  }

  // (4) participants (only update label)
  else if (is(element, 'bpmn:Participant')) {
    options.label = translate('Participant Name');
  }


  return TextField(options);
}


// helpers ////////////////////////

function initializeCategory(businessObject, rootElement, bpmnFactory) {
  const definitions = getBusinessObject(rootElement).$parent;

  const categoryValue = createCategoryValue(definitions, bpmnFactory);

  businessObject.categoryValueRef = categoryValue;
}

function createCategoryValue(definitions, bpmnFactory) {
  const categoryValue = bpmnFactory.create('bpmn:CategoryValue');

  const category = bpmnFactory.create('bpmn:Category', {
    categoryValue: [ categoryValue ]
  });

  // add to correct place
  collectionAdd(definitions.get('rootElements'), category);
  getBusinessObject(category).$parent = definitions;
  getBusinessObject(categoryValue).$parent = category;

  return categoryValue;
}