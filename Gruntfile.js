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
        predef: ['module']
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
          runType: 'runner',
          config: 'tests/intern',
          reporters: ['console', 'lcovhtml']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('intern');
  
  grunt.registerTask('test', ['jshint', 'intern:prod']);
  grunt.registerTask('default', ['test']);
};
