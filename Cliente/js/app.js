(function () {

  var app = angular.module('fila', [
    'ngRoute',
    'fila.controllers',
    'fila.directives',
    'fila.filters',
    'fila.services'
  ]);

  // Route CONFIG
  app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'views/eleccion.html',
        controller: 'EleccionController'
      })
      .when('/cliente', {
        templateUrl: 'views/cliente.html',
        controller: 'ClienteController'
      })
      .when('/cliente/:nro', {
        templateUrl: 'views/cliente.html',
        controller: 'ClienteController'
      })
      .when('/caja', {
        templateUrl: 'views/caja.html',
        controller: 'CajaController'
      })
      .when('/caja/:nro', {
        templateUrl: 'views/caja.html',
        controller: 'CajaController'
      })
      .otherwise({
        redirectTo: '/'
      });

  }]);

})();
