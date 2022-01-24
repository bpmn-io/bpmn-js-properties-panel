import translateModule from 'diagram-js/lib/i18n/translate';

import ElementTemplates from './ElementTemplates';
import ElementTemplatesLoader from './ElementTemplatesLoader';
import ReplaceBehavior from '../element-templates/ReplaceBehavior';
import commandsModule from './cmd';

import zeebePropertiesProviderModule from '../zeebe';

export default {
  __depends__: [
    commandsModule,
    translateModule,
    zeebePropertiesProviderModule
  ],
  __init__: [
    'elementTemplatesLoader',
    'replaceBehavior'
  ],
  elementTemplates: [ 'type', ElementTemplates ],
  elementTemplatesLoader: [ 'type', ElementTemplatesLoader ],
  replaceBehavior: [ 'type', ReplaceBehavior ]
};
