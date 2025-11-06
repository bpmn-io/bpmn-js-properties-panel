/* eslint-disable react-hooks/rules-of-hooks */

import {
  useService
} from '../../hooks';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

const TooltipProvider = {
  'historyTimeToLive': (element) => {

    const translate = useService('translate');

    return (
      <div>
        <p>
          { translate('Number of days before this resource is being cleaned up. If specified, takes precedence over the engine configuration.') }{ ' '}
          <a href="https://docs.camunda.org/manual/latest/user-guide/process-engine/history/" target="_blank" rel="noopener noreferrer">{ translate('Learn more.') }</a>
        </p>
      </div>
    );
  }
};

export default TooltipProvider;
