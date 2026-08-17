import { isAny, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import GraphRelationEntry from './GraphRelationEntry';
import { getGraphRelations } from './relationsHelper';

/**
 * Provides the "Graph Relation" ListGroup items.
 * Data is read from window.__bpmnRelations (injected by BpmnEditor.tsx).
 * Displays nodeId (Parent Id) and docuFilId (Document Id) per relation.
 * Read-only — managed via RelationFoundryPopup in ai-admin-console.
 */
export function GraphRelationProps({ element }) {
  if (!isAny(element, ['bpmn:Task'])) {
    return;
  }

  const businessObject = getBusinessObject(element);
  if (!businessObject) return;

  const relations = getGraphRelations(businessObject.id);

  if (!relations || relations.length === 0) {
    return;
  }

  const entries = [
    {
      id: element.id + '-graphRelation',
      component: GraphRelationEntry,
      element,
      idPrefix: element.id + '-graphRelation'
    }
  ];

  return {
    entries,
    relationCount: relations.length,
    shouldSort: false
  };
}
