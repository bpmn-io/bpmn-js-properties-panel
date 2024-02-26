/* eslint-disable react-hooks/rules-of-hooks */

import {
  useService
} from '../../hooks';

const TooltipProvider = {
  'historyTimeToLive': (element) => {

    const translate = useService('translate');

    return (
      <div>
        <p>
          { translate('Number of days before this resource is being cleaned up. If specified, takes precedence over the engine configuration.') }{ ' '}
          <a href="https://docs.camunda.org/manual/latest/user-guide/process-engine/history/" target="_blank" rel="noopener">{ translate('Learn more.') }</a>
        </p>
      </div>
    );
  }
};

export default TooltipProvider;
