(function () {

  angular.module('fila.services', [])

    // Socket Service
    .factory('socket', ['$rootScope', function($rootScope) {
      var socket;
      return {
        connect: function(url, params) {
          socket = io(url, params);
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
