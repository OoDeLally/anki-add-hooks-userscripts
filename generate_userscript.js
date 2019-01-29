const fs = require('fs');
const babelTemplate = require('babel-template');
const babelGenerate = require('babel-generator').default;
const babelTypes = require('babel-types')




const extractMetadata = (programPath, name, failIfMissing = false) => {
  const file = programPath.parent;
  const comments = file.comments;
  const metadataNode = comments.find(node => new RegExp(`^\\s*@${name}\\b`).test(node.value));
  if (!metadataNode) {
    if (failIfMissing) {
      throw Error(`Missing @${name} metadata. Make sure your script contains it.`)
    }
    return [];
  }
  const commentValue = metadataNode.value;
  const match = commentValue.match(/^\s*@\w+\s+(.*)\s*$/);
  if (!match || !match[1]) {
    return [];
  }
  return [metadataNode, match[1]];
}

const extractFunction = (programPath, name) => {
  const body = programPath.node.body;
  const functionNode = body.find(node => node.type == 'FunctionDeclaration' && node.id.name == name);
  if (!functionNode) {
    throw Error(`Missing function ${name}(). Make sure it is defined at the root of your file.`)
  }
  return functionNode
}


module.exports = function(babel, {templateFile, styleFile}) {
  return {
    visitor: {
      Program(programPath, state) {
        // FIXME Extract EVERYTHING, not just the 3 functions

        // console.log('programPath.node.body:', programPath.node.body)
        const [, nameMetadataValue] = extractMetadata(programPath, 'name', true);

        const runFunction = extractFunction(programPath, 'run');
        const extractFrontTextFunction = extractFunction(programPath, 'extractFrontText');
        const extractBackTextFunction = extractFunction(programPath, 'extractBackText');

        const templateFileContent = fs.readFileSync(templateFile, 'utf-8');
        const buildUserScript = babelTemplate(templateFileContent);
        const styleFileContent = fs.readFileSync(styleFile, 'utf-8');
        const ast = buildUserScript({
          PLACEHOLDER_FUNCTION_RUN: runFunction,
          PLACEHOLDER_FUNCTION_EXTRACT_FRONT_TEXT: extractFrontTextFunction,
          PLACEHOLDER_FUNCTION_EXTRACT_BACK_TEXT: extractBackTextFunction,
          PLACEHOLDER_HOOK_NAME: babelTypes.stringLiteral(nameMetadataValue),
          PLACEHOLDER_STYLE_TEXT: babelTypes.stringLiteral(styleFileContent),
        });

        programPath.parent.program = babelTypes.program(ast);

      },
    },
  };
}
