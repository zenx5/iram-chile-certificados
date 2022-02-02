<?php
	$target_path_pdf = "certificados/";
	$target_path_img = "img/";
	$target_path_pdf = $target_path_pdf . basename( $_POST['registro'].".pdf"); 
	$target_path_img = $target_path_img . basename( "img_".$_POST['registro'].".png"); 
	if(move_uploaded_file($_FILES['filepdf']['tmp_name'], $target_path_pdf)) {
	    echo "El archivo ".  basename( $_FILES['filepdf']['name']). 
	    " ha sido subido";
	
		if(move_uploaded_file($_FILES['img']['tmp_name'], $target_path_img)){
			echo "El archivo ".  basename( $_FILES['img']['name']). 
		    " ha sido subido";
		}
	}	
	else{
	    echo "Ha ocurrido un error, trate de nuevo!";
	}

?>