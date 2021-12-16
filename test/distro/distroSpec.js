const {
  expect
} = require('chai');

const fs = require('fs'),
      path = require('path');

const DIST_DIR = path.join(__dirname, '../../dist');

describe('modules', function() {

  it('should expose CJS bundle', verifyExists('index.js'));

});


describe('assets', function() {



  it('should expose properties panel styles', verifyExists('assets/properties-panel.css'));


  it('should expose element templates styles', verifyExists('assets/element-templates.css'));


});

function verifyExists(relativePath) {
  return function() {

    // given
    const filePath = path.join(DIST_DIR, relativePath);

    // then
    expect(fs.existsSync(filePath), `file ${relativePath} does not exist`).to.be.true;
  };
}
