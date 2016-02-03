(function () {

  angular.module('fila.controllers', [])
    .controller('ClienteController', ['$scope', '$routeParams', 'socket', function ($scope, $routeParams, socket) {
      
      var nro = $routeParams.nro;
      // nro puede ser nulo, en cuyo caso se trata de la conexion de un cliente nuevo
      // TODO: implementar la conexion de un cliente con un número dado.

      $scope.hacerFila = function() {
        socket.emit('hacerFila');
      };

      $scope.salirFila = function() {
        socket.emit('salirFila');
      };


      socket.on('nuevaCola', function(data) {
        $scope.$apply(function () {
          $scope.cola = data;
          $scope.colaText = imprimir(data);
        });
      });

      socket.on('tomaID', function(data) {
        $scope.$apply(function () {
          $scope.socketID = data;
        });
      });

      function imprimir(data)
      {
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
      };

    }])


    /*.controller('CajaController', ['$scope', '$routeParams', 'filaService', function ($scope, $routeParams, filaService) {
      var nro = $routeParams.nro;
     
      // nro puede ser nulo, en cuyo caso se trata de la conexion de un cliente nuevo
      // TODO: implementar la conexion de un cliente con un número dado.

      filaService.conectarCaja().then(function (data) {
        $scope.cola = data
      });

    }])*/

})(_);
