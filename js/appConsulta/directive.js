angular.module("appConsulta")
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