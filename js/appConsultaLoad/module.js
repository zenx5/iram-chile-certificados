angular.module("appConsultaLoad",["ngRoute","ngStorage","ngResource"])
	.config(function($routeProvider){
		$routeProvider
			.when("/",{
				controller:"appConsultaLoadControlLogin",
				templateUrl:"../appConsultaLogin.html"
			})
			.when("/admin",{
				controller:"appConsultaLoadControlAdmin",
				templateUrl : "../appConsultaAdmin.html"
			})
			.otherwise("/");
	})
	