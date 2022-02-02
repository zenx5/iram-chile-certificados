
angular.module("appConsulta")
	.filter('upperCase',function(){
		return function(texto){
		    console.log(texto)
			return texto.toLocaleUpperCase();
		}
	})