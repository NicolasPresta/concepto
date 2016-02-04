(function () {

	angular.module('fila.controllers', [])
		.controller('ClienteController', ['$scope', '$routeParams', 'socket', '$http', function ($scope, $routeParams, socket, $http) {

			var nro = $routeParams.nro;
			// nro puede ser nulo, en cuyo caso se trata de la conexion de un cliente nuevo
			// TODO: implementar la conexion de un cliente con un número dado.
			var miId = {
				id: 1
			};
			$http.post('http://localhost:3001/testHandshake', miId)
				.success(function(data){
					socket.connect('http://localhost:3001', { query: 'token=' + data.token});

					socket.on('nuevaCola', function(data) {
						$scope.$apply(function () {
							$scope.cola = data;
							$scope.colaText = imprimir(data);
							$scope.estado = obtenerEstado(data, $scope.socketID);
						});
					});
					socket.on('tomaID', function(data) {
						$scope.$apply(function () {
							$scope.socketID = data;
						});
					});
				}).error(function(err){

			})



			$scope.hacerFila = function() {
				socket.emit('hacerFila');
			};

			$scope.salirFila = function() {
				socket.emit('salirFila');
			};



			function obtenerEstado(data, id)
			{
				var retorno = {
					estaEnFila: false,
					estaEnFilaGeneral: false,
					estaEnFilaCaja: false,
					nroCaja: null,
					genteDelante: null
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
