import { isAny } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import ChatbotRelationEntry from './ChatbotRelationEntry';
import { getChatbotRelations } from './relationsHelper';

/**
 * Provides the "Chatbot Relation" ListGroup items.
 * Data is read from window.__bpmnRelations (injected by BpmnEditor.tsx).
 * This is a read-only display — no add/remove (managed via RelationFoundryPopup).
 */
export function ChatbotRelationProps({ element }) {
  if (!isAny(element, ['bpmn:Task'])) {
    return;
  }

  const businessObject = getBusinessObject(element);
  if (!businessObject) return;

  const relations = getChatbotRelations(businessObject.id);

  if (!relations || relations.length === 0) {
    return;
  }

  const entries = [
    {
      id: element.id + '-chatbotRelation',
      component: ChatbotRelationEntry,
      element,
      idPrefix: element.id + '-chatbotRelation'
    }
  ];

  return {
    entries,
    relationCount: relations.length,
    shouldSort: false
  };
}
