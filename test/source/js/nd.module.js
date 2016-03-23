N.MODULE_PROPERTY("Array","split",function(text,s){
	if( N.isArray(text) ) return new N.Array(text);
	if(typeof text === "string"){
		var result;
		if((typeof s === "string") || typeof s === "number") {
			s = s+"";
			result = text.split(s);
		} else {
			result = [];
			text.replace(/\S+/gi,function(s){ result.push(s); });
		}
		return new N.Array(result);
	}
	console.warn("Array.split only text or array", text);
	return new N.Array(text);
});


	//Nody Node Foundation 
	(function(W,N,ENV){
		

	//Nody Component Foundation
	(function(W,N,ENV){
		//여러 엘리먼트를 셀렉트하여 한번에 컨트롤
		N.MODULE("Controls",{
			selects:function(){ return this.Source; },
			find:function(f){ if(f) return N.find(f,this.Source); return []; },
			statusFunction:function(f,param,filter,requireElement){
				var fe = filter ? function(node){ return N.node.is(node,filter)?f(node, param):undefined } : function(node){ return f(node, param); };
				var r  = new N.Array(this.selects()).setMap( fe ).setFilter();
				return (requireElement == true) ? r.toArray() : this;
			},
			disabled:function(status,filter){ return this.statusFunction(N.node.disabled,(status !== false ? true : false),filter); },
			readonly:function(status,filter){ return this.statusFunction(N.node.readOnly,(status !== false ? true : false),filter); },
			empty   :function(filter)       { filter = filter?filter+",:not(button):not(select)":":not(button):not(select)"; return this.statusFunction(N.node.value   ,"",filter); },
			map     :function(mapf,filter)  { return this.statusFunction(function(node){ var r = mapf(node); if(N.likeString(r)){ N.node.value(node,r); } },"",filter); },
			selectEach:function(eachf,filter) { return this.statusFunction(function(node){ var r = eachf.call(node,node); },"",filter); },
			removePartClass:function(rmClass,filter,req){
				var r = this.statusFunction(function(node,param){
					var classes = N.node.attr(node,"class");
					if(typeof classes === "string"){
						classes = (new N.StringSource(classes)).setRemoveModel(eval("/^"+param+"/"));
						N.node.attr(node,"class",classes);
						return node;
					}
					return undefined;
				},rmClass,filter,true);
				return (req == true)?r:this;
			},
			changePartClass:function(selClass,toClass,filter){
				new N.Array(this.removePartClass(selClass,filter,true)).each(function(node){
					var classes = N.node.attr(node,"class");
					N.node.attr(node,"class",(new N.StringSource(classes)).addModel(selClass+toClass));
				});
				return this;
			}
		},function(controls,casein){
			this.Source = N.find(controls,casein);
		});
	
	
		// 폼은 일정 폼 노드들을 컨트롤 하기위해 사용됩니다.
		N.EXTEND_MODULE("Controls","Form",{
			isValid        :function(f){ if(typeof f === "function") return f.call(this); return N.isElement(this.Source); },
			selects     :function(){ return N.find(this.SelectRule,this.Source); },
			getSelectTokens:function(){
				return new N.Array(this.SelectRule.split(",")).setMap(function(selString){
					var execResult = /\[([a-zA-Z0-9\-]+)(.*)\]/.exec(selString);
					if( execResult === null) return ;
					return execResult[1];
				}).setFilter().toArray();
			
			},
			//체크아웃 대상 (key와 무관)
			getCheckoutElement:function(){
				return N.find(new N.Array(this.getSelectTokens()).setMap(function(s){ return "["+s+"]"; }).join(","), this.Source);
			},
			//체크아웃 대상 (key가 존재하는 것만)
			getCheckoutElementsWithToken:function(){
				var tokens = new N.Array(this.getSelectTokens());
				return new N.Array(this.getCheckoutElement()).inject({},function(node,inject){
					var getKey;
					tokens.each(function(tokenName){
						if( N.node.hasAttr(node,tokenName) == true ){
							var key = N.node.attr(node,tokenName);
							if( !N.isNothing(key) ){
								if(!(key in inject)) inject[key] = [];
								inject[key].push(node);
								return false;
							}
						}
					});
				});
			},
			checkoutFilter:function(o){ this.FrameCheckoutFilter = o; },
			checkinFilter:function(o){ this.FrameCheckinFilter = o; },
			checkout:function(){
				return new N.HashSource(this.getCheckoutElementsWithToken()).setMap(function(node,key){
					var value = N.node.value(node);
					return value == null ? "" : value;
				}).get();
			},
			checkin:function(hashMap,v2){
				if(typeof hashMap === "string"){
					if(typeof v2 !== "string") v2 = N.toString(v2);
					var map      = {};
					map[hashMap] = v2;
					hashMap      = map;
				}
				if(typeof hashMap === "object"){
					var checkin_targets = this.getCheckoutElementsWithToken()
					for(var key in hashMap) if(key in checkin_targets) {
						N.node.value(checkin_targets[key], hashMap[key]);
					} 
				} else {
					console.warn("Frame::checkin set data를 object형으로 넣어주세요");
				}
				return this;
			},
			clearFormData:function(){
				return this.empty();
			},
			setFormData:function(hashMap,v2){
				return this.checkin(hashMap,v2);
			},
			getFormData:function(key){
				if(typeof key === 'string') return this.checkout()[key];
				return this.checkout();
			}
		},function(context,selectRule){
			this.Source = N.findLite(context)[0];
			this.form   = this.Source;
			if( !N.isElement(this.Source) ) { console.error( "Frame::Context를 처리할 수 없습니다. => ",this.Source," <= ", context); }
		
			//SelectRule
			switch(typeof selectRule){
				case "string": this.SelectRule = selectRule+",[name]"; break;
				default : this.SelectRule = "[name]"; break;
			}
		});
		
		N.MODULE("EventListener",{
			dispatchEvent:function(owner,triggerName){
				var args = Array.prototype.slice.call(arguments,2),arounds=this.ManageModuleAroundEvents.prop(triggerName);
				var result = this.ManageModuleEvents.dataProp(triggerName).map(function(handler){	
					return handler.apply(owner,args);
				});
				if(arounds){
					var afterHandlers = arounds.prop("after");
					afterHandlers && afterHandlers.each(function(afterCallback){
						return afterCallback.apply(owner,args);
					});
				}
				return result;
			},
			dispatchWill:function(owner,triggerName){
				var args=Array.prototype.slice.call(arguments,2),arounds=this.ManageModuleAroundEvents.prop(triggerName);
				if(arounds){
					var beforeHandlers = arounds.prop("before");
					if(beforeHandlers && beforeHandlers.isAny(function(beforeCallback){ return beforeCallback.apply(owner,args) == false; })) {
						return false;
					}
				}
			},
			triggerWithOwner:function(owner,triggerName){
				var params = Array.prototype.slice.call(arguments);
				
				if(this.dispatchWill.apply(this,params) === false) return false;
				return this.dispatchEvent.apply(this,params);
			},
			trigger:function(triggerName){
				this.triggerWithOwner.apply(this,[this.ManageModule,triggerName].concat(Array.prototype.slice.call(arguments,1)));
			},
			listenBefore:function(triggerName,proc){
				if(!this.ManageModuleAroundEvents.has(triggerName)){
					this.ManageModuleAroundEvents.setProp(triggerName,new N.HashSource());
				}
				this.ManageModuleAroundEvents.prop(triggerName).pushDataProp("before",proc);
			},
			listenAfter:function(triggerName,proc){
				if(!this.ManageModuleAroundEvents.has(triggerName)){
					this.ManageModuleAroundEvents.setProp(triggerName,new N.HashSource());
				}
				this.ManageModuleAroundEvents.prop(triggerName).pushDataProp("after",proc);
			},
			listen:function(triggerName,proc){
				if(typeof proc !== "function") return false;
				this.ManageModuleEvents.pushDataProp(triggerName,proc,true);
			},
			hasListen:function(triggerName){
				if(arguments.length === 0) this.ManageModuleEvents.hasProp();
				return this.ManageModuleEvents.hasProp(triggerName);
			},
			hasListener:function(triggerName){
				var result = false;
				this.ManageModuleEvents.each(function(v){
					if(v.length){
						result = true;
						return false;
					}
				});
				return result;
			},
			addTriggerRegister:function(triggerName,owner){
				var _self = this;
				if(typeof triggerName === "string"){
					var upperCaseName = triggerName[0].toUpperCase() + triggerName.substr(1);
					this.ManageModule["trigger"+upperCaseName] = function(){
						_self.triggerWithOwner.apply(_self,[owner?owner:_self.ManageModule,triggerName].concat(Array.prototype.slice.call(arguments)));
					}
				} else {
					N.each(triggerName,function(name){
						if(typeof name === "string"){
							_self.addTriggerRegister(name,owner);
						}
					});
				}
			},
			addEventRegister:function(eventName,withAroundCallback){
				var _self = this;
				if(typeof eventName === "string"){
					var upperCaseName = eventName[0].toUpperCase() + eventName.substr(1);
					var onCaseName = "on"+upperCaseName;
					
					this.ManageModuleEvents.touchDataProp(eventName);
					
					if(withAroundCallback === true){
						var willUpperCase = "will"+upperCaseName;
						var didUpperCase  = "did"+upperCaseName; 
						this.ManageModule[willUpperCase] = function(proc){
							if(typeof proc !== "function") return console.error("missing method from",willUpperCase,proc);
							_self.listenBefore(eventName,proc);
						};
						this.ManageModule[didUpperCase] = function(proc){
							if(typeof proc !== "function") return console.error("missing method from",didUpperCase,proc);
							_self.listenAfter(eventName,proc);
						};
					}
					this.ManageModule[onCaseName] = function(proc){
						if(typeof proc !== "function") return console.error("missing method from",onCaseName,proc);
						_self.listen(eventName,proc);
					};
				} else {
					N.each(eventName,function(name){
						if(typeof name === "string"){
							_self.addEventRegister(name,withAroundCallback);
						}
					});
				}
			}
		},function(module){
			if(!N.isModule(module)) console.error("EventListener:: manage object is must be nody module");
			this.ManageModule = module;
			//{eventName:[handers...]}
			this.ManageModuleEvents = new N.HashSource();
			//{eventName:{aroundName:[handlers..]}}
			this.ManageModuleAroundEvents = new N.HashSource();
			var _self = this;
		});
		
		N.MODULE("ActiveInterface",{
			getItems:function(){
				return N.callArray(this.procedures.getItems());
			},
			isActiveItem:function(item){
				return this.procedures.isActive(item);
			},
			isActiveAll:function(){
				var module = this;
				return N.dataAll(this.getItems(),function(item){
					return module.procedures.isActive(item); 
				});
			},
			isInactiveAll:function(){
				var module = this;
				return N.dataAll(this.getItems(),function(item){
					return !module.procedures.isActive(item); 
				});
			},
			getActiveItems:function(){
				var module = this;
				return N.filter(this.getItems(),function(item){
					return module.procedures.isActive.call(module,item);
				});
			},
			getInactiveItems:function(){
				var module = this;
				return N.filter(this.getItems(),function(item){
					return !module.procedures.isActive.call(module,item);
				});
			},
			setActiveItem:function(item,args,triggingEvent){
				var responder = this.Responder || this;
				this.procedures.setActive.call(responder,item,args);
				if(triggingEvent === true){
					this.EventListener.triggerWithOwner(responder,"active",item);
				}
				return this;
			},
			setInactiveItem:function(item,args,triggingEvent){
				var responder = this.Responder || this;
				this.procedures.setInactive.call(responder,item,args);
				if(triggingEvent === true){
					this.EventListener.triggerWithOwner(responder,"inactive",item);
				}
				return this;
			},
			setInactiveItemWithIndex:function(index,args,triggingEvent){
				var item = this.getItems()[index];
				item && this.setInactiveItem(item,args,triggingEvent);
				return this;
			},
			active:function(item,args,react){
				//이미 active이면 시작하지 않음
				if(this.procedures.isActive(item) === true && react !== true) return;
				
				var selects     = this.getItems();
				var activeItems = this.getActiveItems();
				
				//acceptance가 부정할때는 시작하지 않음
				if(N.CALL(this.options.acceptance,undefined,item,true) === false) return;
				
				if(activeItems.length === 0){
					if( this.EventListener.dispatchWill(this.Responder || this,"change",item,true) !== false && 
					    this.EventListener.dispatchWill(this.Responder || this,"activeStart",item,true) !== false ){
						this.setActiveItem(item,args,true);
						this.EventListener.dispatchEvent(this.Responder || this,"change",item,true);
						this.EventListener.dispatchEvent(this.Responder || this,"activeStart",selects);
					}
				} else {
					if(this.EventListener.dispatchWill(this.Responder || this,"change",item,true) !== false){
						//중복된 active를 허용하지 않으면
						if(!this.options.allowMultiActive){
							for(var i=0,l=activeItems.length;i<l;i++){
								this.setInactiveItem(activeItems[i],args,true);	
							}
						}
						this.setActiveItem(item,args,true);
						this.EventListener.dispatchEvent(this.Responder || this,"change",item,true);
					}
				}
			},
			activeAll:function(){
				for(var d=this.getInactiveItems(),i=0,l=d.length;i<l;this.active(d[i]),i++);
				return this;
			},
			inactive:function(item,args){
				//이미 inactive이면 시작하지 않음
				if(this.procedures.isActive(item) === false) return;
				
				var selects     = this.getItems();
				var activeItems = this.getActiveItems();
				
				//selectItem이 active일때 // inactive 조건을 확인합니다.
				if(activeItems.length === 1){
					//이 아이탬만 액티브일때 //옵션의 모든 인액티브가 허용치 않으면 취소합니다.
					if(!this.options.allowInactiveAll){
						return;
					}
				}
				
				//acceptance가 부정할때는 취소함
				if(N.CALL(this.options.acceptance,undefined,item,false) === false) return;
				
				if(!(activeItems.length - 1)) {
					if(this.EventListener.dispatchWill(this.Responder || this,"change",item,false) !== false){
						this.setInactiveItem(item,args,true);
						this.EventListener.dispatchEvent(this.Responder || this,"change",item,false);
					}
				} else {
					if(this.EventListener.dispatchWill(this.Responder || this,"change",item,false) !== false && 
					   this.EventListener.dispatchWill(this.Responder || this,"activeEnd",item,false) !== false){
						this.setInactiveItem(item,args,true);
						this.EventListener.dispatchEvent(this.Responder || this,"change",item,false);
						this.EventListener.dispatchEvent(this.Responder || this,"activeEnd",selects);
					}
				}
			},
			toggle:function(item){
				this.procedures.isActive(item) ? this.inactive(item) : this.active(item) ;
			},
			inactiveAll:function(){
				for(var d=this.getActiveItems(),i=d.length-1;i>-1;this.inactive(d[i]),i--);
				return this;
			},
			activeWithIndex:function(index){
				var module=this, items = this.getItems();
				N.each(index,function(index){ if(typeof index === "number") if(items[index]) module.active(items[index]); });
				return this;
			},
			inactiveWithIndex:function(index){
				var module=this, items=this.getItems();
				N.reverseEach(index,function(index){ if(typeof index === "number") if(items[index]) module.inactive(items[index]); });
				return this;
			},
			toggleWithIndex:function(index){
				var module=this, items = this.getItems();
				N.each(index,function(index){ if(typeof index === "number") if(items[index]) module.toggle(items[index]); });
				return this;
			}
		},function(properties){
			if(typeof properties === "object"){
				this.procedures = {};
				this.options    = {};
				
				var requireOptions = ["getItems","isActive","setActive","setInactive","allowInactiveAll","allowMultiActive","acceptance","EventListener","Responder"];
				
				for(var i=0,l=requireOptions.length;i<l;i++){
					var optionName = requireOptions[i];
					switch(optionName){
						case "getItems":case "isActive":case "setActive":case "setInactive":
							if(typeof properties[optionName] === "function"){
								this.procedures[optionName] = properties[optionName];
							} else {
								console.error("ActiveItemInterface::"+key+" procedure must be function!",properties);
							}
							if(!this.procedures[optionName]){
								console.error("ActiveItemInterface::"+key+"is must be exsist!",this);
							}
							break;
						case "allowInactiveAll": case "allowMultiActive":
							this.options[optionName] = (typeof properties[optionName] !== "boolean") ? false : properties[optionName];
							break;
						case "acceptance":
							this.options[optionName] = (typeof properties[optionName] !== "function") ? undefined : properties[optionName];
							break;
						case "EventListener":
							this.EventListener = N.isModule(properties[optionName],"EventListener") ? properties[optionName] : new N.EventListener(this);
							break;
						case "Responder":
							this.Responder = properties[optionName] ? properties[optionName] : undefined;
							break;
					}
				}
			} else {
				console.error("ActiveItemInterface::모듈은 반드시 item을 구하는 함수 집합의 오브젝트를 넣으셔야합니다.",this)
			}
		},function(){
			return this.getItems();
		});
		
		N.MODULE("ActiveStatus",{
			addActiveAction:function(statusName,active,inactive){
				if(typeof statusName === 'string'){
					if(typeof active === 'function'){
						this.ActiveProcs[statusName] = active;
					}
					if(typeof inactive === 'function'){
						this.InactiveProcs[statusName] = inactive;
					}
				}
			},
			getActive:function(){
				return this.ActiveKeys.join(" ");
			},
			isActive:function(k){
				return this.ActiveKeys.has(k);
			},
			activeTo:function(key){				
				this.ActiveInterface.active(key,Array.prototype.slice.call(arguments,1));
			},
			inactTo:function(key){
				this.ActiveInterface.inactive(key,Array.prototype.slice.call(arguments,1));
			},
			reactTo:function(key){
				this.ActiveInterface.active(key,Array.prototype.slice.call(arguments,1),true);
			},
			toggleTo:function(key){
				this.ActiveInterface.toggle(key,Array.prototype.slice.call(arguments,1));
			}
		},function(allowMultiActive,allowMultiActive){
			this.ActiveKeys          = new N.Array();
			this.ActiveProcs         = {};
			this.InactiveProcs       = {};
			
			var module = this;
			
			this.ActiveInterface = new N.ActiveInterface({
				getItems:function(){
					return module.ActiveKeys;
				},
				isActive:function(key){
					return module.ActiveKeys.has(key);
				},
				setActive:function(key,args){
					module.ActiveKeys.add(key);
					module.ActiveProcs[key] && module.ActiveProcs[key].call(module,args);
				},
				setInactive:function(key,args){
					module.ActiveKeys.remove(key);
					module.InactiveProcs[key] && module.InactiveProcs[key].call(module,args);
				},
				allowInactiveAll: (typeof allowInactiveAll === "boolean") ? allowInactiveAll : true,
				allowMultiActive: (typeof allowMultiActive === "boolean") ? allowMultiActive : true,
				acceptance:false
			});
		});
		
		// 컨텍스트 컨트롤러
		N.MODULE("Contexts",{
			"+_selectPoolCount":0,
			selectPoolStart:function(proc){
				if(this._selectPoolCount === 0) this._selectPoolList = this.selects(false);
				this._selectPoolCount = this._selectPoolCount + 1;
			},
			selectPoolEnd:function(){
				this._selectPoolCount = this._selectPoolCount - 1;
				if(this._selectPoolCount === 0) this._selectPoolList = null;
				//console.log('pool --',this._selectPoolCount);
			},
			contexts:function(callback){ 
				var contexts = N.findLite(this._initParams[0]);
				if(typeof callback === "function"){
					return callback.apply(undefined,[contexts].concat(Array.prototype.slice.call(arguments,1)));
				}
				return contexts;
			},
			selects:function(usePool){
				if(usePool == false && this._selectPoolCount > 0) { 
					return N.cloneArray(this._selectPoolList);
				}
				
				var selects;
				switch(typeof this._initParams[1]) {
					case 'function':
						selects = this._initParams[1]();
						break;
					default:
						var selectQuery = N.isNothing(this._initParams[1]) ? ">*" : this._initParams[1];
						if(selectQuery == "self") return this.contexts();
						if(selectQuery.charAt(0) == ">"){
							selects = N.findOn(this.contexts(),selectQuery.substr(1));
						} else {
							selects = N.findIn(this.contexts(),selectQuery);
						}
						break;
				}
				if(selects && typeof usePool === "function") {
					return usePool.apply(undefined,[selects].concat(Array.prototype.slice.call(arguments,1)));
				}
				return selects;
			},
			getContext:function(eq){ return this.contexts()[eq]; },
			getSelect :function(eq){ return this.selects()[eq]; },
			on:function(event,func){
				var _ = this;
				// 이벤트와 번호가 들어오면
				if(typeof event=="string" && typeof func === "number"){
					this.selectPoolStart();
					//캐쉬를 사용함 단 트리깅에서만
					var selNode = this.getSelect(func);
				
					if(N.isElement(selNode)) {
						N.node.trigger(selNode,event, (arguments.length > 2)  ? {'arguments':Array.prototype.slice.call(arguments,2)} : undefined ); 
					} else {
						console.warn("Contexts::on::트리깅할 대상이 없습니다.");
					} 
					this.selectPoolEnd();
					return this;
				}
				if(typeof event=="string" && typeof func === "function"){
					N.node.on(this.contexts(),event,function(e){
						var curSel = new N.Array( _.selects() );
						if(curSel.has(e.target)){
							//버블이 잘 왔을때
							var curfuncindex  = curSel.indexOf(e.target);
							var curfuncresult = func.call(e.target,e,curfuncindex,_);
						
							if(curfuncresult == false) return false;
							
							return curfuncresult;
						} else {
							//버블링이 중간에 멈췄을때
							var eventCapture; 
							curSel.each(function(sel){
								if(N.find(e.target,sel,0)){
									eventCapture = sel;
									return false;
								}
							});
							if(eventCapture){
								//이벤트를 다시 발생시킴
								N.node.trigger(eventCapture,e.type);
								return false;
							}
						}
					});
				} else {
					console.error("onSelect::초기화 할수 없습니다. 글자함수필요",event,func);
				}
				return this;
			}
		},function(contextSelector,selectsSelector){
			this._initParams = [contextSelector,selectsSelector];
		});
		
		N.EXTEND_MODULE('Contexts','FilterContexts',{
			needFiltering:function(filterData){
				var selectNodes = this.selects();
				var fm          = this.filterMethod;
				var filteringDataIndexes = [];
				if(this.hiddenClass) {
					var fc = this.hiddenClass;
					N.each(this.selects(),function(sNode,i){
						if( fm.call(sNode,sNode,i,filterData) === true ){
							N.node.removeClass(sNode,fc)
						} else {
							N.node.addClass(sNode,fc);
							filteringDataIndexes.push(i);
						}
					});
				} else {
					N.each(this.selects(),function(sNode,i){
						if( fm.call(sNode,sNode,i,filterData) === true ){
							N.node.style(sNode,'display',null)
						} else {
							N.node.style(sNode,'display','none')
							filteringDataIndexes.push(i)
						}
					});
				}
				return filteringDataIndexes;
			}
		},function(c,s,filterMethod,hiddenClass){
			this._super(c,s);
			if(typeof filterMethod !== 'function') console.error('Filter::세번째 파라메터는 반드시 함수를 넣어주세요',filterMethod);
			this.filterMethod = filterMethod;
		
			if(typeof hiddenClass === 'string') this.hiddenClass = hiddenClass;
			if(hiddenClass === true) this.hiddenClass = 'hidden';
		});
		
		N.EXTEND_MODULE("Contexts","ActiveContexts",{
			inactiveItems:function(){
				return this.ActiveInterface.getInactiveItems();
			},
			activeItems:function(){
				return this.ActiveInterface.getActiveItems();
			},
			activeWithItem:function(selectItem){
				this.selectPoolStart();
				this.ActiveInterface.active(selectItem);
				this.selectPoolEnd();
			},
			inactiveWithItem:function(selectItem){
				this.selectPoolStart();
				this.ActiveInterface.inactive(selectItem);
				this.selectPoolEnd();
			},
			activeAll:function(){
				this.selectPoolStart();
				this.ActiveInterface.activeAll();
				this.selectPoolEnd();
			},
			inactiveAll:function(){
				this.selectPoolStart();
				this.ActiveInterface.inactiveAll();
				this.selectPoolEnd();
			},
			active:function(indexes){
				this.selectPoolStart();
				this.ActiveInterface.activeWithIndex(indexes);
				this.selectPoolEnd();
			},
			inactive:function(indexes){
				this.selectPoolStart();
				this.ActiveInterface.inactiveWithIndex(indexes);
				this.selectPoolEnd();
			},
			toggleWithSelectItem:function(selectItem){
				return N.node.is(selectItem,"."+this.activeClass) ? this.inactiveWithItem(selectItem) : this.activeWithItem(selectItem);
			},
			option:function(key,value){
				if(key === "free"){
					this.ActiveInterface.options["allowInactiveAll"] = this.ActiveInterface.options["allowMultiActive"] = true;
				} else {
					this.ActiveInterface.options[key] = value;
				}
				
			}
		},function(c,s,callback){
			this._super(c,s);
			
			//event listener
			this.EventListener = new N.EventListener(this);
			this.EventListener.addEventRegister(["activeStart","activeEnd"]);
			this.EventListener.addEventRegister(["active","inactive","change"],true);
			
			this.activeClass = "active";
			
			var module = this;
			
			var defaultBehavior = {
				isActive:function(node){
					return nd.node.hasClass(node,module.activeClass);
				},
				setActive:function(node){
					nd.node.addClass(node,module.activeClass);
				},
				setInactive:function(node){
					nd.node.removeClass(node,module.activeClass);
				}
			};
			
			var activeInterfaceOptions = {
				getItems:function(){ return module.selects(); },
				isActive:defaultBehavior.isActive,
				setActive:defaultBehavior.setActive,
				setInactive:defaultBehavior.setInactive,
				allowInactiveAll:false,
				allowMultiActive:false,
				acceptance:false,
				EventListener:this.EventListener,
				Responder:this
			};
			
			if(typeof callback === "object"){
				for(var key in activeInterfaceOptions){
					if(callback.hasOwnProperty(key)){
						if(key === "getItems"){
							console.warn("이 옵션은 바꿀 수 없습니다");
						} else if (defaultBehavior[key]){
							var behaviorKey = key;
							activeInterfaceOptions[key] = function(){
								defaultBehavior[behaviorKey].apply(this,Array.prototype.slice.call(arguments));
								callback[behaviorKey].apply(this,Array.prototype.slice.call(arguments));
							};
						} else {
							activeInterfaceOptions[key] = callback[key];
						}
					}
				}
			}
			
			this.ActiveInterface = new N.ActiveInterface(activeInterfaceOptions);
			
			//lock => api호출이 아닌이상 토글되지 않도록 합니다.
			this.lock = false;
			
			//active executor
			this.on("click",function(){ 
				module.lock === false && module.toggleWithSelectItem(this); 
			});
			
			N.CALL(callback,this,this);
			
			if(this.ActiveInterface.options.allowInactiveAll === false && !this.activeItems().length) this.active(0);
		});
		

		N.EXTEND_MODULE("ActiveStatus","ViewAndStatus",{
			node:function(innerKey){
				if(arguments.length === 0) return new N.NodeHandler(this.view);
				if(innerKey in this) innerKey = this[innerKey];
				
				return new N.NodeHandler(N.find.apply(undefined,N.ownerMap(this,)));
			},
			find:function(query){
				return N.find.apply(this,[innerKey,this.view].concat(Array.prototype.slice.call(arguments,1)));
				//return N.find.apply(undefined,N.ownerMap(this,[query,this.view].concat(Array.prototype.slice.call(arguments,1))));
			}
		},function(targetView,allowMulti,allowInactive){			
			this.view = N.findLite(targetView)[0];
			if(!this.view) return console.error("ViewAndStatus::다음셀렉터를 찾을수 없습니다. 이와 관련된 컨트롤러는 모두 정상적으로 작동되지 않을것입니다. => ",targetView);
			this._super(allowMulti,allowInactive);
			return true;
		});
		
		
		N.EXTEND_MODULE("ViewAndStatus","FormController",{
			setFormData:function(data,v2){
				return this.Form.checkin(data,v2);
			},
			getFormData:function(){
				return this.Form.checkout();
			},
			controlEach:function(h,f){
				this.Form.selectEach(h,f);
			},
			getFormControl:function(){
				return this.Form.find.apply(this.FormControl,Array.prototype.slice.call(arguments));
			}
		},function(targetForm,viewStatus,methodHelper){
			if( this._super(targetForm,false,true) === true ) {
				this.Form = new N.Form(this.view);
				
				var _self = this;
				
				if(viewStatus && (typeof viewStatus === "object")) {
					N.propEach(viewStatus,function(handle,key){
						_self.addActiveAction(key,handle);
					});
				};
				
				if(typeof methodHelper === 'function') methodHelper = {init:methodHelper};
				
				N.propEach(methodHelper,function(fn,key){
					if(!(key in _self.constructor.prototype)) {
						if(key === 'init') {
							if(typeof fn === 'function') fn.apply(_self,Array.prototype.slice.call(arguments));
						} else {
							_self[key] = (typeof fn === 'function') ? function(){fn.apply(_self,Array.prototype.slice.call(arguments));} : fn;
						}
					}
				});
			}
		});
		
		N.EXTEND_MODULE("ViewAndStatus","RoleController",{
			"++findDataRole":function(findwhere,initedRoles){
				var roleName  = this.prototype.__NativeHistroy__[this.prototype.__NativeHistroy__.length-1];
				var findQuery = "[data-role~="+N.kebabCase(roleName)+"]";
				var roles     = findwhere ? N.find(findQuery,N.findLite(findwhere)) : N.findLite(findQuery);
				if(initedRoles === false){
					return N.filter(roles,function(node){
						if(!node.roleController) return true;
						return node.roleController[roleName] ? false : true;
					});
				} else {
					return N.filter(roles,function(node){	
						if(!node.roleController) return false;
						return node.roleController[roleName] ? true : false;
					});
				}
			},
			"++newDataRole":function(findwhere,props,data,rolename){
				var _self      = this;
				var findedRole = this.findDataRole(findwhere,false)[0];
				return findedRole && (new _self(findedRole,props,data));
			},
			"++newDataRoles":function(findwhere,props,data,rolename){
				var _self       = this;
				var findedRoles = this.findDataRole(findwhere,false);
				var initedRoles = [];
				for(var i=0,l=findedRoles.length;i<l;i++) initedRoles.push(new _self(findedRoles[i],props,data));
				return initedRoles;
			},
			hasProp:function(key){
				return this.HashSource.has(key);
			},
			prop:function(key,filter){
				if(arguments.length === 0){
					return this.HashSource.get();
				} else {
					return this.HashSource.prop(key,filter);
				}
			},
			setProp:function(key,value){
				this.HashSource.setProp(key,value);
				return this;
			},
			data:function(){
				return this.ManageData;
			},
			setData:function(v){
				this.ManageData.setSource();
				this.EventListener.trigger("changedata");
				return this;
			},
			pushData:function(v){
				this.ManageData.push(v);
				this.EventListener.trigger("changedata");
				return this;
			},
			findRole:function(find,proc){
				var finded = N.find(find);
				var selectedRoles = new N.Array(N.filter(N.argumentsFlatten(find),function(obj){ return N.isModule(obj,"RoleController"); }));
				if(finded.length === 0) selectedRoles;
				
				N.each(finded,function(roleNode){
					if(typeof roleNode.roleController === "object") selectedRoles.push(roleNode.roleController);
				});
				
				if(typeof proc === "function"){
					var _self = this;
					N.each(selectedRoles,function(roleController){ proc.call(_self,roleController); });
				}
				return selectedRoles;
			},
			findRoleById:function(id){
				var finded = N.find("#"+id.replace("#",""),0);
				if(finded.length === 0) return console.warn("findRoleById는 ",id,"을 찾을수 없습니다");
				return finded.roleController;
			},
			findRoleByProp:function(prop,proc){
				var props = this.HashSource.prop(prop);
				var roles = N.isModule(props,"RoleController") ? [props] : this.findRole(props);
				if(typeof proc === "function"){
					N.each(roles,proc);	
				}
				return roles;
			},
			getBinder:function(proc){
				if(this.Binder){
					if(typeof proc === "function")proc.call(this,this.Binder);
					return this.Binder;
				}
			},
			release:function(){
				nd.node.removeAttr(this.view,"data-role",N.kebabCase(this.__NativeModule__()));
				for(var key in this) this[key] = null;
			}
		},function(targetRole,props,data,initViewProc){
			var detectData = !!data;
			
			if( this._super(targetRole,true,true) === true ) {
				if(N.isModule(props,"Binder")){
					this.HashSource = props.beforeProperty;
					this.HashSource.pushDataProp(this.__NativeModule__(),this);
					this.Binder = props;
				} else if(N.isModule(props,"HashSource")) {
					this.HashSource = props;
					this.HashSource.pushDataProp(this.__NativeModule__(),this);
				} else {
					this.HashSource = new N.HashSource(props);
					this.HashSource.pushDataProp(this.__NativeModule__(),this);
				}
				this.ManageData    = new N.Array(data);
				this.EventListener = new N.EventListener(this);
				this.EventListener.addEventRegister(["changedata"]);
				
				var role       = this;
				var moduleName = this.__NativeModule__();
				
				N.find('script[type*=json]', this.view ,N.each ,function(scriptTag){
					var jsonData = N.node.value(scriptTag);
					if(nd.is(jsonData,"object")) N.is(jsonData,"array") ? role.ManageData.append(jsonData) : role.HashSource.extend(jsonData);
					N.node.remove(scriptTag);
				});
				
				//already init test
				if(!this.view.roleController) this.view.roleController = {};
				if(this.view.roleController[moduleName]){
					console.warn(this.view,"already init => "+moduleName);
				} else {
					this.view.roleController[moduleName] = this;
				}
				
				if(typeof initViewProc === "function" && this.view){
					N.node.addAttr(this.view,"data-role",N.kebabCase(moduleName));
					initViewProc.call(this,this);
				}
				
				detectData && this.EventListener.trigger("changedata");
			}
		});
	
		N.MODULE("ContentLoader",{
			hasLoadContent:function(loadKey){
				return this.ManageLoadNode.has(loadKey);
			},
			loadContent:function(loadPath,loadKey){
				var _self   = this;
				var success = false;
				if(typeof loadKey !== "string") loadKey = this._loadkey;
				if(typeof loadPath === "function"){
					loadPath = loadPath(N.APPLY(loadPath,this));
				}
				switch(typeof loadPath){
					case "string":
						//cache safe loadURL
						var loadURL = loadPath + (loadPath.indexOf("?") > -1 ? "&token=" : "?token=") + N.RANDKIT.base36Random(2);
						new N.Open(loadURL,{
							"dataType":"dom",
							"success":function(doms){
								_self.ManageLoadNode.setProp(loadKey,doms);
								_self.EventListener.trigger("load",loadKey,doms);
								success = true;
							},
							"error":function(){
								console.error("ContentLoader:: Can't load of the path => "+loadPath);
								N.CALL(error,_,loadKey);
							}
						});
						break;
					case "object":
						//must be element object
						var doms = N.findLite(loadPath);
						if( doms.length === 0 ) { 
							console.error("ContentLoader:: not found of the loadObject => "+loadPath);
						} else {
							_self.ManageLoadNode.setProp(loadKey,doms);
							_self.EventListener.trigger("load",loadKey,doms);
							success = true;
						}
					break;
				}
				return success;
			},
			putContent:function(putNode,loadKey){
				if(typeof loadKey !== "string") loadKey = this._loadkey;
				if(this.ManageLoadNode.has(loadKey)){
					return N.node.put(putNode,loadKey,this.ManageLoadNode.prop(loadKey));
				} else {
					console.error('must be loadContent after putContent =>',loadKey);
				}
				
			},
			templateContent:function(loadKey){
				if(typeof loadKey !== "string") loadKey = this._loadkey;
				if(this.ManageLoadNode.has(loadKey)){
					return new N.Template(this.ManageLoadNode.prop(loadKey));
				} else {
					console.error('must be loadContent after templateContent =>',loadKey);
				}
			},
		},function(){
			//key node
			this.ManageLoadNode = new N.HashSource();
			this.EventListener    = new N.EventListener(this);
			this.EventListener.addEventRegister("load");
			this._loadkey = "defaultLoadContent";
		});
		
		
		N.EXTEND_MODULE("ContentLoader","ActiveContentLoader",{
			active:function(activeName){
				if(typeof activeName === "string" && this._activeStatus === activeName){
					return true;
				}
				if(!this.ManageLoadPath.has(activeName)){
					console.error('ActiveContentLoader::activeName in not defined');
					return false;
				}
				var readyActive = true;
				if(!this.ManageLoadNode.has(activeName)){
					readyActive = this.loadContent(activeName,this.ManageLoadPath.prop(activeName));
				}
				if(readyActive){
					//before active view save
					
					if(this._activeStatus){
						var inactiveNodes  = N.findLite(this.view.childNodes);
						var inactiveResult = this.EventListener.trigger("inactive",this._activeStatus,inactiveNodes);
						if(N.has(inactiveResult,false)){
							return false;
						}
						
						
					}
					var activeNodes  = this.ManageLoadNode.prop(activeName);
					var activeResult = this.EventListener.trigger("active",this._activeStatus,activeNodes);
					if(N.has(inactiveResult,false)){
						return false;
					}
				}
				return false;
				
			
			}
		},function(view,loadInfo){
			this._super();
			this.view = N.find(view,0);
			if(this.view) { 
				this.EventListener.addEventRegister(["active","inactive"],true);
				this.EventListener.didInactive(function(keyName,inactiveNodes){
					this.ManageLoadNode.setProp(this._activeStatus,inactiveNodes);
					N.node.empty(this.view);
					this._activeStatus = undefined;
				});
				this.EventListener.didActive(function(keyName,activeNodes){
					this.ManageLoadNode.setProp(keyName,activeNodes);
					N.node.put(this.view,activeNodes);
					this._activeStatus = keyName;
				});
				
				this.ManageLoadPath = new N.HashSource(N.marge(loadInfo,{"loaderInitial":N.toArray(this.view.childNodes)}));
				this._activeStatus   = "loaderInitial";
			} else {
				return console.error("ActiveContentLoader:: not found view of selector =>",view); 
			}
		});
		
		N.MODULE("DataContext",{
			// 배열로된 패스를 반환한다.
			// path rule
			// root   = "","/"=> [/]
			// child  = "/3"  => [/,3]
			// childs = "/*"  => [/,*]
			_clearPath:function(path){
				if (N.isArray(path)) {
					return path;
				} else if((typeof path) === "string"){
					path = path.trim();
					path = path.indexOf("/") == 0 ? path.substr(1) : path;
					path = this.ContextID + "/" + path;
				} else {
					throw new Error("DataContext::_clearPath::1:Invaild path => "+path);
				}

				var result    = new N.Array();
				var splitPath = path.split("/");

				N.each(splitPath,function(keyPath){
					var numberMatch = keyPath.match(/\d/g);
					if(numberMatch != null) {
						if(numberMatch.join("") == keyPath){
							result.push( parseInt(keyPath) );
							return;
						}
					}
					result.push( keyPath );
				});

				result.remove("");
				return result;
			},
			// 글자로된 패스를 반환한다.
			_clearStringPath:function(path){
				var result = this._clearPath(path);
				if (N.isArray(result)) {
					//substr // -> /
					return result.join("/");
				}
			},
			_getDataProps:function(data){
				var data = N.clone(data);
				if( (typeof data) === "object" ) {
					if(N.isArray(data)) {
						return {};
					} else {
						return new N.HashSource(data).remove(this.DefaultDataKey).get();
					}
				}
			},
			_getChildData:function(data){
				if( typeof data === "object" ) {
					if(N.isArray(data)) {
						return N.clone(data);
					} else {
						var childKeyData = data[this.DefaultDataKey];
						if(typeof childKeyData === "object"){
							if(N.isArray(childKeyData)) {
								return N.clone(childKeyData);
							} else {
								return [N.clone(childKeyData)];
							}
						}
					}
				}
				return [];
			},
			// path로 해당 위치의 데이터를 반환해줍니다.
			getFullDataWithPath:function(path){
				var path = this._clearPath(path);
				if (N.isArray(path)) {
					var pathMake   = "";
					var selectData = [this.Source.get()];
					var _self      = this;

					N.each(path,function(pathKey){
	
						if (typeof pathKey === "string") {
							switch(pathKey){
								case "/": case _self.ContextID:
									// 아무것도 하지 않음
									break;
								case "*":
									selectData = new N.Array(selectData).map(function(data){
										if (N.isArray(data)){
											return data;
										} else {
											return _self.Source.prop(_self.DefaultDataKey);
										}
									}).setFlatten().remove(undefined);
									break;
							}
						} else if(typeof pathKey === "number") {
							selectData = new N.Array(selectData).map(function(data){
								if (N.isArray(data)){
									return data[pathKey];
								} else {
									var sourceChildren = data[_self.DefaultDataKey];
									if(N.isArray(sourceChildren)){
										return sourceChildren[pathKey];
									}
								}
							}).remove(undefined);
						}
					});
					return selectData;
				}
			},
			//자식연쇄 메니지드 데이터를 준비합니다.
			feedDownDataBinderMake:function(data,parent){
				if( typeof data === "object" ){
					var makeDataBinder = N.isArray(data) ? new N.DataBinder(this,this._getDataProps(data),"array") : new N.DataBinder(this,this._getDataProps(data),"object");
					var childDatas = this._getChildData(data);
					var childrens  = [];
					var _self      = this;
					if(N.isArray(childDatas)){
						N.each(childDatas,function(childData){
							var child = _self.feedDownDataBinderMake(childData,makeDataBinder);
							if(child) childrens.push(child);
						});
					}
					if(typeof parent === "object") parent.appendChild(makeDataBinder);

					return makeDataBinder;
				} else {
					console.error("data초기 값은 반드시 object타입이여야 합니다. =>",typeof data,data);
				}
			},
			update:function(data,parent,marge){
				if( typeof data === "object" ){
					var dataBinder = parent || this.RootDataBinder;
					
					//feedDownUpdate
					var dataProp  = this._getDataProps(data);
					var diffProps = N.diffKeys(dataBinder.prop(), dataProp);
					for(var i=0,l=diffProps.length;i<l;i++){
						if( diffProps[i] in dataProp ){
							dataBinder.setProp(diffProps[i],dataProp[diffProps[i]]);
						} else if((marge !== true) && !(diffProps[i] in dataProp)) {
							dataBinder.removeProp(diffProps[i]);
						}
					}
					
					//하위데이터
					var childData       = this._getChildData(data);
					var childDataLength = childData.length;
					var managedChildrens= dataBinder.Child.toArray();
					var managedLength   = managedChildrens.length;
					var removeTargets   = [];
					for(var i=0,l=((childDataLength > managedLength) ? childDataLength : managedLength);i<l;i++){
						if(childData[i]&&managedChildrens[i]){
							//update
							this.update(childData[i],managedChildrens[i],marge);
						} else if(!childData[i]&&managedChildrens[i]){
							//remove
							removeTargets.push(managedChildrens[i]);
						} else if(childData[i]&&!managedChildrens[i]){
							//create
							dataBinder.addChildData(childData[i]);
						}
					}
					
					//데이터 지우기
					N.each(removeTargets,function(removeTarget){
						removeTarget.removeDataBinder();
					});
					return dataBinder;
				} else {
					console.warn("data초기 값은 반드시 object타입이여야 합니다.",typeof data,data);
				}
			},
			margeUpdate:function(data){
				this.update(data,undefined,true);
			},
			//dataBinder를 string이나 오브젝트로 뽑아넴
			trace:function(dataBinder){
				var _self = this;
				if (!dataBinder) dataBinder = this.RootDataBinder;
				var ra = dataBinder.SourceType == "array";
				var rs = ra ? "[" : "{";
				var re = ra ? "]" : "}";
				var prop = [];
				dataBinder.Source.each(function(v,k){ prop.push( '\"' + k + '\":\"' + v + '\"' ) });

				if(dataBinder.Child.length > 0) prop.push( 
					(ra ? '' : '\"'+this.DefaultDataKey + '\":[' ) + 
					dataBinder.Child.map( function(dataBinder){ return _self.trace(dataBinder); } ).join(", ") + 
					(ra ? "" : "]")
				);
				return rs + prop.join(", ") + re;
			},
			JSONString:function(){ return this.trace(); },
			JSONObject:function(){ return JSON.parse(this.JSONString()); },
			getDataBinder:function(path,withChildren){
				if(typeof path == '/') return this.RootDataBinder;
				if (path.indexOf("/") == 0) path = this.ContextID + path;
				var paths    = path.split("/");
				var thisID   = this.ContextID;
				var thisRoot = this.RootDataBinder;

				var selectedDataBinder;

				N.each(paths,function(path){
					if(thisID == path) {
						selectedDataBinder = thisRoot;
					} else {
						selectedDataBinder = selectedDataBinder.Child[parseInt(path)];
					}
				});
				return selectedDataBinder;
			},
			querySelectData:function(path){
				var resultData = [this.RootDataBinder];
				if(path == '/' || path == '') return resultData;
				var pathes = [];

				path.replace(/\*\*.+/g,'**').replace(/\/[^\/]+/g,function(s){ pathes.push(s.substr(1)); });

				N.each(pathes,function(path,i){
					var searchTarget = resultData;
					var searchResult = [];
					if(path == '') return false;
					if(path == '*'){
						N.each(searchTarget,function(dataBinder){
							searchResult = searchResult.concat(dataBinder.Child.toArray());
						});
					} else if(path == '**') {
						N.each(searchTarget,function(dataBinder){
							dataBinder.feedDownDataBinder(function(){
								searchResult.push(this);
							});
						});
					} else if(/\[[^\]]+\]/.test(path)){
						//속성만 명시된경우
						var wantedProps = {};
	
						//FROM ELUT_REGEX
						path.replace(new RegExp("\\[[\\w\\-\\_]+\\]|\\[\\\'[\\w\\-\\_]+\\\'\\]|\\[\\\"[\\w\\-\\_]+\\\"\\]","gi"),function(s){
							wantedProps[s.substr(1,s.length-2)] = null;
							return '';
						}).replace(new RegExp("\\[[\\w\\-\\_]+\\=[^\\]]+\\]|\\[\\\'[\\w\\-\\_]+\\\'\\=\\\'[^\\]]+\\\'\\]|\\[\\\"[\\w\\-\\_]+\\\"\\=\\\"[^\\]]+\\\"\\]","gi"),function(s){
							var attr = /\[([\"\'\w\-\_]+)(=|~=|)(.*|)\]$/.exec(s);
							if(attr) {
								wantedProps[N.unwrap(attr[1],["''",'""'])] = (attr[3]) ? N.unwrap(attr[3],["''",'""']) : null;
							} else {
								console.warn('//!devel target parse err',attr,path);
							}
						});
	
						if(/\[[^\]]+\]\*\*$/.test(path)) {
							N.each(searchTarget,function(dataBinder){
								dataBinder.feedDownDataBinder(function(){
									var md   = this;
									var pass = true;
									N.propEach(wantedProps,function(v,k){
										return pass = (v === null || v === '') ? md.hasProp(k) : (md.prop(k) == v);
									});
									if(pass === true) searchResult.push(md);
								});
							});
						} else {
							N.each(searchTarget,function(dataBinder){
								var passData = [];
								N.each(dataBinder.Child,function(dataBinder){
									var pass = true;
									N.propEach(wantedProps,function(v,k){
										return pass = (v === null || v === '') ? dataBinder.hasProp(k) : (dataBinder.prop(k) == v);
									});
									if(pass === true) searchResult.push(dataBinder);
								});
							});
						}
					} else if(N.likeNumber(path)){
						N.each(searchTarget,function(dataBinder){
							var ch = dataBinder.Child[parseInt(path)];
							if(ch){ searchResult.push(ch); }
						});
					} else {
						N.each(searchTarget,function(dataBinder){
							N.each(searchTarget,function(dataBinder){
								if( dataBinder.DataID == path ) searchResult.push(dataBinder);
							});
						});
					}
					resultData = searchResult;
				});
				return resultData;
			},
			getDataBinderWithID:function(findid){
				return this.RootDataBinder.getDataBinderWithID(findid);
			},
			getDataBinderWithOffset:function(path,offset){
				var value = /(.*)\/([\d]+)$/.exec(path);
				if(value === null)console.error("getNextDataBinder 에러",path);return;
				var nextDataBinder = this.getDataBinder(value[1]+"/"+(parseInt(value[2])+offset));
				if(N.isArray(nextDataBinder)) nextDataBinder = nextDataBinder[0];
				return nextDataBinder;
			},
			getRootDataBinder:function(){
				return this.RootDataBinder;
			}
		},function(source,defaultKey){
			this.ContextID             = N.RANDKIT.base36UniqueRandom(5,'co');
			this.Source         = new N.HashSource(source);
			this.DefaultDataKey = defaultKey || "data";
			this.Binder         = new N.Binder();
			// 데이터 안의 모든 Managed data를 생성하여 메타안에 집어넣음
			this.RootDataBinder = this.feedDownDataBinderMake(this.Source.get(),"root");
		});

		N.MODULE("ViewModel",{
			needRenderView:function(depth,dataBinder,feedViews,viewController){
				if(this.Renders[depth]){
					dataBinder.ViewModelScope = new Object();
					var renderResult = N.isModule(this.Renders[depth],"Template") ? dataBinder.template(this.Renders[depth]) : this.Renders[depth].call(dataBinder,dataBinder,feedViews) ;
					dataBinder.ViewModelScope = undefined;
					
					if( renderResult !== false) if(typeof renderResult === 'object' && 'nodeName' in renderResult ) {
						return renderResult;
					} else {
						if(N.isArray(renderResult)) {
							if( renderResult.length == 1 ) return renderResult[0];
							var singleData = N.first(renderResult);
							console.log('경고::ViewModel의 최종 렌더 노드는 하나만 반환되어야 합니다',renderResult);
							return singleData;
						} 
						console.error("오류::ViewModel의 렌더값이 올바르지 않습니다. 대체 렌더링이 실시됩니다.=>",renderResult, this.Renders[depth]);
					}
				}
				return N.make("div",{html:N.toString(dataBinder.prop()),style:'padding-left:10px;'},dataBinder.placeholder("div"));
			},
			clone:function(){
				var init = this.Renders.clone();
				for(var i=0,l=arguments.length;i<l;i++) if( arguments[i] ) init[i] = arguments[i];
				return N.ViewModel.new.apply(undefined,init.toArray());
			}
		},function(renderDepth){
			//tempate 타겟을 설정
			this.Renders = new N.Array(Array.prototype.slice.call(arguments)).map(function(a){ 
				if(typeof a === "string"){
					return new N.Template(a);
				}
				return a; 
			});
		});
	
		N.MODULE("DataBinder",{
			//노드구조
			appendChild:function(childrens){
				var parent = this;
				N.each(childrens,function(child){
					parent.Child.push(child);
					child.Parent = parent;
				});
			},
			removeFromParent:function(){
				if(this.Parent){
					this.Parent.Child.remove(this);
					this.Parent = undefined;
				}
			},
			removeChildren:function(childrens){
				var _self = this;
				N.each(childrens,function(child){
					var index = _self.Child.indexOf(child);
					var select = _self.Child[index];
					if (select) {
						select.removeFromParent();
					}
				});
			},
			breakableFeedDownDataBinder:function(method,param){
				var newParam = method.call(this,param);

				if(newParam !== false) {
					N.each(this.Child,function(child){ 
						return child.breakableFeedDownDataBinder(method,newParam); 
					});
				}

				return newParam;
			},
			//현재부터 자식으로 
			feedDownDataBinder:function(method,param){
				var newParam = method.call(this,param);
				N.each(this.Child,function(child){ child.feedDownDataBinder(method,newParam); });
				return this;
			},
			feedUpManageData:function(method,depth){
				// 돌리는 depth
				var depth = depth ? depth : 0;
				//데이타 얻기
				var mangedDatas = this.Child;

				depth++;
				N.each(mangedDatas,function(child){ child.feedUpManageData(method,depth); });
				method(this,depth-1);
				return this;
			},
			chainUpMangedData:function(method){
				if(typeof method === "function"){
					method.call(this);
					if( this.Parent ) this.Parent.chainUpMangedData(method);
				}
			},
			replaceProp:function(data,rerender){
				if( N.isModule(data,'DataBinder') ) data = data.prop();
				if( typeof data === 'object' ) this.Source.setSource(data);
				if( rerender === true ) this.rerender();
			},
			hasProp:function(key){
				return this.Source.has(key)
			},
			prop:function(key,filter){
				if(arguments.length === 0){
					return this.Source.get();
				} else {
					return this.Source.prop(key,filter);
				}
			},
			setProp:function(key,value,useBind){
				if(typeof key === "string"){
					this.Source.setProp(key,value,false);
					this.DataContext.Binder.send(this,this.DataID+"."+key,value);
				} else if(key === "object"){
					for(var propKey in key) { this.setProp(propKey,key[propKey],false); }
				}
				if(useBind !== false) this.DataContext.Binder.post(this,"GLOBAL.DataBinderWasSetValue",this);
				return this;
			},
			removeProp:function(key){
				if(this.Source.has(key)){
					this.Source.remove(key);
					this.DataContext.Binder.send(this,this.DataID+"."+key,"");
				}
			},
			text:function(key){
				return N.makeText( this.value.apply(this,arguments) )
			},
			bind:function(dataKey,bindElement,optional){
				if(this.PresentorScope) {
					var element = N.isElement(bindElement) ? bindElement : typeof bindElement === "undefined" ? N.create("input!"+bindElement) : N.create(bindElement);
					this.PresentorScope.addBindNode(element,this,dataKey);
					return element;
				} else {
					console.warn("view컨트롤러 스코프 내에서만 bind를 사용할수 있습니다.");
				}
			},
			hidden:function(dataName){
				return this.bind(dataName,"hidden!"+dataName);
			},
			action:function(actionName,actionElement,arg){
				if(this.PresentorScope){
					var element = N.isElement(actionElement) ? actionElement : N.create(actionElement);
					this.PresentorScope.addActionNode(actionName,element,this,arg)
					return element;
				} else {
					console.warn("view컨트롤러 스코프 내에서만 action을 사용할수 있습니다.");
				}
			},
			placeholder:function(tagname){
				if(this.PresentorScope){
					var placeholderElement = N.isElement(tagname) ? tagname : N.create(tagname);
					this.PresentorScope.addPlaceholderNode(this.DataID,placeholderElement);
					return placeholderElement;
				}
			},
			template:function(_template,filter){
				var _self = this;
				
				// filter 에서 function필터링시 메니지드 데이터 스코프에 포함하도록 한다.
				if(typeof filter === 'object'){
	   				 filter = N.propMap(filter,function(v){
	   					if(typeof v === 'function') return function(){ return v.apply(_self,Array.prototype.slice.call(arguments));};
	   					return v;
	   				});
				}
				
				var partialOutput;
				if(typeof _template === 'object') { 
					partialOutput = _template.output(this.prop(),filter);
				} else if(typeof _template === 'string') {
					partialOutput = (new N.Template(_template,true)).output(this.prop(),filter);
				} else { 
					console.error('template 값이 잘못되어 랜더링을 할수 없었습니다.',_template); return false; 
				}
				
				if(partialOutput.isNone()) { 
					console.error("template :: 렌더링할 template를 찾을수 없습니다",partialOutput); return false; 
				}

				partialOutput.partialSetup(['bind','action','placeholder'],
					function(name,node,nodeAlias){
						switch(nodeAlias){
							case 'bind': _self.bind(name,node); break;
							case 'action':
								if(("nd-param" in node.attributes)) {
									_self.action(name,node,N.toObject(node.getAttribute("nd-param")));
									node.removeAttribute("nd-param");
								} else {
									_self.action(name,node);
								}
								break;
							case 'placeholder': _self.placeholder(node); break;
						}
					}
				);
				return partialOutput;
			},
			response:function(responseKey,proc){
				if(typeof responseKey !== "string" && typeof proc !== "function") console.warn("response args must be string & function => ",responseKey,proc);
				if(!this.ViewModelScope) console.warn("response runing must be render scope");
				nd.add(this.BindModelScope,this.ViewModelScope);
				this.DataContext.Binder.listen(this.ViewModelScope,this.DataID+"."+responseKey,function(value,beforeValue,key){ proc(value,key); });
			},
			revertData:function(){
				this.DataContext.getDataWithPath(this.path);
			},
			getPath:function(){
				var path = new N.Array();
				this.chainUpMangedData(function(){ path.push( this.Parent ? this.Parent.Child.indexOf(this) : this.DataContext.ContextID); });
				return path.reverse().join("/");
			},
			querySelectData:function(path){
				if(path == '' || path == '/') return [this];
				return this.DataContext.querySelectData( this.getPath() + '/' + path );
			},
			getDataBinderWithID:function(findid){
				if(typeof findid == 'string') {
					var result;
					this.breakableFeedDownDataBinder(function(){
						if( this.DataID == findid ) {
							result = this;
							return false;
						}
					});
					return result;
				}
			},
			getParentDataBinder : function(){ return this.Parent; },
			getChildDataBinder  : function(){ return this.Child; },
			hasParentDataBinder : function(){ return !!this.Parent; },
			hasChildDataBinder  : function(){ return !!this.Child.length; },
			getDepth:function(){ var depth = 0; this.feedUpManageData(function(m,d){ if (depth < (d + 1)) depth = (d + 1); }); return depth; },
			getLevel:function(){ var level = 0; this.chainUpMangedData(function(){ this.Parent ? level++ : undefined; }); return level; },
			getIndex:function(){ return this.Parent.Child.indexOf(this); },
			getDataID:function(){ return this.DataID; },
			getContextID:function(){ return this.DataContext.ContextID; },
			findById:function(id){
				if(this.DataID == id){
					return this;
				} else {
					var findID;
					this.Child.each(function(child){
						findID = child.findById(id);
						if(findID) return false;
					});
					return findID;
				}
			},
			//뷰컨트롤러와 함께 바인딩되는 메서드들입니다. 렌더시 다음 아래의 메서드들은 절대 호출하면 안됩니다.
			rerender:function(){
				this.DataContext.Binder.post(this,"GLOBAL.DataBinderNeedRerender",this);
			},
			dataBinderIndexExchange:function(changeTarget){
				if(changeTarget){
					this.Parent.Child.changeIndex(this.getIndex(),changeTarget.getIndex());
					this.DataContext.Binder.post(this,"GLOBAL.DataBinderIndexExchange",[this,changeTarget]);
					return true;
				}
				return false;
			},
			//상위 인덱스로
			dataBinderIncrease:function(){
				var nextDataBinder = this.Parent.Child[this.Parent.Child.indexOf(this)+1];
				if (nextDataBinder) return this.dataBinderIndexExchange(nextDataBinder);
				return false;
			},
			//하위 인덱스로
			dataBinderDecrease:function(){
				var prevDataBinder = this.Parent.Child[this.Parent.Child.indexOf(this)-1];
				if (prevDataBinder) return this.dataBinderIndexExchange(prevDataBinder);
				return false;
			},
			//현재 데이터를 제거함
			removeDataBinder:function(onlyThis){
				if(onlyThis === true) {
					this.removeFromParent();
					this.DataContext.Binder.post(this,"GLOBAL.DataBinderRemoved",this);
					this.release();
				} else {
					this.feedUpManageData(function(md){ 
						md.removeDataBinder(true);
					});
				}
			},
			release:function(){
				this.DataContext.Binder.removeListener(this);
				for(var i=0,l=this.BindModelScope.length;i<l;i++){
					this.DataContext.Binder.removeListener(this.BindModelScope.shift());
				} 
				return this.view;
			},
			//하위 데이터를 추가함
			addChildData:function(data){
				if(typeof data === "function") data = data();
				if(typeof data === "object") {
					this.DataContext.feedDownDataBinderMake(data||{},this);
					var makedData = this.Child.last();
					this.DataContext.Binder.post(this,"GLOBAL.DataBinderAddedChild",{"dataID":this.DataID,"newDataBinder":makedData});
					return makedData;
				} else {
					console.warn("addChildData :: append data가 들어오지 않았습니다", data);
				}
			},
			addMemberData:function(data){
				if(this.Parent) return this.Parent.addChildData(data);
			}
		},function(DataContext,initData,dataType){
			this.DataContext = DataContext;
			this.DataID      = N.RANDKIT.base62UniqueRandom(8,'ma');
			this.Source      = new N.HashSource(initData);
			this.SourceType  = dataType || "object";
			//노드구조
			this.Child       = new N.Array();
			this.Parent      = undefined;        
			//현재 컨트롤중인 뷰컨트롤입니다.
			this.PresentorScope = undefined;
			this.BindModelScope = [];
			this.ViewModelScope = undefined;
			//binder setting
			var binder = this.DataContext.Binder;
			var binderPrefix = this.DataID+".";
			binder.prefixListen(this,binderPrefix,function(value,beforeValue,key){
				this.setProp(key,value);
			});
			//bindfix
			this.Source.each(function(v,k){
				binder.beforeProperty.setProp(binderPrefix+k,v);
			});
		});

		N.MODULE("Presentor",{
			addActionEvent:function(name,method){
				if(!this._dataActions){
					this._dataActions = new N.HashSource();;
					this.ManageDataActions = new N.EventListener(this._dataActions);
				}
				this.ManageDataActions.listen(name,method);
			},
			addPlaceholderNode:function(dataID,placeholderNode){
				if( typeof dataID === "string" && N.isElement(placeholderNode) ){
					this.placeholderNodes[dataID] = placeholderNode;
				}
			},
			addBindNode:function(element,dataBinder,dataKey){
				this.dataBinder.DataContext.Binder.bindNode(element,dataBinder.DataID+"."+dataKey);
			},
			addActionNode:function(actionName,element,dataBinder,arg){
				var viewController = this;
				var _self = this;
				N.node.on(element,"click", function(){
					if(_self.ManageDataActions.hasListener(actionName)){
						_self.ManageDataActions.triggerWithOwner(dataBinder,actionName,arg,element,_self);
					} else {
						console.warn("MVVM::no had action",actionName);
					}
				});
			},
			setDataBinder:function(dataBinder){
				var findDataBinder;
				if(N.isModule(dataBinder,"DataContext")){
					findDataBinder = dataBinder.getRootDataBinder();
				} else if(N.isModule(dataBinder,"DataBinder")) {
					findDataBinder = dataBinder;
				} else if(typeof dataBinder === 'object') {
					findDataBinder = new N.DataContext(dataBinder).getRootDataBinder();
				}
				if(!findDataBinder){
					console.warn("setDataBinder::dataBinder 오브젝트가 필요합니다. 들어온 값->", dataBinder);
					return false;
				}
		
				if(this.dataBinder){
					if(this.dataBinder.DataContext === findDataBinder.DataContext){
						return true;
					}
					if(this.dataBinder.DataContext !== findDataBinder.DataContext){
						this.dataBinder.DataContext.Binder.removeListener(this);
					}
				}
				
				this.dataBinder = findDataBinder;
				var currentBinder = findDataBinder.DataContext.Binder;
		
				currentBinder.listen(this,"GLOBAL.DataBinderNeedRerender",function(rerenderDataBinder){
					//부모의 placehoder를 찾음
					var parentDataBinder = rerenderDataBinder.getParentDataBinder();
					if(parentDataBinder) {
						//부모의 placeholder가 존재해야 작동함
						var parentPlaceHolder = this.placeholderNodes[parentDataBinder.getDataID()];
						var beforeElement     = this.structureNodes[rerenderDataBinder.getDataID()];
						var beforePlaceHolder = this.placeholderNodes[rerenderDataBinder.getDataID()];
						
						if(!beforeElement) console.error('rerender 대상의 데이터를 찾을 수 없습니다.') ;
						if(parentPlaceHolder) {
							//바꿔치기 하기
							this.needDisplay(rerenderDataBinder,parentPlaceHolder,true);
							N.node.before(beforeElement,this.structureNodes[rerenderDataBinder.DataID]);
							//placeHolder를 가지고 있었을 경우에만 호출됨
							if(beforePlaceHolder) N.node.append(this.placeholderNodes[rerenderDataBinder.DataID],beforePlaceHolder.children);
							//remove binder
							rerenderDataBinder.DataContext.Binder.removeListenerWithNode(beforeElement);
							N.node.remove(beforeElement);
						} else {
							return console.error("부모의 placeholder가 존재해야 rerender가 작동할수 있습니다.");
						}
					} else {
						this.needDisplay(rerenderDataBinder);
					}
					this.ManagePresentorEvent.trigger("dataChange","rerender",rerenderDataBinder,this.structureNodes[rerenderDataBinder.DataID]);
					this.ManagePresentorEvent.trigger("displayChange",this,this.view);
				});
		
				currentBinder.listen(this,"GLOBAL.DataBinderIndexExchange",function(changesDataBinder){
					
					var node1 = this.structureNodes[changesDataBinder[0].DataID];
					var node2 = this.structureNodes[changesDataBinder[1].DataID];
			
					if(node1 && node2){
						var nodeHelper1 = N.create("div");
						var nodeHelper2 = N.create("div");
						N.node.before(node1,nodeHelper1);
						N.node.before(node2,nodeHelper2);
						N.node.before(nodeHelper1,node2);
						N.node.before(nodeHelper2,node1);
						N.node.remove(nodeHelper1);
						N.node.remove(nodeHelper2);
	
						this.ManagePresentorEvent.trigger("dataChange","position",changesDataBinder[0],node1);
						this.ManagePresentorEvent.trigger("dataChange","position",changesDataBinder[1],node2);
					}
				});
		
				currentBinder.listen(this,"GLOBAL.DataBinderRemoved",function(dataBinder){
					var dataID = dataBinder.DataID;
					if(this.structureNodes[dataID]){
						var _self = this;
						//바인드값 삭제
						dataBinder.DataContext.Binder.removeListenerWithNode(this.structureNodes[dataID]);
						
						//스트럭쳐 노드 삭제				
						N.node.remove(this.structureNodes[dataID])
						delete this.structureNodes[dataID];
						//	
						this.ManagePresentorEvent.trigger("dataChange","remove",dataBinder);
						this.ManagePresentorEvent.trigger("displayChange",this,this.view);
					}
					//
					if(this.placeholderNodes[dataID]) delete this.placeholderNodes[dataID];
				});
				currentBinder.listen(this,"GLOBAL.DataBinderAddedChild",function(params){
					try {
						if(this.placeholderNodes[params.dataID]) {
							this.needDisplay(params.newDataBinder,this.placeholderNodes[params.dataID]);
							this.ManagePresentorEvent.trigger("dataChange","append",params.newDataBinder,this.structureNodes[params.newDataBinder.DataID]);
							this.ManagePresentorEvent.trigger("displayChange",this,this.view);
						}
					} catch(e) {
						console.log(e);
						console.log(this.placeholderNodes);
					}
					
				});				
				currentBinder.listen(this,"GLOBAL.DataBinderWasSetValue",function(dataBinder){
					this.ManagePresentorEvent.trigger("propChange","bind",dataBinder,this.structureNodes[dataBinder.DataID])
					this.ManagePresentorEvent.trigger("displayChange",this,this.view);
				});
		
				//end
				return true;		
			},
			needDisplay:function(dataBinder,rootElement,sigleRenderMode){
				//기본적으로 존재하지 않는값을 경고해줌
				if(!this.dataBinder) console.warn("DataContextViewController:: Must need set DataBinder before needDisplay");
				if(!this.viewModel) console.warn("DataContextViewController:: Must need set ViewModel before needDisplay");
				//파라메터 두개가 존재하지 않으면 초기화 진행을 한다
				if( (!dataBinder) && (!rootElement) ){
					this.view.innerHTML= '';
					this.bindValueNodes = new N.Array();
					this.structureNodes = {};
					this.placeholderNodes = {};
					this.selectIndexes  = new N.Array();
				}
				dataBinder     = dataBinder || this.dataBinder;
				rootElement     = rootElement || this.view;
				var viewController = this;
				var feedCollection = N.arrays(this.dataBinder.getDepth());
				var lastFeed       = null;
				var topLevel       = this.dataBinder.getLevel();
				var startDepth     = dataBinder.getLevel();

				//후가공
				var renderPostpress = function(node,dataBinder,depth){
					node.setAttribute('data-databinder-id',dataBinder.DataID);
					node.setAttribute('data-databinder-depth',depth);
				};

				if (sigleRenderMode == true) {
					// 메니지드 데이터에 현재 스코프를 등록함
					dataBinder.PresentorScope = viewController;
					//slngleRenderMode의 관리는 매우 중요함 else문의 블럭과 동일하게 동작하도록 주의할것
					var renderResult = viewController.viewModel.needRenderView(startDepth-topLevel,dataBinder,[],viewController);
					renderPostpress(renderResult,dataBinder,startDepth - topLevel);
					// 루트에 추가함
					rootElement.appendChild(renderResult);
					// 그린내역을 기록함
					if(N.isElement(renderResult) || N.isTextNode(renderResult)) viewController.structureNodes[dataBinder.DataID] = renderResult;
					// 현재 스코프를 지움
					dataBinder.PresentorScope = undefined;
				} else {
					dataBinder.feedUpManageData(function(dataBinder,depth){
						// 마지막 피드가 존재하지 않으면 depth값을 초기화함
						if (lastFeed == null) lastFeed = depth;

						// 메니지드 데이터에 현재 스코프를 등록함
						dataBinder.PresentorScope = viewController;

						var renderResult;

						if (depth == startDepth) {
							// 최상위 렌더링
							renderResult = viewController.viewModel.needRenderView(depth-topLevel,dataBinder,feedCollection[depth+1],viewController);
							renderPostpress(renderResult,dataBinder,depth);
							//루트에 추가
							rootElement.appendChild(renderResult);
							//컨테이너에 추가
							if( viewController.placeholderNodes[dataBinder.DataID] ) N.node.append(viewController.placeholderNodes[dataBinder.DataID],feedCollection[depth+1]);
							feedCollection[depth+1] = [];
						} else if (depth < lastFeed) {
							// 렌더 피드가 올라감
							var renderResult = viewController.viewModel.needRenderView(depth-topLevel,dataBinder,feedCollection[lastFeed],viewController);
							renderPostpress(renderResult,dataBinder,depth);
							//컨테이너에 추가
							if( viewController.placeholderNodes[dataBinder.DataID] ){ 
								N.node.append(viewController.placeholderNodes[dataBinder.DataID],feedCollection[lastFeed])
							};
							//피드 초기화
							feedCollection[lastFeed] = [];
							feedCollection[depth].push(renderResult);
						} else {
							// 최하위 피드모음
							// 렌더 피드가 내려감
							var renderResult = viewController.viewModel.needRenderView(depth-topLevel,dataBinder,[],viewController);
							renderPostpress(renderResult,dataBinder,depth);
							feedCollection[depth].push(renderResult);
						}
						// 마지막 피드 depth를 기록함
						lastFeed = depth;

						// 그린내역을 기록함
						if(N.isElement(renderResult) || N.isTextNode(renderResult)) viewController.structureNodes[dataBinder.DataID] = renderResult;

						// 현재 스코프를 지움
						dataBinder.PresentorScope = undefined;
	
					},startDepth);
				}
				this.ManagePresentorEvent.trigger("displayChange",this,this.view);
				return this;
			},
			needDisplayWithViewModel:function(newViewModel){
				this.viewModel = newViewModel;
				this.needDisplay();
			},
			needDisplayWithData:function(data){
				this.setDataBinder(data) ? this.needDisplay() : console.warn("데이터를 초기화하는데 실패하였습니다. 데이터의 형식이 잘못되었습니다.",data);
			},
			findByDataBinder:function(dataBinder){
				return this.structureNodes[dataBinder.getDataID()];
			},
			findByManagedId:function(dataBinderID){
				return this.structureNodes[dataBinderID];
			},
			findByIndex:function(){
				var selectQuery = N.filter(N.argumentsFlatten(arguments),function(v){ return (typeof v === "number" || v === "*")?true:false; },N.map,function(v,i){
					return v === "*" ? "[data-databinder-depth=\""+i+"\"]" : "[data-databinder-depth=\""+i+"\"]:nth-child("+(v+1)+")";
				}).join(" ");
				return new nd.NodeHandler(selectQuery,this.view);
			},
			getDataBinderByNode:function(node,strict){
				if(strict === true) {
					for(var key in this.structureNodes) if(this.structureNodes[key] === node) return this.dataBinder.getDataBinderWithID(key);
				} else {
					if( N.node.is(node,'[data-databinder-id]') ) return this.getDataBinderByNode(node,true);
					var parentNode = N.findParent(node,'[data-databinder-id]');
					if(parentNode) return this.getDataBinderByNode(parentNode,true);
				}
			},
			getRootDataBinder:function(){
				return this.dataBinder;
			},
			getDataBinderByIndex:function(){
				var _dataContext = this.getRootDataBinder();
				return N.map(this.findByIndex.apply(this,Array.prototype.slice.call(arguments)),function(node){
					return _dataContext.getDataBinderWithID(nd.node.data(node,"databinder-id"));
				});
			}
		},function(view,dataBinder,viewModel,needDisplay){
			this.view = N.findLite(view)[0];
			if(!this.view) console.error('초기화 실패 View를 찾을수 없음 => ', view);
			
			this.structureNodes = {};
			this.placeholderNodes = {};
			
			//events
			this.ManagePresentorEvent = new N.EventListener(this);
			this.ManagePresentorEvent.addEventRegister(["propChange","dataChange","displayChange"]);
			this.ManagePresentorEvent.addTriggerRegister(["displayChange"]);
			this.addActionEvent("up",function(arg,el,vc){
				if(typeof arg === "function") {
					if( arg(this,element) != false ) this.dataBinderDecrease();
				} else {
					this.dataBinderDecrease();
				}
			});
			this.addActionEvent("down",function(arg,el,vc){
				if(typeof arg === "function") {
					if( arg(this,element) != false ) this.dataBinderIncrease();
				} else {
					this.dataBinderIncrease();
				}
			});
			this.addActionEvent("append",function(arg,el,vc){ this.addChildData(arg); });
			this.addActionEvent("delete",function(arg,el,vc){ this.removeDataBinder(); });
			
			this.viewModel = viewModel ? N.isArray(viewModel) ? N.ViewModel.new.apply(undefined,N.toArray(viewModel)) : viewModel : new N.ViewModel();
			
			if(dataBinder)this.setDataBinder(dataBinder);

			//needDisplay
			if(typeof needDisplay === "function") needDisplay = N.CALL(needDisplay,this);
			if(needDisplay === true) this.needDisplay();
		});
		
		
		N.MODULE("Timefire",{
			isProgress:function(){
				return this._timeout !== null;
			},
			cancel:function(finish){
				clearTimeout(this._timeout);
				this._timeout = null;
				if(finish !== true){
					this.EventListener.trigger("cancle");
				}
			},
			trigger:function(){
				if( this._timeout ){
					clearTimeout(this._timeout);
				} else {
					this.EventListener.trigger("start");
				}
				this.EventListener.trigger("trigger");
				
				var timefire = this;
				
				this._timeout = setTimeout(function(){
					timefire.cancel(true);
					timefire.EventListener.trigger("fire");
				},this.initFireTime);
			}
		},function(fireTime,finish){
			this.initFireTime  = typeof fireTime === 'number' ? fireTime : 300;
			this.rate          = typeof rate     === 'number' ? rate     : 50;
			this.EventListener = new N.EventListener(this);
			this.EventListener.addEventRegister(["start","trigger","cancle","fire"]);
			if(typeof finish === "function") this.onFire(finish);
			this._timeout = null;
		});
	
		N.MODULE("ResizeNode",{
			width:function(){
				return this.Source.offsetWidth;
			},
			height:function(){
				return this.Source.offsetHeight;
			},
			trigger:function(data){
				this.Handler(data);
			},
			destroy:function(){ N.node.off(window,'resize',this.Handler); }
		},function(target,triggeringMethod,firstTriggering,delay){
			this.Source = N.findLite(target)[0];
			this.TriggeringMethod = triggeringMethod;
			this.Delay          = N.toNumber(delay);
		
			if(this.Source && this.TriggeringMethod) {
			
				if(firstTriggering !== true) {
					this.lastWidth  = this.Source.offsetWidth;
					this.lastHeight = this.Source.offsetHeight;
				}
			
				var _ = this;
				this.Handler = function(e){
					if( _.Delay ) {
						var t = setTimeout(function(){
						
							//오프셋이 올바르지 않은 엘리먼트가 도큐먼트에 종속되지 않은 상태라면
							if( _.Source.offsetWidth == 0 || _.Source.offsetHeight == 0) 
								if( N.findParents(_.Source,N.last).tagName !== 'HTML' ) return;
						
							if( (_.lastWidth !== _.Source.offsetWidth) || (_.lastHeight !== _.Source.offsetHeight) ){
								_.lastWidth  = _.Source.offsetWidth;
								_.lastHeight = _.Source.offsetHeight;
								_.TriggeringMethod.call(_.Source,e,_);
							}
							clearTimeout(t);
						},_.Delay);
					} else {
						if( _.Source.offsetWidth == 0 && _.Source.offsetHeight == 0) return;
						if( (_.lastWidth !== _.Source.offsetWidth) || (_.lastHeight !== _.Source.offsetHeight) ){
							_.lastWidth  = _.Source.offsetWidth;
							_.lastHeight = _.Source.offsetHeight;
							_.TriggeringMethod.call(_.Source,e,_);
						}
					
					}
				};
				if(firstTriggering === true) {
					this.Handler({});
				}
			
				N.node.on(window,'resize',this.Handler);
			}
		});
		
	
		//partial module
		//성능의 가속을 위해 존재하는 값들입니다.
		var PARTIAL_DATA_KEYS = ['dataset','val','href','put','display','for'];
		var PARTIAL_ATTR_KEYS = ["nd-dataset","nd-val","nd-href","nd-put","nd-display","nd-for"];
		var PARTIAL_SEL_KEYS  = ["[nd-dataset]","[nd-val]","[nd-href]","[nd-put]","[nd-display]","[nd-for]"];
		N.EXTEND_MODULE("NodeHandler","Partial",{
			findPartial:function(partialCase,partialKey){
				if(arguments.length === 0) return N.clone(this.__partialPointer);
				if(!(partialCase in this.__partialPointer)) 
					return console.error("NodeHandler::partial case가 존재하지 않습니다.",partialCase,this.__partialPointer);
				if(arguments.length === 1) return N.clone(this.__partialPointer[partialCase]);
				return new N.NodeHandler(this.__partialPointer[partialCase][partialKey]);
			},
			"for":function(key,proc){
				if(typeof key === "object"){
					var r=[]; for(var k in key) r.push(this.for(k,key[k])); return r;
				}
			
				var ff = this.findPartial("for",key);
				return (typeof proc === "function") ? ff.each(proc) : ff;
			},
			val:function(key,value){
				if(typeof key === "object"){
					var r=[]; for(var k in key) r.push(this.val(k,key[k])); return r;
				}
			
				if(arguments.length === 2){
					if(value !== undefined || value !== null){
						this.findPartial("val",key).each(function(node){
							return N.node.value(node,value);
						});
					}
					return this;
				} else {
					return this.findPartial("val",key).value();
				}
			},
			put:function(key,value){
				if(typeof key === "object"){
					var r=[]; for(var k in key) r.push(this.put(k,key[k])); return r;
				}
			
				var puts = nd.findLite(value);
				if(!puts.length) return this;
				this.findPartial("put",key).each(function(node){
					return N.node.put(node,puts);
				})
				return this;
			},
			// 실제 노드의 키를 지우면서 실행함
			partialSetup:function(propKeys,callback,presets){
				var keys  = propKeys;
				var pKeys = (presets && presets.pKeys) ? presets.pKeys : (new N.Array(keys)).map(function(key){ return 'nd-'+key; });
				var sKeys = (presets && presets.sKeys) ? presets.sKeys : (new N.Array(pKeys)).map(function(pkey){ return '['+ pkey +']'; });
				var pNodes = this.find(sKeys.join(','));
				for(var i=0,l=pNodes.length;i<l;i++){
					for(var si=0,sl=sKeys.length;si<sl;si++){
						if(N.NODEKIT.the(pNodes[i],sKeys[si])) {
							callback(pNodes[i].getAttribute(pKeys[si]),pNodes[i],keys[si]);
							pNodes[i].removeAttribute(pKeys[si]);
						}
					}
				}
			},
			setPartialProperties:function(data,filter){
				if(!data)data={};
				var pointer = this.__partialPointer;
				this.partialSetup(PARTIAL_DATA_KEYS,function(name,node,nodeAlias){
						if(!(nodeAlias in pointer)) pointer[nodeAlias] = {};
						name.replace(/\S+/g,function(s){
							if(!pointer[nodeAlias][s]) pointer[nodeAlias][s] = [];
							pointer[nodeAlias][s].push(node);
						});
					},{pKeys:PARTIAL_ATTR_KEYS,sKeys:PARTIAL_SEL_KEYS}
				);
		
				if(typeof filter === 'object') {
					N.propEach(filter,function(value,key){
						if(typeof value === 'function') {
							if( pointer.custom && (key in pointer.custom) ) {
								data[key] = value;
							} else {
								data[key] = value.call(data,data[key],key,data);
							}
						} else {
							data[key] = value;
						}
					});
				}
			
				//퍼포먼스 중심 코딩
				for(var partialCase in pointer) {
					for(var attrValue in pointer[partialCase]) {
						if(attrValue in data && data[attrValue] !== null) {
							var nodelist = pointer[partialCase][attrValue];
							for(var i=0,l=nodelist.length;i<l;i++) {
								var node = nodelist[i];
								switch(partialCase){
									case "val":N.node.value(node,data[attrValue]);break;
									case "html":node.innerHTML = data[attrValue];break;
									case "href" :node.setAttribute("href",data[attrValue]);break;
									case "class":N.node.addClass(node,data[attrValue]);break;
									case "put"    : N.node.put(node,data[attrValue]); break;
									case "display": if(!data[attrValue]){N.node.style(node,'display','none');}  break;
									case "dataset": N.propEach(data[attrValue],function(key,value){ node.dataset[value] = key; });break;
									case "for" : 
										if(typeof data[attrValue] === 'function') data[attrValue].call(node,node,attrValue);
										break;
								}
							}
						}
					}
				}
				return this;
			},
			release:function(){
				var finalData = this.toArray();
				this.splice(0,this.length);
				this.__partialPointer = null;
				return finalData;
			}
		},function(node,nodeProp,filter){ 
			if(typeof node === "string"){
				node = node.trim();
				node = (/^</.test(node) && />$/.test(node)) ? N.parseHTML(node) : N.makes(node);
			} 
			this.setSource(N.findLite(node));
			this.__partialPointer = {};
			this.setPartialProperties(nodeProp,filter);
		});
	
		N.EXTEND_MODULE("NodeHandler","Template",{
			clone :function(){ return new N.Template(this,this.defaultFilter); },
			partial:function(nodeData,filter){
				return new N.Partial(N.cloneNodes(this),nodeData,N.marge(this.defaultFilter,filter));
			},
			render:function(nodeData,filter){
				return this.output(nodeData,N.marge(this.defaultFilter,filter)).release()[0];
			}
		},function(node,defaultFilter){
			this.defaultFilter = defaultFilter;
			this.setSource(N.makeSampleNode(node));
		});
		
		
	})(window,N,N.ENV);
