var gutil    = require('gulp-util');
var _  = require('lodash');
var through  = require('through2');
var glob = require('glob');
var fs = require('fs');
var vinylFs = require('vinyl-fs');
var Promise = require('es6-promise').Promise;

const PLUGIN_NAME = 'gulp-resolve-dependants';

var fileDep = require('node-file-dep');

module.exports = resolveDependants(option) {
    var _option = _.defaults(option, {
        files: null,
        detector: null,
        read: false,
        includeOrigFile: true,
        basePath: '.'
    });

    if(!_option.files){
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'option.files is required.'));
        return callback();
    }

    if(!_option.detector){
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'option.detector is required.'));
        return callback();
    }

    return through.obj(function (file, encoding, callback) {
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
            var projectDependencies = new fileDep.Project(parser, {
                basePath: _option.basePath
            });
            files.forEach(function(file){
                projectDependencies.addFile(file.path, file.contents);
            });
            var dependants = projectDependencies.getDependantsOf(file.path);
            var sources = _option.includeOrigFile ? dependants.concat(file.path) : dependants;
            source.forEach(function(source){
                _this.push(vinylFs.src(source, {read: _option.read}));
            });
            callback();
        }, function(err){
            _this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            callback();
        });
    });
};

function readProjectFiles(pattern){
    return new Promise(function(resolve, reject){
        glob(files, function(err, matches){
            err ? reject(err) : resolve(matches);
        });
    }).then(function(matches){
        return Promise.all(matches.map(readFile));
    });
}

function readFile(file){
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

