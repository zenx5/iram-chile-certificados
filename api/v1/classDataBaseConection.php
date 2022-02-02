<?php
	class DataBaseConection{
		protected $host = "";
		protected $user = "";
		protected $pass = "";
		protected $database = "";
		protected $pin = null;
		protected $arrayStatus = null;
		protected $result = '';
		protected $lastResult = null;
		protected $lastQuery = "";
		public $details = false;
		public function __construct($host,$user,$pass,$database,$force=false){
			$this->host = $host;
			$this->user = $user;
			$this->pass = $pass;
			$this->database = $database;
			if($this->pin = mysqli_connect($host,$user,$pass)){
				$this->arrayStatus = array('status'=>'ready','pin'=>$this->pin);
				if(mysqli_select_db($this->pin,$database)){
					$this->arrayStatus = array('status'=>'connect','pin'=>$this->pin);
					return;
				}
				elseif($force){
					mysqli_query($this->pin,"CREATE DATABASE $database");
					if(mysqli_select_db($this->pin,$database)){
						$this->arrayStatus = array('status'=>'connect','pin'=>$this->pin);
						return;
					}
				}
				return;
			}
			$this->arrayStatus = array('status'=>'no-connect','pin'=>null);
			return;
		}

		public function insertInto($table,$data){
			foreach($data as $index => $registro) {
				$keys = "";
				$values = "";
				foreach ($registro as $key => $value) {
					$keys = $keys." ".$key." ";
					$values = $values." '".$value."' ";
				}
				$keys = str_replace("  ",",",$keys);
				$values = str_replace("  ",",",$values);
				$this->query("insert into $table ($keys) values ($values)");
			}
			return $this;
		}

		public function pin(){
			return $this->pin;
		}

		public function getStatus(){
			return $this->arrayStatus;
		}

		public function toString(){
			return json_encode($this->result);
		}

		public function getValue(){
			return $this->result;
		}

		public function getQuery(){
			return $this->lastQuery;
		}		

		public function query($query){
			$this->lastQuery = $query;
			if($this->lastResult !== null){
				$query = str_replace('_this_', $this->lastResult, $query);
			}

			$reg = mysqli_query($this->pin,$query);
			$typeQuery = array(
				's' => 'select',
				'S' => 'select',
				'u' => 'update',
				'U' => 'update',
				'i' => 'insert',
				'I' => 'insert',
				'd' => 'delete',
				'D' => 'delete',
				'C' => 'create',
				'c' => 'create',
				'a' => 'alter',
				'A' =>	'alter')[$query[0]];
			$result = array();
			$index = 0;
			if($this->details){
				$index = 1;
				$result[0]['type'] = $typeQuery;
				$result[0]['query'] = $query;
				$result[0]['length'] = 0;
			}
			if($typeQuery=='select'){
				if($reg){
					while($table = mysqli_fetch_array($reg)){
						$select = false;
						$result[$index] = array();
						foreach ($table as $key => $value) {
							if($select){
								$result[$index][$key] = $value;
							}
							$select = !$select;
						}
						$index++;
					}		
					if($this->details){
						$result[0]['length'] = $index - 1;
					}
				}
			}
			$this->lastResult = null;
			if($index == 1){
				if(count($result[0])==1){
					$this->lastResult = $result[0][key($result[0])];
					$this->result = $result;
					return $this;
				}
			}
			$this->result = $result;
			return $this;
		}
	}
?>