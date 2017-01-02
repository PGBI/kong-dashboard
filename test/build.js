var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var fs = require ('fs');

describe('Build', function () {
  it('should have built the public folder', function () {
    assert.isTrue(fs.existsSync('./public/index.html'));
    assert.isTrue(fs.existsSync('./public/html/home.html'));
    assert.isTrue(fs.existsSync('./public/js/app.min.js'));
  });
});
