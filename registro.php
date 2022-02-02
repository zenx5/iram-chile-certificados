<?php
	require 'api/v1/classDataBaseConection.php';

	$db = new DataBaseConection('localhost','root','','appiram');
	
	if(isset($_POST['r'])){
		$usuario = $_POST['usuario'];
		$contrasena = $_POST['contrasena'];
		$existe = $db->query("select usuario from administradores where usuario='$usuario'");
		if(json_encode($existe)=="[]"){
			$contrasena = password_hash($contrasena,PASSWORD_BCRYPT);
			$db->query("insert into administradores(usuario,contrasena,nivel,standby) values('$usuario','$contrasena','0','1')");
			echo '{"used":"false","msj":"Ha sido registrado exitosamente con el nombre de usuario: '.$usuario.' "}';
		}
		else{
			echo '{"used":"true","msj":"El nombre de usuario ya esta en uso"}';	
		}
	}
	elseif(isset($_POST['a'])){
		$usuario = $_POST['usuario'];
		print($_POST['action']);
		if($_POST['action']=='true'){
			print("if");
			$notif = $db->query("update  administradores set standby='0' where usuario='$usuario'");
		}
		else{
			print("delete from administradores where usuario='$usuario'");
			$db->query("delete from administradores where usuario='$usuario'");
		}
	}
?>