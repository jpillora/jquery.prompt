var fs = require('fs'),
    _;

/*global module:false*/
module.exports = function(grunt) {


  // Project configuration.
  grunt.initConfig({

    pkg: '<json:component.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= pkg.license %> */',
      header:
        '(function() {',
      footer:
        '}());'
    },
    stylus: {
      compile: {
        options: {
          compress: true
        },
        files: {
          'dist/*.css': ['src/*.styl']
        }
      }
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          '<banner:meta.header>',
          '<file_strip_banner:dist/<%= pkg.name %>.css.js>',
          '<file_strip_banner:src/<%= pkg.name %>.js>',
          '<banner:meta.footer>'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    css2js: {
      dist: {
        file: 'dist/<%= pkg.name %>.css'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
    },

    watch: {
      scripts: {
        files: '<config:lint.files>',
        tasks: 'default',
        options: {
          debounceDelay: 1000
        }
      }
    },
    jshint: {
      options: {
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        require: true,
        jQuery: true,
        "$": true
      }
    }
  });

  // Plugins
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha');

  // Custom tasks
  grunt.registerMultiTask('css2js', 'Web get stuff.', function() {
    var name = this.target,
        src = grunt.file.expandFiles( this.data.file ),
        dest = src + '.js';

    grunt.log.writeln("Converting: '" + src + "' to JavaScript");
    var css = fs.readFileSync("dist/jquery.prompt.css").toString();
    if(!css) {
      grunt.log.writeln("Failed to read file");
      return false;
    }
    var cssStrings = css.split("\n").map(function(l) { return '"' + l + '\\n"'; }).join(" + \n");
    var js = '$(function() { $("head").append($("<style/>").html(' + cssStrings + ')); });';
    grunt.log.writeln("Saved: '" + src + "' as '" + dest + "'");
    fs.writeFileSync(dest, js);
    return true;
  });

  // Default task.
  grunt.registerTask('default', 'stylus lint css2js concat min');
  grunt.renameTask('watch', 'real-watch');
  grunt.registerTask('watch', 'default real-watch');

};
