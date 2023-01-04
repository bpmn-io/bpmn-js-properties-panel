import translateModule from 'diagram-js/lib/i18n/translate';

import ElementTemplatesConditionChecker from './ElementTemplatesConditionChecker';
import ElementTemplates from './ElementTemplates';
import ElementTemplatesLoader from './ElementTemplatesLoader';
import ReplaceBehavior from './ReplaceBehavior';
import commandsModule from './cmd';
import templateElementFactoryModule from './create';
import ElementTemplatesPropertiesProvider from './ElementTemplatesPropertiesProvider';
import UpdateTemplatePropertiesOrder from './UpdateTemplatePropertiesOrder';

import zeebePropertiesProviderModule from '../zeebe';

export default {
  __depends__: [
    commandsModule,
    templateElementFactoryModule,
    translateModule,
    zeebePropertiesProviderModule
  ],
  __init__: [
    'elementTemplatesLoader',
    'replaceBehavior',
    'elementTemplatesPropertiesProvider',
    'elementTemplatesConditionChecker',
    'updateTemplatePropertiesOrder'
  ],
  elementTemplates: [ 'type', ElementTemplates ],
  elementTemplatesLoader: [ 'type', ElementTemplatesLoader ],
  replaceBehavior: [ 'type', ReplaceBehavior ],
  elementTemplatesPropertiesProvider: [ 'type', ElementTemplatesPropertiesProvider ],
  elementTemplatesConditionChecker: [ 'type', ElementTemplatesConditionChecker ],
  updateTemplatePropertiesOrder: [ 'type', UpdateTemplatePropertiesOrder ]
};
