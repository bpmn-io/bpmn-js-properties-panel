import {
  is
} from 'bpmn-js/lib/util/ModelUtil';



/**
 * getExtensionElementsList - get the extensionElements of a given type for a given
 * businessObject as list. Will return an empty list if no extensionElements (of
 * given type) are present
 *
 * @param  {ModdleElement} businessObject
 * @param  {string} [type=undefined]
 * @return {Array<ModdleElement>}
 */
export function getExtensionElementsList(businessObject, type = undefined) {
  const elements = ((businessObject.get('extensionElements') &&
                  businessObject.get('extensionElements').get('values')) || []);

  return (elements.length && type) ?
    elements.filter((value) => is(value, type)) :
    elements;
}
