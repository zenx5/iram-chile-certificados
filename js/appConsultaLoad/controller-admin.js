
angular.module("appConsultaLoad")
.controller("appConsultaLoadControlAdmin",function($scope,$http,$location,$sessionStorage,$resource){
	//$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

    $scope.format = function(id){
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
	};
	
	if(typeof(keys) !== 'function'){
		 function keys(obj){
			var arregloKeys = [];
			for(var key in obj){
				arregloKeys.push(key);
			}
			return arregloKeys;
		}
	}
	
	$scope.registro = {
		personas : '../api/v1/personas/',
		certificados : '../api/v1/certificados/',
		personas_certificados : '../api/v1/personas_certificados/',
		administradores : '../api/v1/administradores/'
	};
	$scope.ArchivoNoValido = false;
	$scope.opcionesEquipo = [];
	$scope.equipo = null;
	$scope.nivel_usuario = 0;
	$scope.nuevoRegistro = {
		persona : {},
		certificado : {},
	};
	$scope.dataDownload;
	
	
	$scope.notificacion_change = true;
	$scope.ApiRest = "";
	$scope.nuevos_usuarios = [];
	$scope.estado = {};
	$scope.notif_nuevo_usuario = false;
	
	setTimeout(function(){
	consultarRegistro($scope.registro.certificados,null,function(data){
		console.log(data.data);
		for(var aux in data.data){
			$scope.opcionesEquipo.push({id:data.data[aux].id,titulo:data.data[aux].titulo});
		}
		$scope.$apply();
	})},5000);

	
	
	if($scope.usuario == "publico"){
	    $location.path('/');
	}
	
	$scope.consultarAdministradores = function(){
		if($scope.nivel_usuario==3){
			consultarRegistro($scope.registro.administradores,null,function(data){
				if(data.data.length!= $scope.nuevos_usuarios.length){

					$scope.nuevos_usuarios = data.data.filter(function(e){
						if((e.nivel!=3)){
							return e;
						}
					});	
				}
			});
		}
	};

	

	$scope.generarToken = function(_bool){
		var dato = {
			usuario : $scope.usuario,
			contrasena : $scope.contrasena
		};
		if(_bool){
			$scope.token_usuario = "new";
		}
		modificarRegistro($scope.registro.administradores,dato,function(data){
			console.log(data);
			$scope.token_usuario = data.data;
		});
	};
	
	//funcion para verificar la identidad del usuario y evitar que se entre usando el link
	if(($sessionStorage.usuario === undefined)||($sessionStorage.usuario === '')){
		//$location.path('/');
	}
	else{
		$scope.usuario = $sessionStorage.usuario;
		$scope.contrasena = $sessionStorage.contrasena;
		$scope.nivel_usuario = sessionStorage.nivel;

		$scope.generarToken(false);		
	}
	

	setInterval($scope.consultarAdministradores,10000);	
	/*************************************************************
	****                                             *************
	****   ****   *****   *    *  ******  *   **     *************
	****  ******  ******  **  **  ******  **  **     *************
	****  **  **  **  **  ******    **    *** **     *************
	****  ******  **  **  ******    **    ******     *************
	****  ******  **  **  ******    **    ** ***     *************
	****  **  **  ******  **  **  ******  **  **     *************
	****  **  **  *****   **  **  ******  **   *     *************
	****                                             *************
	*************************************************************/
	//funcion para aprobar o rechazar nuevos administradores
	$scope.aprobar = function(_bool,user){
		$scope.notificacion_change = true;
		if(_bool){
			dato = {
						usuario  :  user,
						nivel   :  $scope.estado[user],
						standby  :  ($scope.estado[user]=='0')?1:0
					};
			console.log(dato);
			modificarRegistro($scope.registro.administradores,dato,function(data){
				data = data.data;
				$scope.consultarAdministradores();
			});
			
		}
			else{
			borrarRegistro($scope.registro.administradores,{usuario:user},function(data){
				$scope.nuevos_usuarios = $scope.nuevos_usuarios.filter(function(e){
					if(e.usuario!=user){
						return e;
					}
				});
				console.log("borrado "+user);
			});

		}
	};


	


	/*************************************************************
	****                                             *************
	****   ****   **      ******  **  **  ******     *************
	****  ******  **      ******  **  **  ******     *************
	****  **   *  **      **  **  **  **  **         *************
	****  **      **      ******  **  **  ****       *************
	****  **   *  **      ******   ****   **         *************
	****  ******  ******  **  **   ****   ******     *************
	****   ****   ******  **  **    **    ******     *************
	****                                             *************
	*************************************************************/
	//funcion para cambiar la clave
	$scope.cambiarClave = function(){
		if($scope.contrasena != $scope.vieja_contrasena){
			alert("Olvidaste tu Contraseña?");
			return false;
		}
		var dato = {
			usuario : $scope.usuario,
			contrasena : $scope.vieja_contrasena,
			nueva_contrasena : $scope.nueva_contrasena
		};
		peticionHttp("POST","acceso.php",{data:"c=1&usuario="+dato.usuario+"&contrasena="+dato.contrasena+"&nueva_contrasena="+dato.nueva_contrasena,'Content-Type' : 'application/x-www-form-urlencoded'},function(data){
				data = data.data;
				//console.log(data);
				$scope.contrasena = $scope.nueva_contrasena;
				$sessionStorage.contrasena = $scope.nueva_contrasena;
				$scope.vieja_contrasena = "";
				$scope.nueva_contrasena = "";
				alert("Se cambio la contraseña de su cuenta");
			});
	};

	/*************************************************************
	******                                                     ***
	******    **      ******  ******  ******  **  **  ******   ***
	******    **      ******  ******  ******  **  **  ******   ***
	******    **      **  **  **      **  **  **  **    **     ***
	******    **      **  **  **  **  **  **  **  **    **     ***
	******    **      **  **  **  **  **  **  **  **    **     ***
	******    ******  ******  ******  ******  ******    **     ***
	******    ******  ******  ******  ******  ******    **     ***
	******                                                     ***
	**************************************************************/

	//funcion para hacer logout
	$scope.logout = function(){
		$sessionStorage.usuario = "";
		$sessionStorage.contrasena = "";
		$location.path("/");

	};


	/*************************************************************
	******                                                     ***
	******    *****   ******  ******  ******  ******  ******   ***
	******    ******  ******  ******  ******  ******  ******   ***
	******    **  **  **  **  **  **  **  **  **  **  **  **   ***
	******    *****   **  **  *****   *****   ******  *****    ***
	******    **  **  **  **  *****   *****   ******  *****    ***
	******    ******  ******  ** ***  ** ***  **  **  ** ***   ***
	******    *****   ******  **  **  **  **  **  **  ** ***   ***
	******                                                     ***
	**************************************************************/
	//funcion para Borrar un registro
	$scope.borrar = function(){
	    var value = $scope.del_rut.split('.').join('').split('-').join('');
		if(value.length>0){
			borrarRegistro($scope.registro.personas,{rut:value},function(data){
				console.log(data);
				alert("Se borro el Registro de RUT "+$scope.del_rut);
				$scope.del_rut = "";
			});
		}
		if($scope.del_certificado.length>0){
			borrarRegistro($scope.registro.certificados,{id:$scope.del_certificado},function(data){
				console.log(data);
				$scope.del_certificado = "";
			});
		}
	};

	$scope.borrarTodo = function(){
		if(confirm("Seguro que desea borrar toda la data de la base de Datos?")){
			$scope.getDATA('JSON');
			borrarRegistro($scope.registro.personas,null,function(){
				borrarRegistro($scope.registro.certificados,null,function(){
					borrarRegistro($scope.registro.personas_certificados,null,function(){
						alert("Todos los datos de la Base de Datos fueron borrados, por razones de seguridad se ha descargado un archivo con toda la informacion");
					})
				})
			})
		}
	}

	

	/******************************************************************
	*****                                                      ********  
	*****    ******  **  **  **  **  ******   ****   *****     ********  
	*****    ******  *** **  **  **  ******  ******  ******    ********  
	*****    **      *** **  **  **    **    **  **  **  **    ******** 
	*****    *****   ** ***  ******    **    ******  *****     ********  
	*****    **      ** ***   ****     **    ******  *****     ********  
	*****    ******  **  **    **    ******  **  **  **  **    ********  
	*****    ******  **  **    **    ******  **  **  **  **    ********  
	*****                                                      ********  
	*******************************************************************/
	$scope.enviarDatos = function($regpersona, $regcertificado, $regpersonas_certificados){
		if(typeof($regpersona).length=="undefined"){ $regpersona = [$regpersona];}
		if(typeof($regcertificado).length=="undefined"){ $regcertificado = [$regcertificado];}
		if(typeof($regpersonas_certificados=="undefined").length){ $regpersonas_certificados = [$regpersonas_certificados];}
		for(i in $regpersona){
			var $persona = $regpersona[i];
			console.log($regpersona[i])
			agregarRegistro($scope.registro.personas,$persona,function(data1){
				console.log("salida POST, guardando personas");
				console.log(data1.data);
				for(j in $regcertificado){
					var  $certificado = $regcertificado[j];
					console.log($regpersonas_certificados[j])
					console.log($persona)
					if($regpersonas_certificados[j].rut == $persona.rut){
						agregarRegistro($scope.registro.certificados,$certificado,function(data2){
							console.log("salida POST, guardando certificados");
							console.log(data2.data);
							consultarRegistro($scope.registro.certificados,null,function(data){
								console.log("salida GET, extrayendo certificados");
								console.log(data.data)
								data = data.data;
								console.log(data);
								$regpersonas_certificados[j].id_certificados = data[data.length - 1].id;	
								
								agregarRegistro($scope.registro.personas_certificados,$regpersonas_certificados[j],function(data3){
									console.log("salida POST, guardando personas_certificados");
									console.log(data3)
								})
								
							}) //fin consulta
						})//fin nuevo registro certificados
					}
				}
			}) //fin nuevo registro personas
		}
		document.location.reload()
	}
	
	/***********************************************************
	******                                          ************
	******  ***      ****   ******   ****    ****   ************
	******  *****   ******  ******  ******  **  **  ************
	******  ** ***  **  **    **    **  **   **     ************
	******  **  **  ******    **    **  **    **    ************
	******  ** ***  ******    **    **  **     **   ************
	******  *****   **  **    **    ******  **  **  ************
	******  ***     **  **    **     ****    ****   ************
	******                                          ************
	***********************************************************/
	//funcion para cargar datos de manera 'manual'

	$scope.cargarDatos = function(){

		var file = document.getElementById('pdf');
		var datafile = new FormData();
		datafile.append('filepdf'  , file.files[0]);
		//console.log(document.getElementById('registro').value)
		datafile.append('registro' ,document.getElementById('registro').value);
		datafile.append('img',document.getElementById('foto').files[0])
		xhr = new XMLHttpRequest();
		xhr.open("POST","../newpdf.php");
		xhr.send(datafile);
		if($scope.equipo!=0){
			var $certificado = {
				titulo : $scope.equipo
			}
		}
		else{
			var $certificado = {
				titulo : $scope.nuevoRegistro.certificado.equipo,
				duracion_horas:0
			}
		}
		
		$scope.nuevoRegistro.persona.uri_foto = "img_"+$scope.nuevoRegistro.persona.rut+".png";
		//$scope.data.uri_foto = $scope.foto_URI[0];
		$scope.nuevoRegistro.persona.rut = $scope.nr_p_rut;
		$aux = {
			rut : $scope.nuevoRegistro.persona.rut, 
			fecha_expiracion : $scope.nuevoRegistro.certificado.fecha_expiracion,
			fecha_evaluacion : $scope.nuevoRegistro.certificado.fecha_evaluacion,
			nro_registro : $scope.nuevoRegistro.certificado.registro,
			observaciones : $scope.nuevoRegistro.certificado.observaciones

		}
		$scope.enviarDatos($scope.nuevoRegistro.persona,$certificado,$aux);
	}

	/***********************************************************
	******                                            **********
	******    ******    ******    **        ******    **********
	******    ******    ******    **        ******    **********
	******    **          **      **        **        **********
	******    ****        **      **        ****      **********
	******    ****        **      **        **        **********
	******    **        ******    ******    ******    **********
	******    **        ******    ******    ******    **********
	******                                            **********
	***********************************************************/
	$scope.cargarFile = function(){
		switch($scope.fileData_ext[0]){
			case 'JSON':
				$scope.ArchivoNoValido = false;
				var $file = JSON.parse($scope.fileData[0]),
					$personas = [], $certificados = [], $aux = []
				for(i in $file){
					$personas.push({
						nombre : $file[i].nombre,
						apellido : $file[i].apellido,
						rut : $file[i].rut,
						uri_foto: $file[i].foto
					});
					for(j in $file[i].certificados){
						$certificados.push({
							titulo : $file[i].certificados[j].titulo,
							duracion_horas:$file[i].certificados[j].duracion_horas
						})	
						$aux.push({
							rut : $file[i].rut,
							nro_registro : $file[i].certificados[j].nro_registro,
							fecha_evaluacion : $file[i].certificados[j].fecha_evaluacion,
							fecha_expiracion : $file[i].certificados[j].fecha_expiracion,
							observaciones : $file[i].certificados[j].observaciones,
							file: $file[i].certificados[j].file
						})
					}
					
					
				}
				for(var i = 0; i < $personas.length; i++){
					$scope.enviarDatos($personas[i],$certificados[i],$aux[i]);
				}
				break;
			default:
				$scope.fileData[0] = ''
				$scope.ArchivoNoValido = true;
		}
	}
	
	/****************************************************************         
	*********                                             ***********         
	*********       ****       ******      ******         ***********          
	*********      ******      ******      ******         ***********        
	*********      ******      **  **        **           ***********        
	*********      **  **      ******        **           ***********        
	*********      ******      ******        **           ***********        
	*********      **  **  **  **      **  ******  **     ***********        
	*********      **  **  **  **      **  ******  **     ***********        
	*********                                             ***********        
	****************************************************************/        
	$scope.cargarApi = function(){
		$api  = $resource($scope.ApiRest);
		$api.query(function(datos){uri
			agregarRegistro($scope.registro.personas,datos);
		})
	}
	//*******************************************************************
	//***                                                   *************
	//***       *****       *****    ****   ******   ****   *************
	//***      ******       ******  ******  ******  ******  *************
	//***      **           **  **  **  **    **    **  **  *************
	//***      **  **  ***  **  **  ******    **    ******  *************
	//***      **  **  ***  **  **  ******    **    ******  *************
	//***      ******       ******  **  **    **    **  **  *************
	//***       ****        ****    **  **    **    **  **  *************
	//***                                                   *************
	//*******************************************************************
	
	$scope.getDATA = function(type){
		console.log(type);
		var data = []
		consultarRegistro($scope.registro.personas,null,function(data){
			$persona = data.data;
			consultarRegistro($scope.registro.certificados,null,function(data){
				$certificados = data.data;
				consultarRegistro($scope.registro.personas_certificados,null,function(dataR){
					$aux = dataR.data;
					var data = [];
					for(var i = 0; i < $persona.length; i++){
						data[i] = $persona[i];
						data[i].certificados = []
						for(var j = 0; j < $aux.length; j++){
							if($aux[j]['rut']==$persona[i]['rut']){
								data[i].certificados.push((function(cert,aux){
									for(var k = 0; k < cert.length; k++){
										if(cert[k]['id']==aux['id_certificados']){
											return {
												titulo : cert[k]['titulo'],
												duracion_horas : cert[k]['duracion_horas'],
												nro_registro : aux['nro_registro'],
												fecha_expiracion : aux['fecha_expiracion'],
												fecha_evaluacion : aux['fecha_evaluacion'],
												observaciones : aux['observaciones']
												//file:  aux['file']
											};
										}
									}
								})($certificados,$aux[j]))
							}
						}
					}
					if(type=='JSON'){
						$scope.getJSON(data)
					}
					else if(type=='XML'){
						$scope.getXML(data)
					}
				})
			})
		});
	}

	$scope.getJSON = function(data){
		data = JSON.stringify(data);
		do{
			data = data.replace(',"',',\n"')
		}while(data.indexOf(',"')!=-1)
		$scope.download(data,'json');
	}
	$scope.getXML = function(data){
		$convert = new X2JS();
		var xml = "<xml>"+$convert.json2xml_str(data)+"</xml>"
		k = 0;
		while(xml.indexOf('<'+k+'>')!=-1){
			xml = xml.replace('<'+k+'>','<persona>');
			xml = xml.replace('</'+k+'>','</persona>');
			k++;
		}
		$scope.download(xml,'xml');
	}

	$scope.download = function(data,ext){
		var a = document.createElement('a');
		a.setAttribute('href',
		 'data:text/'+ext+';charset=utf-8,'+encodeURIComponent(data));
		a.setAttribute('download','data.'+ext)
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
	
	
	//*******************************************************************
	//***                                          **********************
	//***      **  **  ******  ******  *****       **********************
	//***      **  **  ******  ******  ******      **********************
	//***      ******    **      **    **  **      **********************
	//***      ******    **      **    ******      **********************
	//***      **  **    **      **    *****       **********************
	//***      **  **    **      **    **          **********************
	//***      **  **    **      **    **          **********************
	//***                                          **********************
	//*******************************************************************

	function consultarRegistro(registro,data,response){
		if(data === null){
			dato = {
				id:''
			}
		}
		else{
			dato = {
				id : data
			}
		}
		consumoApi('GET',registro,dato,response)
	}

	function modificarRegistro(registro,data,response){
		consumoApi('PUT',registro,data,response)
	}

	function agregarRegistro(registro,data,response){
		consumoApi('POST',registro,data,response);
	}


	function borrarRegistro(registro, data, response){
		if(data == null){
			console.log("null");
			data = {
				delete : "_ALL_"
			};
		}
		console.log(data);
		consumoApi('DELETE',registro,data,response);
	}

	function consumoApi(method,registro, data, response){
		var idkey = "",
		 	xdata = {
				headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
			};
		if(method.toLocaleUpperCase() == 'GET'){
			idkey = data[keys(data)[0]]+"/";
		}
		else{
			xdata = {
				data : 'data='+JSON.stringify(data),
			} 
		}
		peticionHttp(
			method,
			registro+idkey+'@!'+$scope.token_usuario+'/',
			xdata,
			response
		);	
	}

	function peticionHttp(method,url,data,response){
		var objSend = {
			method : method.toLocaleUpperCase(),
			url : url
		}
		for(elem in data){
			objSend[elem] = data[elem];
		}
		$http(objSend).then(response)
	}

	

})