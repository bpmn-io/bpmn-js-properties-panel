import Markup from 'preact-markup';

import { sanitizeHTML } from '../util/sanitize';

export function PropertyDescription(props) {

  const {
    description
  } = props;

  return (
    <Markup
      markup={ sanitizeHTML(description) }
      trim={ false } />
  );
}