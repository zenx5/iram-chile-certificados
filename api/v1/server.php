<?php
	require "classApiRest.php";
	include_once("../../configuracion.php");
	function getToken($url){
		$vector = explode('@!',$url);
		if(count($vector)==2){
			return $vector[1];
		}
		else{
			return null;
		}
	}
	$method = $_SERVER['REQUEST_METHOD'];
	$URL = explode('@!',substr($_SERVER['REQUEST_URI'],1))[0];
	$token = explode('/',getToken($_SERVER['REQUEST_URI']))[0];
	$paths = explode("/",$URL);
	$root = array_shift($paths);
	//echo "root: ".$root."<BR>";
	$version = array_shift($paths);
	//echo "version: ".$version."<BR>";
	$resource = array_shift($paths);
	//echo "resource: ".$resource."<BR>";
	$id = array_shift($paths);
	//echo "id: ".$id."<BR>";
	$key = array_shift($paths);
	//echo "key: ".$key."<BR>";
	if($id===null){
		$id="";
	}
	parse_str(file_get_contents('php://input'),$_REQUEST);

	$data = (isset($_REQUEST['data'])?$_REQUEST['data']:null);

	$data = json_decode($data,true);

	$api = new ApiRest($method,$URL,$resource,$id,$key,new DataBaseConection($host,$host_user,$host_pass,$database));
	
	//echo $URL."<BR>";
	//echo $version."<BR>";
	//echo $resource."<BR>";
	///echo $id."<BR>";
	//die("...");
	if(($token == 'undefined')||($token == 'new')){
		$nivel = $api->query->get("select nivel,token,contrasena from administradores where (usuario='".$data['usuario']."')");
		if(!password_verify($data['contrasena'],$nivel['0']['contrasena'])){
			die("...");
		}
		else{
			$data['contrasena'] = $nivel['0']['contrasena'];
		}
	}
	else{
		$nivel = $api->query->get("select nivel from administradores where token='$token'");
		if(isset($data['contrasena'])){
			$data['contrasena'] = password_hash($data['contrasena'],PASSWORD_BCRYPT);
		}
	}

	if(array_key_exists('0',$nivel)){
		$nivel = $nivel['0']['nivel'];
	}
	else{
		$nivel = '0';
	}
	$api->setKey('rut');
	
	$api->condition($nivel>='1')->get('personas',function($head,$data){
		header($head);
		echo json_encode($data);
	},null);

	$api->condition($nivel>='2')->post('personas',null,$data,function($head,$data){
		header($head);
		echo json_encode($data);
	});

	$api->condition($nivel=='3')->delete('personas',$data,function($head,$data){
		header($head);
		echo json_encode($data);
	});

    $api->setKey('nro_registro');
    
	$api->condition($nivel>='1')->get('personas_certificados',function($head,$data){
		header($head);
		echo json_encode($data);
	},null);

	$api->condition($nivel>='2')->post('personas_certificados',null,$data,function($head,$data){
		header($head);
		echo json_encode($data);
	});

	$api->condition($nivel=='3')->delete('personas_certificados',$data,function($head,$data){
		header($head);
		echo json_encode($data);
	});

	$api->setKey('id');

	$api->condition($nivel>='1')->get('certificados',function($head,$data){
		header($head);
		echo json_encode($data);
	},null);

	$api->condition($nivel>='2')->post('certificados',null,$data,function($head,$data){
		header($head);
		echo json_encode($data);
	});
	
	$api->condition($nivel=='3')->delete('certificados',$data,function($head,$data){
		header($head);
		echo json_encode($data);
	});

	$api->setKey('usuario');
	
	$api->condition($nivel==3)->get('administradores',function($head,$data){
		header($head);
		echo json_encode($data);
	},null);


	if(($token!="new")&&($token!="undefined")){
		$api->condition($nivel==3)->put('administradores',array(),$data,function($head,$data){
			header($head);
			echo json_encode($data);
		});
	}

	if(($method == 'PUT')&&($resource=='administradores')){
		if(isset($data['usuario'])&&(isset($data['contrasena']))&&($token=='new')){
			unset($data['contrasena']);
			$data['token'] = password_hash($keypass,PASSWORD_BCRYPT);
		}
	}

	$api->condition($nivel>0)->put('administradores',array('usuario'),$data,function($head,$data){
		header($head);
		echo ($data[0]['token']);
	});




	$api->condition($nivel=='3')->delete('administradores',$data,function($head,$data){
		header($head);
		echo json_encode($data);
	});


	$api->get(null,null, function(){
		echo "<h4>Ningun Recurso coincide con la peticion</h4>";
	});
?>