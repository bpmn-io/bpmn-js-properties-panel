import { isAny, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import ApiRelationEntry from './ApiRelationEntry';
import { getApiRelations } from './relationsHelper';

/**
 * Provides the "API Relation" ListGroup items.
 * Data is read from window.__bpmnRelations (injected by BpmnEditor.tsx).
 * cal_tp_cd === 'APIB' entries are shown here.
 * Read-only — managed via RelationFoundryPopup in ai-admin-console.
 */
export function ApiRelationProps({ element }) {
  if (!isAny(element, ['bpmn:Task'])) {
    return;
  }

  const businessObject = getBusinessObject(element);
  if (!businessObject) return;

  const relations = getApiRelations(businessObject.id);

  if (!relations || relations.length === 0) {
    return;
  }

  const entries = [
    {
      id: element.id + '-apiRelation',
      component: ApiRelationEntry,
      element,
      idPrefix: element.id + '-apiRelation'
    }
  ];

  return {
    entries,
    relationCount: relations.length,
    shouldSort: false
  };
}
