

/**	Aplicacion realizada con el AngularJS ***/
//Creamos el modulo para la Aplicacion 
angular.module("appConsulta",["ngRoute","ngStorage","ngAnimate"])
.config(function($routeProvider){
    $routeProvider
        .when('/',{
            controller : "appConsultaControl",
            templateUrl : "login.html"
        })
        .when('/consulta',{
            controller : "appConsultaControl",
            templateUrl : "consulta.html"
        })
        .otherwise('/');
})
	