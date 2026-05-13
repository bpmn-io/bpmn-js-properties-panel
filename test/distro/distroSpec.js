const {
  expect
} = require('chai');

const fs = require('fs'),
      path = require('path');

const DIST_DIR = path.join(__dirname, '../../dist');

describe('modules', function() {

  it('should expose CJS bundle', verifyExists('index.js'));

});

describe('named exports', function() {

  let esmBundle;

  before(function() {
    esmBundle = fs.readFileSync(path.join(DIST_DIR, 'index.esm.js'), 'utf-8');
  });

  it('should export BpmnPropertiesPanelModule', function() {
    expect(esmBundle).to.include('BpmnPropertiesPanelModule');
  });


  it('should export BpmnPropertiesPanelCoreModule', function() {
    expect(esmBundle).to.include('BpmnPropertiesPanelCoreModule');
  });


  it('should export BpmnPropertiesPanelHeaderModule', function() {
    expect(esmBundle).to.include('BpmnPropertiesPanelHeaderModule');
  });

});

function verifyExists(relativePath) {
  return function() {

    // given
    const filePath = path.join(DIST_DIR, relativePath);

    // then
    expect(fs.existsSync(filePath), `file ${relativePath} does not exist`).to.be.true;
  };
}
