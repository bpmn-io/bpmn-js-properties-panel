import { useMemo } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from '../../hooks';

const DEFAULT_FEEL_LANGUAGE_CONTEXT = {
  parserDialect: 'camunda',
};

export function withFeelLanguageContext(Component) {
  return (props) => {
    const feelLanguageContext = useMemo(() => {
      const config = useService('config');

      return (config && config.feelLanguageConfig) || DEFAULT_FEEL_LANGUAGE_CONTEXT;
    });

    return <Component { ...props }
      feelLanguageContext={ feelLanguageContext }
    ></Component>;
  };
}