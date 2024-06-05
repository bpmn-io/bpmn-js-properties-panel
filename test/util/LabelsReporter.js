// adopted from bpmn-js label-reporter

const fs = require('fs');
const path = require('path');

function LabelsReporter() {
  const labelsFile = path.join(__dirname, '../../labels.csv');

  let labels = [];

  this.onBrowserLog = function(browser, log, type) {

    if (log === undefined || typeof log !== 'string') {
      return;
    }

    if (log.substring(0, 1) === '\'') {
      log = log.substring(1, log.length - 1);
    }

    try {
      const obj = JSON.parse(log);

      if (obj.type === 'label') {
        labels.push(obj.value);
      }
    } catch (e) {
      return;
    }
  };


  this.onRunComplete = function() {
    const csv = labels.map(label => `${label.id},${label.title}`).join('\n');
    fs.writeFileSync(labelsFile, csv);
  };
}

module.exports = {
  'reporter:label-reporter' : [ 'type', LabelsReporter ]
};