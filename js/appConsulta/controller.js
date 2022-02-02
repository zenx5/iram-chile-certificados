
angular.module("appConsulta")
//Creamos el controlador de la Aplicacion
//Inyectamos el objeto $scope y el objeto $http para hacer 
//peticiones AJAX al servidor
.controller("appConsultaControl",function($scope,$http,$sessionStorage,$location){
	//Declaramos las variables que usaremos
	//En la variable 'data' almacenaremos el resultado de la peticion AJAX
	$scope.data = {
		nombre			: "",
		apellido		: "",
		uri_foto		: "",
		rut 			: "",
		genero			: "",
		fecha_evaluacion: "",
		fecha_expiracion: "",
		registro		: "",
		observaciones 	: "",
		equipo 			: "",
		result          : true
	};
	$scope.aux = '';
	//La variable 'target' almacena el contenido del input que usamos para la busqueda
	$scope.target = '';
	//La variable 'last' almacena la ultima consulta que realizamos
	$scope.last = ''
	$scope.searching = true;
	//la variable 'error' sera usada para determinar si ocurre algun error de comunicacion
	//con el servidor al momento de la solicitud
	$scope.error = true;
	
	$scope.formatREG = function(id){
	    var value = $scope[id];
	    value = value.split('-').join('');
	    
	   if(value.length <= 2){
	       if(!isNaN(value[0])||!isNaN(value[1])) {
	           value = value.substring(0,value.length - 1);
	       }
			$scope[id] = value;
			return;
		}
		if(isNaN(value.substring(2))){
		    value = value.substring(0,value.length - 1); 
        }
		if((value.length > 2)&&(value.length < 7)){
		    value = value.substring(0,2) + "-" + value.substring(2);
		}
		else if((value.length >= 7)&&(value.length <= 8)){
		    value = value.substring(0,2) + "-" + value.substring(2,6) + "-" + value.substring(6);
		}
		else if(value.length > 8){
		    value = value.substring(0,value.length - 1);
		    value = value.substring(0,2) + "-" + value.substring(2,6) + "-" + value.substring(6);
		}
		$scope[id] = value;
	}
	
	$scope.formatEMP = function(id){
	    var value = $scope[id];
	    value = value.split('-').join('');
	    
	    if(isNaN(value.substring(6))||value.length > 10||(value.length<7&&!isNaN(value[value.length - 1]))){
		    value = value.substring(0,value.length - 1); 
        }
	    
	   if(value.length <= 2){
			$scope[id] = value;
			return;
		}
		
		if(value.length == 3){
		    value = value.substring(0,2) + "-" + value.substring(2);
		}
		else if(value.length == 4){
		    value = value.substring(0,2) + "-" + value.substring(2,3) + "-" + value.substring(3);
		}
		else if((value.length > 4)){
		    value = value.substring(0,2) + "-" + value.substring(2,3) + "-" + value.substring(3,4) + "-" + value.substring(4);
		}
		$scope[id] = value;
	}
	
	$scope.formatRUT = function(id){
		var value = $scope[id];
		value = value.split('-').join('');
		value = value.split('.').join('');
		if(!isFinite(value)){
			value = value.substr(0, value.length-1);
		}
		if(value.length <= 1){
			$scope[id] = value;
			return;
		}
		value = Intl.NumberFormat('es-VE').format(value.substr(0, value.length - 1)) + "-" + value[value.length - 1];
		$scope[id] = value;
	}
	$scope.usuario = "";
	$scope.contrasena = "";
	$scope.login = function(){
		$http({
			method : 'POST',
			url : '../acceso.php',
			data: 'a=1&usuario='+$scope.usuario+'&contrasena='+$scope.contrasena,
			headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
		})
			.then(function(data){
				var data = data.data;
				console.log(data)
				if(JSON.parse(data.result)){
					$sessionStorage.usuario = $scope.usuario;
					$sessionStorage.contrasena = $scope.contrasena;
					sessionStorage.nivel = data.nivel;
					$location.path('/consulta');
				}
				else{
					$scope.loginTypeError = data.errorType;
					alert(data.msj);
				}
			});
	}
	
	$scope.logout = function(){
	    $sessionStorage.usuario = "";
		$sessionStorage.contrasena = "";
		sessionStorage.nivel = "0";
		$location.path('/');
	}
	//La funcion 'search' hace la consulta a la base de datos
	//usando el objeto '$http' de Angular.
	//Esta funcion se dispara con el evento 'ng-click' del boton
	//de busqueda o con el evento 'ng-submit' del formulario
	$scope.searchEquipo = function(){
	    
	}
	
	$scope.search = function(){
	    $scope.searching = true;
	    $scope.data.result = false;
	    $scope.error = false;
		//hacemos una peticion 'GET' usando nuestra propia APIRest
		//Enviamos el codigo RUT que hemos solicitado al usuario
		if($scope.target=="") return;
		
		var value = $scope.target;//.split('-').join('');
		$http.get("../api/v1/personas_certificados/"+value+"/@!$2y$10$ChM6jbE2ceExRBWNcfmYoeYv.snP9kulhb36UI67IFeMRBszq4Z4a")
			//Si la peticion tiene respuesta exitosa ejecutamos 
			//la siguiente funcion
			.then(function(response){
				var data = response.data;
				//si la peticion resulta exitosa 'bajamos' la bandera de error
				//la respuesta del servidor la almacenamos en la variable 'data'
				if((typeof(data).length=="undefined")){
					$scope.data = data;
					$scope.data.result = false;
					$http.get("../api/v1/personas/"+data['rut']+"/@!$2y$10$ChM6jbE2ceExRBWNcfmYoeYv.snP9kulhb36UI67IFeMRBszq4Z4a")
						.then(function(response){
							data2 = response.data;
							if((typeof(data2).length=="undefined")){
								$scope.data['nombre'] = data2['nombre'];
								$scope.data['apellido'] = data2['apellido'];
								$scope.data['uri_foto'] = data2['uri_foto'];
								$http.get("../api/v1/certificados/"+data['id_certificados']+"/@!$2y$10$ChM6jbE2ceExRBWNcfmYoeYv.snP9kulhb36UI67IFeMRBszq4Z4a")
									.then(function(response){
										data3 = response.data;
										if((typeof(data).length=="undefined")){
											$scope.data['equipo'] = data3['titulo'];
											$scope.searching = false;
                                    	    $scope.data.result = true;
                                    	    $scope.error = false;
                                    	    $scope.aux = $scope.data['rut'];
                                    	    $scope.formatRUT('aux');
                                    	    $scope.data['rut'] = $scope.aux.replace($scope.aux.substring(0,5),"*.***");
										}
										else{
										    $scope.searching = false;
                                    	    $scope.data.result = false;
                                    	    $scope.error = false;
										}
									})
							}
						})
				}
				else{
					$scope.searching = false;
            	    $scope.data.result = false;
            	    $scope.error = false;
				}
				//'last' almacena el valor de 'target' (ultima consulta) 
				$scope.last = $scope.target;
			})
			/*.error(function(){
				//si no se puede realizar la comunicacion con el servidor
				//'subimos' la bandera de error
				$scope.error = true;
			})*/
	}
});