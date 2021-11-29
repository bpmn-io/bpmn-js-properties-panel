import translateModule from 'diagram-js/lib/i18n/translate';

import ElementTemplates from './ElementTemplates';
import ElementTemplatesLoader from './ElementTemplatesLoader';
import ReplaceBehavior from './ReplaceBehavior';
import commandsModule from './cmd';
import ElementTemplatesPropertiesProvider from './ElementTemplatesPropertiesProvider';

import camundaPlatformPropertiesProviderModule from '../camunda-platform';

export default {
  __depends__: [
    commandsModule,
    translateModule,
    camundaPlatformPropertiesProviderModule
  ],
  __init__: [
    'elementTemplatesLoader',
    'replaceBehavior',
    'elementTemplatesPropertiesProvider'
  ],
  elementTemplates: [ 'type', ElementTemplates ],
  elementTemplatesLoader: [ 'type', ElementTemplatesLoader ],
  replaceBehavior: [ 'type', ReplaceBehavior ],
  elementTemplatesPropertiesProvider: [ 'type', ElementTemplatesPropertiesProvider ]
};
