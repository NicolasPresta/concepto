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

    // Common
    .factory('common', ['$rootScope', function($rootScope) {
      return {

        imprimir: function (data){
          // Dado el objeto con toda la info de las colas, arma un resumen humanofriendly
          var resumen = "----- COLA GENERAL ------ " + "\n" + "\n";

          data.colaGeneral.forEach((cliente) => {
            resumen = resumen + "-" + cliente.id + "\n";
          });

          resumen = resumen + "\n";

          data.cajas.forEach((caja) => {
            resumen = resumen + "----- CAJA " + caja.numero + " ------ Atendiendo: " +  caja.atendiendo  + "\n" + "\n";

            caja.cola.forEach((cliente) => {
              resumen = resumen + "-" + cliente.id + "\n";
            });
          });

          return resumen;
        },

        getServerURL : function(){
          return 'http://localhost:3001'
        }

      };
    }])

})();
