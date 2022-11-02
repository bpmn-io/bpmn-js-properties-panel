
import { ExtractProcessVariables } from 'extract-process-variables-plugin';
import staticContextExtractor from './staticContextExtractor';

class ZeebeVariableExtractors extends ExtractProcessVariables {

  constructor(eventBus) {
    console.log('here');
    super(eventBus);
  }

  addExtractor(context) {
    context.extractors.push(staticContextExtractor);
  }

}


ZeebeVariableExtractors.$inject = [ 'eventBus' ];

export default ZeebeVariableExtractors;