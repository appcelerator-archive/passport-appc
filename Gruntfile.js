module.exports = function (grunt) {

	grunt.initConfig({
		appcJs: {
			src: ['*.js']
		}
	});

	grunt.loadNpmTasks('grunt-appc-js');

	grunt.registerTask('default', ['appcJs']);
};
