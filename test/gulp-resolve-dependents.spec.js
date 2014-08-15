var gulp = require('gulp'),
fs = require('fs'),
concat = require('gulp-concat'),
resolveDependents = require('../index.js');
tsParser = require('cheap-ts-reference-parser');

describe('gulp-resolve-dependents', function(){
    it('should track dependents correctly', function(done){
        gulp.src(__dirname + '/fixtures/lib/c.ts')
        .pipe(resolveDependents({
            files: __dirname + '/fixtures/**/*.ts',
            detector: tsParser
        }))
        .pipe(concat('result.js'))
        .pipe(gulp.dest(__dirname + '/results/'))
        .on('end', function(){
            var concated = fs.readFileSync(__dirname + '/results/result.js', {encoding: 'utf8'});
            var expected = fs.readFileSync(__dirname + '/expected/result.js', {encoding:'utf8'});
            expect(concated).toEqual(expected);
            fs.unlink(__dirname + '/results/result.js', function(){
                fs.rmdir(__dirname + '/results', function(err){
                    done();
                });
            });
        });
    });
});
