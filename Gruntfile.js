module.exports = function (grunt) {

  // make sure to update this to point to your files
  var files = ['lib/**/*.js'];

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true
      },
      src: files
    },
    jscs: {
      options: {
        config: '.jscsrc',
        reporter: 'inline'

      },
      src: files
    }
  });

  // Load grunt plugins for modules
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');

  // register tasks. You might do this under a test 'test'
  grunt.registerTask('default', ['jshint', 'jscs']);
};
