import { isArray } from 'min-dash';

/**
 * Resolve a moddle location on an element to the standard bpmn entry id this
 * provider renders for it.
 *
 * The location is a moddle `path` (as produced by `getPath` from
 * `@bpmn-io/moddle-utils`) rooted at the element's business object — the same
 * shape lint rules report. Scoped to the properties the bpmn (standard)
 * provider owns; mirrors the zeebe provider's resolver.
 *
 * Returns `null` when the location is not rendered by a standard bpmn entry (so
 * the caller can defer to another provider or its own fallback).
 *
 * @param {djs.model.Base|ModdleElement} element
 * @param {Array<string|number>} path
 *
 * @return {string|null}
 */
export function getBpmnEntryId(element, path) {
  if (!element || !isArray(path) || !path.length) {
    return null;
  }

  const property = path[ path.length - 1 ];

  // element documentation (DocumentationProps). A finding points at the
  // `documentation` property — the best-effort element-level anchor a rule
  // emits when documentation text is missing — which the group renders as the
  // `documentation` entry (always present, regardless of element type).
  if (property === 'documentation') {
    return 'documentation';
  }

  return null;
}
