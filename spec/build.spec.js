var fs = require ('fs');

describe('Build', function () {
  it('should have built the public folder', function () {
    expect(fs.existsSync('./public/index.html')).toBeTruthy();
    expect(fs.existsSync('./public/html/home.html')).toBeTruthy();
    expect(fs.existsSync('./public/js/app.min.js')).toBeTruthy();
  });
});
