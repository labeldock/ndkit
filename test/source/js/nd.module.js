//******************
// NodyArray
N.ARRAY_MODULE("Array",{
	each     : function(block) { for ( var i=0,l=this.length;i<l;i++) { if( block(this[i],i) == false ) break; } return this; },
	reverseEach : function(block) { for ( var i=this.length-1;i>-1;i--) { if( block(this[i],i) == false ) break; } return this; },
	keys  : function(rule){ return N.propKey(this,rule); },
	zero  :function(){ return N.first(this); },
	first :function(){ return N.first(this); },
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
		if( N.isArray(v) ) {
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
		if( !N.isArray(a) ) return this.push(a);
		for(var i=0,l=a.length;i<l;i++) this.push(a[i]);
		return this;
	},
	prepend:function(a){
		if(a === undefined || a === null) return this;
		if( !N.isArray(a) ) return this.insert(a,0);
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
	stringFlatten:function(){ return this.save().setMap(function(t){ if(typeof t === "string") return t.split(" "); if(N.isArray(t)) return new N.Array(t).setFlatten().setFilter(function(v){ return N.is(v,"string")}); }).remove(undefined).setFlatten(); },
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
	random:function(length){ return new N.Array(N.dataRandom(this.toArray())); },
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
			//name base form data
			getFormData:function(){ 
				return N.inject(this,function(inj,node){
					N.extend(inj,(new N.Form(node)).getFormData()); 
				}); 
			},
			setFormData:function(data){ 
				if(typeof data === 'object'){
					this.each(function(node){ (new N.Form(node)).setFormData(data); });
					return this; 
				} 
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
			output:function(nodeData,filter){
				return new N.Partial(N.cloneNodes(this),nodeData,N.marge(this.defaultFilter,filter));
			},
			render:function(nodeData,filter){
				return this.output(nodeData,N.marge(this.defaultFilter,filter)).release()[0];
			},
			renders:function(nodeDatas,filter){
				var _self = this;
				var filter = N.marge(this.defaultFilter,filter);
				return N.map(nodeDatas,function(data){
					return _self.output(data,filter).release()[0];
				});
			}
		},function(node,defaultFilter){
			this.defaultFilter = defaultFilter;
			this.setSource(N.makeSampleNode(node));
		});
	})(window,N,N.ENV);

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
			isValid        :function(f){ if(typeof f === "function") return f.call(this); return N.isNode(this.Source); },
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
			if( !N.isNode(this.Source) ) { console.error( "Frame::Context를 처리할 수 없습니다. => ",this.Source," <= ", context); }
		
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
				
					if(N.isNode(selNode)) {
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
				return new N.NodeHandler(N.find.apply(undefined,N.ownerMap(this,[innerKey,this.view].concat(Array.prototype.slice.call(arguments,1)))));
			},
			find:function(query){
				return N.find.apply(undefined,N.ownerMap(this,[query,this.view].concat(Array.prototype.slice.call(arguments,1))));
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
				
				N.TRY_CATCH(function(){
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
							N.TRY_CATCH(
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
								N.TRY_CATCH(function(){
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
					var element = N.isNode(bindElement) ? bindElement : typeof bindElement === "undefined" ? N.create("input!"+bindElement) : N.create(bindElement);
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
					var element = N.isNode(actionElement) ? actionElement : N.create(actionElement);
					this.PresentorScope.addActionNode(actionName,element,this,arg)
					return element;
				} else {
					console.warn("view컨트롤러 스코프 내에서만 action을 사용할수 있습니다.");
				}
			},
			placeholder:function(tagname){
				if(this.PresentorScope){
					var placeholderElement = N.isNode(tagname) ? tagname : N.create(tagname);
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
				if( typeof dataID === "string" && N.isNode(placeholderNode) ){
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
					if(N.isNode(renderResult) || N.isTextNode(renderResult)) viewController.structureNodes[dataBinder.DataID] = renderResult;
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
						if(N.isNode(renderResult) || N.isTextNode(renderResult)) viewController.structureNodes[dataBinder.DataID] = renderResult;

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
	
		N.EXTEND_MODULE("Counter","BezierCounter",{
			setCubicBezier:function(x1,x2,y1,y2){
				this.setCountProcessor(N.workerOfCubicBezier(
					(typeof x1 === "number") ? x1 : 0,
					(typeof x2 === "number") ? x2 : 0,
					(typeof y1 === "number") ? y1 : 0,
					(typeof y2 === "number") ? y2 : 0
				));
			}
		},function(x1,x2,y1,y2,ms,counting,finish,rate,now){
			this.setCubicBezier(x1,x2,y1,y2)
			this._super(ms,counting,finish,rate,now);
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
	})(window,N,N.ENV);
