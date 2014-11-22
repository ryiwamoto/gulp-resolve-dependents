var gulp = require('gulp'),
  fs = require('fs'),
  concat = require('gulp-concat'),
  resolveDependents = require('../index.js'),
  tsParser = require('cheap-ts-reference-parser'),
  path = require('path');

describe('gulp-resolve-dependents', function () {
  it('should track dependents correctly', function (done) {
    var fixtureDir = 'test/fixtures/resolve-files'
    var resultDir = 'test/results/resolve-files';
    var resultFile = resultDir + '/result.js';
    var expectedFile = 'test/expected/resolve-files/result.js';

    gulp.src(fixtureDir + '/lib/c.ts')
      .pipe(resolveDependents({
        files: fixtureDir + '/**/*.ts',
        resolver: tsParser
      }))
      .pipe(concat('result.js'))
      .pipe(gulp.dest(resultDir))
      .on('end', function () {
        try {
          var concated = fs.readFileSync(resultFile, {encoding: 'utf8'});
          var expected = fs.readFileSync(expectedFile, {encoding: 'utf8'});

          expect(concated).toEqual(expected);
          fs.unlink(resultFile, function () {
            fs.rmdir(resultDir, done);
          });
        } catch (e) {
          console.log(e);
        }
      });
  });

  it('should track dependents correctly with basePath', function (done) {
    var fixtureDir = 'test/fixtures/base-path';
    var resultDir = 'test/results/base-path';
    var resultFile = resultDir + '/result.js';
    var expectedFile = 'test/expected/base-path/lib/result.js';

    gulp.src(path.resolve(fixtureDir + '/lib/deep/a.ts'))
      .pipe(resolveDependents({
        files: fixtureDir + '/**/*.ts',
        basePath: 'test/fixtures/base-path',
        includeSource: false,
        resolver: tsParser
      }))
      .pipe(concat('result.js'))
      .pipe(gulp.dest('test/results/base-path'))
      .on('end', function () {
        try {
          var concated = fs.readFileSync(resultFile, {encoding: 'utf8'});
          var expected = fs.readFileSync(expectedFile, {encoding: 'utf8'});
          expect(concated).toEqual(expected);
          fs.unlink(resultFile, function () {
            fs.rmdir(resultDir, done);
          });
        } catch (e) {
          console.log(e);
        }
      });
  });
});

