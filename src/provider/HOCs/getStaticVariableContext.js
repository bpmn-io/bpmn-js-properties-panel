import { parser } from 'lezer-feel';

import varContext from './Untitled-1.json';

const context = {};

for (const key of Object.keys(varContext)) {
  context[key] = extractVariables(key);
}

console.log(context);

export function useStaticVariableContext(bo) {

  return context;

}

function extractVariables(type) {
  const currentContext = varContext[type];

  // parse example with feel
  const inExample = currentContext.inputs?.exampleData?.[0];
  const inExapleExp = JSON.stringify(inExample);

  const outExample = currentContext.outputs?.exampleData?.[0];
  const outExapleExp = JSON.stringify(outExample);


  const result = {};
  result.in = getVariablesFromString(inExapleExp);
  result.out = getVariablesFromString(outExapleExp);
  return result;
}

// translate AST to types Variables
function handleContextEntry(entry) {

  const key = entry.children[0];
  const value = entry.children[1];

  const type = getType(value.name);
  let info = 'Imported from external Context';

  if (type !== 'Context') {
    info += `\r\nExample: ${value.content}`;
  }


  let name = key.content;
  if (name.startsWith('"')) {
    name = name.substring(1, name.length - 1);
  }

  return {
    name: name,
    detail: type,
    values: handleContextValue(value),
    info: info,
    value: value.content,
    entry: value
  };
}

function handleContextValue(value) {
  if (value.name === 'Context') {
    return value.children.map(handleContextEntry) ;
  }

  return [
    {
      detail: getType(value.name),
      value: value.content,
      info: 'Imported from external Context',
      entry: value
    }
  ];
}

function getVariablesFromString(parseableExp) {
  const variables = [];
  const rootContext = getRootContext(parseableExp);

  if (!rootContext || rootContext.name !== 'Context') {
    return variables;
  }


  rootContext.children.forEach(entry => {
    variables.push(handleContextEntry(entry));
  });

  return variables;
}

export {
  handleContextEntry,
  handleContextValue,
  getVariablesFromString
};

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
        skip,
        content: exp.slice(from, to)
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
  const name = type.replace('Literal', '');

  switch (name) {
  case 'Numeric':
    return 'Number';
  case 'VariableName':
    return 'variable';
  default:
    return name;
  }

  // return type.replace('Literal', '');
}