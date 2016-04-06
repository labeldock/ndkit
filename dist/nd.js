/* 
 * nd.js (https://github.com/labeldock/ndkit)
 * Copyright HOJUNG-AHN. and other contributors
 * Released under the MIT license
 */
(function(){
	
	var CORE={},N=(function(){return N.API.apply(window,Array.prototype.slice.call(arguments))});
	
	(function(W,NMethods,NSingletons,NModules,nody,CORE){
	
		// Nody version
		// This is pre release version
		N.VERSION = "0.0 alpah pre", N.BUILD = "12";
		
		// Core verison
		N.CORE_VERSION = "3.0", N.CORE_BUILD = "100";
		
		N.PLUGIN = function(proc){ proc(N,CORE); };
  
		// Pollyfill IE Console error fix
		if (typeof W.console !== "object") W.console = {}; 'log info warn error count assert dir clear profile profileEnd'.replace(/\S+/g,function(n){ if(!(n in W.console)) W.console[n] = function(){ if(typeof air === "object") if("trace" in air){ var args = Array.prototype.slice.call(arguments),traces = []; for(var i=0,l=args.length;i<l;i++){ switch(typeof args[i]){ case "string" : case "number": traces.push(args[i]); break; case "boolean": traces.push(args[i]?"true":"false"); break; default: traces.push(N.toString(args[i])); break; } } air.trace( traces.join(", ") ); } } });	
		
		// Bechmark : two times call the MARK('name');
		var MARKO = {}; W.MARK = function(name){ if(typeof name === "string" || typeof name === "number") { name = name+""; if(typeof MARKO[name] === "number") { var time = (+new Date() - MARKO[name]);console.info("MARK::"+name+" => "+time) ; delete MARKO[name]; return time  } else { console.info("MARK START::"+name); MARKO[name] = +new Date(); } } };
		
		// Pollyfill : Trim 
		if(!String.prototype.trim) String.prototype.trim = function() { return this.replace(/(^\s*)|(\s*$)/gi, ""); };
	 
		// Pollyfill : JSON
		if(typeof W.JSON === "undefined"){ W.JSON = { 'parse' : function(s) { var r; try { r = eval('(' + s + ')'); } catch(e) { r = N.asObject(s); } return r; }, 'stringify' : function(o) { return W.N.toString(obj,Number.POSITIVE_INFINITY,true); } };}
		
		// Pollyfill : bind
		if (!Function.prototype.bind) { Function.prototype.bind = function (oThis) { if (typeof this !== "function") { throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable"); } var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {}, fBound = function () { return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments))); }; fNOP.prototype = this.prototype; fBound.prototype = new fNOP(); return fBound; }; }
		
		// IE8 Success fix
		if (typeof W.success === "function"){W.success = "success";}
		
		var IS_MODULE = function(obj,moduleName){
			if(arguments.length == 1){
				if(typeof obj === "object" && ("__NativeHistroy__" in obj)){
					return true;
				}
			} else {
				if(typeof obj === "object" && obj !== null && (typeof moduleName === "string") && ("__NativeHistroy__" in obj)){
					for(var i=obj["__NativeHistroy__"].length-1;i>-1;i--){
						if(obj["__NativeHistroy__"][i] === moduleName) return true;
					}
				}
			}
			return false;
		};
		
		//NativeCore console trace
		N.API = function(name) {
			if(arguments.length === 0){
				return "Nody "+N.VERSION+" ("+N.BUILD+")";
			}
			if(typeof name === "string"){
			    if (NModules[name]) {
			        var result = name + "(" + /\(([^\)]*)\)/.exec(((NModules[name].prototype["set"]) + ""))[1] + ")";
			        var i2 = 0;
			        for (var protoName in NModules[name].prototype)
			            switch (protoName) {
						case "set": case "get": case "__NativeType__": case "__NativeHistroy__": case "__NativeHistroy__": case "constructor": case "__NativeClass__": case "_super": case "__NativeInitializer__": break; default:
			                    if (typeof NModules[name].prototype[protoName] === "function") result += "\n " + i2 + " : " + protoName + "(" + /\(([^\)]*)\)/.exec(((NModules[name].prototype[protoName]) + ""))[1] + ")";
			                    i2++;
			                    break;
			            }
			        return result;
			    }
				if(typeof N[name] === "function") {
					if (N[name]["__NativeMethod__"]) {
						return "NODY_NDPIPE :: " + name + /\(([^\)]*)\)/.exec(N[name]["__NativeMethod__"])[0];
					} else {
						return "NODY_METHOD :: " + name + /\(([^\)]*)\)/.exec(N[name])[0];
					}
				}
			}
			return name + " is not found";
		};
		
		N.ALL     = function(){ var i,key,logText = []; var getterText = "# Native Getter"; for (i=0,l=NMethods.length;i<l;i++) getterText += "\n" + i + " : " + NMethods[i]; logText.push(getterText); var singletonText = "# Native Singleton"; i=0; for (key in NSingletons ) { singletonText += "\n" + i + " : " + key; var protoName,i2=0; switch(key){ case "ADVKIT": case "ELUT": case "NODY": case "FINDKIT": case "NODEKIT": case "ELKIT": var count = 0; for(protoName in NSingletons[key].constructor.prototype) count++; singletonText += "\n [" + count + "]..."; break; default: for(protoName in NSingletons[key].constructor.prototype) singletonText += "\n" + (i2++) + " : " + protoName; break; } i++; } logText.push(singletonText); var moduleText = "# Native Module"; i=0; for (key in NModules ) { moduleText += "\n MODULE(" + i + ") ::" + N.API(key); i++; } logText.push(moduleText); return logText.join("\n"); };
		N.DEBUGER = false;
	
		//NativeCore Start
		var NativeFactoryObject = function(type,name,sm,gm){
			if( !(name in NModules) ){
				var nativeProto,setter,getter,nodyModule;
				//console.log(name,type);
				switch(type){
					case "object":
						nativeProto = {};
						setter      = typeof sm === "function" ? 
									  function(){ sm.apply(this,Array.prototype.slice.call(arguments)); return this; } : 
									  function(v){ this.Source = v; return this; };
						getter      = gm?gm:function(){return this.Source;};
						var nodyObject = function(){ 
							if(typeof this.set === "function"){ 
								for(var protoKey in NModules[name].prototype) {
									//init inital variable
									if(/^\+[^+]+/.test(protoKey)) {
										this[protoKey.substr(1)] = NModules[name].prototype[protoKey];
									}
								}
								//set apppy
								this.set.apply(this,Array.prototype.slice.apply(arguments)); 
							} 
						};
						nodyModule = nodyObject;
						break;
					case "array":
						nativeProto = [];
						setter      = typeof sm === "function" ? 
									  sm : 
									  function(v){ return this.setSource(v); };
						getter      = function(){ return this.toArray.apply(this,arguments); };
						var nodyArray = function(){ 
							if(typeof this.set === "function"){ 
								for(var protoKey in NModules[name].prototype) {
									//init inital variable
									if(/^\+[^+]+/.test(protoKey)) {
										this[protoKey.substr(1)] = NModules[name].prototype[protoKey];
									}
								}
								//set apppy
								this.set.apply(this,Array.prototype.slice.apply(arguments)); 
							} 
						};
						nodyModule = nodyArray;
						break;
					default: throw new Error("NativeFactoryObject :: 옳지않은 타입이 이니셜라이징 되고 있습니다. => " + type);
				}
			
				NModules[name]               = nodyModule;
				NModules[name]["new"]        = (function(module){
					return function(){ return new (Function.prototype.bind.apply(module,[module].concat(Array.prototype.slice.call(arguments)))); };
				}(NModules[name]));
				NModules[name].prototype     = nativeProto;
				//native concept
				NModules[name].prototype.__NativeType__        = type;
				NModules[name].prototype.__NativeHistroy__     = [name];
				NModules[name].prototype.constructor = nodyModule;
				NModules[name].prototype.__NativeModule__       = function(n){ 
					return (arguments.length === 0) ? 
					this.__NativeHistroy__[this.__NativeHistroy__.length - 1] :
					this.__NativeHistroy__[this.__NativeHistroy__.length - 1] == n 
				};
				//
				NModules[name].prototype.set = setter;
				NModules[name].prototype.get = getter;
				NModules[name].prototype._super = function(a){
					//scope start
					var currentScopeDepth,
						currentScopeModuleName,
						currentScopePrototype,
						currentMethodName,
						currentCallMethod=arguments.callee.caller,
						superScope = 0;
					for(scopeMax=this.__NativeHistroy__.length;superScope<scopeMax;superScope++){
						currentScopeDepth      = (this.__NativeHistroy__.length - 1) - superScope ;
						currentScopeModuleName = this.__NativeHistroy__[currentScopeDepth];
						currentScopePrototype  = NModules[currentScopeModuleName].prototype.constructor.prototype;
						currentMethodName;
						for(var key in currentScopePrototype){
							if(key !== "_super" && currentScopePrototype[key] == currentCallMethod){
								currentMethodName = key;
								break;
							}
						}
						if(typeof currentMethodName !== "undefined"){ break; }
					}
					if(typeof currentMethodName === "undefined"){
						console.error("NodyNativeCore::_super::해당 함수에 그러한 프로토타입이 존재하지 않습니다.",currentCallMethod);
						return undefined;
					}
					//next scope
					var i=0,result=undefined;
					for(var i=0,l=currentScopeDepth;i<l;i++){
						var nextScopeDepth       = this.__NativeHistroy__.length - superScope - 2;
						var nextScopeName        = this.constructor.prototype.__NativeHistroy__[nextScopeDepth];
						var nextScopeConstructor = NModules[nextScopeName];
						var nextScopePrototype   = nextScopeConstructor.prototype;
						var nextSuperMethod      = nextScopeConstructor.prototype[currentMethodName];
						superScope++;
						if(typeof nextSuperMethod === "function"){
							if(currentCallMethod !== nextSuperMethod){
								result = nextSuperMethod.apply(this,Array.prototype.slice.call(arguments));
								break;
							}
						} else {
							break;
						}
					}
					return result;
				};
				return true;
			} else {
				console.error("NodyNativeCore :: already exsist module =>",name);
				return false;
			}
		};
		var NativeFactoryExtend = function(name,methods,setflag,getflag){
			if( (typeof methods === "object") && (name in NModules)){
				var protoObject = NModules[name].prototype;
				if(typeof setflag === "function"){ methods.set = setflag; setflag = true; }
				if(typeof getflag === "function"){ methods.get = getflag; getflag = true; }
				for(var key in methods){ switch(key){
					case "constructor":case "_super":
						break;
					case "__NativeHistroy__":
						protoObject[key] = Array.prototype.slice.call(methods[key]);
						break;
					case "set": if(setflag == true) protoObject[key] = methods[key]; break;
					case "get": if(getflag == true) protoObject[key] = methods[key]; break;
					default   :
						if(/^\+\+[^\+]+/.test(key)){
							(function(module,moduleMethodName,moduleMethod){
								if(moduleMethodName) {
									if(typeof moduleMethod === "function") {
										module[moduleMethodName] = function(){
											return moduleMethod.apply(module,Array.prototype.slice.call(arguments));
										};
									} else {
										module[moduleMethodName] = moduleMethod;
									}
								}
							}(NModules[name],key.substr(2),methods[key]));
						}
						protoObject[key] = methods[key];
						break;
				} }
				return true;
			} else {
				//no exsist prototype object
				return false;
			}
		};
		var NativeFactoryDeploy = function(name){
			if(name in NModules) {
				(function(module){
					nody[name] = module;
					module.prototype.__NativeInitializer__ = module.new;
				}(NModules[name]));
			}
		};
		N.MODULE = function(name,proto,setter,getter){
			if(NativeFactoryObject("object",name)){
				if(typeof proto === "function") getter = setter, setter = proto, proto = {};
				NativeFactoryExtend(name,proto,setter,getter)
				NativeFactoryDeploy(name);
			}
		};
		N.MODULE_PROPERTY = function(name,propName,propValue){
			NModules[name][propName] = propValue;
			return NModules[name];
		};
		N.ARRAY_MODULE = function(name,proto,setter,getter){
			if(NativeFactoryObject("array",name)){
				NativeFactoryExtend(name,proto,setter,getter);
				NativeFactoryDeploy(name);
			}
		};
		N.EXTEND_MODULE = function(parentName,name,methods,setter,getter){
			if(typeof methods == "function") getter = setter, setter = methods, methods = {};
			var parentConstructor = NModules[parentName];
			if(typeof parentConstructor === "undefined") throw new Error("확장할 behavior ("+parentName+")가 없습니다"+N.toString(NModules));
		
			//새 오브젝트 만들기
			if(NativeFactoryObject(parentConstructor.prototype.__NativeType__,name)){
				var extendConstructor = NModules[name];
				NativeFactoryExtend(name,parentConstructor.prototype,true,true);
				NativeFactoryExtend(name,methods,setter,getter);
				extendConstructor.prototype["__NativeHistroy__"].push(name);
				// 비헤이비어 만들기
				NativeFactoryDeploy(name);
			}
		};
		
		//Getter:Core
		var METHOD_BIND_FUNCTION = function(method,key,procedures,bclass){
			bclass.prototype[key] = function(){
				procedures[key].apply(this,Array.prototype.slice.call(arguments));
				return this;
			};			
			method[key] = function(){
				var bindInstance = new bclass();
				bindInstance[key].apply(bindInstance,Array.prototype.slice.call(arguments));
				return  bindInstance;
			};
		};
		
		N.METHOD = function(n,m,bind){ 
			N[n]=m;
			NMethods.push(n);
			
			if(typeof bind === 'object'){
				
				var bindClass = function(){
					var _=this; 
					this.__NODY_METHOD_NEW__ = true; 
					this.call = function(){ return m.apply(_,Array.prototype.slice.call(arguments));};
				};
				
				for(var key in bind){ METHOD_BIND_FUNCTION(m,key,bind,bindClass); };
			}
			
			return m;
		};
		
		//Kit:Core
		N.SINGLETON = function(n,m,i){
			var o=i?i:function(){};
			
			o.prototype=m;
			o.prototype.constructor=o;
			o.prototype.EACH_TO_METHOD_WITH_PREFIX=function(){
				for(var k in o.prototype){
					switch(k){
						case "EACH_TO_METHOD":case "EACH_TO_METHOD_WITH_PREFIX":case "constructor":break;
						default: N.METHOD(n+k,o.prototype[k]); break;
					}
				}
			};
			o.prototype.EACH_TO_METHOD=function(){
				for(var k in o.prototype){
					switch(k){
						case "EACH_TO_METHOD":case "EACH_TO_METHOD_WITH_PREFIX":case "constructor":break;
						default: N.METHOD(k,o.prototype[k]); break;
					}
				}
			};
			N[n]=new o();
			NSingletons[n]=N[n];
		};
		
		var CORE = {};
		
		N.CORE = CORE;
		
		CORE.NDCLASS = function(func,proto){
			if(proto) func.prototype = proto;
			func.constructor = func;
			return func;
		};
		
		CORE.KNOWN = {
			TIMESCALE:[
				{key:"year",scale:31536000000},
				{key:"month",scale:2678400000},
				{key:"day",scale:86400000},
				{key:"hour",scale:3600000},
				{key:"minute",scale:60000},
				{key:"second",scale:1000},
				{key:"ms",scale:1}
			]
		};
		
		CORE.TYPEOF  = {
			VENDER:function(o){ return (typeof o === "object" && o !== null ) ? ("jquery" in o) ? true : false : false; },
			LIKEARRAY:function(a){ return (typeof a === "object" && a !== null ) ? (((a instanceof Array || a instanceof NodeList || a instanceof HTMLCollection || CORE.TYPEOF.VENDER(a) || ( !isNaN(a.length) && isNaN(a.nodeType))) && !(a instanceof Window) ) ? true : false) : false; },
			ARRAY:function(a){ return a instanceof Array; },
			NODE:function(a){ if(a == null) return false; if(typeof a === "object") if(typeof a.nodeType == "number") return true; return false; },
			ELEMENT:function(a){ if(a == null) return false; if(typeof a === "object") if(a.nodeType == 1) return true; return false; },
		};
		
		CORE.NEW_ARRAY = function(v) { 
			if( CORE.TYPEOF.LIKEARRAY(v) ) { 
				if("toArray" in v){ 
					return Array.prototype.slice.apply(v.toArray()); 
				} else {
					var mvArray = [];
					for(var i=0,l=v.length;i<l;i++) mvArray.push(v[i]); 
					return mvArray;
				} 
			}
			
			if(v||v==0) return [v];
			return [];
		}
		
		CORE.AS_ARRAY = function(v){
			return CORE.TYPEOF.ARRAY(v) ? v : CORE.NEW_ARRAY(v);
		};
		
		CORE.AS_OBJECT = function(param,es,kv){
				if(typeof param==="object"){
					//null filter
					return param ? param : {};
				} 
				if(kv == true && ( typeof param === "string" || typeof es === "string")){ var r = {}; r[es] = param; return r; }
				if(typeof param==="string" || typeof param==="boolean") {
					var c = CORE.TRY_CATCH(function(){
						//native JSON call
						if(JSON == aJSON) throw new Error("not json supported browser");
						var jp = JSON.parse(param);
						if(typeof jp !== "object") throw new Error("pass");
					},function(e){
					
						if( (new N.StringSource(param)).isDataContent()=="plain" ){
							var esv = (typeof es === "string" ? es : "value");
							var reo={};reo[esv]=param;
							return reo;
						}
					
						return (new N.StringSource(param)).getContentObject();
					});
				}
				return c || {};
		};
		
		CORE.RECALL = function(f){
			if(typeof f === "function") return f.apply(this,Array.prototype.slice.call(arguments,1));
			return f;
		};
		
		CORE.CLONE = function(target,d){
			if(d == true) {
				if(CORE.TYPEOF.LIKEARRAY(target)) {
					if(!CORE.TYPEOF.LIKEARRAY(d)) { d = [] };
					for (var i=0,l=target.length;i<l;i++) d.push( ((typeof target[i] === "object" && target[i] !== null ) ? CORE.CLONE(target[i]) : target[i]) )
					return d;
				} else {
					if(d == true) { d = {} };
			        for (var p in target) (typeof target[p] === "object" && target[p] !== null && d[p]) ? CORE.CLONE(target[p],d[p]) : d[p] = target[p];
					return d;
				}
			
			}
			switch(typeof target){
				case "undefined": case "function": case "boolean": case "number": case "string": return target; break;
				case "object":
					if(target === null) return target;
					if(target instanceof Date){
						var r=new Date();r.setTime(target.getTime());return r;
					}
					if(CORE.TYPEOF.LIKEARRAY(target)){
						var r=[]; for(var i=0,length=target.length;i<length;i++)r.push(target[i]); return r;
					} 
					if(CORE.TYPEOF.ELEMENT(target) == true){
						return target;
					}
					var r={};
					for(var k in target){
						if(target.hasOwnProperty(k))r[k]=target[k];
					}
					return r;
				break;
				default : console.error("CORE.CLONE::copy failed : target => ",target); return target; break;
			}
		};
		
		CORE.NUMBER = {
			NUMBERS:function(value){
				//[int value, float value, float length, originNumber]
				var numberInfo  = [0,"0",0,!isNaN(parseFloat(value))];
		        var parseString = "";
		        (value+"").replace(/\d|\./g,function(s){ parseString += s; });
		        if(/\d/.test(parseString)){
		            var dotIndex = parseString.indexOf(".");
		            switch(dotIndex) {
		                case -1:
		                    numberInfo[0] = parseString*1;
		                    break;
		                case 0:
		                    parseString = "0" + parseString;
		                default:
		                    var intValue = /[\d]+\./.exec(parseString)[0];
		                    numberInfo[0] = intValue.substr(0,intValue.length - 1) * 1;

		                    numberInfo[1] = /\.[\d]+/.exec(parseString);
							if(numberInfo[1] === null){
								numberInfo[1] = "0";
								numberInfo[2] = 0;
							} else {
								numberInfo[1] = numberInfo[1][0].substr(1);
								numberInfo[2] = numberInfo[1].length;
							}
		                    break;
		            }
		        }
		        return numberInfo;
			},
			INT:function(v){
				return CORE.NUMBER.NUMBERS(v)[0];
			},
			FLOAT:function(v){
				var n=CORE.NUMBER.NUMBERS(v);
				return n[0]+parseFloat("0."+n[1]);
			}
		};
		
		CORE.ENUM = {
			EACH:function(d,f){
				var d=CORE.AS_ARRAY(d);
				for(var i=0,l=d.length;i<l;i++) if( f(d[i],i) == false ) break;
				return d;
			},
			MAP:function(d,f){
				var d=CORE.AS_ARRAY(d);
				for(var i=0,l=d.length;i<l;i++) d[i]=f(d[i],i);
				return d;
			},
			INJECT:function(d,f){
				var d=CORE.NEW_ARRAY(d);
				for(var i=0,l=d.length;i<l;i++) d[i]=f(d[i],i);
				return d;
			},
			REDUCE:function(d,f){
				var d=CORE.NEW_ARRAY(d);
				for(var i=0,l=d.length;i<l;i++) d=f(d,d[i],i);
				return d;
			},
			FOREACH:function(d,f){
				for(var k in d) if( f(d[k],k) == false ) break;
				return d;
			},
			FORMAP:function(d,f){
				for(var k in d) d[k] = f(d[k],k);
				return d;
			}
		};
		
		CORE.INDEX = {
			LIMIT:function(i,m,s){
				if(typeof m !== "number") return i;
				if(typeof s !== "number") s = 0;
				if(i > m) return m;
				if(i < s) return s;
				return i;
			},
			PAGE:function(i,p){ return Math.floor(i/p); },
			REVERSE:function(i,p){ return (p-1) - i },
			TURN:function(i,p){ if(i < 0) { var abs = Math.abs(i); i = p-(abs>p?abs%p:abs); }; return (p > i)?i:i%p; },
			BOUNCE:function(i,p){ i = N.toNumber(i); p = N.toNumber(p); return (i == 0 || (Math.floor(i/p)%2 == 0))?i%p:p-(i%maxIndex); }
		};
		
		
		//vector based range
		CORE.NDZONE = CORE.NDCLASS(function(source,step){
			if(source instanceof CORE.NDZONE){
				this.$type  = source.$type;
				this.$stuff = source.$stuff;
				this.$step  = source.$step;
				return;
			}
			
			this.$step     = N.parseFloat(step) || 1;
			
			if(CORE.TYPEOF.ARRAY(source)){
				if(step == false){
					this.$type  = "arrange";
					this.$stuff = CORE.CLONE(source);
				} else {
					source = source[0] + "-" + source[source.length-1];
				}	
			}
						
			var source = (source+"").trim(),range = /^([\-\+\.0-9]+)(\~|\-)([\-\+\.0-9]+)$/.exec(source);
			
			if(range){
				this.$type  = "range";
				this.$stuff = Array.prototype.slice.call(range,1);
				for(var i=0,l=this.$stuff.length;i<l;i++) this.$stuff[i] = this.$stuff[i];
				//if(this.$stuff[0] > this.$stuff[2]) this.$stuff = this.$stuff.reverse();
				return;
			}
			
			if(source.indexOf("||") > -1){
				this.$type  = "arrange";
				this.$stuff = source.split("||");
				return;
			}
			
			if(source.indexOf(",") > -1){
				this.$type  = "arrange";
				this.$stuff = source.split(",");
				return;
			}
			
			this.$type  = "arrange";
			this.$stuff = [source];
		},{
			clone:function(){
				return new CORE.NDZONE(this);
			},
			range:function(requireNumber){
				if(this.$cache) return this.$cache;
				switch(this.$type){
					case "range":
						return this.$cache = nd.range(N.parseFloat(this.$stuff[2]),N.parseFloat(this.$stuff[0]),this.$step,true);
					case "arrange":
						return this.$cache = (requireNumber==true ?  N.map(this.$stuff[0].split(this.$stuff[1]),function(n){return N.parseFloat(n)}) : this.$stuff[0].split(this.$stuff[1]));
				}
			},
			attract:function(){
				return N.attract(this.range());
			},
			around:function(v){
				var range = this.range();
				
				if(range[0] > v || range.length === 1) { return range[0]; }
				if(range[range.length-1] < v) { return range[range.length-1]; }
				
				var s,si;
				
				for(var i=0,l=range.length;i<l;i++){
					if(range[i] > v) break;
					s=range[i],si=i;
				}
				
				if(!s) return range[range.length-1];
				var sa = range[si+1];
				return typeof sa == "undefined" ? s : (v - s) < (sa - v) ? s : sa;
			},
			length:function(){
				if(this.$type==="range"){
					// TODO:not full tested
					return Math.floor((N.parseFloat(this.$stuff[2]) - (N.parseFloat(this.$stuff[0]) - this.$step)) / this.$step);
				} else {
					return this.range().length;
				}
			},
			size:function(){
				if(this.$type==="range"){
					return N.parseFloat(this.$stuff[2]) - N.parseFloat(this.$stuff[0]);
				} else {
					return this.range().length;
				}
			},
			step:function(){
				return this.$step;
			},
			maximum:function(v){
				//set
				if(this.$type==="range") {
					if(typeof v==="number"){
						delete this.$cache;
						return this.$stuff[2] = v, this;
					} else {
						var max = N.parseFloat(this.$stuff[2]);
						return max;
					}
				}
				return N.last(this.range(typeof v==="boolean"?v:true));
			},
			minimum:function(v){
				//set
				if(this.$type==="range"){
					if(typeof v==="number"){
						delete this.$cache;
						return this.$stuff[0] = v, this;
					} else {
						return N.parseFloat(this.$stuff[0]);
					}
				}
				return N.first(this.range(typeof v==="boolean"?v:true));
			},
			valueAt:function(i,iproc){
				var i=(iproc || CORE.INDEX.LIMIT)(i,this.length());
				
				switch(this.$type){
					case "range":
						return this.minimum() + (this.$step * i);
					case "arrange":
						return this.range()[i];
				}
			},
			vectorByValue:function(v){
				return (v - this.minimum()) / this.size();
			},
			valueByVector:function(v){
				return this.minimum() + this.size() * v;
			},
			isInner:function(z){
				if(!(z instanceof CORE.NDZONE)) z = new CORE.NDZONE(z);
				return this.maximum() <= z.maximum() && this.minimum() >= z.minimum();
			},
			isOuter:function(z){
				if(!(z instanceof CORE.NDZONE)) z = new CORE.NDZONE(z);
				return (this.minimum() >= z.maximum()) || (this.maximum() <= z.minimum());
			},
			isBefore:function(z){
				if(!(z instanceof CORE.NDZONE)) z = new CORE.NDZONE(z);
				return this.minimum() < z.maximum();
			},
			isAfter:function(z){
				if(!(z instanceof CORE.NDZONE)) z = new CORE.NDZONE(z);
				return this.maximum() < z.minimum();
			},
			isConfilct:function(z){
				return !this.isOuter(z);
			}
		});
		
		CORE.NDCURSOR = CORE.NDCLASS(function(v,getter){
			//[num...]
			this.$cursor=[];
			this.$ranges=[];
			this.setCursor(v);
			this.$getter = getter;
		},{
			setCursor:function(v){
				for(var i=0,d=CORE.AS_ARRAY(v),l=d.length;i<l;i++){ 
					if(typeof d[i] === "undefined"){
						continue;
					} else if(d[i] instanceof CORE.NDZONE ){
						this.$ranges[i] = d[i];
						this.$cursor[i] = 0;
					} else {
						this.$ranges[i] = undefined;
						this.$cursor[i] = CORE.NUMBER.FLOAT(d[i]); 
					}					
				}
			},
			getCursor:function(v){
				return this.$cursor;
			},
			getValue:function(){
				var $ranges=this.$ranges,$getter=this.$getter;
				
				return CORE.ENUM.MAP(CORE.CLONE(this.$cursor),function(v,i){
					var val = $ranges[i] ? $ranges[i].valueAt(v,CORE.INDEX.TURN) : v;
					return (typeof $getter === "function") ? $getter(val,i) : val;
				});
			},
			getRotate:function(){
				var ranges = this.$ranges;
				return CORE.ENUM.INJECT(this.$cursor,function(v,i){
					var range = ranges[i];
					if(range) {
						return Math.floor(v * range.step() / range.size()) - 1;
					} else {
						return undefined;
					}
				},[]);
			},
			forward:function(t){
				var ranges=this.$ranges,befRotate=this.getRotate(),t=(t||1);
				
				for(var i=0,d=this.$cursor,l=d.length;i<l;i++){
					d[i] = d[i] + (this.$ranges[i] ? this.$ranges[i].step() * t : t);
				}
				
				return this;
			},
			reverse:function(t){
				var ranges=this.$ranges,befRotate=this.getRotate(),t=(t||1);
				
				for(var i=0,d=this.$cursor,l=d.length;i<l;i++){
					d[i] = d[i] - (this.$ranges[i] ? this.$ranges[i].step() * t : t);
				}
				
				return this;
			},
			getGears:function(){
				return this.$gears;
			}
		});
		
		CORE.NDDOMAIN = CORE.NDCLASS(function(domain,exchange){
			this.$cursors = [];
			this.setDomain(domain);
			this.setExchange(exchange);
		},{
			setDomain:function(r){ this.$domain = new CORE.NDZONE(r); },
			setExchange:function(r){ this.$exchange = new CORE.NDZONE(r); },
			getDomain:function(){ return this.$domain; },
			getExchange:function(){ return this.$exchange; },
			scale:function(){ return this.$exchange.size() / this.$domain.size(); },
			newCursor:function(pos){
				var $this = this;
				
				var newCursor = new CORE.NDCURSOR(pos,function(value,i){
					var vector = $this.$domain.vectorByValue(value);
					var result = $this.$exchange.valueByVector(vector);
					return result;
				});
				
				this.$cursors.push(newCursor);
				return newCursor;
			}
		});
		
		// (pipeline base function call)
		// var a = CORE.PIPE(function(a){ return a; });
		// var b = function(a,b){ return a+b; };
		// a(1,b,2); => 3
		CORE.PIPE = function(func,over,owner){ 
			var f = function(){ 
				if(arguments.length >= f.__NativeMethodOver__){ 
					for(var i=f.__NativeMethodOver__,l=arguments.length;i<l;i++){ 
						if(typeof arguments[i] === "function"){ 
							return arguments[i].apply(owner,[func.apply(owner,Array.prototype.slice.call(arguments,0,i))].concat(Array.prototype.slice.call(arguments,i+1,l)) ); 
						} 
					} 
				} 
				return f.__NativeMethod__.apply(owner,Array.prototype.slice.call(arguments)); 
			}; 
			return f.__NativeMethod__=func,
			f.ACLINK =function(argu){
				var args = CORE.NEW_ARRAY(argu);
				if(args[0]) args[0] = CORE.CLONE(args[0]);
				return f.apply(undefined,args);
			},
			f.BOOST=func,
			f.__NativeMethodOver__=(over || 1),f;
		};

		//trycatch high perfomance
		CORE.TRY_CATCH = function(t,c,s){try{return t.call(s);}catch(e){if(typeof c === 'function') return c.call(s,e);}};
		
		var UNIQUE_RANDOM_KEYS = [];
		
		N.SINGLETON("RANDKIT",{
			//random
			base64Token  : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
			base64Random : function(length,codeAt,codeLength){
				length     = (isNaN(length)) ? 1 : parseInt(length);
				codeAt     = (isNaN(codeAt)) ? 0 : parseInt(codeAt);
				codeLength = (isNaN(codeLength)) ? 64 - codeAt : parseInt(codeLength);
				var result = "";
				for(var i=0,l=length;i<l;i++) result = result + this.base64Token.charAt( codeAt + parseInt(Math.random() * codeLength) );
				return result;
			},
			base64UniqueRandom:function(length,prefixKey,codeAt,codeLength){
				var randomKey;
				var process = 0;
				prefixKey = (typeof prefixKey === 'string') ? prefixKey : '';
				do {
					var needContinue = false;
					randomKey        = prefixKey + this.base64Random(length,codeAt,codeLength);
					N.each(UNIQUE_RANDOM_KEYS,function(recentKey){
						if(recentKey == randomKey) needContinue = true;
						return false;
					});
				
					process++;
				
					if(process > 100) {
						console.log("base64UniqueRandom 1000회 이상 랜덤을 생성하였지만 unique 값을 구할수 없었습니다");
						needContinue = false;
						randomKey    = undefined;
					}
				} while(needContinue);
			
				if(randomKey) UNIQUE_RANDOM_KEYS.push(randomKey);
			
				return randomKey;
			},
			base62Random:function(length) { return this.base64Random(length,0,62); },
			base62UniqueRandom:function(length,prefix) { return this.base64UniqueRandom(length || 6,prefix,0,62); },
			random:function(length) { return parseInt(this.base64Random(length,52,10)); },
			numberRandom:function(length) { return this.base64Random(length,52,10); },
			base36Random:function(length) { return this.base64Random(length,26,36); },
			base36UniqueRandom:function(length,prefix) { return this.base64UniqueRandom(length || 6,prefix,26,36); },
			base26Random:function(length) { return this.base64Random(length,0,52); },
			base26UniqueRandom:function(length,prefix) { return this.base64UniqueRandom(length || 6,prefix,0,52); },
			//확률적으로 flag가 나옵니다. 0~1 true 가 나올 확률
			"versus":function(probabilityOfTrue){
				if(typeof probabilityOfTrue !== 'number') probabilityOfTrue = 0.5;
				return !!probabilityOfTrue && Math.random() <= probabilityOfTrue;
			},
			//무작위로 뽑아낸다 //2: 길이만큼
			"attract":function(v,length){
				v = CORE.NEW_ARRAY(v);
				if(typeof length === "undefined") return v[Math.floor(Math.random() * v.length)];
				if(length > v.length) length = v.length;
				var r = [];
				for(var i=0,l=length;i<l;i++){
					var vi = Math.floor(Math.random() * v.length);
					r.push(v[vi]);
					v.splice(vi,1);
				}
				return r;
			},
			//데이터를 섞는다
			"shuffle":CORE.PIPE(function(v){
				//+ Jonas Raoni Soares Silva
				//@ http://jsfromhell.com/array/shuffle [rev. #1]
				v = CORE.NEW_ARRAY(v);
			    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
			    return v;
			},1)
		});
		N.RANDKIT.EACH_TO_METHOD();
		
		//
		// ndkit : cache
		//
		var nody_cache;
		N.cache = {
			has:function(sender,name){
				if( !(sender in nody_cache) ) return false;
				if( !(name in nody_cache[sender]) ) return false;
				return true;
			},
			set:function(s,n,v){ if( !(s in nody_cache) ) nody_cache[s] = {}; nody_cache[s][n] = v; },
			get:function(s,n)  { if( N.cache.has(s,n) ) return nody_cache[s][n]; },
			clear:function()     { nody_cache = {"N.selectorInfo":{"":{}},"AreaContent":{}}; },
			trace:function()     { return JSON.stringify(nody_cache); }
		}
		N.cache.clear();
		
		//
		// ndkit : type
		//
		var nody_typemap = { "string" : "isString", "number" : "isNumber", "likenumber": "likeNumber", "likestring" : "likeString", "array" : "isArray", "object" : "isObject", "email" : "isEmail", "ascii" : "isAscii", "true" : "isTrue", "false" : "isFalse", "nothing" : "isNothing", "ok" : "isOk" };
	
		N.SINGLETON("TYPE",{
			// // 데이터 타입 검사
			"isUndefined": function (t) {return typeof t === "undefined" ? true : false ;},
			"isDefined"  : function (t) {return typeof t !== "undefined" ? true : false ;},
			"isNull"     : function (t) {return t === null ? true : false;},
			"isNil"      : function (t) {return ((t === null) || (typeof t === "undefined")) ? true : false;},
			"isFunction" : function (t) {return typeof t === "function" ? true : false;},
			"isBoolean"  : function (t) {return typeof t === "boolean"  ? true : false;},
			"isObject"   : function (t) {return typeof t === "object"   ? true : false;},
			"isString"   : function (t) {return typeof t === "string"   ? true : false;},
			"isNumber"   : function (t) {return typeof t === "number"   ? true : false;},
			"likeNumber" : function (t) {return (typeof t === "number") ? true : ((typeof t === "string") ? (parseFloat(t)+"") == (t+"") : false );},
		
			"isJquery"   : CORE.TYPEOF.VENDER,
			"isArray"    : CORE.TYPEOF.LIKEARRAY,
			"isArguments": function(a){ return (typeof a === "object" && a !== null) ? ("callee" in a) ? true : false : false; },
			"isEmail"    : function(t){ return N.likeString(t) ? /^[\w]+\@[\w]+\.[\.\w]+/.test(t) : false;},
			"isAscii"    : function(t){ return N.likeString(t) ? /^[\x00-\x7F]*$/.test(t)         : false;},
			"isTrue"     : function(t){ return !!t ? true : false;},
			"isFalse"    : function(t){ return  !t ? false : true;},
		
			//문자나 숫자이면 참
			"likeString" :function(v){ return (typeof v === "string" || typeof v === "number") ? true : false; },
		
			// // 엘리먼트 유형 검사
			"isWindow"  :function(a){ if(typeof a === "object") return "navigator" in a; return false; },
			"isDocument":function(a){ return typeof a === "object" ? a.nodeType == 9 ? true : false : false; },
			"isElement" : CORE.TYPEOF.ELEMENT,
			"isNode"    : CORE.TYPEOF.NODE,
			"hasNode" :function(a){ if( CORE.TYPEOF.LIKEARRAY(a) ){ for(var i=0,l=a.length;i<l;i++) if(CORE.TYPEOF.ELEMENT(a[i])) return true; return false; } else { return CORE.TYPEOF.ELEMENT(a); } },
			"isTextNode":function(a){ if(a == null) return false; if(typeof a === "object") if(a.nodeType == 3 || a.nodeType == 8) return true; return false;},
			// // 값 유형 검사
			// 0, "  ", {}, [] 등등 value가 없는 값을 검사합니다.
			"isNothing":function(o){ 
		        if (typeof o === "undefined")return true;
				if (typeof o === "string")return o.trim().length < 1 ? true : false;
				if (typeof o === "object"){
					if(o instanceof RegExp) return false;
					if(CORE.TYPEOF.ELEMENT(o)) return false;
					if(o == null ) return true;
					if(CORE.TYPEOF.LIKEARRAY(o)) {
						o = o.length;
					} else {
			            var count = 0; for (var prop in o) { count = 1; break; } o = count;
					}
				}
		        if (typeof o === "number")return o < 1 ? true : false;
		        if (typeof o === "function")return false;
				if (typeof o === "boolean")return !this.Source;
				console.warn("N.isNothing::이 타입에 대해 알아내지 못했습니다. nothing으로 간주합니다.",o);
		        return true;
			},
			"isOk":function(o){ return !N.isNothing(o); },
			// 무엇이든 길이 유형 검사
			"toLength":function(v,d){
				switch(typeof v){ 
					case "number":return (v+"").length;break;
					case "string":return v.length;
					case "object":if("length" in v)
					return v.length;
				}
				return (typeof d=="undefined")?0:d;
			},
			// 무엇이든 크기 유형 검사 (is에서 사용되기 위한 문법)
			"toSize":function(target,type){
				if((typeof type != "undefined") && (typeof type != "string")) console.error("N.toSize::type은 반드시 string으로 보내주세요",type);
				switch(type){
					case "likenumber": return parseFloat(target); break;
					case "number"  : return parseFloat(target); break;
					case "likestring": case "text" : case "email" : case "ascii" : return (target + "").length; break;
					case "string"  : case "array" : return target.length;
					case "object"  : default : return N.toLength(target); break;
				}
			},
			"is":function(target,test,trueBlock,falseBlock){
			
				if(N.isNothing(test)) return N.isTrue(target);
			
				var testResult;
			
				switch(typeof test){
					case "string":
						var model = [];
						test.trim().replace(/\S+/g,function(s){ model.push(s); });
				
						for (var i=0,l=model.length;i<l;i++) {
							if(/^(\!|)(\w*)([\>\<\=\:]{0,3})([\S]*)/.test(model[i])) {
								var param = /^(\!|)(\w*)([\>\<\=\:]{0,3})([\S]*)/.exec(model[i]);
							} else {
								console.warn("포멧이 올바르지 않은 키워드 입니다.",model[i]);
							}
					
							var typeMapName = nody_typemap[param[2]];
							if( nody_typemap[param[2]] ) {
								//type 확인
								testResult = N.TYPE[typeMapName](target);
								if(param[1] == "!") testResult = !testResult;
								if(!testResult) break;
								//길이 확인
								if(param[3] != "" && param[4] != ""){
									if( N.likeNumber(param[4]) ) {
										switch(param[3]){
											case ">": testResult = N.toSize(target,param[2]) > parseFloat(param[4]); break;
											case "<": testResult = N.toSize(target,param[2]) < parseFloat(param[4]); break;
											case "<=": case "=<": case "<==": case "==<": testResult = N.toSize(target,param[2]) <= parseFloat(param[4]); break;
											case ">=": case "=>": case ">==": case "==>": testResult = N.toSize(target,param[2]) >= parseFloat(param[4]); break;
											case "==" : case "===": testResult = N.toSize(target,param[2]) == parseFloat(param[4]); break;
											case "!=" : case "!==": testResult = N.toSize(target,param[2]) != parseFloat(param[4]); break;
										}
									} else if(param[3] === ":" && /\d+\~\d+/.test(param[4])) {
										var rangeNumbers = /(\d+)\~(\d+)/.exec(param[4]);
										if(rangeNumbers[1] == rangeNumbers[2]){
											testResult = ( N.toSize(target,param[2]) == parseFloat(param[4]) );
										} else {
											var lv=(rangeNumbers[1]*1),rv=(rangeNumbers[2]*1),cv=N.toSize(target,param[2]);
											if( lv > rv ) {
												testResult = ( (cv <= lv) && (cv >= rv) );
											} else {
												testResult = ( (cv <= rv) && (cv >= lv) );
											}
										}
									}
									if(!testResult) break;
								}
							} else {
								console.warn("Nody::IS::인식할수 없는 타입의 키워드 입니다. => ",param[2]+"("+typeof param[2]+")");
							}	
						}
						break;
					case "object":
						if((test instanceof RegExp) && N.likeString(target)){
							testResult = test.test(target+"");
						} else {
							testResult = false;
						}
						break;
				}
			
				if(testResult === true)  return (typeof trueBlock === "function")  ? trueBlock(target)  : (typeof trueBlock  !== "undefined") ? trueBlock : true;
				if(testResult === false) return (typeof falseBlock === "function") ? falseBlock(target) : (typeof falseBlock !== "undefined") ? falseBlock : false;
			
				return false;
			},
			"like":function(target,test,tb,fb){
				if(N.isString(target)) target = target.trim();
				return N.is(target,test,tb,fb);
			}
		});
		
		N.TYPE.EACH_TO_METHOD();
	
		var DATA_FILTER_PROC = function(inData,filterMethod){
			var data = CORE.AS_ARRAY(inData);
			filterMethod = filterMethod || function(a){ return typeof a === "undefined" ? false : true; };
			if(typeof filterMethod === "function"){
				var result=[];
				N.each(data,function(v,i){ if(filterMethod(v,i)==true) result.push(v); });
				return result;
			}
			return [];
		};
		
		var DATA_ANY_PROC = function(inData,filterMethod){
			var tr = false,fm=(typeof filterMethod === 'function') ? filterMethod : function(v){ return v === filterMethod; };
			filterMethod = filterMethod || function(a){ return typeof a === "undefined" ? false : true; };
			DATA_FILTER_PROC(inData,function(v,i){
				var r = fm(v,i)
				if(r === true) { tr = true; return false; }
			});
			return tr;
		};
		
		var DATA_ALL_PROC = function(inData,filterMethod){
			var tr = true,fm=(typeof filterMethod === 'function') ? filterMethod : function(v){ return v === filterMethod; };
			filterMethod = filterMethod || function(a){ return typeof a === "undefined" ? false : true; };
			DATA_FILTER_PROC(inData,function(v,i){
				var r = fm(v,i);
				if(r === false) return tr = false;
			});
			return tr;
		};
		
		// 배열 오브젝트 베이스 KIT
		N.SINGLETON("DATAKIT",{			
			"asArray":CORE.PIPE(function(v){
				return CORE.TYPEOF.LIKEARRAY(v) ? v : CORE.NEW_ARRAY(v);
			},1),
			"asObject":CORE.PIPE(function(ob,es,kv){
				return CORE.AS_OBJECT(ob,es,kv);
			},1),
			//배열이 아니면 배열로 만들어줌
			"toArray":CORE.PIPE(function(v){
				return CORE.NEW_ARRAY(v);
			},1),
			"toObject":CORE.PIPE(function(ob,es,kv){
				return CORE.AS_OBJECT(ob,es,kv);
			},1),
			"pushOf":CORE.PIPE(function(d,v,k){
				if(typeof d == "object"){
					if(CORE.TYPEOF.LIKEARRAY(d)){
						d.push(v);
					} else {
						d[k || "value"] = v;
					}
				}
				return d;
			},2),
			"push":CORE.PIPE(function(d,v,k){
				return N.pushOf.BOOST(CORE.CLONE(d),v,k);
			},2),
			"has" :function(d,v){ 
				if(typeof d === "object"){
					if(CORE.TYPEOF.LIKEARRAY(d)){
						for(var i=0,l=d.length;i<l;i++) if(d[i] === v) return true; return false; 
					} else {
						for(var k in d) if(d[k] === v) return true; return false; 
					}
				}
			},
			"addOf":CORE.PIPE(function(data,v,k){
				return N.has(data,v) ? data : N.pushOf.BOOST(data,v,k);
			},2),
			"add":CORE.PIPE(function(data,v,k){
				return N.has(data,v) ? data : N.push.BOOST(data,v,k);
			},2),
			"count":function(d){
				if(typeof d === "object") return d instanceof Array ? d.length : Object.keys(d).length;
				if(typeof d === "string") return d.length;
				return 0;
			},
			//첫번째 소스에 두번째 부터 시작하는 소스를 반영
			"extendOf":function(data){
				if(typeof data !== "object") return data;
				for(var i=1,l=arguments.length;i<l;i++) 
					if( typeof arguments[i] == "object" ) 
						for(var key in arguments[i]) data[key] = arguments[i][key];
				return data;
			},
			"extend":function(data,fillData,forceFill){
				if(typeof data !== "object") {
					if(data === undefined) data = {};
					else data = {data:data};
				}
				if(forceFill !== true) forceFill = CORE.AS_ARRAY(forceFill);
				if (forceFill.length || forceFill === true) {
					for(var key in fillData)  {
						if( !(key in data) ) data[key] = fillData[key];
						else if(forceFill === true || N.has(forceFill,key) ) data[key] = fillData[key];
					} 
				} else {
					for(var key in fillData)  if( !(key in data) ) data[key] = fillData[key];
				}
				return data;
			},
			//완전히 새로운 포인터 오브젝트에 다른 소스를 반영
			"margeOf":function(data){
				if(typeof data !== "object") {
					if(data === undefined) data = {};
					else data = {data:data};
				} 
				return N.extend.apply(undefined,[CORE.CLONE(data,true)].concat(Array.prototype.slice.call(arguments,1)));
			},
			"marge":function(data,fillData,forceFill){
				return N.extendOf(CORE.CLONE(data,true),fillData,forceFill);
			},
			"keyOf":function(data,value){
				if(CORE.TYPEOF.LIKEARRAY(data) === true){
					for(var i=0,l=data.length;i<l;i++) if(data[i] === value) return i;
				} else if(typeof data === "object"){
					for(var key in data) if(data[key] === value) return key;
				} else if(typeof data === "string"){
					return data.indexOf(value);
				}
			},
			"all":DATA_ALL_PROC,
			"any":DATA_ANY_PROC,
			"needOf":CORE.PIPE(function(d,v){
				!N.has(d,v) && N.pushOf.BOOST(d,v); return d;
			},2),
			"need":CORE.PIPE(function(d,v){
				return N.needOf.BOOST(CORE.CLONE(d),v);
			},2),
			"get":CORE.PIPE(function(d,index){
				if(typeof d === "object" || typeof d === "string") return d[index];
				return d;
			},1),
			"setOf":CORE.PIPE(function(d,v,k){
				if(typeof k === "undefined") k = (typeof d == "string" || CORE.TYPEOF.LIKEARRAY(v)) ? 0 : "value";
				if(typeof d === "object" || typeof d === "string") d[k] = CORE.RECALL(v);
				return d;
			},2),
			"set":CORE.PIPE(function(d,v,k){
				return N.setOf.BOOST(CORE.CLONE(d),v,k);
			},2),
			"range":CORE.PIPE(function(end,start,step,last){
				var r=[];
				end=parseFloat(end),end=isNaN(end)?0:end;
				start=parseFloat(start),start=isNaN(start)?0:start;
				step=parseFloat(step),step=isNaN(step)||step==0?1:step;
				if(step <= 0){ return console.warn("range::not support minus step"),r;};
				if(last==true) for(var i=start,l=end;i<=l;i=i+step) r.push(i); else for(var i=start,l=end;i<l;i=i+step) r.push(i);;
				return r;
			},1),
			//배열의 하나추출
			"first":CORE.PIPE(function(t,offset){
				if(typeof offset === "function" && CORE.TYPEOF.LIKEARRAY(t)) for(var i=0,l=t.length;i<l;i++){
					if(offset(t[i],i)===true){
						return t[i];
					} 
				} 
				return typeof t === "object" ? typeof t[0] === "undefined" ? undefined : t[0+(~~offset)] : t;
			},2),
			//배열의 뒤
			"last":CORE.PIPE(function(t,offset){ 
				return CORE.TYPEOF.LIKEARRAY(t) ? t[t.length-1-(~~offset)] : t; 
			},2),
			// 각각의 값의 function실행
			"each":CORE.PIPE(function(v,f){ 
				var ev=CORE.AS_ARRAY(v);
				for(var i=0,l=ev.length;i<l;i++) if(f.call(ev[i],ev[i],i) === false) return false;
				return ev; 
			},2),
			// 각각의 값의 function실행
			"reverseEach":CORE.PIPE(function(v,f){ 
				var ev=CORE.AS_ARRAY(v); 
				for(var i=ev.length-1;i>-1;i--) if(f.call(ev[i],ev[i],i) === false) return false; 
				return ev; 
			},2),
			"from":CORE.PIPE(function(v,f){
				if(typeof v === "object" && typeof f === "string"){
					if( f.indexOf(".") > 0 ){
						var sf=f.split(".");
						var se=v;
						for(var i=0,l=sf.length;i<l;i++)if(se[sf[i]])se=se[sf[i]];
						return se;
					}
					return v[f];
				} else if(typeof v === "object" && typeof f === "number"){
					return v[f];
				}
			},2),
			// 각각의 값을 배열로 다시 구해오기
			"map":CORE.PIPE(function(v,f){ 
				var rv=[],ev=CORE.AS_ARRAY(v);
				if(typeof f == "function"){
					for(var i=0,l=ev.length;i<l;i++) rv.push(f.call(ev[i],ev[i],i)); 
				} else if(typeof f === "string" || typeof f === "number"){
					for(var i=0,l=ev.length;i<l;i++) rv.push(N.from.BOOST(ev[i],f)); 
				}
				return rv; 
			},2),
			// define이 끝날때까지 계속 map을 생성함
			"defineMap":CORE.PIPE(function(v,f,infinity){ 
				var v=v,rv=(typeof v === "undefined") ? [] : [v],ev=CORE.AS_ARRAY(v),infinity = (typeof infinity === "number") ? infinity : 100000;
				for(var i=0;i<infinity;i++){
					v = f.call(v,v,i);
					if(typeof v === "undefined") break;
					else rv.push(v);
				} 
				return rv;
			},2),
			"removeByKey":function(array,indexes){
				if(CORE.TYPEOF.LIKEARRAY(array)){
					var removeCount = 0;
					N.each(N.unique(indexes).sort(),function(index){
						if(typeof index === "number") array.splice(index+(removeCount++),1);
					});
				}
			},
			"removeByValue":function(array,target){
				if(CORE.TYPEOF.LIKEARRAY(array)){
					var selectIndex = -1;
					var removeIndexes = [];
					for(var i=0,l=array.length;i<l;i++) if(array[i] === target) removeIndexes.push(i);
					if(removeIndexes.length) N.removeByKey(array,removeIndexes);
				}
			},
			"inject":function(v,f,d){ 
				d=(typeof d=="object"?d:{});v=CORE.AS_ARRAY(v); for(var i=0,l=v.length;i<l;i++)f(d,v[i],i);return d;
			},
			"filter":CORE.PIPE(DATA_FILTER_PROC,2),
			
			"insert":CORE.PIPE(function(data,v,a){
				data = CORE.AS_ARRAY(data);
				Array.prototype.splice.call(data,typeof a === "number"?a:0,0,v);	
				return data;
			},2),
			// false를 호출하면 배열에서 제거합니다.
			"sort":CORE.PIPE(function(data,filter){
				if(data.length == 0) return data.toArray();
				if(typeof filter !== "function") return Array.prototype.sort.call(new N.Array(data));
				
				var result = [data[0]];
				
				for(var i=1,l=data.length;i<l;i++) for(var ri=0,rl=result.length;ri<rl;ri++){
					if(filter(data[i],result[ri]) === true){
						N.insert(result,data[i],ri);
						break;
					}
					if((ri + 1) === result.length){
						result.push(data[i]);
					}
				}
				return result;
			},2),
			"arrayShift":function(data,len,rep){
				Array.prototype.splice.apply(data,[0,typeof len==="number"?len:1].concat(Array.prototype.slice.call(arguments,2)));
				return data;
			},
			"enter":CORE.PIPE(function(data,index){
				if(typeof index !== "number" || index === NaN) return [];
				var r = [], d = CORE.AS_ARRAY(data);
				for(var i=0,l=index < d.length ? index : d.length;i<l;i++) r.push(d[i]);
				return r;
			},2),
			"exit":CORE.PIPE(function(data,index){
				if(typeof index !== "number" || index === NaN) return [];
				var r = [], d = CORE.AS_ARRAY(data);
				for(var i=index<0?0:index,l=d.length;i<l;i++) r.push(d[i]);
				return r;
			},2),
			"exitFillOf":CORE.PIPE(function(data,index,req){
				data = CORE.AS_ARRAY(data);
				if(typeof req == "function"){
					for(var i=data.length,l=~~index;i<l;i++) data.push(req(i));
				} else {
					for(var i=data.length,l=~~index;i<l;i++) data.push(CORE.CLONE(req));
				}
				return data;
			},3),
			"exitFill":CORE.PIPE(function(data,index,req){
				return N.exitFillOf.BOOST(CORE.CLONE(data),index,req);
			},3),
			"dataShift":function(data,len,rep){
				return N.arrayShift(Array.prototype.slice.call(CORE.AS_ARRAY(data)),len,rep);
			},
			"arrayUnshift":function(data,index,rep){
				//todo:behind와 통합
				index = typeof index !== "number" ? data.length - 1 : index;
				Array.prototype.splice.apply(data,[index,data.length-index].concat(Array.prototype.slice.call(arguments,2)));
				return data;
			},
			"dataUnshift":function(data,index,rep){
				return N.arrayReplace(Array.prototype.slice.call(CORE.AS_ARRAY(data)),index,rep);
			},
			//중복되는 값 제거
			"unique":CORE.PIPE(function(){
				var value  = [],result = [];
				for(var ai=0,li=arguments.length;ai<li;ai++){
					var mvArray = CORE.NEW_ARRAY(arguments[ai]);
					for(var i=0,l=mvArray.length;i<l;i++){
						var unique = true;
						for(var i2=0,l2=result.length;i2<l2;i2++){
							if(mvArray[i] == result[i2]){
								unique = false;
								break;
							}
						}
						if(unique==true) result.push(mvArray[i]);
					}
				}
				return result;
			},1),
			"keys":CORE.PIPE(function(d){
				return Object.keys(d);
			},1),
			//nd.track(["aass","bddw","casef"],function(s){ return s[0]; });  =>  {a: ["aass"], b: ["bddw"], c: ["casef"]}
			//nd.track([{key:"a"},{key:"b"},{key:"c"}],"key");  =>  {a: [{key: "a"}], b: [{key: "b"}], c: [{key: "c"}]}
			"track":CORE.PIPE(function(d,f){
				var r={};
				if(typeof f === "function"){
					for(var i=0,l=d.length;i<l;i++){
						var k = f(d[i]);
						if(typeof k === "string" || typeof k === "number"){
							r[k]=r[k]||[];
							r[k].push(d[i]);
						}
					}
				}
				if(typeof f === "string" || typeof f === "number"){
					for(var i=0,l=d.length;i<l;i++){
						if(typeof d[i] === "object" && d[i].hasOwnProperty(f)){
							var k = d[i][f];
							if(!r[k])r[k]=[];
							r[k].push(d[i]);
						} 
					}
				}
				return r;
			},2),
			//object to array map
			"trackMap":CORE.PIPE(function(d,f){
				var r = [];
				if(typeof f === "function"){
					for(var k in d)r.push(f(d[k],k));
				} else {
					for(var k in d)r.push(d[k]);
				}
				return r;
			},2),
			//custom ordinal enum
			"forEach":CORE.PIPE(function(a,d,f){
				var ks = CORE.AS_ARRAY(a);
				for(var i=0,l=ks.length;i<l;i++){
					if(f(d[ks[i]],ks[i])==false) return false;
				}
				return d;
			},3),
			"forMap":CORE.PIPE(function(a,d,f){
				var ks = CORE.AS_ARRAY(a);
				
				var rv=[],ev=CORE.AS_ARRAY(d);
				
				if(typeof f == "function"){
					for(var i=0,l=ks.length;i<l;i++) rv.push(f.call(d[ks[i]],d[ks[i]],ks[i]));
				} else if(typeof f === "string" || typeof f === "number"){
					for(var i=0,l=ks.length;i<l;i++) rv.push(N.from.BOOST(d[ks[i]],ks[i])); 
				}
				return rv;
			},3),
			"dataEqual":function(data1,data2){
				var firstType  = typeof data1;
				if(firstType === typeof data2) {
					if(firstType === "object") {
						var firstArray = CORE.TYPEOF.LIKEARRAY(data1);
						if(firstArray === CORE.TYPEOF.LIKEARRAY(data2)){
							if(firstArray){
								//둘다 array일 경우
								if(data1.length === data2.length) {
									var equal = true;
									for(var i=0,l=data1.length;i<l;i++){
										if(data1[i] !== data2[i]){
											equal = false;
											break;
										}
									}
									return equal;
								} else {
									return false;
								}
							} else {
								var allkeys = N.flatten(N.propKey(data1),N.propKey(data2),N.unique);
								var equal = true;
								for(var i=0,l=allkeys.length;i<l;i++){
									if(data1[allkeys[i]] !== data2[allkeys[i]]){
										equal = false;
										break;
									}
								}
								return equal;
							}
						} else {
							return false;
						}
					} else {
						return (data1 === data2);
					}
				}
				return false;
			},
			"dataEqualUnique":function(){
				var value=[],result=[];
				for(var ai=0,li=arguments.length;ai<li;ai++){
					var mvArray = CORE.NEW_ARRAY(arguments[ai]);
					for(var i=0,l=mvArray.length;i<l;i++){
						var unique = true;
						for(var i2=0,l2=result.length;i2<l2;i2++){
							//console.log("mvArray[i],result[i2]",mvArray[i],result[i2],N.dataEqual(mvArray[i],result[i2]));
							if(N.dataEqual(mvArray[i],result[i2])){
								unique = false;
								break;
							}
						}
						if(unique==true) result.push(mvArray[i]);
					}
				}
				return result;
			},
			"dataIndex":function(data,compare){ var v = CORE.AS_ARRAY(data); for(var i in v) if(compare == v[i]) return N.toNumber(i); },
			"arrayIndex":function(array,compare){ if(CORE.TYPEOF.LIKEARRAY(array))for(var i=0,l=array.length;i<l;i++)if(array[i] === compare)return i; return -1;},
			// 배열안의 배열을 풀어냅니다.
			"flatten":CORE.PIPE(function(){ return N.argumentsFlatten(arguments); },1),
			//값을 플래튼하여 실행함
			"argumentsFlatten":function(){ var result = []; function arrayFlatten(args){ N.each(args,function(arg){ if(CORE.TYPEOF.LIKEARRAY(arg)) return N.each(arg,arrayFlatten); result.push(arg); }); } arrayFlatten(arguments); return result; },
			//owner를 쉽게 바꾸면서 함수실행을 위해 있음
			"APPLY" : function(f,owner,args) { if( typeof f === "function" ) { args = CORE.NEW_ARRAY(args); return (args.length > 0) ? f.apply(owner,args) : f.call(owner); } },
			"FLATTENCALL" : function(f,owner) { return N.APPLY(f,owner,N.argumentsFlatten(Array.prototype.slice.call(arguments,2))); },
			"CALL"    :function(f,owner){ return (typeof f === "function") ? ((arguments.length > 2) ? f.apply(owner,Array.prototype.slice.call(arguments,2)) : f.call(owner)) : undefined; },
			"CALLBACK":function(f,owner){ return (typeof f === "function") ? ((arguments.length > 2) ? f.apply(owner,Array.prototype.slice.call(arguments,2)) : f.call(owner)) : f; },
			//배열안에 배열을 길이만큼 추가
			"arrays":function(l) { l=N.toNumber(l);var aa=[];for(var i=0;i<l;i++){ aa.push([]); }return aa; },
			//숫자로 변환합니다. 디폴트 값이나 0으로 반환합니다.
			"toNumber":function(v,d){
				switch(typeof v){ case "number":return v;case "string":var r=v.replace(/[^.\d\-]/g,"")*1;return isNaN(r)?0:r;break; }
				switch(typeof d){ case "number":return d;case "string":var r=d*1;return isNaN(r)?0:r;break; }
				return 0;
			},
			//1:길이와 같이 2: 함수호출
			"times":CORE.PIPE(function(l,f,s){ 
				l=N.toNumber(l); var r = []; 
				if(typeof f === 'string') var fs = f, f = function(i){ return N.exp.seed(i)(fs); };
				for(var i=(typeof s === 'number')?s:0;i<l;i++) r.push(f(i)); 
				return r; 
			},2),
			//i 값이 제귀합니다.
			"indexAsReverse":CORE.INDEX.REVERSE,
			"indexAsTurn":CORE.INDEX.TURN,
			"indexAsBounce":CORE.INDEX.BOUNCE,
		});
		N.DATAKIT.EACH_TO_METHOD();
		
		// 오브젝트 베이스 KIT
		N.SINGLETON("PROPKIT",{
			"isModule":IS_MODULE,
			"isProp":function(source){
				return (typeof source === "object") || (typeof source === "function");
			},
			"propLength":function(data){ var l = 0; if(typeof data === "object" || typeof data === "function") for(var key in data) l++; return l; },
			//새로운 객체를 만들어 복사
			"clone"  : CORE.CLONE,
			"diffKeys":function(a,b){
				if(typeof a === "object" && typeof b === "object"){
					return N.filter(N.flatten(N.propKey(a),N.propKey(b),N.unique),function(key){
						if(a[key] !== b[key]){ return true; }
					});
				}
				return null;
			},
			//오브젝트의 key를 each열거함
			"propEach":CORE.PIPE(function(v,f){
				if(N.isProp(v)){for(k in v) if(f(v[k],k)===false) break;}; 
				return v;
			},2),
			//
			"propChange":CORE.PIPE(function(source,original,change){
				if(N.isProp(source) && typeof original === "string" && typeof change === "string") { 
					source[change] = source[original]; delete source[original]; 
				}
				return source;
			}),
			"propSet":CORE.PIPE(function(source,key){
				if(N.isProp(source) && (typeof key === "string" || typeof key === "number")) {
					for(var i=2,l=arguments.length;i<l;i++){
						if(arguments[i] !== undefined || arguments[i] !== NaN){
							source[key] = arguments[i];
							break;
						}
					}
				}
				return source;
			}),
			"propShift":CORE.PIPE(function(source,key){
				var result;
				if(N.isProp(source) && (typeof key === "string" || typeof key === "number") && (key in source)) {
					result = source[key];
					delete source[key];
				}
				return result;
			}),
			"propMap":CORE.PIPE(function(v,f){ 
				var result = {}; 
				if(N.isProp(v)) for(var k in v) result[k] = f(v[k],k); return result; 
				return result;
			},2),
			//오브젝트의 key value값을 Array 맵으로 구한다.
			"propData" :CORE.PIPE(function(v,f){ var result = []; if(typeof f !== "function") f = function(v){ return v; }; if(typeof v === "object"){ for(var k in v) result.push(f(v[k],k)); return result; } return result;},2),
			"propKey"  :CORE.PIPE(function(obj,rule,expandKeys){
				var r = [];
				if(typeof rule === "string"){
					if((rule in obj) || expandKeys === true) r.push(rule);
				} else if(CORE.TYPEOF.LIKEARRAY(rule)) {
					if(expandKeys === true){
						for(var i=0,l=rule.length;i<l;i++) (typeof rule[i] === "string") && r.push(rule[i]);
					} else {
						for(var i=0,l=rule.length;i<l;i++) (rule[i] in obj) && r.push(rule[i]);
					}
				} else if(rule instanceof RegExp) {
					var r = [];
					N.propEach(obj,function(v,k){ if(rule.test(k)){ r.push(k) }});
				} else {
					var r = [];
					N.propEach(obj,function(v,k){ r.push(k); });
				}
				return r;
			},1),
			"numbers":CORE.NUMBER.NUMBERS
		});
		N.PROPKIT.EACH_TO_METHOD();
		
		N.SINGLETON("TIMEKIT",{
			"cron":function(pattern){
				return new CORE.NDCRON(pattern);
			},
			"parseDate":function(dv,format,pad){
				if(CORE.TYPEOF.LIKEARRAY(dv)) dv = dv.join(' ');
			
				var dt = /(\d\d\d\d|)[^\d]?(\d\d|\d|).?(\d\d|\d|)[^\d]?(\d\d|\d|)[^\d]?(\d\d|\d|)[^\d]?(\d\d|\d|)/.exec(dv);
				dt[1] = dt[1] || (((new Date()).getYear() + 1900) +'');
				dt[2] = dt[2] || ((new Date()).getMonth()+1);
				dt[3] = dt[3] || ((new Date()).getDate());
				dt[4] = dt[4] || ("00");
				dt[5] = dt[5] || ("00");
				dt[6] = dt[6] || ("00");
			
				var r    = [ dt[1],dt[2],dt[3],dt[4],dt[5],dt[6],dt[0] ];
				r.year   = dt[1],r.month  = dt[2],r.date = dt[3],r.hour = dt[4],r.minute = dt[5],r.second = dt[6],r.init = dt[7];
				r.format = function(s){
					return s.replace('YYYY',r.year).replace(/(MM|M)/,r.month).replace(/(DD|D)/,r.date)
					.replace(/(hh|h)/,r.hour).replace(/(mm|m)/,r.minute).replace(/(ss|s)/,r.second)
					.replace(/(A)/,(N.toNumber(r.hour) > 12) ? 'PM' : 'AM');
				}
				if(typeof format === 'string') 
					return r.format(format);
					return r;
			},
			"timeStamp":function(exp){
				if( arguments.length === 0){
					return (+new Date());
				}
				if( typeof exp === "string") {
					exp = N.parseDate(exp);
				}
				if( typeof exp === "number") {
					return exp;
				}
				if( CORE.TYPEOF.LIKEARRAY(exp) && (exp.length == 7) ){
					exp = new Date(exp[0], exp[1], exp[2], exp[3], exp[4], exp[5]);
				}
				if( exp instanceof Date){
					return (+exp);
				}
				return 0;
			},
			"parseTimeScale":function(scale,toObject){
				var totalScale = ~~scale;
				var r = {string:[]};
				
				nd.each(CORE.KNOWN.TIMESCALE,function(prop){
					var size=~~(totalScale/prop.scale);
					if(size > 0){
						r[prop.key]=size;
						r.string.push(size+prop.key);
						totalScale -= (size * prop.scale);
					}
				});
				
				if(!r.string.length){
					r.string = ["0ms"];
					r.ms = 0;
				}
				
				return toObject == true ? r : r.string.join(" ");
			},
			"timeScale":function(exp){
				var scale = 0;
				if(typeof exp === "number") {
					return exp;
				}
				if(typeof exp === "string") {
					// 
					exp = exp.replace(/\d+(Y|year)/,function(t){
						t.replace(/\d+/,function(d){ scale += d*31536000000; });
						return "";
					})
					exp = exp.replace(/\d+(M|month)/,function(t){
						t.replace(/\d+/,function(d){ scale += d*2678400000; });
						return "";
					})
					exp = exp.replace(/\d+(D|day)/,function(t){
						t.replace(/\d+/,function(d){ scale += d*86400000; });
						return "";
					})
					exp = exp.replace(/\d+(h|hour)/,function(t){
						t.replace(/\d+/,function(d){ scale += d*3600000; });
						return "";
					})
					exp = exp.replace(/\d+(ms|millisecond)/,function(t){
						t.replace(/\d+/,function(d){ scale += d*1; });
						return "";
					})
					exp = exp.replace(/\d+(m|minute)/,function(t){
						t.replace(/\d+/,function(d){ scale += d*60000; });
						return "";
					})
					exp = exp.replace(/\d+(s|second)/,function(t){
						t.replace(/\d+/,function(d){ scale += d*1000; });
						return "";
					})
				}
				return scale;
			}
		});
		N.TIMEKIT.EACH_TO_METHOD();
		
		//프리미티브 베이스 킷
		N.SINGLETON("PRIMITIVEKIT",{
			"decimalValue":function(text){
	            var numberValue = N.numbers(text)[0]+"";
	            if(numberValue.length < 4) return numberValue;
	            var total = "",count = 0;
	            (numberValue.split('').reverse().join('')).replace(/./g,function(s){ total = ((count%3) === 2 ) ? ("," + s + total) : (s + total), count++; });
	            return total.replace(/^\,/,"");
	        },
			"parseFloat":function(value,padRight){
				var numberInfo = N.numbers(value);
	            var floatValue = 
	                (typeof padRight == "number") ?
	                (("." + numberInfo[1]).substr(0,padRight+1)) :
	                ("." + numberInfo[1]);
	            return (numberInfo[0] + floatValue)*1;
			},
			"fillLeft":function(str,padLength,fillValue){
				if(typeof padLength !== "number") return value;
				if(typeof fillValue !== "string") fillValue = " ";
				var padLeft="",requirePad = padLength - (str+"").length;
				for(var i=0,l=requirePad>0?requirePad:0;i<l;i++){ padLeft += fillValue; }
				return padLeft + str;
			},
			"padLeft":function(value,padLength,useFloat){
				if(typeof padLength !== "number") return value;
				var padLeft="",numberInfo = N.numbers(value),requirePad = padLength-(numberInfo[0]+"").length;
				for(var i=0,l=requirePad>0?requirePad:0;i<l;i++){ padLeft += "0"; }
				return padLeft + (useFloat === false || !numberInfo[2] ? numberInfo[0] : numberInfo[0] + "." + numberInfo[1] )
			},
			"padRight":function(value,padRight){
	            if(typeof padRight == "number") {
	                var dInfo = N.numbers(value);
	                var iVal  = dInfo[0];
        
	                if(Math.floor(padRight) === 0) return dInfo[0] + "";
        
	                var fStr = (dInfo[1]+"").substr(0,padRight);
        
	                for(var i=0,l=padRight - fStr.length;i<l;fStr += "0",i++);
	                return iVal+"."+fStr;                
	            } else {
	                return N.parseFloat(value)+"";
	            }
	        },
	        "parseInt":function(value){
	            return N.numbers(value)[0];
	        },
	        "parseHigh":function(value){
				var high = Number.NEGATIVE_INFINITY;
				var numberList = N.argumentsFlatten(arguments);
				for(var i=0,l=numberList.length;i<l;i++){
					var parseNumber = N.parseFloat(numberList[i]);
					if(high < parseNumber) high = parseNumber;
				}
				return high === Number.NEGATIVE_INFINITY ? 0 : high;
	        },
	        "parseLow":function(value){
				var low = Number.POSITIVE_INFINITY;
				var numberList = N.argumentsFlatten(arguments);
				for(var i=0,l=numberList.length;i<l;i++){
					var parseNumber = N.parseFloat(numberList[i]);
					if(low > parseNumber) low = parseNumber;
				}
				return low === Number.POSITIVE_INFINITY ? 0 : low;
	        },
			//무엇이든 문자열로 넘김
			"toString":function(tosv,depth,jsonfy){
				switch(typeof tosv){
					case "string" : return jsonfy==true ? '"' + (tosv+"") + '"' :tosv+""; break;
					case "number" : return (tosv+""); break;
					case "object" : 
						if(typeof depth === "undefined") depth = 10;
						if(depth < 1) return "...";
						if(tosv==null){
							return jsonfy==true ? '"null"' : "null";
						} else if(CORE.TYPEOF.ELEMENT(tosv)) {
							if(tosv == document) { return '"[document]"'; }
							//node3
							var tn = tosv.tagName.toLowerCase();
							var ti = N.isNothing(tosv.id) ? "" : "#"+tosv.id;
							var tc = N.isNothing(tosv.className) ? "" : "." + tosv.className.split(" ").join(".");
							return jsonfy==true ? '"'+tn+ti+tc+'"' : tn+ti+tc; 
						} else if(N.isTextNode(tosv)) {
							return '#text '+tosv.textContent;
						} else if(CORE.TYPEOF.LIKEARRAY(tosv)){
							//array
							var result = [];
							for(var i=0,l=tosv.length;i<l;i++) result.push(N.toString(tosv[i],depth-1,jsonfy));
							return "["+(jsonfy==true?result.join(","):result.join(", "))+"]";
						} else if(tosv.jquery){
							//jquery
							var result = N.map(tosv,function(o){ N.toString(o); }).join(", ");
							return jsonfy==true ? '"$['+result+']"' : "$["+result+"]";
						} else {
							//object
							var kv = [];
							for(var key in tosv) kv.push( (jsonfy==true ?  ('"' + key + '"') : key) + ":" + N.toString(tosv[key],depth-1,jsonfy)); 
							return "{"+(jsonfy==true?kv.join(","):kv.join(", "))+"}";
						}
						break;
					case "boolean"   : 
						if(jsonfy==true) return tosv ? '"true"' : '"false"';
						return tosv?"true":"false";
					case "undefined" : return jsonfy==true ? '"undefined"' : "undefined";
					default          : if("toString" in tosv){
						return jsonfy==true ? '"'+ tosv.toString() +'"' : tosv.toString();
					} else {
						return jsonfy==true ? '"[typeof ' + typeof tosv + ']"' : "[typeof " + typeof tosv + "]"; 
					}
					break;
				}
			},
			//무엇이든 문자열로 넘기지만 4댑스 이하로는 읽지 않음
			"tos"  : function(tosv,jsonfy){ return N.toString(tosv,9,jsonfy); },
			//어떠한 객체의 길이를 조절함
			"max"  : function(target,length,suffix){
				if(typeof target === "string"){
					length = isNaN(length) ? 100 : parseInt(length);
					suffix = typeof suffix === "string" ? suffix : "...";
					if( target.length > length ){
						return target.substr(0,length) + suffix;
					}
				} else if (CORE.TYPEOF.LIKEARRAY(target)) {
					if (target.length > length) target.length = length;
				}
				return target;
			},
			"byteSize":function(t){
				return unescape(escape(t).replace(/%u..../g,function(s){ return "  "; })).length;
			}
		});
		N.PRIMITIVEKIT.EACH_TO_METHOD();
		
	})(window,[],{},{},N,CORE);
	
	
	// AMD
	(function(W){
		window.nd = N;
		if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) { 
			define(function(){ return N; }); 
		}
	}(window));
	
	
	(function(N,CORE){
		
		N.SINGLETON("TOKENKIT",{
			//Helper of pascalCase,camelCase,snakeCase,kebabCase
			"CASE_SPLIT":function(s,c){ if(typeof c === "string") return s.split(c) ; if(typeof s !== "string")return console.error("CASE_SPLIT::첫번째 파라메터는 반드시 String이여야 합니다. // s =>",s); s = s.replace(/^\#/,""); /*kebab*/ var k = s.split("-"); if(k.length > 1) return k; /*snake*/ var _ = s.split("_"); if(_.length > 1) return _; /*Cap*/ return s.replace(/[A-Z][a-z]/g,function(s){return "%@"+s;}).replace(/^\%\@/,"").split("%@"); },
			//to PascalCase
			"pascalCase":CORE.PIPE(function(s){ var words = N.CASE_SPLIT(s); for(var i=0,l=words.length;i<l;i++) words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase(); return words.join(""); },1),
			//to camelCase
			"camelCase":CORE.PIPE(function(s){ var words = N.CASE_SPLIT(s); for(var i=1,l=words.length;i<l;i++) words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase(); words[0] = words[0].toLowerCase(); return words.join(""); },1),
			//to snake_case
			"snakeCase":CORE.PIPE(function(s){ var words = N.CASE_SPLIT(s); for(var i=0,l=words.length;i<l;i++) words[i] = words[i].toLowerCase(); return words.join("_"); },1),
			//to kebab-case
			"kebabCase":CORE.PIPE(function(s){ var words = N.CASE_SPLIT(s); for(var i=0,l=words.length;i<l;i++) words[i] = words[i].toLowerCase(); return words.join("-"); },1),
			"split":CORE.PIPE(function(d,s){
				return d.split("",s);
			},1),
			"hasToken":CORE.PIPE(function(d,t,s){
				return N.has(d.split(s || " "),t);
			},1),
			"addToken":CORE.PIPE(function(d,t,s){
				if(N.hasToken.BOOST(d,t,s)){
					return d;
				} else {
					return d + (s || " ") + t;
				}
			},1),
			"removeToken":CORE.PIPE(function(d,t,s){
				console.warn("todo");
			},1)
		});
		N.TOKENKIT.EACH_TO_METHOD();
		
		N.SINGLETON("ADVKIT",{
			"scalef":function(scale,value,total){
				return (typeof value === "number"?value:100) / (typeof total === "number"?total:100) * scale;
			},
			"scale":function(scale,value,total){
				return Math.round(N.ADVKIT.scalef(scale,value,total));
			},
			// nd.ratio(500,10,50,100) => [31, 156, 313]
			"ratiof":function(ratioTotal){
				var args = N.argumentsFlatten(arguments),total = 0,ratioTotal=N.toNumber(args.shift()) || 100;
				return N.map(args,function(v){
					var num = N.toNumber(v);
					total += num;
					return num;
				},N.arrayMap,function(num){
					return num / total * ratioTotal;
				});
			},
			"ratio":function(ratioTotal){
				var fixResult = N.toNumber(ratioTotal);
				var roundResult = N.arrayMap(N.ADVKIT.ratiof.apply(this,Array.prototype.slice.call(arguments)),function(n){
					var round = Math.round(n);
					fixResult -= round;
					return round;
				});
				if(fixResult !== 0){
					roundResult[roundResult.length-1] += fixResult;
				} 
				return roundResult;
			},
			"arcPointf":function(radius,deg){
				radius=N.parseFloat(radius),deg=N.parseFloat(deg);
				var radian = (360-deg) * Math.PI / 180;
				return [radius - radius * Math.sin(radian),radius - radius * Math.cos(radian)];
			},
			"arcPoint":function(radius,deg){
				return N.arrayMap(N.arcPointf(radius,deg),function(n){ return Math.round(n); });
			},
			"toPx":function(v){ if( /(\%|px)$/.test(v) ) return v; return N.toNumber(v)+"px"; },
			//래핑된 텍스트를 제거
			"isWrap":function(c,w){ if(typeof c === "string"){ c = c.trim(); w = typeof w !== "undefined" ? CORE.AS_ARRAY(w) : ['""',"''","{}","[]"]; for(var i=0,l=w.length;i<l;i++){ var wf = w[i].substr(0,w[i].length-1); var we = w[i].substr(w[i].length-1); if(c.indexOf(wf)==0 && c.substr(c.length-1) == we) return true; } } return false; },
			"unwrap":function(c,w){ if(typeof c === "string"){ c = c.trim(); w = typeof w !== "undefined" ? CORE.AS_ARRAY(w) : ['""',"''","{}","[]","<>"]; for(var i=0,l=w.length;i<l;i++) if(N.isWrap(c,w[i])) return c.substring(w[i].substr(0,w[i].length-1).length,c.length-1); } return c; },
			"wrap":function(c,w){ if(!N.isWrap(c,w)){ c = typeof c === "string" ? c.trim() : ""; w = typeof w === "string" ? w.length > 1 ? w : '""' : '""'; return w.substr(0,w.length-1) + c + w.substr(w.length-1); } return c; },
			//쿼테이션을 무조건 적용
			"DQURT":function(c){ if(typeof c === "string"){ if(N.isWrap(c,'""')) return c; return '"'+N.unwrap(c,"''")+'"'; } return c; },
			"SQURT":function(c){ if(typeof c === "string"){ if(N.isWrap(c,"''")) return c; return "'"+N.unwrap(c,'""')+"'"; } return c; },
			//첫번째 택스트 값에 대한 두번째 매칭되는 값의 index나열
			"indexes":function(c,s){
				if(typeof c === "string" || typeof c === "number"){
					var idx = [],mvc = c+"",s = s+"",prog = 0,next;
					do {
						var i = mvc.indexOf(s,prog);
						if(i > -1){
							prog = s.length + (i);
							idx.push(prog-s.length); 
							next = true;
						} else {
							next = false;
						}
					} while(next)
					return idx;
				}
			},
			// 아래 N.indexes 함수들은 어떠한 위치를 제외한 인덱싱을 위해 존재함
			"safeSplitIndexes":function(c,idx,safe){
				if(typeof c === "string" && CORE.TYPEOF.LIKEARRAY(idx)){
					var indexes = CORE.CLONE(idx);
					indexes.push(c.length);
					var result  = [];
					var past    = 0;
					if(safe == true){
						for(var i=0,l=indexes.length;i<l;i++) {
							if(i){
								result.push(c.substring(past-1,indexes[i]));
								past = indexes[i]+1;
							}
						}
					} else {
						for(var i=0,l=indexes.length;i<l;i++){					
							//위에선 i가 0이 아닐때인데 이걸 고치면 작동이 이상해서 일단 납둠
							result.push(c.substring(past,indexes[i]));
							past = indexes[i]+1;
						}
					}
					return result;
				}
			},
			"simpleRange":function(result){
				if(result){
					var sFlag    = [];
					sFlag.length = result.length; 
					for(var si=0,sl=result.length;si<sl;si++) for(var sfi=0,sfl=result.length;sfi<sfl;sfi++) if(si !== sfi) if(result[si][0] < result[sfi][0]) if(result[si][1] > result[sfi][1]) sFlag[sfi] = false;
					var sResult = [];
					for(var sri=0,srl=sFlag.length;sri<srl;sri++) if(sFlag[sri] !== false) sResult.push(result[sri]);
					return sResult;
				}
			},
			"indexesRange":function(f,e){
				if(CORE.TYPEOF.LIKEARRAY(f) && CORE.TYPEOF.LIKEARRAY(e)){
					var flag = [];
					var value= [];
					var fi = 0;
					var ei = 0;
					var next;
					do {
						var fiv = f[fi];
						var eiv = e[ei];
						if(typeof fiv === "undefined" && typeof eiv === "undefined"){
							next = false;
						} else {
							if(typeof eiv === "undefined" || (eiv > fiv)){
								flag.push(true);
								value.push(fiv);
								fi++;
							} else {
								flag.push(false);
								value.push(eiv);
								ei++;
							}
							next = true;
						}
					} while (next);
					var result = [];
					var pos    = [];
					var neg    = [];
					for(var i=0,l=flag.length;i<l;i++){
						var cFlag = flag[i];
						var nFlag = flag[i+1];
						if(cFlag){
							pos.push(value[i]);
						} else {
							neg.push(value[i]);
							if(neg.length >= pos.length && (nFlag==true || typeof nFlag === "undefined")){
								for(var ii=0,ll=neg.length;ii<ll;ii++){
									if(pos.length == 0){
										neg.length = 0;
										break;
									} else {
										result.push([pos.shift(),neg[neg.length - 1]]);
										neg.length = neg.length-1;
									}
								}
							}
						}
					}
					return result;
				} else if(CORE.TYPEOF.LIKEARRAY(f) && typeof e === "undefined"){
					var result = [];
					var stack  = [];
					for(var i=0,l=f.length;i<l;i++){
						stack.push(f[i]);
						if(stack.length > 1) result.push(stack);
					}
					return result;
				} else {
					console.warn("N.indexesRange::두번째까지 파라메터는 array여야 합니다.",f,e);
				}
			},
			"safeSplit":function(c,s,w,safe){
				if(typeof c === "string"){
					if(typeof s !== "string" || s.length == 0) s=",";
					if(s.length > 1){
						console.wran("N.safeSplit:: 두번째 파라메터는 1글자만 지원합니다. => ",s);
						s = s.substr(0,1);
					}
					w = typeof w !== "undefined" ? CORE.AS_ARRAY(w) : ["{}","[]"];
					c = N.unwrap(c,w);
					var outSplit = [];
					for(var i=0,l=w.length;i<l;i++){
						var fv   = w[i].substr(0,w[i].length-1);
						var ev   = w[i].substr(w[i].length-1);
						var fidx = N.indexes(c,fv);
						if(fv == ev){
							outSplit = outSplit.concat(N.indexesRange(fidx));
						} else {
							var eidx = N.indexes(c,ev);
							outSplit = outSplit.concat(N.indexesRange(fidx,eidx));
						}
					}
					outSplit = N.simpleRange(outSplit);
					var splitPoints  = N.indexes(c,s);
					var splitIndexes = [];
					for(var si=0,sl=splitPoints.length;si<sl;si++){
						var point = splitPoints[si];
						var pass  = true;
						for(var oi=0,ol=outSplit.length;oi<ol;oi++){
							if(point > outSplit[oi][0] && point < outSplit[oi][1]){
								pass = false;
								break;
							}
						}
						if(pass == true) splitIndexes.push(point);
					}
					return N.safeSplitIndexes(c,splitIndexes,safe);
				}
			},
			//길이만큼 늘립니다.
			"dataClip":CORE.PIPE(function(v,l,ex){
				var d = CORE.NEW_ARRAY(v);
				if(typeof l !== 'number' || d.length === l) return d;
				if (d.length > l) return Array.prototype.slice.call(d,0,l);
				N.times(l - d.length,function(){ d.push(ex); });
				return d;
			},2),
			"dataRepeat":CORE.PIPE(function(v,l){
				var d = CORE.NEW_ARRAY(v);
				if(typeof l !== 'number' || d.length === l) return d;
				if (d.length > l) return Array.prototype.slice.call(d,0,l);
				N.times(l - d.length,function(){ d.push(v); });
				return d;
			},2),
			//길이만큼 리피트 됩니다.
			"dataTile":function(v,l){
				var base;
				switch(typeof v){
					case "string":case "number": base = v; break;
					case "object":if(CORE.TYPEOF.LIKEARRAY(v)){base = v;}else{ console.warn("N.dataTile::Array만 가능합니다."); return v;} break;
				}
				if(typeof base === "undefined"){ return ; } else {
					var baseLength = N.toLength(v);
					var result,len = N.toNumber(l,baseLength);
					switch(typeof base){
						case "string": result=""; for(var i=0;i<len;i++)result+=v[N.indexAsTurn(i,baseLength)]; return result;
						case "number":
							var vm = [];
							(v+"").replace(/\d/g,function(s){vm.join(s*1);});
							result=0 ; for(var i=0;i<len;i++)result+=vm[N.indexAsTurn(i,baseLength)]; return result;
							break;
						case "object":
							result=[]; for(var i=0;i<len;i++)result.push(v[N.indexAsTurn(i,baseLength)]); return result;
							break;
					}
				}
			},
			"Structure#StringNumberInfo":function(nv){
				var i = /([\D]*)(([\d\,]+|)+(\.[\d]+|))([\D]*)/.exec(nv);
				var n = /([0]*)(.*)/.exec(i[2]);

				if( !!n[1].length && !n[2].length ){
					n[1] = n[1].substr(0,n[1].length-1);
					//n[2] = "0";
					i[2] = "0";
					i[3] = "0";
				}
			
				if(i[1].charAt(i[1].length-1) == "-" && !!i[2].length ){
					i[1] = i[1].substr(0,i[1].length-1);
					i[2] = "-"+i[2];
					i[3] = "-"+i[3];
				}
			
				if(n[1].length){
					i[2] = n[2];
					i[3] = n[2];
				}
				i[2] = i[2].replace(/\,/g,"");
				i[3] = i[3].replace(/\,/g,"");
			
				this.Source.prefix     = i[1];
				this.Source.prefixZero = n[1];
				this.Source.number     = i[2];
				this.Source.integer    = i[3];
				this.Source.float      = i[4];
				this.Source.suffix     = i[5];
	
				this.fixNumberInfo    = function(){
					if(!("floatValue" in this.Source)){
						//float
						this.Source.floatValue = (this.float !== "") ? "0"+this.Source.float : "0";
						//nothing
						if( this.Source.integer == "") this.Source.integer = "0";
						if( this.Source.float   == "") this.Source.float   = "0";
						if( this.Source.number  == "") this.Source.number  = "0";
					}
					return this;
				}
			},
			// 글자안의 숫자를 뽑아냅니다.
			"textNumber":function(source){
				if(typeof source === "string"){
					var info = (new StringNumberInfo(source)).get();
					if(!!info.prefix || !!info.prefixZero || !!info.suffix) return source;
				}
				return N.toNumber(source);
			},
			"cursor":function(v,getter,gears){
				return new CORE.NDCURSOR(v,getter,gears);
			},
			"domain":function(domain,exchange){
				return new CORE.NDDOMAIN(domain,exchange);
			},
			"zone":function(command,step){
				return new CORE.NDZONE(command,step);
			},
			// depreacted zone
			// 1~4 => random any
			"zoneRange":function(source){
				var numberSplit = /^([^\~]*)\~(.*)$/.exec(source);
				if(numberSplit){
					var ns1 = (new StringNumberInfo(numberSplit[1])).get();
					var ns2 = (new StringNumberInfo(numberSplit[2])).get();
					//
					var nprefix = ns1.prefix;
					var nzeroLen = !!ns1.prefixZero ? ns1.prefixZero.length + ns1.integer.length : 0 ;
					//
					var numv1 = N.toNumber(ns1.number);
					var numv2 = N.toNumber(ns2.number);
					//
				
					var chov  = 0;
					if(numv1 > numv2){ chov = numv2+Math.floor(Math.random()*(numv1-numv2+1));
					} else { chov = numv1+Math.floor(Math.random()*(numv2-numv1+1)); }
					//
					if( nzeroLen > 0){
						renVal = N.toNumber(chov);
						renLen = N.toNumber(nzeroLen);
						chov   = renLen ? ((renVal + Math.pow(10,renLen))+"").substr(1) : renVal
					} 
					return !!nprefix ? nprefix+chov : chov;
				} else {
					return N.textNumber(source);
				}
			},
			// 1,2,3,4 => random any
			"zoneChoice":function(value,split){
				if( CORE.TYPEOF.LIKEARRAY(value) ) return value[Math.floor(Math.random()*(value.length))];
				var cache = N.cache.get("N.zoneChoice",value+split);
				if(cache) return cache[Math.floor(Math.random()*(cache.length))];
				var cachedata = value.split(typeof split === "string"?split:"|");
				N.cache.set("N.zoneChoice",value+split,cachedata);
				return cachedata[Math.floor(Math.random()*(cachedata.length))];
			},
			"zoneInfo":function(command){
				command = N.toString(command);
				var value,mutableType,type = (command.indexOf("\\!") == 0)?"fixed":(command.indexOf("\\?") == 0)?"mutable":"plain";
				if(type != "plain"){
					command = command.substr(2);
					if(/\d+\~\d+/.test(command)){
						mutableType = "range";
						value = (type == "fixed") ? N.zoneRange(command) : command;
					} else if( command.indexOf("|") > -1 ){
						mutableType = "choice";
						value = (type == "fixed") ? N.zoneChoice(command) : command;
					} else {
						console.error("setZoneParams:: 알수없는 명령어 입니다 ->",command);
						value = command;
					}
				} else {
					value = command;
				}
				return {value:value, type:type, mutableType:mutableType};
			},
			"zoneValue":function(zone){
				switch(zone.type){
					case "fixed": case "plain":
						return zone.value;
						break;
					case "mutable":
						switch(zone.mutableType){
							case "range":
								return N.zoneRange(zone.value);
								break;
							case "choice":
								return N.zoneChoice(zone.value);
								break;
						}
						break;
				}
			}
		});
		N.ADVKIT.EACH_TO_METHOD();
	
	
	
		N.METHOD("exp",function(source){
			var $seed  = this.$seed || 0;
			var $names = this.$names || [];
			var aPoint=[],params = N.map(Array.prototype.slice.call(arguments,1),function(t){ return N.zoneInfo(t); });
			return source.replace(/(\\\([^\)]*\)|\\\{[^\}]*\})/g,function(s){
				if(s[s.length-1] == ')') {
					var dv = N.zoneValue(N.zoneInfo("\\!"+s.substring(2,s.length-1)));
					aPoint.push(dv);
					return dv;
				} else {
					var evs = s.substring(2, s.length - 1).replace(/\$i/g, function(s) {
	                    return $seed;
	                }).replace(/\&\d+/g, function(s) {
	                    var av = aPoint[parseInt(s.substr(1))];
	                    return N.likeNumber(av) ? av * 1 : '\"' + av + '\"';
	                }).replace(/\$\d+/g, function(s) {
	                    var paramResult = params[parseInt(s.substr(1))];
	                    if (paramResult) {
	                        paramResult = N.zoneValue(paramResult);
	                        return N.likeNumber(paramResult) ? paramResult : '\"' + paramResult + '\"' ;
	                    }
	                }).replace(/\$\w+/g, function(s) {
						var selectkey = s.substr(1);
						var paramResult;
						for(var i=0,l=$names.length;i<l;i++){
							if($names[i] === selectkey){
								paramResult = params[i];
								break;
							}
						}
	                    if (paramResult) {
	                        paramResult = N.zoneValue(paramResult);
	                        return N.likeNumber(paramResult) ? paramResult : '\"' + paramResult + '\"' ;
	                    }
	                });
					var v = eval(evs);
					aPoint.push(v);
					return v;
				}
			});
		
		},{
			seed:function($seed){ 
				this.$seed = N.toNumber($seed);
			},
			names:function(){
				this.$names = Array.prototype.slice.call(arguments);
			}
		});
	
		N.METHOD("expn",function(source){
			if(arguments.length === 1){
				return N.toNumber(N.exp.call(undefined,"\\("+source+")"));
			} else {
				var args = Array.prototype.slice.call(arguments);
				args[0]  = "\\{"+args[0]+"}";
				return N.toNumber(N.exp.apply(undefined,args));
			}
		});
		
		//******************
		// NodyArray
		N.ARRAY_MODULE("Array",{
			each     : function(block) { for ( var i=0,l=this.length;i<l;i++) { if( block(this[i],i) == false ) break; } return this; },
			reverseEach : function(block) { for ( var i=this.length-1;i>-1;i--) { if( block(this[i],i) == false ) break; } return this; },
			keys  : function(rule){ return N.propKey(this,rule); },
			zero  :function(){ return N.get(this,0); },
			first :function(){ return N.get(this,0); },
			last :function(){ return N.last(this); },
			from :function(index){ return this[index]; },
			has:function(v){ for(var i=0,l=this.length;i<l;i++) if(this[i] === v) return true; return false; },
			push : function(v,i){ switch(typeof i){ case "string": case "number": this[i] = v; break; default: Array.prototype.push.call(this,v); break; } return this; },
			add :function(v,i){ if( !this.has(v) ) this.push(v,i); return this; },
			marge:function(array){
				var _self = this;
				N.each(array,function(v){ _self.add(v); });
				return this;
			},
			setSource : function(v){
				if( CORE.TYPEOF.LIKEARRAY(v) ) {
					if("toArray" in v){
						Array.prototype.splice.apply(this,[0,this.length].concat(v.toArray()));
					} else {
						Array.prototype.splice.apply(this,[0,this.length].concat(Array.prototype.slice.call(v)));
					}
					return this;
				} else {
					if(v||v==0){
						Array.prototype.splice.call(this,0,this.length,v);
					} else {
						Array.prototype.splice.call(this,0,this.length);
					}
					return this;
				}
			},
			//값의 길이
			isNone:function(){ return (this.length === 0) ? true : false },
			isOne:function(){ return (this.length === 1) ? true : false },
			isMany:function(){ return (this.length > 1) ? true : false },
			isOk:function(){ return (this.length > 0) ? true : false },
			isNok:function(){ return (this.length === 0) ? true : false},
			//선택된 값으로 배열이 재정렬 됩니다.
			selectValue:function(value){ var selects = []; N.each(this,function(v){ if(v == value) selects.push(v); }); this.setSource(selects); },
			selectIndex:function(index){ return this.setSource(this[index]); },
			selectFirst:function(){ return this.setSource(this[0]); },
			selectLast :function(){ return this.setSource(this[this.length-1]); return this; },
			//배열의 길이를 조절합니다.
			max:function(length) { this.length = length > this.length ? this.length : length; return this; },
			min:function(length,undefTo){var count=parseInt(length);if(typeof count=="number")if(this.length<count)for(var i=this.length;i<count;i++)this.push(undefTo);return this;},
			//원하는 위치에 대상을 삽입합니다.
			insert: function(v,a){ 
				N.insert(this,v,a);
				return this;
			},
			// 순수 Array로 반환
			toArray  : function() { return Array.prototype.slice.call(this); },
			//내부요소 모두 지우기
			clear   : function() { this.splice(0,this.length); return this; },
			clone:function(){ return new N.Array(this);},
			//filter function(a,b){ return a>b; } => [a,b];
			sort:function(filter){
				if(typeof filter !== "function") {
					return Array.prototype.sort.call(new N.Array(this));
				}
				if(this.length == 0){
					return this.toArray();
				}
				var result = new N.Array([this[0]]);
				for(var i=1,l=this.length;i<l;i++) for(var ri=0,rl=result.length;ri<rl;ri++){
					if(filter(this[i],result[ri]) === true){
						result.insert(this[i],ri);
						break;
					}
					if((ri + 1) === result.length){
						result.push(this[i]);
					}
				}
				return result;
			},
			setSort:function(filter){
				if(typeof filter !== "function") {
					return Array.prototype.sort.call(this);
				} else {
					return this.setSource(this.sortFilter(filter));
				}
			},
			callback:function(f){
				if(typeof f === "function"){ return f.call(this,this); }
			},
			//뒤로부터 원하는 위치에 대상을 삽입합니다.
			behind: function(v,a){ return this.insert(v, this.length - (isNaN(a) ? 0 : parseInt(a)) ); },
			//원하는 위치에 대상을 덮어씁니다.
			overwrite : function(v,a){ this.min(a+1); this[a] = v; return this; },
			// 현재의 배열을 보호하고 새로운 배열을 반환한다.
			save : function(v){ return this.__NativeInitializer__(this); },
			//array안의 array 풀어내기
			flatten : function(){ return new N.Array(N.argumentsFlatten(this)); },
			setFlatten    : function(){return this.setSource(this.flatten());},
			//다른 배열 요소를 덛붙인다.
			concat : function(){ return new N.Array(arguments).inject(this.save(),function(v,_a){ new N.Array(v).each(function(v2){ _a.push(v2); }); }); },
			setConcat    : function(){ return this.setSource(this.concat.apply(this,arguments)); },
			//
			append:function(a){
				if(a === undefined || a === null) return this;
				if( !CORE.TYPEOF.LIKEARRAY(a) ) return this.push(a);
				for(var i=0,l=a.length;i<l;i++) this.push(a[i]);
				return this;
			},
			prepend:function(a){
				if(a === undefined || a === null) return this;
				if( !CORE.TYPEOF.LIKEARRAY(a) ) return this.insert(a,0);
				for(var i=0,l=a.length;i<l;i++) this.insert(a[i],i);
				return this;
			},
			//어떠한 요소끼리 위치를 바꾼다
			changeIndex:function(leftIndex,rightIndex){
				var left  = this[leftIndex];
				var right = this[rightIndex];
				this[leftIndex]  = right;
				this[rightIndex] = left;
			},
			// 리턴한 요소를 누적하여 차례로 전달함
			inject:function(firstValue,method) { for(var i = 0,l = this.length;i<l;i++) { var returnValue = method(this[i],firstValue,i); if(typeof returnValue !== "undefined") firstValue = returnValue; } return firstValue; },
			// 상속대상도 map의 결과는 이 모듈이여야 합니다.
			map:function(process)    { return new N.Array(N.map(this,process)); },
			setMap:function(process) { return N.arrayMap(this,process); },
			// index가 maxIndex한계값이 넘으면 index가 재귀되어 반환된다.
			turning:function(maxIndex,method){
				var NI = parseInt(maxIndex);
			   	var t  = function(cIndex) { if(cIndex < 0) { var abs = Math.abs(cIndex); cIndex = NI-(abs>NI?abs%NI:abs); }; return (NI > cIndex)?cIndex:cIndex%NI; };
				var ti = function(cIndex) { return { "turning" : t(cIndex), "group"   : Math.floor(cIndex/NI) } };
				for(var i = 0; i < this.length ; i++) { var tio = ti(i); method(this[i],tio.turning,tio.group,i); }
				return this;
			},
			// true를 반환하면 새 배열에 담아 리턴합니다.
			filter   : function(filterMethod) { 
				if(typeof filterMethod === "undefined") { filterMethod = function(a){ return typeof a === "undefined" ? false : true; }; } 
				if(typeof filterMethod === "function"){
					var result=[]; 
					this.each(function(v,i){ if(true==filterMethod(v,i)){ result.push(v); } });
					return new N.Array(result);
				}
				return new N.Array();
			},
			setFilter      : function(filterMethod) { return this.setSource(this.filter(filterMethod)); },
			// undefined요소를 제거한다.
			compact : function(){ return this.filter(function(a){ return a == undefined ? false : true; }); },
			setCompact    : function(){ return this.setSource(this.compact());},
			// time // 오버라이팅
			timesmap : function(time,method,start,end){
				var _ = this;
				var length = _.length;
				var result = this.clone();
				var timef  = (typeof method === 'function') ? method : function(){return method;}
	
				N.times(time,function(i){
					if( length <= i ) result.push( timef(_[i],i) ); else result[i] = timef(_[i],i);
				},start,end);
	
				return result;
			},
			setTimesmap:function(time,method,start,end){ return this.setSource(this.timesmap(time,method,start,end)); },
			// 파라메터 함수가 모두 true이면 true입니다.
			isAll:function(passMethod) { for(var i=0,l=this.length;i<l;i++) if(passMethod(this[i],i) != true) return false; return true; },
			// 하나라도 참이면 true입니다
			isAny:function(passMethod) { for(var i=0,l=this.length;i<l;i++) if(passMethod(this[i],i) == true) return true; return false; },
			//substr처럼 array를 자른다.
			subarray:function(fi,li,infinity){
				fi = isNaN(fi) == true ? 0 : parseInt(fi);
				li = isNaN(li) == true ? 0 : parseInt(li);
				var nl,ns,result = new N.Array();
				if (fi > li) {
					nl = fi;
					ns = li;
				} else {
					nl = li;
					ns = fi;
				}
				//제한
				if(infinity !== true){
					nl = nl < this.length ? nl : this.length;
					ns = ns > 0 ? ns : 0;
				}
				for(var i=ns,l=nl;i<l;i++) result.push(this[i]);
				return result;
			},
			setSubarray:function() { return this.setSource(this.subarray.apply(this,arguments));},
			subarr:function(fi,li) { return this.subarray(fi,li ? li + fi : this.length); },
			setSubarr:function(fi,li){return this.setSource(this.subarr(fi,li));},
			//해당되는 인덱스를 제거
			drop:function(index){ index=index?index:0;return this.subarray(index).concat(this.subarr(index+1)); },
			setDrop:function(index) { return this.setSource(this.drop(index)); },
			// 인수와 같은 요소를 제거한다.
			getRemove:function(target) { return this.filter(function(t){ if(t == target) return false; return true; }); },
			remove:function(target) { return this.setSource(this.getRemove(target)); },
			// 요소중의 중복된 값을 지운다.
			unique:function(){var result=new N.Array();this.each(function(selfObject){if(result.isAll(function(target){return selfObject!=target;}))result.push(selfObject);});return result;},
			setUnique:function(){return this.setSource(this.unique());},
			// 인수가 요소안에 갖고있다면 true가 반환
			has : function(h) { return this.isAny(function(o) { return o == h; }); },
			// index위치에 있는 요소를 얻어온다.
			eq:function(index,length){if(isNaN(length))length=1;return this.subarr(index,length);},
			// 요소중 처음으로 일치하는 index를 반환한다.
			indexOf:function(target){var result=-1;this.each(function(t,i){if(t==target){result=i;return false;}});return result;},
			lastIndexOf:function(target){var result=-1;this.reverseEach(function(t,i){if(t==target){result=i;return false;}});return result;},
			//todo
			nthIndexOf:function(nth,target){
		
			},
			// 첫번째부터 참인 오브젝트만 반환합니다. //마지막부터 참인
			firstMatch:function(matchMethod){var result;this.each(function(value,index){if(matchMethod(value,index)==true){result=value;return false;}});return result;},
			lastMatch:function(matchMethod){var result;this.reverseEach(function(value,index){if(matchMethod(value,index)==true){result=value;return false;}});return result;},
			//todo
			nthMatch:function(nth,value,index){
		
			},
			//요소안의 string까지 split하여 flaatten을 실행
			stringFlatten:function(){ return this.save().setMap(function(t){ if(typeof t === "string") return t.split(" "); if(CORE.TYPEOF.LIKEARRAY(t)) return new N.Array(t).setFlatten().setFilter(function(v){ return N.is(v,"string")}); }).remove(undefined).setFlatten(); },
			setStringFlatten:function(){ return this.setSource( this.stringFlatten() ); },
			sliceGroup:function(){
				var progressIndex = 0;
				var array  = Array.prototype.slice.call(this);
				var result = new N.Array();
				N.each(N.filter(N.argumentsFlatten(arguments),function(n){return typeof n === "number" && n > 0;}),function(i){
					if(!array.length){
						return false;
					}
					result.push(array.splice(0,i));
				});
				array.length && result.push(array);
				return result;
			},
			setSliceGroup:function(){
				this.setSource(this.sliceGroup.apply(this,Array.prototype.slice.call(arguments)));
			},
			//그룹 지어줌
			groups:function(length,reverse){
				var result=[];
				if(reverse == true){
					this.save().reverse().turning(length,function(obj,i,g){if(!result[g])result[g]=[];result[g].push(obj);});
					return new N.Array(result).setMap( function(groups){ return new N.Array(groups).reverse().toArray(); } ).reverse();
				}
				this.turning(length,function(obj,i,g){if(!result[g])result[g]=[];result[g].push(obj);});
				return new N.Array(result);
			},
			setGroups:function(length,reverse){ return this.setSource(this.groups(length,reverse)); },
			//랜덤으로 내용을 뽑아줌
			random:function(length){ return new N.Array(N.attract(this.toArray())); },
			shuffle:function(){ return new N.Array(N.dataShuffle(this.toArray())); },
			setShuffle:function(){ return this.setSource(this.shuffle()); },
			join:function(t,p,s){ return (N.likeString(p)?p:"")+Array.prototype.join.call(this,t)+((N.likeString(s))?s:""); },
			//Object로 반환
			keyPair:function(key,value){
				if (!N.likeString(key)) key = "key";
				if (!N.likeString(value)) value = "value";
				var r = {};
				this.each(function(data){
					if(typeof data === "object" || typeof data === "function"){
						if(key in data){
							r[data[key]] = data[value];
							return r;
						}
					}
				});
				return r;
			}
		});
	
		//******************
		N.MODULE("HashSource",{
			setSource:function(obj,k){ 
				obj = N.asObject(obj,k);
				if(typeof obj === "object"){ 
					for(var key in this.Source) delete this.Source[key]; 
					for(var k in obj) this.Source[k] = obj[k]; 
				} 
				return this; 
			},
			keys:function(rule,keys){ return N.propKey(this.Source,rule,keys); },
			values:function(){ 
				var result = [];
				if(arguments.length){
					for(var i=0,l=arguments.length;i<l;i++){
						if(typeof arguments[i] === "function") {
							return arguments[i].apply(undefined,result);
						} else {
							result.push(this.Source[arguments[i]]);
						}
					}
				} else {
					for (key in this.Source) result.push(this.Source[key]);
				}
				return result;
			},
			each:function(f){ for(key in this.Source){ var r = f(this.Source[key],key); if(typeof r == false) {break;} } return this; },
			reverseEach:function(method){ var keys = this.keys(); for ( var i = keys.length - 1 ; i > -1 ; i--) { if( method(keys[i],i) == false ) break; } return this; },
			callback:function(f){
				if(typeof f === "function") this.call(this,this.Source);
			},
			count:function(){return N.propLength(this.Source); },
			clone:function(){return CORE.CLONE(this.Source); },
			save:function() {return this.__NativeInitializer__(CORE.CLONE(this.Source)); },
			//key value get setter
			pushKeyValue:function(){
				for(var i=0,l=Math.ceil(arguments.length/2);i<l;i++){
					this.Source[arguments[i*2]] = arguments[i*2+1];
				}
				return this;
			},
			//존재하지 않는 키
			safePushKeyValue:function(){
				for(var i=0,l=Math.ceil(arguments.length/2);i<l;i++){
					var key = this.Source[arguments[i*2]];
					if(key in this.Source) this.Source[key] = arguments[i*2+1];
				}
				return this;
			},
			hasProp:function(key){
				if(arguments.length === 0){
					for(var sk in this.Source) return true; return false;
				}
				return key in this.Source;
			},
			prop:function(k,filter){
				if(arguments.length === 0){
					return this.Source;
				} else {
					if(typeof k === "string"){
						return (typeof filter === "function") ? filter.call(this,this.Source[k],(k in this.Source)) : this.Source[k];
					} else {
						var _self = this;
						if(typeof filter === "function") {
							return N.map(k,function(key){ return filter.call(_self,_self.Source[key],(key in _self.Source)); });
						} else {
							return N.map(k,function(key){ return _self.Source[key]; });
						}
					}
				}
			},
			setProp:function(k,v){
				if(arguments.length < 2){
					console.warn('arguments length must be gt 2');
				} else if(typeof k === "string") {
					this.Source[k] = v;
				} else if(typeof k === "object") {
					for(var kk in key) this.setProp(kk,key[kk]);
				} 
				return this;
			},
			//키값판별
			propIs    :function(key,test,t,f) { return N.is(this.Source[key],test,t,f); },
			propLike  :function(key,test,t,f) { return N.like(this.Source[key],test,t,f); },
			//오브젝트에 키를 가지고 있는지 확인
			has:function(key,value){ 
				return (arguments.length === 2) ? (key in this.Source) ? (this.Source[key] === value) : false : (key in this.Source);
			},
			//그러한 value가 존재하는지 확인
			hasValue:function(value){
				var result = false;
				this.each(function(v,k){ if(value == v){ result = true; return false; } });
				return result;
				return key in this.Source; 
			},
			//배열기반 키벨류 관리
			hasDataProp:function(keyName){
				return (this.Source[keyName] instanceof N.Array);
			},
			touchDataProp:function(keyName){
				if(typeof keyName === "string"){
					//arrayModule
					if(!this.hasDataProp(keyName)) this.Source[keyName] = new N.Array(this.Source[keyName]);
					return this.Source[keyName];
				} else {
					console.warn('Manage::touchDataProp parameter is must be string',keyName);
				}
			},
			defineDataProp:function(){
				var args = N.argumentsFlatten(arguments);
				for(var i=0,l=args.length;i<l;i++) this.touchDataProp(args[i]);
				return this;
			},
			dataProp:function(k,filter){
				var data = this.touchDataProp(k,false);
				return (typeof filter === "function") ? data.map(filter) : data;
			},
			pushDataProp:function(k,v,unique){
				if(arguments.length < 2) return console.warn("pushDataProp is must be length gt 1");
				var trackSource = this.touchDataProp(k);
				unique == true ? N.addOf.BOOST(trackSource,v) : N.pushOf.BOOST(trackSource,v);
				return this
			},
			extend:function(o){ N.extend(this.Source,o); return this; },
			marge:function(o){ return N.marge(this.Source,o); },
			extendOf:function(o){ N.extendOf(this.Source,o); return this; },
			margeOf:function(o){ return N.margeOf(this.Source,o); },
			//.arrangementObjectsDataProp({a:2,b:3,c:4},{b:4,d:4},{a:1,d:5})
			//"{"a":[2,null,1],"b":[3,4,null],"c":[4,null,null],"d":[null,4,5]}"
			arrangementObjectsDataProp:function(data){
				
				var arrangementKeys = this.keys();
				var args  = Array.prototype.slice.call(arguments);
				var _self = this;
				for(var i=0,l=arguments.length;i<l;i++){
					if(typeof args[i] === "object"){
						var keys = Object.keys(args[i]);
						for(var ki=0,l=keys.length;ki<l;ki++) if(!N.has(arrangementKeys,keys[ki])) {
							arrangementKeys.push(keys[ki]);
						}
					}
				}
				
				for(var i=0,l=args.length;i<l;i++){
					N.each(arrangementKeys,function(key){
						_self.pushDataProp(key,args[i][key]);
					});
				}
				
				return this;
			},
			setDataPropFix:function(){
				for(var key in this.Source) if(N.isModule(this.Source[key],"Array")) this.Source[key] = this.Source[key].toArray();
				return this;
			},
			getDataPropFix:function(){
				var cloneSource = {};
				for(var key in this.Source) {
					if(N.isModule(this.Source[key],"Array")){
						cloneSource[key] = this.Source[key].toArray();
					}  else {
						cloneSource[key] = this.Source[key];
					}
				}
				return cloneSource;
			},
			//map
			map:function(f,ksel){ 
				if(typeof f === "function"){
					var result = CORE.CLONE(this.Source),keys = this.keys(ksel,true);
					for(var i=0,l=keys.length;i<l;i++) result[keys[i]] = f(this.Source[keys[i]],keys[i]);
					return result; 
				}
			},
			setMap:function(f,ksel){ 
				if(typeof f === "function"){
					var keys = this.keys(ksel,true);
					for(var i=0,l=keys.length;i<l;i++) this.Source[keys[i]] = f.call(this,this.Source[keys[i]],keys[i]);
					return this;
				}
			},
			inject:function(o,f,ksel){ if(typeof f === "function") { this.map(function(v,k){ var or = f(v,o,k); if(typeof or !== "undefined") { o=or; } },ksel); return o; } },
			join:function(a,b){ a = typeof a === "string" ? a : ":"; b = typeof b === "string" ? b : ","; return this.inject([],function(v,i,k){ i.push(k+a+N.toString(v)); }).join(b); },			
			toParameter : function(useEncode){ return this.inject({},function(val,inj,key){ inj[ (useEncode == false ? key : (new N.StringSource(key)).encode()) ] = (useEncode == false ? val : (new N.StringSource(val)).encode()); }); },
			stringify:function(){ return JSON.stringify(this.getDataPropFix()); },
			toString:function(){ return JSON.stringify(this.getDataPropFix()); },
			change:function(original, change){
				//change key name
				N.propChange(this.Source,original,change); 
				return this.Source;
			},
			//오브젝트의 키를 지우고자 할때
			removeAll:function(){ for( var key in this.Source ) delete this.Source[key]; return this.Source; },
			getRemove:function(){ 
				var source = this.Source; 
				var keys = N.flatten(arguments);
				for(var i=0,l=keys.length;i<l;i++){
					if(typeof keys[i] === "string"){
						delete source[keys[i]];
					}
				}
				return this.Source; 
			},
			remove:function(key){ delete this.Source[key]; return this; },
			//다른 오브젝트와 함칠때
			concat:function(){ 
				var result = this.clone(); 
				for(var i=0,l=arguments.length;i<l;i++){ 
					new N.HashSource(arguments[i]).each(function(v,k){ result[k] = v; });
				}; 
				return result; 
			},
			setConcat:function(){ 
				this.setSource(this.concat.apply(this,arguments)); 
				return this; 
			},
			//다른 오브젝트와 함칠때 이미 있는 값은 오버라이드 하지 않음
			safeConcat:function(){ 
				var result = this.clone(); 
				for(var i=0,l=arguments.length;i<l;i++){ 
					new N.HashSource(arguments[i]).each(function(v,k){ 
						if( (k in result) == false) result[k] = v; 
					});
				} 
				return result; 
			},
			setSafeConcat:function(){ 
				this.setSource(this.getSafeConcat.apply(this,arguments)); return this; 
			}
		}, function(p,n,s){
			if(typeof s === "string"){
				this.Source = {};
				this[s].apply(this,new N.Array(arguments).setSubarr(0,2).toArray());
			} else {
				this.Source = N.asObject(p,n);
			}
		}, function(k){
			this.setDataPropFix();
			return (arguments.length == 0) ? this.Source : this.Source[k];
		});
	
		//******************
		//String
		var htmlSafeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': '&quot;', "'": '&#39;', "/": '&#x2F;' };
		
		N.MODULE("StringSource",{
			encode:function(){ return encodeURI(this.Source); },
			decode:function(){ return decodeURI(this.Source); },
			setEncode:function(){this.Source = this.encode();return this;},
			setDecode:function(){this.Source = this.decode();return this;},
			raw:function(){return this.Source},
			HTMLSafe:function(){
				return (new String(this.Source)).replace(/[&<>"'\/]/g, function (s) { return htmlSafeMap[s]; });
			},
			byteSize:function(){ return N.byteSize(this.Source); },
			lines:function(){ return Array.split(this.Source,"\n").toArray(); },
			lineEach:function(f,j){ if(typeof f === "function") return new N.Array(this.lines()).setMap(function(s,i){ return f(s,i); }).setCompact().join( (j?j:"\n") ); },
			//한줄의 탭사이즈를 구함
			tabSize:function(){
				var tabInfo = /^([\s\t]*)(.*)/.exec(this.Source);
				var tab   = tabInfo[1].replace(/[^\t]*/g,"").length;
				var space = tabInfo[1].replace(/[^\s]*/g,"").length - tab;
				return tab + Math.floor(space / 4);
			},
			//한줄의 탭을 정렬함
			tabAbsolute:function(tabSize,tabString){
				tabSize = N.toNumber(tabSize);
				if(arguments.length < 2) tabString = "\t";
				if(tabSize < 0) tabSize = 0;
				var result = "";
				for(var i = 0; i < tabSize; i++) result += tabString;
				return result + /^([\s\t]*)(.*)/.exec(this.Source)[2];
			},
			//각각의 탭음 밀어냄
			tabsOffset:function(offset,tabString){
				offset = parseInt(offset);
				if(typeof offset === "number") return N.Array.split(this.Source,"\n").setMap(function(text){
					return (new N.StringSource(text)).tabAbsolute((new N.StringSource(text)).tabSize() + offset,tabString);
				}).join("\n");
				return this.Source;
			},
			//라인중
			tabsSize:function(){
				var minimum;
				this.lineEach(function(line){
					var tabSize = (new N.StringSource(line)).tabSize();
					if((minimum == undefined) || (tabSize < minimum)) minimum = tabSize;
				});
				return minimum;
			},
			tabsAlign:function(){
				var beforeSize;
				var baseOffset = 0;
				return this.lineEach(function(line){
					//console.log("baseOffset",baseOffset);
					var tabSize = (new N.StringSource(line)).tabSize();
					//console.log(tabSize,beforeSize);
					if(beforeSize == undefined){
						beforeSize = 0;
						return line;
					} else if(tabSize > beforeSize){
						baseOffset++;
					} else if(tabSize < beforeSize){
						baseOffset--;
					} else {
						//nothing is right
					}
					beforeSize = tabSize;
					return (new N.StringSource(line)).tabAbsolute(baseOffset);
				});
			},
			setTabsAlign:function(){ this.Source = this.tabsAlign(); return this; },
			trimLine:function(){ return this.lineEach(function(line){ var trimText = line.trim(); return (trimText == "") ? undefined : line; }); },
			setTrimLine:function(){ this.Source = this.trimLine(); return this; },
			trim:function(){
				return this.Source.trim();
			},
			setTrim:function(){
				this.Source = this.trim();
				return this;
			},
			//content
			abilityFunction  : function(fs,is,js){ 
				var origin = (js==true) ? N.safeSplit(this.Source,fs,["{}","[]",'""',"''"]) : this.Source.trim().split(fs); 
				if(origin[origin.length-1].trim()=="") origin.length = origin.length-1;  
				
				return new N.Array(origin).isAll(function(s,i){ return s.indexOf(is) > 0; }) ? origin.length : 0; },
			abilityObject    : function(){ return this.abilityFunction(",",":",true); },
			abilityParameter : function(){ return this.abilityFunction("&","="); },
			abilityCss       : function(){ return this.abilityFunction(";",":"); },
			isDataContent:function(absoluteWrap){
				var o = this.abilityObject();
				var c = this.abilityCss();
				var p = this.abilityParameter();
				if(N.isWrap(this.Source,"[]")) return "array";
				if(absoluteWrap == true) if(N.isWrap(this.Source,"''",'""') == true) return "plain";
				if( (absoluteWrap == true && N.isWrap(this.Source,"{}")) || (o > 0 && o >= c && o >= p) ){
					return "object";
				} 
				if(p > 0) {
					//태그일수도 있으니 확인
					if( /^<\w+/i.test(this.Source) && /\w+>$/i.test(this.Source) ) return "plain";
					return "parameter";
				}
				if(o > 0) return "css";
				return "plain";
			},
			getDataContentWithPattrn:function(fs,is,js){
				return new N.Array( (js==true) ? N.safeSplit(this.Source,fs,["{}","[]",'""',"''"]) : this.Source.trim().split(fs) ).inject({},function(s,inj){
					var v = s.substr(s.indexOf(is)+1);
					if(s.trim().length > 0) inj[ N.unwrap(s.substr(0,s.indexOf(is)),['""',"''"]) ] = N.unwrap((js == true) ? (new N.StringSource(v)).getContentObject(true) : v,['""',"''"]);
					return inj;
				});
			},
			getContentObject:function(absoluteWrap){
				switch(this.isDataContent(absoluteWrap)){
					case "object"       : return this.getDataContentWithPattrn(",",":",true); break;
					case "parameter"    : return this.getDataContentWithPattrn("&","="); break;
					case "css"          : return this.getDataContentWithPattrn(";",":"); break;
					case "array"        :
						var a = N.safeSplit(this.Source,",",["{}","[]",'""',"''"]);
						if(a == ""){
							return [];
						} else {
							return new N.Array(a).inject([],function(s,inj){
								inj.push(N.unwrap( (new N.StringSource(s)).getContentObject(true) , ["''",'""'] )); 
								return inj; 
							});
						}
						break;
					case "plain" : 
						if(!isNaN(this.Source) && this.Source !== ""){
							return this.Source.indexOf("0x")==0 ? parseInt(this.Source,16) : parseFloat(this.Source);
						} else {
							return this.Source;
						}
					break;
				};
			},
			JSON:function(){ return JSON.stringify(this.getContentObject());},
			//reverse
			reverse : function() { return this.Source.split("").reverse().join(""); },
			setReverse    : function()   { this.Source = this.reverse(); return this; },
			//remove
			getRemove:function(target){
				var index = this.Source.indexOf(target);
				if(index < 0)return this.Source;
				var targetLength = target.length;
				return this.Source.substr(0,index) + this.Source.substr(index + targetLength,this.Source.length);
			},
			remove:function(target){
				this.Source = this.getRemove(target);
				return this;
			},
			//model
			removeToken:function(target,space){
				//model split
				space = space ? space : " ";
				var models = this.Source.split(space);
				var result = [];
				if(typeof target === "string") target = new RegExp(
					"("+ target.replace(new RegExp(space+"+","g"),"|")  + ")","g");
				if(target instanceof RegExp) 
					for (var i=0,l=models.length;i<l;i++) 
						if(target.test(models[i]) == false) 
							result.push(models[i]);
				return result.join(space);
			},
			setRemoveToken:function(target,space){
				this.Source = this.removeToken(target,space);
				return this;
			},
			hasToken:function(target,space){
				space = space ? space : " ";
				var models = this.Source.split(space);
				for (var i=0,l=models.length;i<l;i++) if(models[i] == target)  return true;
				return false;
			},
			addToken:function(target,space) { space = space ? space : " ";if(this.hasToken(target,space)) return this.Source; return this.Source + space + target; },
			setAddModel:function(target,space){
				this.Source = this.addToken(target,space);
				return this;
			},
			//prefix suffix
			fixString:function(p,s){ return (typeof p === "string"?p:"") + this.Source + (typeof s === "string"?s:""); }
		},function(param,jsonfy){
			if( typeof param === "undefined" || param == null ){
				this.Source = ""
			} else {
				this.Source = N.toString(param,10,jsonfy);
			}
			return this;
		});
		
	}(nd,nd.CORE));
	
}());