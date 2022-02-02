<?php
	//header("Access-Control-Allow-Origin: localhost");
	require 'api/v1/classDataBaseConection.php';
	include_once('configuracion.php');
	$db = new DataBaseConection($host,$host_user,$host_pass,$database);
	die(password_verify('$2y$10$LIExjtjmrl//KT1UwtIaee62vhlSYKe0t1VCYnnIjse8eGcjVxW0m','publico'));
	if(isset($_POST['a'])){
		$admin = $_POST['usuario'];
		$dataUser = $db->query("Select contrasena,nivel from administradores where usuario='$admin'")->getValue();
		//echo json_encode($dataUser);
		if(json_encode($dataUser)=="[]"){
			echo '{"result":"false","errorType":"1","msj":"Error al Iniciar Session, por favor verifique sus credenciales"}';
		}
		else{
			//echo $_POST['contrasena'];
			//echo $dataUser[0]['contrasena'];
			if(password_verify($_POST['contrasena'],$dataUser[0]['contrasena'])){
				if($db->query("select standby from administradores where usuario='$admin'")->getValue()[0]['standby']==1){
					echo '{"result":"false","errorType":"0","msj":"El usuario aun no ha sido habilitado para administrar la aplicacion"}';
				}
				else{
					echo '{"result":"true","nivel":"'.$dataUser[0]['nivel'].'"}';
				}
			}
			else{
				echo '{"result":"false","errorType":"2","msj":"Error al Iniciar Session, por favor verifique sus credenciales"}';
			}
		}
	}
	elseif(isset($_GET['n'])){
		$notif = $db->query("select usuario from administradores where standby='1'")->getValue();
		if(array_key_exists('0',$notif)){
			$nuevos_usuarios = array();
			foreach ($notif as $key => $value) {
				$nuevos_usuarios[] = $value['usuario'];
			}
			echo '{"notificacion":"true","nuevos_usuarios":'.json_encode($nuevos_usuarios).'}';
		}
		else{
			echo '{"notificacion":"false"}';
		}
	}
	elseif(isset($_POST['c'])){
		$usuario = $_POST['c'];
		$contrasena = $db->query("select contrasena from administradores where usuario='$usuario'")->toString();
		echo $contrasena;
		if(password_verify($_POST['contrasena'],$contrasena)){
			$contrasena = password_hash($_POST['nueva_contrasena'],PASSWORD_BCRYPT);
			$db->query("update administradores set contrasena='$contrasena' where usuario='$usuario'");
			echo '{"result":"true","msj":"Cambio de clave exitoso"}';
		}
		else{
			echo '{"result":"false","errorType":"1","msj":"No se cambio la contrasena"}';
		}
	}
?>