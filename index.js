var gutil    = require('gulp-util');
var _  = require('lodash');
var through  = require('through2');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var vinylFs = require('vinyl-fs');
var Promise = require('es6-promise').Promise;

const PLUGIN_NAME = 'gulp-resolve-dependents';

var fileDep = require('node-file-dep');

module.exports = function(option) {
  var _option = _.defaults(option, {
      files: null,
      resolver: null,
      includeSource: true,
      basePath: process.cwd
  });

  return through.obj(function (file, encoding, callback) {
      if (!_option.files) {
        this.emit(
          'error',
          new gutil.PluginError(PLUGIN_NAME, 'option.files is required.')
        );
        return callback();
      }

      if (!_option.resolver) {
        this.emit(
          'error',
          new gutil.PluginError(PLUGIN_NAME, 'option.resolver is required.')
        );
        return callback();
      }

      var _this = this;

      if (file.isNull()) {
        this.push(file);
        return callback();
      }

      if (file.isStream()) {
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        return callback();
      }

      readProjectFiles(_option.files).then(function(files){
          var projectDependencies = new fileDep.Project(_option.resolver, {
              basePath: _option.basePath
          });
          files.forEach(function(file){
              projectDependencies.addFile(file.path, file.contents);
          });
          var dependents = projectDependencies.getDependentsOf(path.resolve(file.path));
          var sources = _option.includeSource ? dependents.concat(file.path) : dependents;
          sources.forEach(function(source){
              _this.push(new gutil.File({
                    base: _option.basePath,
                    path: source,
                    contents: fs.readFileSync(source)
              }));
          });
          callback();
        }, function(err){
          _this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
          callback();
      }).catch(function(){
          _this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
          callback();
      });
  });
};

function readProjectFiles(pattern){
  return new Promise(function(resolve, reject){
      glob(pattern, function(err, matches){
          err ? reject(err) : resolve(matches);
      });
  }).then(function(matches){
      return Promise.all(matches.map(readFile));
  });
}

function readFile(filePath){
  return new Promise(function(resolve, reject){
      fs.readFile(filePath, {encoding: 'utf8'}, function(err, data){
          if(err){
            reject(err);
          }else{
            resolve({
                path: filePath,
                contents: data
            });
          }
      });
  });
}
