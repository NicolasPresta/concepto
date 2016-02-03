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
        templateUrl: 'views/cliente.html',
        controller: 'ClienteController'
      })
      .when('/:nro', {
        templateUrl: 'views/cliente.html',
        controller: 'ClienteController'
      })
      /*.when('/caja', {
        templateUrl: 'views/indexCaja.html',
        controller: 'CajaController'
      })
      .when('/caja/:nro', {
        templateUrl: 'views/indexCaja.html',
        controller: 'CajaController'
      })*/
      .otherwise({
        redirectTo: '/'
      });

  }]);

})();
