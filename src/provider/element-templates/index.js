import translateModule from 'diagram-js/lib/i18n/translate';

import { ConditionChecker } from './ConditionChecker';
import ElementTemplates from './ElementTemplates';
import ElementTemplatesLoader from './ElementTemplatesLoader';
import ReplaceBehavior from './ReplaceBehavior';
import commandsModule from './cmd';
import ElementTemplatesPropertiesProvider from './ElementTemplatesPropertiesProvider';

import camundaPlatformPropertiesProviderModule from '../camunda-platform';
import ChangeElementTemplateHelper from './ChangeElementTemplateHelper';

export default {
  __depends__: [
    commandsModule,
    translateModule,
    camundaPlatformPropertiesProviderModule
  ],
  __init__: [
    'conditionChecker',
    'elementTemplatesLoader',
    'replaceBehavior',
    'elementTemplatesPropertiesProvider',
    'changeElementTemplateHelper'
  ],
  elementTemplates: [ 'type', ElementTemplates ],
  elementTemplatesLoader: [ 'type', ElementTemplatesLoader ],
  replaceBehavior: [ 'type', ReplaceBehavior ],
  elementTemplatesPropertiesProvider: [ 'type', ElementTemplatesPropertiesProvider ],
  conditionChecker: [ 'type', ConditionChecker ],
  changeElementTemplateHelper: [ 'type', ChangeElementTemplateHelper ]
};
