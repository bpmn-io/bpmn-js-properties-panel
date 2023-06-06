import { isUndefined } from 'min-dash';

export function getVersionOrDateFromTemplate(template) {
  const metadata = template.metadata,
        version = template.version;

  if (metadata) {
    if (!isUndefined(metadata.created)) {
      return toDateString(metadata.created);
    } else if (!isUndefined(metadata.updated)) {
      return toDateString(metadata.updated);
    }
  }

  if (isUndefined(version)) {
    return null;
  }

  return version;
}


// helper ///////////

/**
 * Example: 01.01.1900 01:01
 *
 * @param {number} timestamp
 * @returns {string}
 */
function toDateString(timestamp) {
  const date = new Date(timestamp);

  const year = date.getFullYear();

  const month = withLeadingZeros(String(date.getMonth() + 1));

  const day = withLeadingZeros(String(date.getDate()));

  const hours = withLeadingZeros(String(date.getHours()));

  const minutes = withLeadingZeros(String(date.getMinutes()));

  return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
}

function withLeadingZeros(string) {
  return leftPad(string, 2, '0');
}

function leftPad(string, length, character) {
  while (string.length < length) {
    string = character + string;
  }

  return string;
}
