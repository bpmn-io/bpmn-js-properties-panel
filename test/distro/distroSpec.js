const {
  expect
} = require('chai');

const fs = require('fs'),
      path = require('path');

const DIST_DIR = path.join(__dirname, '../../dist');

describe('modules', function() {

  it('should expose CJS bundle', verifyExists('index.js'));

});

function verifyExists(relativePath) {
  return function() {

    // given
    const filePath = path.join(DIST_DIR, relativePath);

    // then
    expect(fs.existsSync(filePath), `file ${relativePath} does not exist`).to.be.true;
  };
}
