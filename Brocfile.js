var uglifyJavaScript = require('broccoli-uglify-js');
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var env = require('broccoli-env').getEnv();
var compileES6 = require('broccoli-es6-concatenator');
var findBowerTrees = require('broccoli-bower');

var sourceTrees = [];

if (env === 'production') {

  // Build file
  var js = compileES6('src', {
    loaderFile: '../vendor/no_loader.js',
    inputFiles: [
      '**/*.js'
    ],
    wrapInEval: false,
    outputFile: '/ember-json-api.js'
  });

  var jsMinified = compileES6('src', {
    loaderFile: '../vendor/no_loader.js',
    inputFiles: [
      '**/*.js'
    ],
    wrapInEval: false,
    outputFile: '/ember-json-api.min.js'
  });

  var ugly = uglifyJavaScript(jsMinified, {
    mangle: true,
    compress: true
  });

  sourceTrees = sourceTrees.concat(js);
  sourceTrees = sourceTrees.concat(ugly);

} else if (env === 'development') {

  var src, vendor;
  src = pickFiles('src', {
    srcDir: '/',
    destDir: '/src'
  });
  vendor = pickFiles('vendor', {
    srcDir: '/',
    destDir: '/vendor'
  });

  sourceTrees = sourceTrees.concat(src);
  sourceTrees = sourceTrees.concat(findBowerTrees());
  sourceTrees = sourceTrees.concat(vendor);
  var js = new mergeTrees(sourceTrees, { overwrite: true });

  js = compileES6(js, {
    loaderFile: 'vendor/loader.js',
    inputFiles: [
      'src/**/*.js'
    ],
    legacyFilesToAppend: [
      'jquery.js',
      'qunit.js',
      'handlebars.js',
      'ember.js',
      'ember-data.js'
    ],
    wrapInEval: true,
    outputFile: '/assets/app.js'
  });

  sourceTrees = sourceTrees.concat(js);

  var tests = pickFiles('tests', {
    srcDir: '/',
    destDir: '/tests'
  })
  sourceTrees.push(tests)

  sourceTrees = sourceTrees.concat(tests);

}
module.exports = mergeTrees(sourceTrees, { overwrite: true });
