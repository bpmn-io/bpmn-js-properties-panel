import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  add as collectionAdd
} from 'diagram-js/lib/util/Collections';

import { TextAreaEntry, isTextAreaEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function NameProps(props) {
  const {
    element
  } = props;

  if (isAny(element, [ 'bpmn:Collaboration', 'bpmn:DataAssociation', 'bpmn:Association' ])) {
    return [];
  }

  return [
    {
      id: 'name',
      component: Name,
      isEdited: isTextAreaEntryEdited
    }
  ];
}

function Name(props) {
  const {
    element
  } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const canvas = useService('canvas');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

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
    },
    autoResize: true
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


  return TextAreaEntry(options);
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
