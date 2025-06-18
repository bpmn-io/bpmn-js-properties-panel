import { FeelLanguageContext } from '@bpmn-io/properties-panel';

const DEFAULT_FEEL_LANGUAGE_CONTEXT = {
  parserDialect: 'camunda',
};

export function withFeelLanguageContext(Component) {
  return props => <FeelLanguageContext.Provider value={ DEFAULT_FEEL_LANGUAGE_CONTEXT }>
    <Component { ...props }></Component>
  </FeelLanguageContext.Provider>;
}
