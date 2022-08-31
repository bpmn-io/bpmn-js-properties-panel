import { useMemo } from '@bpmn-io/properties-panel/preact/hooks';
import { parser } from 'lezer-feel';
import { domify } from 'min-dom';
import { getExtensionElementsList } from '../../utils/ExtensionElementsUtil';

import varContext from './Untitled-1.json';

export function useStaticVariableContext(bo) {

  const type = 'send-message'; // getExtensionElementsList(bo, 'zeebe:TaskDefinition')[0]?.type;

  return useMemo(() => extractVariables(type), [

    //   type
  ]);

}

function extractVariables(type) {
  const variables = [];
  console.log(type);

  if (!type) {
    return variables;
  }



  const typeContext = varContext['type:' + type];
  console.log(typeContext);

  if (!typeContext) {
    return variables;
  }

  // parse example with feel
  const example = typeContext.outputs?.exampleData?.[0];
  const parseableExp = JSON.stringify(example);

  const rootContext = getRootContext(parseableExp);

  console.log(rootContext);

  if (!rootContext || rootContext.name !== 'Context') {
    return variables;
  }

  // translate AST to types Variables

  const handleContextEntry = (entry) => {

    const key = entry.children[0];
    const value = entry.children[1];

    const type = getType(value.name);
    let info = 'Imported from external Context';

    if (type !== 'Context') {
      info += `\r\nExample: ${parseableExp.substring(value.from, value.to)}`;
    }

    return {
      name: parseableExp.substring(key.from + 1, key.to - 1),
      detail: type,
      values: handleContextValue(value),
      info: info
    };
  };

  const handleContextValue = (value) => {
    if (value.name === 'Context') {
      return value.children.map(handleContextEntry) ;
    }

    return [ {
      detail: getType(value.name),
      value: parseableExp.substring(value.from, value.to),
      info: 'Imported from external Context'
    } ];
  };


  rootContext.children.forEach(entry => {
    variables.push(handleContextEntry(entry));
  });

  return variables;
}

function getRootContext(exp) {
  const tree = parser.parse(exp);

  const stack = [
    {
      children: []
    }
  ];

  tree.iterate({
    enter(node) {

      const {
        name,
        from,
        to
      } = node;


      const skip = (
        (name === exp.slice(from, to) && name !== 'null')
            || name === 'Identifier'
      );

      const _node = {
        name,
        from,
        to,
        children: [],
        skip
      };

      stack.push({
        ..._node
      });

    },

    leave(node) {

      const current = stack.pop();

      if (current.skip) {
        return;
      }

      const parent = stack[stack.length - 1];

      parent.children.push(current);
    }
  });

  return stack[0].children[0].children[0]; // root=>expression=>context

}


function getType(type) {
  return type.replace('Literal', '');
}