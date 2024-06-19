/**********************************************************************
***************                                            ************
***************   **       ****    *****  ******  **  **   ************
***************   **      ******  ******  ******  **  **   ************
***************   **      **  **  **        **    *** **   ************
***************   **      **  **  **  **    **    ******   ************
***************   **      **  **  **  **    **    ** ***   ************
***************   ******  ******  ******  ******  **  **   ************
***************   ******   ****    ****   ******  **  **   ************
***************                                            ************
**********************************************************************/
angular.module("appConsultaLoad")
.controller("appConsultaLoadControlLogin",function($scope,$http,$location,$sessionStorage){
	//$http.get("/certificadosiram.cl/acceso.php?")
	//Variables usadas
	$scope.registro = {
		usuario : "",
		contrasena : ""
	};
	$scope.loginTypeError = 0;
	$scope.usuario_repetido = false;
	$scope.usuario = "";
	$scope.contrasena = "";
	$scope.login = function(){
		$location.path('/admin');
		return
		$http({
			method : 'POST',
			url : '../acceso.php',
			data: 'a=1&usuario='+$scope.usuario+'&contrasena='+$scope.contrasena,
			headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
		})
			.then(function(data){
				var data = data.data
				if(JSON.parse(data.result)){
					$sessionStorage.usuario = $scope.usuario;
					$sessionStorage.contrasena = $scope.contrasena;
					sessionStorage.nivel = data.nivel;
					if($scope.usuario=='publico'){
					    $scope.usuario = "";
					    $scope.contrasena = "";
					    $sessionStorage.usuario = $scope.usuario;
					    $sessionStorage.contrasena = $scope.contrasena;
					    sessionStorage.nivel = "";
					    $location.path('/');
					    return;
					}
					$location.path('/admin');
				}
				else{
					$scope.loginTypeError = data.errorType;
					alert(data.msj);
				}
			});
	}	 

	$scope.registro = function(){
		$location.path('/admin');
		return
		$http({
			method : 'POST',
			url : '../registro.php',
			data: 'r=1&usuario='+$scope.registro.usuario+'&contrasena='+$scope.registro.contrasena,
			headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
		})
			.success(function(data){
				console.log(data);
				$scope.usuario_repetido = JSON.parse(data.used);
				$scope.registro.contrasena = "";
				if(!JSON.parse(data.used)){
					$("#close").click();
					alert(data.msj)
				}
			})
	}
});