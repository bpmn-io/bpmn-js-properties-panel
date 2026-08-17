import { html } from 'htm/preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { useService } from '../../../hooks';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { getApiRelations, subscribeRelationsUpdated, deleteApiRelation } from './relationsHelper';

/**
 * Entry component for API Relation.
 * Reads from window.__bpmnRelations injected by BpmnEditor.
 * Displays callRefId (API router/endpoint ID) for this task.
 */
export default function ApiRelationEntry(props) {
  const { element } = props;

  const translate = useService('translate');
  const businessObject = getBusinessObject(element);
  const elementId = businessObject?.id;

  const [items, setItems] = useState(() => getApiRelations(elementId));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refresh = () => setItems(getApiRelations(elementId));
    const unsubscribe = subscribeRelationsUpdated(refresh);
    return unsubscribe;
  }, [elementId]);

  const handleDelete = useCallback(async (callRefId) => {
    setLoading(true);
    try {
      await deleteApiRelation(elementId, callRefId);
    } finally {
      setLoading(false);
    }
  }, [elementId]);

  if (!items || items.length === 0) {
    return html`
      <div class="bio-properties-panel-entry" style="padding: 8px 12px; color: #888; font-size: 12px;">
        ${translate('No API relations')}
      </div>
    `;
  }

  return html`
    <div style="padding: 4px 0; opacity: ${loading ? '0.6' : '1'}; pointer-events: ${loading ? 'none' : 'auto'};">
      ${items.map((item, idx) => html`
        <div
          key=${'api-' + idx + '-' + item.callRefId}
          style="
            margin: 4px 8px 8px 8px;
            padding: 12px;
            background: #ffffff;
            border: 1px solid #dfe1e6;
            border-radius: 6px;
            font-size: 12px;
            color: #172b4d;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight: 600; color: #5e6c84; font-size: 11px; letter-spacing: 0.5px;">
              RELATION ${idx + 1}
            </div>
            <div
              style="cursor: pointer; color: #de350b;"
              title=${translate('Remove')}
              onClick=${() => handleDelete(item.callRefId)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </div>
          </div>
          <div>
            <span style="font-weight: 600;">${translate('Intent ID')}:</span>
            <span style="margin-left: 4px;">${item.callRefId || '-'}</span>
          </div>
        </div>
      `)}
    </div>
  `;
}
