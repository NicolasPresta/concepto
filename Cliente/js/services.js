(function () {

  angular.module('fila.services', [])

    // Socket Service
    .factory('socket', ['$rootScope', function($rootScope) {
      return {
        connect: function(url) {
          socket = io(url);
        },
        on: function(eventName, callback){
          socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
          socket.emit(eventName, data);
        }
      };
    }])

})();
