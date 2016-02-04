module.exports = function (grunt) {

  grunt.initConfig({
    connect: {
      server: {
        options: {
          hostname: '127.0.0.1',
          port: 9000,
          base: 'Cliente/',
          keepalive: true
        }
      }
    },
    watch: {
      project: {
        files: ['Cliente/**/*.js', 'Cliente/**/*.html', 'Cliente/**/*.json', 'Cliente/**/*.css'],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['connect', 'watch']);

};
