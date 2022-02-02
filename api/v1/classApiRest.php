<?php
	require "classDataBaseConection.php";
	class OnlyQuery{
		protected $database = null;
		public function __construct($database){
			$this->database = $database;
		}
		public function get($strquery){
			$type = "";
			for ($i=0; $i < 6; $i++) { 
				$type = $type.$strquery[$i];
			}
			if(($type != "select")&&($type != "SELECT")){
				return null;
			}
			return $this->database->query($strquery)->getValue();
		}
		public function toString(){
			return "holaaa";
		}
	}
	class ApiRest{
		protected $method = "";
		protected $url = "";
		protected $key = "id";
		protected $keyValue = "";
		protected $database = null;
		protected $paths = null;
		protected $funcValidation = null;
		protected $access = true;
		public $query = null;
		public $responseBand = false; 
		public function __construct($request_method,$request_uri,$resource,$id,$key,$database){
			$this->method = $request_method;
			$this->url = $request_uri;
			$this->database = $database;
			$this->query = new OnlyQuery($database);
			$this->paths = explode("/",$this->url);
			/*$paths = $this->paths;
			$this->root = array_shift($paths);
			$this->root = array_shift($paths);*/
			$this->resource = $resource;//array_shift($paths);
			$this->keyValue = $id;//array_shift($paths);
			$this->keyUnique = $key;
		}

		public function condition($value){
			$this->access = $value;
			return $this;
		}

		public function setKey($key){
			$this->key = $key;
		}

		public function validateKey($func){
			$this->keyValue = $func($this->keyValue);	
		}

		public function get($route,$response,$notResponse){
			if(!$this->access){
				$this->access = true;
				return;
			}
			if($this->method == 'GET'){
				if(($route === null)&&(!$this->responseBand)){
					$notResponse();
				}
				else if($route == $this->resource){
					if($this->keyValue==''){
						$cond = "1";
					}
					else{
						$cond = $this->key."='".$this->keyValue."'";
					}
					if($this->keyValue!==null){
						$this->responseBand = true;
						if($cond=="1"){
							$result = $this->database->query("select * from ".$this->resource." where ".$cond)->getValue();
							$response("200 OK HTTP/1.1",$result,$this->query);
						}
						else{
							$result = $this->database->query("select * from ".$this->resource." where ".$cond)->getValue();
							if(array_key_exists('0', $result)){
								$result = $result[0];
							}
							if($this->keyUnique !== null){
								if(array_key_exists($this->keyUnique,$result)){
									$result = $result[$this->keyUnique];
								}
								else if($this->keyUnique!=""){
									$result = "Atributo Inexistente";
								}
							}
							$response("200 OK HTTP/1.1",$result,$this->query);	
						}
					}
					else{
						$this->responseBand = true;
						$response("404 NOT FOUND HTTP/1.1","404",$this->query);
					}
				}
			}
		}

		public function post($route,$required,$data,$response){
			if(!$this->access){
				$this->access = true;
				return;
			}
			if($this->method == 'POST'){
				if($route == $this->resource){
					if($required!=null){
						foreach ($required as $key => $value) {
							if(!array_key_exists($value, $data)){
								$response("404 HTTP/1.1; charset=utf-8","<h1>Acceso Denegado</h1><p>Comuniquese con el proveedor del Servicio de la Api Rest para solicitar su acceso a este recurso.</p><br><p>API REST diseñada por <b>Kavac Digital</b>, buscanos en Instagram como @kavacdigital</p>");
								$this->responseBand = true;
								return;

							}
						}
					}
					if(json_encode($data)[0]=='{'){
						$data = array($data);
					}
					foreach ($data as $i => $element){
						$keys = "";
						$values = "";
						foreach($element as $key => $value) {
							$keys = $keys." ".$key." ";
							$values = $values." '".$value."' ";
						}
						//die("dd");
						$keys = str_replace("  ", ",",$keys);
						$values = str_replace("  ", ",",$values);

						$this->database->query("insert into ".$this->resource."($keys) values($values)");
					}
					$this->responseBand = true;
					$response("202 OK HTTP/1.1",'{"msj":"success"}');
				}

			}
		}

		public function put($route,$required,$data,$response){
			if(!$this->access){
				$this->access = true;
				return;
			}
			if($this->responseBand){
				return;
			}
			if($this->method == 'PUT'){
				if($route == $this->resource){
					foreach ($required as $key => $value) {
						if(!array_key_exists($value, $data)){
							$response("404 HTTP/1.1; charset=utf-8","<h1>Acceso Denegado</h1><p>Comuniquese con el proveedor del Servicio de la Api Rest para solicitar su acceso a este recurso.</p><br><p>API REST diseñada por <b>Kavac Digital</b>, buscanos en Instagram como @kavacdigital</p>");
							$this->responseBand = true;
							return;
						}
					}
					$pair = "";
					foreach($data as $key => $value) {
						$pair = $pair." ".$key."='".$value."' ";
					}
					$pair = str_replace("  ", ",",$pair);
					$cond = $this->key."='".$data[$this->key]."'";
					$this->responseBand = true;
					$response("202 OK HTTP/1.1",$this->database->query("update ".$this->resource." set ".$pair." where $cond")->query("select * from ".$this->resource." where $cond")->getValue());
				}
			}
		}

		public function delete($route,$data,$response){
			if(!$this->access){
				$this->access = true;
				return;
			}
			if($this->method == 'DELETE'){
				if($route == $this->resource){
					foreach($data as $key => $value) {
						$cond = " ".$key."='".$value."' ";
						if(($key == "delete")&&($value == "_ALL_")){
							$cond = "1";
						}
					}		
					$response("202 OK HTTP/1.1",$this->database->query("delete from $route where $cond")->getQuery());
				}
			}
		}

		
	}


?>