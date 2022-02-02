angular.module("appConsultaLoad")
.directive("ngDisabled",function(){
	return function(scope,element,attrs){
		attrs.$observe("ngDisabled",function(value){
			value = value.split("&&");
			setInterval(function($,val,e){
				var ngDisabledCond = true;
				for(i in val){
					ngDisabledCond = (ngDisabledCond&&$[val[i]]!=""&&$[val[i]]!=null&&$[val[i]]!=undefined);
				}
				e.disabled = !ngDisabledCond;
			},500,scope,value,element[0])	
		})
		
	}
})
.directive("ngFile",function() {
	return function(scope,element,attrs){
		element[0].addEventListener("change",function(ev){
			var archivo = ev.target.files;
			for(var i = 0; i < archivo.length; i++){
				if(!archivo[i]){
					return;
				}
				if(i==0){
					scope[attrs["ngFile"]+"_name"] = [];
					scope[attrs["ngFile"]+"_ext"] = [];
					scope[attrs["ngFile"]+"_size"] = [];
					scope[attrs["ngFile"]+"_lastModified"] = [];
					scope[attrs["ngFile"]+"_type"] = [];
					scope[attrs["ngFile"]+"_URI"] = []
					scope[attrs["ngFile"]] = [];
				}
				scope[attrs["ngFile"]+"_name"][i] = archivo[i].name;
				scope[attrs["ngFile"]+"_ext"][i] = archivo[i].name.substr(archivo[i].name.indexOf(".")+1).toUpperCase();
				scope[attrs["ngFile"]+"_size"][i] = archivo[i].size;
				scope[attrs["ngFile"]+"_lastModified"][i] = archivo[i].lastModified;
				scope[attrs["ngFile"]+"_type"][i] = archivo[i].type;
				//console.log(archivo);
				var lector = new FileReader();
				lector.onloadend = (function(index,archivo){
						return function(e){
							var contenido = e.target.result;
							if((contenido.indexOf("data:")!=-1)&&(contenido.indexOf(" ")==-1)){
								scope[attrs["ngFile"]+"_URI"][index] = contenido;
								console.log(contenido)
								scope[attrs["ngFile"]+"_load"] = true;
							}
							else{
								scope[attrs["ngFile"]][index] = contenido;
								lector.readAsDataURL(archivo[index]);
							}
							scope.$apply();
						}
				})(i,archivo)
				lector.readAsText(archivo[i]);
			}
		})
		scope[attrs["ngFile"]+"_load"] = false;
	}
})