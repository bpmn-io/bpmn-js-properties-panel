import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  TextAreaEntry,
  isTextAreaEntryEdited
} from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import { without } from 'min-dash';

const DOCUMENTATION_TEXT_FORMAT = 'text/plain';


/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function DocumentationProps(props) {
  const {
    element
  } = props;

  const entries = [
    {
      id: 'documentation',
      component: ElementDocumentationProperty,
      isEdited: isTextAreaEntryEdited
    }
  ];

  if (hasProcessRef(element)) {
    entries.push({
      id: 'processDocumentation',
      component: ProcessDocumentationProperty,
      isEdited: isTextAreaEntryEdited
    });
  }

  return entries;
}

function ElementDocumentationProperty(props) {
  const {
    element
  } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = getDocumentation(getBusinessObject(element));

  const setValue =
    setDocumentation(element, getBusinessObject(element), bpmnFactory, commandStack);

  return TextAreaEntry({
    element,
    id: 'documentation',
    label: translate('Element documentation'),
    getValue,
    setValue,
    debounce
  });
}

function ProcessDocumentationProperty(props) {
  const {
    element
  } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const processRef = getBusinessObject(element).processRef;

  const getValue = getDocumentation(processRef);

  const setValue =
    setDocumentation(element, processRef, bpmnFactory, commandStack);

  return TextAreaEntry({
    element,
    id: 'processDocumentation',
    label: translate('Process documentation'),
    getValue,
    setValue,
    debounce
  });
}


// helper ////////////////////////////

function hasProcessRef(element) {
  return is(element, 'bpmn:Participant') && element.businessObject.get('processRef');
}

function findDocumentation(docs) {
  return docs.find(function(d) {
    return (d.textFormat || DOCUMENTATION_TEXT_FORMAT) === DOCUMENTATION_TEXT_FORMAT;
  });
}

/**
 * Retrieves a documentation element from a given moddle element.
 *
 * @param {ModdleElement} businessObject
 *
 * @returns {ModdleElement} documentation element inside the given moddle element.
 */
function getDocumentation(businessObject) {
  return function() {
    const documentation = findDocumentation(
      businessObject && businessObject.get('documentation')
    );

    return documentation && documentation.text;
  };
}

/**
 * Sets a documentation element for a given moddle element.
 *
 * @param {ModdleElement} businessObject
 */
function setDocumentation(element, businessObject, bpmnFactory, commandStack) {
  return function(value) {

    let documentation = findDocumentation(
      businessObject && businessObject.get('documentation')
    );

    // (1) update or removing existing documentation
    if (documentation) {

      if (value) {
        return commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: documentation,
          properties: {
            text: value
          }
        });
      } else {
        return commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: {
            documentation: without(businessObject.get('documentation'), documentation)
          }
        });
      }
    }

    // (2) create new documentation entry
    if (value) {
      documentation = bpmnFactory.create('bpmn:Documentation', {
        text: value
      });

      return commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: {
          documentation: [ ...businessObject.get('documentation'), documentation ]
        }
      });
    }
  };
}