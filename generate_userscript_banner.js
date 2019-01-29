// Generate the userscript metadata for greasemonkey


const fs = require('fs');


const openFileAndExtractMetaDataLines = (filePath) => {
  const templateFileContent = fs.readFileSync(filePath, 'utf-8');
  const templateLines = templateFileContent.split(/[\n\r]+/);
  return templateLines.filter(text => /^\s*\/\/\s*@\w+\b/.test(text));
}



module.exports = (templateFile, context) => {
  let lines = ['==UserScript=='];

  // From the template
  for (let metadataLine of openFileAndExtractMetaDataLines(templateFile)) {
    lines.push(metadataLine);
  }

  // From the script
  for (let metadataLine of openFileAndExtractMetaDataLines(context.chunk.entryModule.id)) {
    lines.push(metadataLine);
  }

  lines.push('==/UserScript==');
  return lines.join('\n');
}
