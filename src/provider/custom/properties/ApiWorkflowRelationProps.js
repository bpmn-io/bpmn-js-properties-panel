import { isAny, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import ApiWorkflowRelationEntry from './ApiWorkflowRelationEntry';
import { getApiWorkflowRelations } from './relationsHelper';

/**
 * Provides the "API Workflow Relation" ListGroup items.
 * Data is read from window.__bpmnRelations (injected by BpmnEditor.tsx).
 * cal_tp_cd === 'SAPI' entries are shown here.
 * Read-only — managed via RelationFoundryPopup in ai-admin-console.
 */
export function ApiWorkflowRelationProps({ element }) {
  if (!isAny(element, ['bpmn:Task'])) {
    return;
  }

  const businessObject = getBusinessObject(element);
  if (!businessObject) return;

  const relations = getApiWorkflowRelations(businessObject.id);

  if (!relations || relations.length === 0) {
    return;
  }

  const entries = [
    {
      id: element.id + '-apiWorkflowRelation',
      component: ApiWorkflowRelationEntry,
      element,
      idPrefix: element.id + '-apiWorkflowRelation'
    }
  ];

  return {
    entries,
    relationCount: relations.length,
    shouldSort: false
  };
}
