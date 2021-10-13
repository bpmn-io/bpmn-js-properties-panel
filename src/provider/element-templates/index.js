import translateModule from 'diagram-js/lib/i18n/translate';

import ElementTemplates from './ElementTemplates';
import ElementTemplatesLoader from './ElementTemplatesLoader';
import ReplaceBehavior from './ReplaceBehavior';
import commandsModule from './cmd';

export default {
  __depends__: [
    commandsModule,
    translateModule
  ],
  __init__: [
    'elementTemplatesLoader',
    'replaceBehavior'
  ],
  elementTemplates: [ 'type', ElementTemplates ],
  elementTemplatesLoader: [ 'type', ElementTemplatesLoader ],
  replaceBehavior: [ 'type', ReplaceBehavior ]
};
