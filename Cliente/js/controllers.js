(function (_) {
  angular.module('fila.controllers', [])
    .controller('ClienteController', ['$scope', '$routeParams', 'socket', 'common', function ($scope, $routeParams, socket, common) {
    
      var nro = $routeParams.nro;
      // nro puede ser nulo, en cuyo caso se trata de la conexion de un cliente nuevo
      // TODO: implementar la conexion de un cliente con un número dado.

      socket.connect(common.getServerURL());

      $scope.hacerFila = function() {
        socket.emit('hacerFila');
      };

      $scope.salirFila = function() {
        socket.emit('salirFila');
      };

      socket.on('nuevaCola', function(data) {
        $scope.$apply(function () {
          $scope.cola = data;
          $scope.colaText = common.imprimir(data);
          $scope.estado = obtenerEstado(data, $scope.socketID);
        });
      });

      socket.on('tomaID', function(data) {
        $scope.$apply(function () {
          $scope.socketID = data;
        });
      });

      socket.on('clienteAtendido', function() {
        $scope.$apply(function () {
          $scope.estado.atendido = true;
          $scope.estado.estaEnFila = false;
          $scope.estado.estaEnFilaGeneral = false;
          $scope.estado.estaEnFilaCaja = false;
        });
      });

      function obtenerEstado(data, id)
      {
        var retorno = {
        estaEnFila: false,
        estaEnFilaGeneral: false,
        estaEnFilaCaja: false,
        nroCaja: null,
        genteDelante: null,
        atendido: false
        }

        var ix = 0;
        var cantidadGenteColaGeneral =  data.colaGeneral.length;

        data.colaGeneral.forEach((cliente) => {
          if(cliente.id == id){
            ix = ix + 1;
            retorno.estaEnFila = true;
            retorno.estaEnFilaGeneral = true;
            retorno.genteDelante = cantidadGenteColaGeneral - ix;
          }
        });


        if(!retorno.estaEnFila){
          data.cajas.forEach((caja) => {
            caja.cola.forEach((cliente) => {
              if(cliente.id == id){
                retorno.estaEnFila = true;
                retorno.estaEnFilaCaja = true;
                retorno.nroCaja = caja.numero;
              }
            })
          });
        }

        return retorno;
      };

    }])


.controller('CajaController', ['$scope', '$routeParams', 'socket', 'common',  function ($scope, $routeParams, socket, common) {
    
      var nro = $routeParams.nro;
      // nro puede ser nulo, en cuyo caso se trata de la conexion de un cliente nuevo
      // TODO: implementar la conexion de un cliente con un número dado.

      socket.connect(common.getServerURL());

      $scope.abrirCaja = function() {
        socket.emit('abrirCaja');
      };

      $scope.cerrarCaja = function() {
        socket.emit('cerrarCaja');
      };

      $scope.atendiCliente = function(id) {
        socket.emit('atendiCliente', id);
      };

      $scope.llamarOtroCliente = function(id) {
        socket.emit('llamarOtroCliente', id);
      };


      socket.on('nuevaCola', function(data) {
        $scope.$apply(function () {
          $scope.cola = data;
          $scope.colaText = common.imprimir(data);
          $scope.estado = obtenerEstado(data, $scope.socketID);
        });
      });

      socket.on('tomaID', function(data) {
        $scope.$apply(function () {
          $scope.socketID = data;
        });
      });


      function obtenerEstado(data, id)
      {
        var retorno = {
          atendiendo: false,
          hayMasClientes: false,
          cola: null,
        }

        retorno.hayMasClientes = data.colaGeneral.length;

        data.cajas.forEach((caja) => {
          if(caja.numero == id){
            retorno.cola = caja.cola;
            retorno.atendiendo = caja.atendiendo;
          }
        })

        return retorno;
      };

    }])

    .controller('EleccionController', ['$scope', '$routeParams', 'socket', 'common',  function ($scope, $routeParams, socket, common) {
    
     

    }])

})(_);
