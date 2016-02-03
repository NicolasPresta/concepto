(function () {

  angular.module('fila.services', [])

    // Socket Service
    .factory('socket', ['$rootScope', function($rootScope) {
      var url = 'http://localhost:3001';
      var socket = io(url);

      return {
        on: function(eventName, callback){
          socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
          socket.emit(eventName, data);
        }
      };
    }])

})();
