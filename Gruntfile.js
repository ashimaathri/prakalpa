module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options : {
        curly : true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        newcap: false,
        undef: true,
        unused: true,
        expr: true,
        latedef: true,
        nonbsp: true,
        dojo: true,
        predef: ['module'],
        loopfunc: true
      },
      all: [
        'Gruntfile.js',
        'src/**/*.js',
        'tests/**/*.js'
      ]
    },
    intern: {
      prod: {
        options: {
          config: 'tests/intern',
          reporters: ['Console']
        }
      },
      dev: {
        options: {
          config: 'tests/intern',
          reporters: ['Console', { id: 'LcovHtml', directory: 'html-report' }]
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('intern');
  
  grunt.registerTask('test', ['jshint', 'intern:prod']);
  grunt.registerTask('test-local', ['jshint', 'intern:dev']);
  grunt.registerTask('default', ['test']);
};
