/* 
 * ndkit.webkit.js (https://github.com/labeldock/ndkit)
 * Copyright HOJUNG-AHN. and other contributors
 * Released under the MIT license
 */
nd && nd.PLUGIN(function(N,CORE){
	
	N.VERSION += ", interactive(0.0 alpah pre)", N.BUILD += ", interactive(1)";
	
	N.MODULE("Binder",{
		shouldSendValueToListenersInfo:function(listeners,setValue,dataName){
			var beforeValue = this.beforeProperty.prop(dataName);
			//set send
			this.protectProperty.add(dataName);
			(new N.Array(listeners)).each(function(listenInfo){
				listenInfo.proc.call(listenInfo.listener,setValue,beforeValue,listenInfo.mutableKey);
			});
			this.beforeProperty.setProp(dataName,setValue);
			this.protectProperty.remove(dataName);
		},
		getListenInfo:function(listener,propertyName){
			if(!listener) return this.Source.get();
			var propertyName = (typeof propertyName === "string")?propertyName:this.defaultKey;
			return this.Source.filter(function(listenInfo){
				return (listenInfo.listener === listener && listenInfo.propertyName === propertyName);
			});
		},
		send:function(sender,dataName,setValue,forceLevel,allowDuplicateSend){
			if(this.protectProperty.has(dataName)){
				this.trace && console.info(sender,"was make duplicate send (",dataName,") is still processing => ", setValue);
				return false;
			}
			//duplicate value sending protect
			var beforeValue = this.beforeProperty.prop(dataName);
			if(allowDuplicateSend !== true && setValue === beforeValue){
				this.trace && console.info(sender,"send is same from before value.");
				return false;
			}
			var sendTargets = this.Source.map(function(listenInfo){
				if(sender !== listenInfo.listener) {
					if(listenInfo.prefixListen === true){
						var prefixLength = listenInfo.propertyName.length;
						if(dataName.substr(0,prefixLength) === listenInfo.propertyName){
							listenInfo.mutableKey = dataName.substr(prefixLength);
							return listenInfo;
						}
					} else if(dataName === listenInfo.propertyName) {
						listenInfo.mutableKey = dataName;
						return listenInfo;
					}
				}
			}).remove(undefined);
			
			//allow inspect
			var allowProc    = true
			var forceLevel   = (typeof forceLevel === "number") ? forceLevel : 0;
			var _self        = this;
			sendTargets.each(function(listenInfo){
				if(listenInfo.allowProc){
					if( listenInfo.allowProc(setValue,beforeValue) === false ){
						if(listenInfo.protectLevel >= forceLevel) {
							//transaction
							_self.shouldSendValueToListenersInfo(_self.getListenInfo(sender,dataName),beforeValue,dataName);
							return allowProc = false;
						}
					}
				}
			});
			
			//set data
			if(allowProc === true) this.shouldSendValueToListenersInfo(sendTargets,setValue,dataName);
		},
		post:function(sender,dataName,setValue,forceLevel){
			this.send(sender,dataName,setValue,forceLevel,true);
		},
		listen:function(listener,propertyName,proc,allowProc,protectLevel,prefixListen){
			//value inspect
			if(!(typeof listener == "object" || typeof listener == "function") || typeof propertyName !== "string" || typeof proc !== "function"){
				return console.error("BindAdapter::listen arguments must be (listener,propertyName,proc)(object,string,fucntion)=>",arguments);
			}
			//duplicate listen & property inspect
			if(this.Source.isAny(function(listenInfo){
				return (listenInfo.listener === listener && listenInfo.propertyName === propertyName);
			})){
				return console.error("BindAdapter:: already set listener & property");
			}
			var listenInfo = {
				listener:listener,
				propertyName:propertyName,
				proc:proc,
				allowProc:allowProc,
				protectLevel:(typeof protectLevel === "number") ? protectLevel : 0,
				prefixListen:!!prefixListen,
				mutableKey:propertyName
			};
			this.Source.push(listenInfo);
			
			//beforeProperty set
			if(this.beforeProperty.has(propertyName)){
				this.shouldSendValueToListenersInfo(listenInfo,this.beforeProperty.prop(propertyName),propertyName);
			}
		},
		prefixListen:function(listener,propertyName,proc,allowProc,protectLevel){
			//value inspect
			if(typeof listener !== "object" || typeof propertyName !== "string" || typeof proc !== "function"){
				return console.error("BindAdapter::listen arguments must be (listener,propertyName,proc)(object,string,fucntion)=>",arguments);
			}
			this.listen(listener,propertyName,proc,allowProc,protectLevel,true);
		},
		selfSend:function(setValues,dataName,forceLevel){
			return this.send(this,propertyName,proc,allowProc,protectLevel);
		},
		selfListen:function(propertyName,proc,allowProc,protectLevel){
			return this.listen(this,propertyName,proc,allowProc,protectLevel);
		},
		prop:function(){
			return this.beforeProperty.prop.apply(this.beforeProperty,Array.prototype.slice.call(arguments));
		},
		setProp:function(){
			return this.beforeProperty.setProp.apply(this.beforeProperty,Array.prototype.slice.call(arguments));
		},
		inspect:function(allowProc,propertyName,protectLevel){
			var propertyName = (typeof propertyName === "string")?propertyName:this.defaultKey;
			if(typeof allowProc !== "function"){
				return console.error("BindAdapter::inspect arguments must be (inspectProc,propertyName)(string,fucntion)");
			}
			this.listen(this,propertyName,function(){},allowProc,protectLevel);
		},
		bindNode:function(node,propertyName,propFilter){
			var listener = N.find(node,0);
			if(listener) {
				var propertyName = (typeof propertyName === "string")?propertyName:this.defaultKey;
				//send node
				switch(listener.tagName.toLowerCase()){
					case "input" : case "select":
						var binder = this;
						N.node.on(listener,"keyup",function(e) {
							binder.send(listener,propertyName,N.node.value(listener));
						});
					default: /*readOnly*/ break;
				};
				//listen node
				this.listen(listener,propertyName,function(value){
					if(typeof propFilter === "function"){ 
						value = propFilter(value);
						if(typeof value === "object" && listener.tagName !== "input"){
							var nodes = N.find(value);
							if(nodes.length) return N.node.put(listener,nodes);
						}
					}
					N.node.value(listener,value);
				});
			}
		},
		getListener:function(){
			return this.Source.map(function(listenInfo){ return listenInfo.listener }).setUnique();
		},
		getListenerByKey:function(key){
			return this.Source.filter(function(listenInfo){ 
				return listenInfo.propertyName === key;
			}).setUnique();
		},
		getProperties:function(){
			return this.Source.map(function(listenInfo){ return listenInfo.propertyName }).setUnique();
		},
		removeListener:function(listener){
			this.Source.setFilter(function(listenInfo){
				return (listenInfo.listener === listener) ? false : true;
			});
		},
		removeListenerWithNode:function(nodeListener){
			var _self = this;
			_self.Source.setFilter(function(listenInfo){
				var filterTarget = true;
				N.find(nodeListener,N.each,function(rootNode){
					N.find("*",rootNode,N.each,function(node){
						if(listenInfo.listener === node){
							filterTarget = false;
							return false;
						}
					});
				});
				return filterTarget;
			});
		},
		removeListen:function(listener,propertyName){
			this.Source.setFilter(function(listenInfo){
				return (listenInfo.listener === listener && listenInfo.propertyName === propertyName) ? false : true;
			});
		},
		removeProperty:function(propertyName){
			this.Source.setFilter(function(listenInfo){
				return (listenInfo.propertyName === propertyName) ? false : true;
			});
		}
	},function(defaultData,defaultKey,trace){ 
		//console trace
		this.trace           = trace;
		this.Source          = new N.Array();
		this.defaultKey      = (typeof defaultKey === "string") ? defaultKey : "default"
		//dobule set protect
		this.protectProperty = new N.Array();
		if(!N.isNil(defaultData) && typeof defaultData !== "object"){
			var redefine = {};
			redefine[this.defaultKey] = defaultData;
			defaultData = redefine;
		}
		this.beforeProperty  = new N.HashSource(defaultData);
		// { listener:Object , listen:"name" ,proc: }
	});
	
	N.MODULE("Request",{
		relativeSend:function(url,param,callback,method){
			var _self=this;
			var sender=new (function(){
				//url
				this.url       = _self.defaultURL + url;
				//method
				this.method    = method && _self.option.prop("method") || "GET";
				if (typeof this.method === "string"){
					this.method = this.method.toUpperCase();
				} else {
					console.warn("Requst::send => method is must be string", this.method);
					this.method = "GET";
				}
				//parameter
				var parameterSource = (new N.HashSource(_self.option.prop("parameter"))).extend(param);
				this.parameter       = parameterSource.get();
				this.parameterString = parameterSource.join("=","&");
				//callback
				this.callback  = (typeof callback === "function") ? callback : _self.option.prop("callback");
				
				this.asynchronous = (typeof _self.option.prop("asynchronous") === "boolean") ? _self.option.prop("asynchronous") : true;
				//TODO: 적합성 판정이 필요함
				_self.option.each(function(value,key){
					switch(key){ 
						case "url":case "parameter":case "parameterString":case "method":case "callback":case "asynchronous":break;
						default:this[key] = value;
					}
				});
				
				this.onreadystatechange = function(){
					this.callback.apply(this,Array.prototype.slice.call(arguments));
				}
			})();
			
			if( !("callback" in sender) ) return console.error("Request :: callback is undefined. this must exsist");
			
			//request Object만들기
			var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : 
								window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : 
								(function () { console.error("XMLHTTPRequest를 지원하지 않는 브라우져입니다"); }());					
			if (!xhr) return;
			
			xhr.onreadystatechange = function(){ 
				switch(xhr.readyState){
					case 1: 
						if(sender.debug) console.info("Request::("+sender.url+")server connection established");
						break;
					case 2: 
						if(sender.debug) console.info("Request::("+sender.url+")request recived");
						break;
					case 3: 
						if(sender.debug) console.info("Request::("+sender.url+")processing request");
						break;
					case 4:
						if(xhr.status < 400){
							if(sender.debug === "true"){
				 				var debugObject = {
				 					method:sender.method,
				 					url:sender.url,
				 					param:sender.parameter
				 				};
				 				console.info("Request::Success:: [\n - method => "
				 							,debugObject.method
				 							,"\n - url    => "
				 							,debugObject.url
				 							,"\n - param  => "
				 							,N.tos(debugObject.param)
				 							,"\n]\n:::result==> "
				 							,N.max(N.tos(debugObject.data),debugObject.dataTraceMax)
				 							,"\n\n"
				 						);
				 				return debugObject;
							}
						} else {
							console.error("Request::load : '"+ sender.url +"' 호출이 실패되었습니다. JSON 파라메터와 에러코드를 출력합니다. ==> \n------\n" ,N.tos(sender) ,"\n------\n", xhr.textError)
							if(xhr.status<500){
								//4xx error
								console.warn("Request::send::error => ["+xhr.status+"] page not found",sender.url);
							}else if(xhr.status<600){
								//5xx error
								console.warn("Request::send::error => ["+xhr.status+"] internal server error",sender.url);
							} else {
								//etc error
								console.warn("Request::send::error => ["+xhr.status+"] error",sender.url);
							}
						}
						sender.onreadystatechange(xhr.responseText,/^(2\d\d|3\d\d|0)$/.test(xhr.status),xhr.status,sender,xhr);
					break;
				}
			};
			
			CORE.TRY_CATCH(function(){
				switch(sender.method){
					case "GET":
						var parameterText = (sender.parameterString.length ? sender.parameterString : "?" + sender.parameterString);
						xhr.open("GET", sender.url + parameterText, typeof sender.asynchronous === "boolean" ? sender.asynchronous : true);
						xhr.send();
						break;
					case "POST":
					default:
						if(!this.sender.method.length){
							return console.error("Requst::send => method name is worng", sender.method);
						}
						xhr.open("POST", this.url, typeof sender.asynchronous === "boolean" ? sender.asynchronous : true );
						CORE.TRY_CATCH(
							function(){
								xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
								xhr.setRequestHeader('Content-type'    , 'application/x-www-form-urlencoded');
							},function(){
								console.warn("XMLHttpRequest:: setRequestHeader를 지원하지 않는 브라우져입니다");
								throw e;
							}
						);
						xhr.send( requestString );
						break;
				}
			},function(e){
				if(e.message.indexOf("denied") > 0){
					throw new Error("Cross Domain Error (if current browser is IE)");
				} else {
					throw e;
				}
			},this);
			
			return sender;
		},
		send:function(param,callback,method){
			if(typeof this.defaultURL !== "string"){
				return console.error("Requst::send => not exesist request url");
			}
			return this.relativeSend("",param,callback);
		},
	},function(url,option){
		//option
		//parameter => default parameter
		//callback  => default callbck
		//method    => default callbck
		this.defaultURL = url;
		this.option = new N.HashSource(typeof option === "boolean" ? {asynchronous:option} : option);
	});
	
	N.METHOD("load",function(url){
		var responseText;
		return (new nd.Request("",{asynchronous:false})).relativeSend(url,null,function(text,success,status){ 
			responseText = success ? text : "";
		}), responseText;
	});
	
	N.METHOD("loadNodes",function(url,all){
		var preg = document.createElement("div");
		preg.innerHTML = N.load(url);
		return all === true ? N.toArray(preg.children) : N.filter(preg.children,function(node){
			return !/^(script|link|title|meta)$/i.test(node.tagName);
		});
	});
	
	
	N.METHOD("open",function(url,option){
		if(typeof option === "function") option = {success:option};
		//success option
		var option = N.HashSource({
			"callback":function(responseText,status,sender,xhr){
				if(status < 400){
					var successResult;
					switch(sender.contentType){
						case "json": case "object":
							CORE.TRY_CATCH(function(){
								successResult = JSON.parse(responseText);
							},function(e){
								console.error("open::wrong json format. =>",responseText,xhr);
								throw e;
							});
							break;
						case "dom": case "node":
							successResult = N.parseHTML(responseText);
							break;
						case "http": case "html": case "js": case "javascript": case "css": case "stylesheets": default :
							successResult = responseText
							break;
					}
					if(typeof sender.success !== "function") return console.error("open:: must 'success' exsist as function =>",option);
					sender.success(successResult,sender,xhr);
					(typeof sender.final === "function") && sender.final(finalResult,sender,xhr);
				} else {
					var finalResult;
					if(sender.error) {
						finalResult = requestObject.statusText;
						sender.error(requestObject.statusText,sender,xhr);
					}
					(typeof sender.final === "function") && sender.final(finalResult,sender,xhr);
				}
			}
		}).marge(option)
		return (new N.Request(url,option)).send();
	});
	
	N.MODULE("Timeline",{
		updateFix:function(){
			var se = this.Status.values("timeStart","timeEnd");
			if(se[0] > this._tick){
				this._tick = se[0];
			}
			if(se[1] < this._tick){
				this._tick = se[1];
			}
		},
		append:function(){
			var _self = this;
			N.dataFlatten(arguments,N.each,function(pushProperties,i){
				if( N.isModule(pushProperties,"TimeProperties") ){
					_self.Source.add(pushProperties);
				
					var ts = pushProperties.timeStart();
					var te = pushProperties.timeEnd();
				
					if(_self.Source.length === 1) {
						_self.Status.pushKeyValue("timeStart",ts,"timeEnd",te);
					} else if(_self.Source.length > 1) {
						var se = _self.Status.values("timeStart","timeEnd");
						if(se[0] > ts){
							_self.Status.pushKeyValue("timeStart",ts);
						}
						if(se[1] < te){
							_self.Status.pushKeyValue("timeEnd",te);
						}
					}
					_self.updateFix();
				}
			});
		},
		stop:function(){
			this._rate = 0;
			this._spot = null;
			if(this._wheel) this._wheel = clearInterval(this._wheel);
			return this;
		},
		move:function(timestamp,safeRate){
			//정방향일때와 아닐때
			var finished;
			if(this._rightDirection){
				var timeEnd = this.Status.get("timeEnd");
				if( timestamp > timeEnd ){
					this._tick = timeEnd;
					finished = true;
				}
			} else {
				var timeStart = this.Status.get("timeStart")
				if( timestamp < timeStart ){
					this._tick = timeStart;
					finished = true;
				}
			}
			if(finished === true){
				this.stop();
				this.EventListener.trigger("timeMove");
				this.EventListener.trigger("timeFinish");
			} else {
				this._tick = timestamp;
				this.EventListener.trigger("timeMove");
				N.CALL(this._onTimeMove,this._tick);
			}
		},
		offset:function(offset){
			this.move(this._tick + offset);
		},
		offsetExp:function(exp){
			this.move(this._tick + N.timescaleExp(exp));
		},
		//속도 1은 1초 양음수 가능
		rate:function(rate,toggle){
			if((toggle===true || toggle==="toggle") && this._rate!==0){
				return this.stop();
			}
			if(typeof rate !== "number") return console.error("Timeline::rate is must be number");
			if(this._wheel) clearInterval(this._wheel);
			if(rate !== 0) {
				var _timeline  = this;
				this._rate = rate;
				this._spot = (+new Date());
				this._rightDirection = (rate > 0);
				
				var wheelProc = function(){
					if(_timeline._rate === 0) return _timeline.stop();
					var newSpot   = (+new Date())
					var realScale = newSpot - _timeline._spot;
					var wheelSpot = _timeline._tick + (realScale * _timeline._rate);
					_timeline.move(wheelSpot,true);
					_timeline._spot = newSpot;
				}
				this._wheel = setInterval(wheelProc,this._interval);
				wheelProc();
			}
		},
		rateByTimescale:function(exp,toggle){
			return this.rate(N.timescaleExp(exp) / 1000,toggle);
		},
		timestamp:function(){
			return this._tick;
		},
		timescale:function(){
			return this.Status.values("timeEnd","timeStart",function(e,s){ return e-s; });
		},
		getTimeStart:function(){
			return this.Status.get("timeStart");
		},
		getTimeEnd:function(){
			return this.Status.get("timeEnd");
		},
		runTimescale:function(){
			if(this._rightDirection)
				return (this._tick - this.Status.get("timeStart"));
			return (this.Status.get("timeEnd") - this._tick);
		},
		restTimescale:function(){
			if(this._rightDirection)
				return (this.Status.get("timeEnd") - this._tick);
			return (this._tick - this.Status.get("timeStart"));
		},
		getCurrentData:function(){
			var currentTime = this._tick;
			return this.Source.map(function(timeProperties){
				return timeProperties.getPropWithTime(currentTime);
			});
		},
		getCurrentVectorData:function(){
			var currentTime = this._tick;
			return this.Source.map(function(timeProperties){
				return timeProperties.getVectorPropWithTime(currentTime);
			});
		},
		getTimeProperties:function(index){
			return (arguments.length) ? this.Source[index] : this.Source.clone();
		},
		getCurrentAttribute:function(index){
			if(arguments.length){
				return this.Source[index] && this.Source[index].Attribute;
			}
			return this.Source.map(function(timeProperties){
				return timeProperties.Attribute;
			});
		},
		progress:function(){
			return 100 - (100 / this.timescale()) * this.restTimescale();
		},
		restProgress:function(){
			return (100 / this.timescale()) * this.restTimescale();
		},
		setFPS:function(fps){
			this._fps      = (typeof fps === "number") ? fps : 30;
			this._interval = N.parseInt(1000 / this._fps);
		},
		clear:function(){
			this.Source = new N.Array();
			this.Status = new N.HashSource({
				timeStart:0,
				timeEnd  :0
			});
			this._tick  = 0;
			this._rate  = 0;
			this._wheel = null;
			this._rightDirection = true;
		}
	},function(fps){
		this.clear();
		if(typeof fps === "number") this.setFPS(fps);
		
		this.EventListener = new N.EventListener(this);
		this.EventListener.addEventRegister(["timeMove","timeFinish"]);
	});
	
	N.MODULE("TimeProperties",{
		insertTimeProperty:function(time,data){
			if(typeof time !== "number" || typeof data !== "object"){
				return console.error("addTimeProperty:: must be argument type (number, object)");
			} 
			var insertAt = 0, sourceLength = this.Source.length;
			this.Source.reverseEach(function(sourceProps,index){
				if(time > sourceProps.time){
					insertAt = index+1;
					return false;
				} 
			});
			this.Source.insert({
				time:time,
				props:data
			},insertAt);
			return this;
		},
		push:function(){
			var _self = this;
			N.dataFlatten(arguments,N.each,function(pushData){
				if(typeof pushData !== "object"){
					var alchemy = {};
					alchemy[_self.defaultKey] = pushData;
					pushData = alchemy;
				}
				var pushTime = _self.defaultStartTime + (_self.defaultInertval * _self.Source.length);
				_self.insertTimeProperty(pushTime,pushData);
			});
			return this;
		},
		getAroundPropWithTime:function(time){
			if(typeof time !== "number") console.error("getAroundPropWithTime:: arg must be number");
			if(!this.Source.length) return {};
			if(this.Source.length === 1 || this.Source.first().time > time) { return [this.Source[0].props,undefined,0]; }
			if(this.Source.last().time < time) { return [this.Source.last().props,undefined,0]; }
			
			//if length 2
			var selectSource,selectSourceIndex;
			
			this.Source.each(function(source,index){
				if(source.time > time){
					selectSourceIndex = index - 1;
					return false;
				}
			});
			
			selectSource = this.Source[selectSourceIndex];
			
			//select last prop
			if(!selectSource){
				selectSource      = this.Source.last();
				selectSourceIndex = this.Source.length - 1;
				var beforeSource = this.Source[selectSourceIndex-1];
				return [beforeSource.props,selectSource.props,(1/(selectSource.time - beforeSource.time)) * (time - beforeSource.time)];
			}
			//other
			var afterSource = this.Source[selectSourceIndex+1];
			return [selectSource.props,afterSource.props,(1/(afterSource.time - selectSource.time)) * (time - selectSource.time)];
			
		},
		getPropWithTime:function(time){
			var aroundData = this.getAroundPropWithTime(time);
			if(typeof aroundData[1] === "undefined"){
				return aroundData[0];
			} else {
				return (aroundData[2] < 0.5)?aroundData[0]:aroundData[1];
			}
		},
		getVectorPropWithTime:function(time){
			var aroundData = this.getAroundPropWithTime(time);
			if(typeof aroundData[1] === "undefined"){
				return this._gto,aroundData[0];
			} else {
				var dataProps = new N.HashSource();
				dataProps.arrangementObjectsDataProp(aroundData[0],aroundData[1]);
				return dataProps.setMap(function(arrange){
					var a0n = typeof arrange[0] === "number";
					var a1n = typeof arrange[1] === "number";
					if(a0n && a1n){
						return arrange[0] + ( (arrange[1] - arrange[0]) * aroundData[2] );
					} else if(a0n) {
						return arrange[0];
					} else if(a1n) {
						return arrange[1];
					} else {
						return arrange[0] && arrange[1];
					}
				}).get();
			}
		},
		timeStart:function(){
			var timeProps = this.Source.first();
			return timeProps ? timeProps.time : null;
		},
		timeEnd:function(){
			var timeProps = this.Source.last();
			return timeProps ? timeProps.time : null;
		},
		timeLength:function(){
			return this.Source.isNone() ? null :
					this.Source.isOne() ? 0 :
					this.timeStart() - this.timeEnd();
		},
		getPropWithIndex:function(index){
			var data = this.get(index);
			return data ? data["prop"] : undefined;
		},
		getTimeWithIndex:function(index){
			var data = this.get(index);
			return data ? data["time"] : undefined;
		}
	},function(attr,interval,startTime,defaultKey){
		this.Source    = new N.Array();
		this.Attribute = (new N.HashSource(attr)).get();
		this.defaultKey = (typeof defaultKey === "string") ? defaultKey : "value"
		this.defaultStartTime = startTime ? N.timestampExp(startTime): N.timestampExp();
		this.defaultInertval  = interval  ? N.timescaleExp(interval) : N.timescaleExp("2s");
	},function(index){
		return this.Source[index];
	});

	N.METHOD("workerOfLinearVector",function(x,y,epsilon){
		epsilon = (typeof epsilon === "number") ? epsilon : 1;
		var pointX = N.parseInt(x);
		var pointY = N.parseInt(y);
		if(pointX === pointY){ return function(){ return pointX; }; }
		return function(t){
			return pointX + (((pointY - pointX) / epsilon) * t);
		};
	});
	N.METHOD("workerOfCubicBezier",function(x1, y1, x2, y2, epsilon){
		epsilon = (typeof epsilon === "number") ? epsilon : 1;
		var curveX = function(t){
				var v = 1 - t;
				return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
			};

			var curveY = function(t){
				var v = 1 - t;
				return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
			};

			var derivativeCurveX = function(t){
				var v = 1 - t;
				return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
			};

			return function(t){

				var x = t, t0, t1, t2, x2, d2, i;

				for (t2 = x, i = 0; i < 8; i++){
					x2 = curveX(t2) - x;
					if (Math.abs(x2) < epsilon) return curveY(t2);
					d2 = derivativeCurveX(t2);
					if (Math.abs(d2) < 1e-6) break;
					t2 = t2 - x2 / d2;
				}

				t0 = 0, t1 = 1, t2 = x;

				if (t2 < t0) return curveY(t0);
				if (t2 > t1) return curveY(t1);

				while (t0 < t1){
					x2 = curveX(t2);
					if (Math.abs(x2 - x) < epsilon) return curveY(t2);
					if (x > x2) t0 = t2;
					else t1 = t2;
					t2 = (t1 - t0) * .5 + t0;
				}

				// Failure
				return curveY(t2);

			};
	});

	N.MODULE("Counter",{
		timeoutHandler:function(){
			if(this._timeout)clearTimeout(this._timeout);
			var now = (+(new Date()));
			if( this._moveEnd > now ) {
				this._countProcesser ?
					N.CALL(this._whenCounting,this,this._countProcesser(1-(this._moveEnd-now)/this.duration)) :
					N.CALL(this._whenCounting,this,1-(this._moveEnd-now)/this.duration);
				var _ = this;
				this._timeout = setTimeout(function(){ _.timeoutHandler.call(_) },this.rate);
			} else {
				this.moveStart = null;
				this.moveEnd   = null;
				N.CALL(this._whenCounting,this,1);
				N.CALL(this._whenCountFinish,this,1);
			}
		},
		whenCountStart :function(m){ this._whenCountStart = m; },
		whenCount      :function(m){ this._whenCounting = m; },
		whenCountFinish:function(m){ this._whenCountFinish = m; },
		setCountProcessor:function(m){
			if(typeof m === "function") this._countProcesser = m;
		},
		setRate:function(rate){
			this.rate = typeof rate === 'number' ? rate : 20;
		},
		start:function(ms,counting,finish){
			this.duration = typeof ms   === 'number' ? ms : 300;
			if(counting)this.whenCount(counting);
			if(finish)this.whenCountFinish(finish);
		
			var _ = this;
			this._moveStart = (+(new Date()));
			this._moveEnd   = this._moveStart + this.duration;
			this.timeoutHandler();
		}
	},function(ms,counting,finish,rate,now){
		this.setRate(rate);
		if(finish === true || ms === true || rate === true || now === true) { this.start(ms,counting,finish) }
	});
	
	N.MODULE("Gesture",function(gestureView,allowOuterMove,allowVitureTouch){
		this.view = N.findLite(gestureView)[0];
		
		if(!this.view) return console.error("Gesture::no find gestrue view");
		
		this.GestureListener = {};
		this._firstPinchValue;
		this._firstPageX;
		this._firstPageY;
		this._lastPageX;
		this._lastPageY;
		this.stopPropagation = true;
		this.preventDefault  = true;
		//touch event
		this.EventListener = new N.EventListener(this);
		this.EventListener.addEventRegister(["gesture","drag","throw","pinch"]);
		var EventListener = this.EventListener;
		var _self = this;
		var getPinchDistance = function(fx1,fy1,fx2,fy2){
			return Math.sqrt(
				Math.pow((fx1-fx2),2),
				Math.pow((fy1-fy2),2)
			);
		};
		this._gestureStartHandler = function(e){
			if(EventListener.hasListener()){
				var pageX = _self._firstPageX = _self._lastPageX = e.touches ? e.touches[0].pageX : e.pageX;
				var pageY = _self._firstPageY = _self._lastPageY = e.touches ? e.touches[0].pageY : e.pageY;
				
				_self._lastGesture = {
					e:e,
					pageX:pageX,
					pageY:pageY,
					relativeX:0,
					relativeY:0,
					moveX:0,
					moveY:0
				};
				
				if (EventListener.hasListener("pinch") && e.touches && e.touches.length === 2) {
					e.preventDefault();
					_self._firstPinchValue = getPinchDistance(
						 pageX,
						 pageY,
						 e.touches[1].pageX,
						 e.touches[1].pageY
					);
					_self._lastGesture.pinch = 1;
					EventListener.trigger("pinch",_self._lastGesture,"start");
				}
				EventListener.trigger("gesture",_self._lastGesture,"start");
				
				if(_self.stopPropagation===true)e.stopPropagation();
				if(_self.preventDefault===true) e.preventDefault();
			}
		}
	
		this._gestureMoveHandler = function(e){
			//TouchMoveX를 체크하는 이유는 시작한 터치무브가 존재하지 않을경우에는 작동되지 않음 (바깥쪽 이벤트가 Touch끼리 서로 섞이지 않게 하기 위함)
			if(EventListener.hasListener() && _self._firstPageX !== undefined){
				var pageX = e.touches ? e.touches[0].pageX : e.pageX;
				var pageY = e.touches ? e.touches[0].pageY : e.pageY;
				
				_self._lastGesture = {
					e:e,
					pageX:pageX,
					pageY:pageY,
					relativeX:pageX - _self._firstPageX,
					relativeY:pageY - _self._firstPageY,
					moveX:pageX - _self._lastPageX,
					moveY:pageY - _self._lastPageY
				}
				
				_self._lastPageX = pageX;
				_self._lastPageY = pageY;
				
				if (EventListener.hasListener("pinch") && (typeof _self._firstPinchValue === "number") && e.touches && e.touches.length === 2) {
					e.preventDefault();
					var pinchDistance = getPinchDistance(
						 e.touches[0].pageX,
						 e.touches[0].pageY,
						 e.touches[1].pageX,
						 e.touches[1].pageY
					);
					_self._lastGesture.pinch = -((_self._firstPinchValue / pinchDistance) - 1);
					EventListener.trigger("pinch",_self._lastGesture,"move");
					
				}
				EventListener.trigger("gesture",_self._lastGesture,"move");
				
				if(_self.stopPropagation===true)e.stopPropagation();
				if(_self.preventDefault===true) e.preventDefault();
			}
		};
	
		this._gestureEndHandler = function(e){
			if(EventListener.hasListener() && _self._firstPageX !== undefined){
				
				if (EventListener.hasListener("pinch") && (typeof _self._firstPinchValue === "number") && e.touches && e.touches.length === 2) {
					this.EventListener.trigger("pinch",_self._lastGesture,"end");
				}
				EventListener.trigger("gesture",_self._lastGesture,"end");
				
				_self._firstPageX = _self._lastPageX = undefined;
				_self._firstPageY = _self._lastPageY = undefined;
				_self._firstPinchValue = undefined;
				_self._lastGesture = undefined;
				
				if(_self.stopPropagation===true)e.stopPropagation();
				if(_self.preventDefault===true) e.preventDefault();
			}
		};
		
		N.node.punch(this.view,"mousedown",this._gestureStartHandler);
		N.node.punch(document.body,"mousemove",this._gestureMoveHandler);
		N.node.punch(document.body,"mouseup",this._gestureEndHandler);		
	});
	
	
	
	
	
	
	
	var RoleNodes = {};
	var GET_ROLE_TOKEN = function(){
		
	};
	
	N.MODULE("Role",function(){
		
	},function(){
		
	});
	
	N.EXTEND_MODULE("NodeHandler","RoleScope",{
		
	},function(node,data){
		var firstNode = N.find(node,0);
		this.$parent  = firstNode.parentNode;
		
		if(this.$parent){
			this.$placeholder = document.createComment("role scope token");
			this.$parent.insertBefore(this.$placeholder,firstNode);
			
			//
			this.$sample = N.makeSampleNode(firstNode);
			
			
			console.log("this.$sample",this.$sample);
		}
	});
	
	N.MODULE("Mobile",{
		
	},function(target,data){
		
		//
		this.$rootView = nd.find(target,0);
		this.$rootData = data;
		this.$roleScope = new N.RoleScope(this.$rootView,this.$rootData);
		console.log("this.$roleScope",this.$roleScope);
		console.log("this",this);
	});
	
});