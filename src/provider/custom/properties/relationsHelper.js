/**
 * Helper to read relation data injected by BpmnEditor.tsx
 * into window.__bpmnRelations after injectGraphMappings runs.
 *
 * Structure of window.__bpmnRelations:
 * [
 *   {
 *     id: <wf_task_id>,
 *     properties: {
 *       relations: {
 *         graphRelation:       [{ docuFilId, nodeId, id, type }],
 *         chatbotRelation:     [{ id, callRefId, type }],
 *         apiWorkflowRelation: [{ id, callRefId, type }],
 *         apiRelation:         [{ id, callRefId, type }],
 *       }
 *     }
 *   }
 * ]
 *
 * BpmnEditor.tsx also exposes:
 *   window.__bpmnRelationHandlers = {
 *     deleteChatbot(taskId, callRefId),
 *     deleteGraph(taskId, docuFilId, nodeId),
 *     deleteApiWorkflow(taskId, callRefId),
 *     deleteApi(taskId, callRefId),
 *   }
 * and dispatches CustomEvent('bpmn-relations-updated') after each change.
 */

/**
 * Returns the relations object for a given BPMN element id.
 * @param {string} elementId
 * @returns {{ graphRelation, chatbotRelation, apiWorkflowRelation, apiRelation } | null}
 */
export function getRelationsForElement(elementId) {
  const nodes = window.__bpmnRelations;
  if (!Array.isArray(nodes) || !elementId) return null;
  const node = nodes.find((n) => n.id === elementId);
  return node?.properties?.relations || null;
}

export function getChatbotRelations(elementId) {
  return getRelationsForElement(elementId)?.chatbotRelation || [];
}

export function getGraphRelations(elementId) {
  return getRelationsForElement(elementId)?.graphRelation || [];
}

export function getApiWorkflowRelations(elementId) {
  return getRelationsForElement(elementId)?.apiWorkflowRelation || [];
}

export function getApiRelations(elementId) {
  return getRelationsForElement(elementId)?.apiRelation || [];
}

/**
 * Subscribe to bpmn-relations-updated events.
 * Returns unsubscribe function for use in useEffect cleanup.
 * @param {() => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeRelationsUpdated(callback) {
  window.addEventListener('bpmn-relations-updated', callback);
  return () => window.removeEventListener('bpmn-relations-updated', callback);
}

/**
 * Delete a chatbot relation.
 * Calls window.__bpmnRelationHandlers.deleteChatbot (exposed by BpmnEditor.tsx).
 */
export async function deleteChatbotRelation(taskId, callRefId) {
  const handlers = window.__bpmnRelationHandlers;
  if (handlers?.deleteChatbot) {
    await handlers.deleteChatbot(taskId, callRefId);
  } else {
    console.warn('deleteChatbot handler not provided');
  }
}

/**
 * Delete a graph relation.
 */
export async function deleteGraphRelation(taskId, docuFilId, nodeId) {
  const handlers = window.__bpmnRelationHandlers;
  if (handlers?.deleteGraph) {
    await handlers.deleteGraph(taskId, docuFilId, nodeId);
  } else {
    console.warn('deleteGraph handler not provided');
  }
}

/**
 * Delete an API workflow relation.
 */
export async function deleteApiWorkflowRelation(taskId, callRefId) {
  const handlers = window.__bpmnRelationHandlers;
  if (handlers?.deleteApiWorkflow) {
    await handlers.deleteApiWorkflow(taskId, callRefId);
  } else {
    console.warn('deleteApiWorkflow handler not provided');
  }
}

/**
 * Delete an API relation.
 */
export async function deleteApiRelation(taskId, callRefId) {
  const handlers = window.__bpmnRelationHandlers;
  if (handlers?.deleteApi) {
    await handlers.deleteApi(taskId, callRefId);
  } else {
    console.warn('deleteApi handler not provided');
  }
}
