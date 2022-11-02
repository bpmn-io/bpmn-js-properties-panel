import camunda7API from './parsedAPI.json';

import { ExtractProcessVariables } from 'extract-process-variables-plugin';
import { getExtensionElementsList } from '../../../utils/ExtensionElementsUtil';

// import staticContextExtractor from './staticContextExtractor';

class OpenAPIExtractor extends ExtractProcessVariables {

  constructor(eventBus) {
    super(eventBus);
    this.extractVariables.bind(this);
  }

  extractVariables(context) {
    const {
      elements,
      processVariables
    } = context;

    elements.forEach(element => {
      const inputParameters = getExtensionElementsList(element, 'zeebe:IoMapping')[0]?.inputParameters;

      if (!inputParameters) return;

      const source = inputParameters.find(inputParameter => {
        return inputParameter.target === 'path';
      })?.source;

      if (!source) return;

      const path = source.substring(2, source.length - 1);
      const schema = camunda7API.paths[path]?.get?.responses['200']?.content['application/json']?.schema;

      if (!schema) return;

      const variables = transformSchemaToVariables(schema);

      variables.forEach(variable => {
        this.addVariable(processVariables, element, variable.name, element, variable);
      });

    });

  }

}


OpenAPIExtractor.$inject = [ 'eventBus' ];

export default OpenAPIExtractor;


function transformSchemaToVariables(schema) {
  const values = [];

  Object.entries(schema?.properties).forEach(([ key, value ]) => {
    if (value.type === 'object') {
      values.push({
        name: key,
        detail: 'Context',
        values: transformSchemaToVariables(value)
      });
    } else {
      values.push({
        name: key,
        detail: value.type,
        info: value.description
      });
    }
  });

  return values;
}