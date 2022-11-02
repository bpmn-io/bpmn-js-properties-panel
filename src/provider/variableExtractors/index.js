import OpenAPIExtractor from './openAPI/OpenAPIExtractor';
import ZeebeVariableExtractors from './ZeebeVariableExtractors';

export default {
  __init__: [ 'zeebeVariableExtractors', 'openAPIExtractor' ],
  zeebeVariableExtractors: [ 'type', ZeebeVariableExtractors ],
  openAPIExtractor: [ 'type', OpenAPIExtractor ]
};