/* 
 * ndkit.webkit.js (https://github.com/labeldock/ndkit)
 * Copyright HOJUNG-AHN. and other contributors
 * Released under the MIT license
 */

nd && nd.PLUGIN(function(N,CORE){
	
	N.VERSION += ", webkit(0.0 alpah pre)", N.BUILD += ", webkit(2)";
	
	// addEventListener polyfill by https://gist.github.com/jonathantneal/3748027
	!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
		WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
			var target = this;

			registry.unshift([target, type, listener, function (event) {
				event.currentTarget = target;
				event.preventDefault = function () { event.returnValue = false };
				event.stopPropagation = function () { event.cancelBubble = true };
				event.target = event.srcElement || target;

				listener.call(target, event);
			}]);

			this.attachEvent("on" + type, registry[0][3]);
		};

		WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
			for (var index = 0, register; register = registry[index]; ++index) {
				if (register[0] == this && register[1] == type && register[2] == listener) {
					return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
				}
			}
		};

		WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
			return this.fireEvent("on" + eventObject.type, eventObject);
		};
	})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
	
	
	//
	// webkit : include
	//
	
	N.include =function(aFilename){
		var fileref,filetype = /\.([^\.]+)$/.exec(aFilename)[1];
		if (filetype==="js"){ 
			//if aFilename is a external JavaScript file
			fileref=document.createElement('script');
			fileref.setAttribute("type","text/javascript");
			fileref.setAttribute("src", aFilename);
		}
		else if (filetype==="css") {
			//if aFilename is an external CSS file
			fileref=document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", aFilename);
		}
		document.getElementsByTagName("head")[0].appendChild(fileref);
	};
	
	//
	// webkit : url
	//
	N.url = {
		info : function(url){
			var info;
			
			CORE.TRY_CATCH(
				function(){
					info = /([\w]+)(\:[\/]+)([^/]*\@|)([\w\d\.\-\_\+]+)(\:[\d]+|)(\/|)([\w\d\.\/\-\_]+|)(\?[\d\w\=\&\%]+|)(\#[\d\w]*|)/.exec(url?url:window.document.URL.toString());
				},
				function(){
					info = null;
				}
			)
			if(info === null) {
				console.error("N.url.info::faild get url info",e);
				return null;
			}
		
			return {
				"url"      : window.document.URL.toString(),
				"protocol" : info[1],
				"divider"  : info[2],
				"userinfo" : info[3],
				"hostname" : info[4],
				"port"     : info[5].substring(1),
				"path"     : info[6]+info[7],
				"query"    : info[8],
				"fragment" : info[9],
				"filename" : /(\/|)([\w\d\.\-\_]+|)$/.exec(info[6]+info[7])[2]
			};
		},
		root:function(url){ var 
			h = N.url.info(url);
			var root = h.protocol + h.divider + h.hostname + (h.port !== ""?":"+h.port:h.port);
			return /\/$/.test(root) ? root : root + "/";
		},
		script:function(){ 
			var scripts = document.getElementsByTagName('script');
			var lastScript = scripts[scripts.length-1];
			var scriptString;
			if(lastScript){
				scriptString = lastScript.src;
			} else {
				console.warn("GETSCRIPTURL faild");
			}
			//ie7 fix
			if(!/^[\w]+\:\//.test(scriptString)) scriptString = N.url.root() + scriptString;
			return scriptString;
		},
		scriptRoot:function(){ return N.url.script().replace(/([^\/]+$)/,""); },
	};
	
	//
	// webkit : broweser env
	//
	N.ENV = (function(){
		var info = {};
		
		info.online = navigator ? navigator.onLine : false;
		
		//support LocalStorage
		info.supportLocalStorage = window ? ('localStorage' in window) ? true : false : false;
		info.localStorage = window.localStorage;
		
		//support SessionStorage
		info.supportSessionStorage = window ? ('sessionStorage' in window) ? true : false : false;
		info.sessionStorage = window.sessionStorage;
		
		//storage hack
		info.supportStorage = info.supportLocalStorage || info.supportSessionStorage;
		info.storage = info.localStorage || info.sessionStorage;
		
		//support ComputedStyle
		info.supportComputedStyle  =  window ? ('getComputedStyle' in window) ? true : false : false;
	
		var lab3Prefix = function(s){
			if( s.match(/^Webkit/) ) return "-webkit-";
			if( s.match(/^Moz/) )    return "-moz-";
			if( s.match(/^O/) )      return "-o-";
			if( s.match(/^ms/) )     return "-ms-";
			return "";
		};
	
		var supportPrefix = {};
	
		info.getCSSName = function(cssName){
			if(typeof cssName !== "string"){
				return cssName+"";
			}
			cssName.trim();
			for(var prefix in supportPrefix) {
				if( cssName.indexOf(prefix) === 0 ) {
					var sp = supportPrefix[prefix];
					if( sp.length ) return sp+cssName;
				}
			}
			return cssName;
		};
	
		var tester = document.createElement('div');
	
		//transform
		support = false;
		"transform WebkitTransform MozTransform OTransform msTransform".replace(/\S+/g,function(s){ if(s in tester.style){
			support = true;	
			supportPrefix["transform"] = lab3Prefix(s);
		}});
		info.supportTransform = support;
	
		//transition
		support = false;
		"transition WebkitTransition MozTransition OTransition msTransition".replace(/\S+/g,function(s){ if(s in tester.style){
			support = true;
			supportPrefix["transition"] = lab3Prefix(s);
		}});
		info.supportTransition = support;
	
		//getUserMedia
		info.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		info.supportGetUserMedia = !!info.getUserMedia;
	
		//ie8 fix nodelist slice
		info.supportNodeListSlice = (function(){try{Array.prototype.slice.call(NodeList);return true;}catch(e){return false;}}());
	
		//matches
		info.querySelectorAllName =
			('querySelectorAll'       in document) ? 'querySelectorAll' :
			('webkitQuerySelectorAll' in document) ? 'webkitQuerySelectorAll' :
			('msQuerySelectorAll'     in document) ? 'msQuerySelectorAll' :
			('mozQuerySelectorAll'    in document) ? 'mozQuerySelectorAll' :
			('oQuerySelectorAll'      in document) ? 'oQuerySelectorAll' : false;
		info.supportQuerySelectorAll = !!info.querySelectorAllName;
		info.supportStandardQuerySelectorAll = (info.querySelectorAllName === 'querySelectorAll');
		
		//matches
		info.matchesSelectorName = 
			('matches' in tester)               ? 'matches' :
			('webkitMatchesSelector' in tester) ? 'webkitMatchesSelector' :
			('msMatchesSelector'     in tester) ? 'msMatchesSelector' :
			('mozMatchesSelector'    in tester) ? 'mozMatchesSelector' :
			('oMatchesSelector'      in tester) ? 'oMatchesSelector' : false;
		
		info.supportMatches = !!info.matchesSelectorName;
		info.supportStandardMatches = (info.matchesSelectorName === 'matches');
		
		return info;
	}());
	
	var QUERY_SELECTOR_NAME = N.ENV.querySelectorAllName;
	N.QUERY_SELECTOR_ENGINE = N.ENV.supportQuerySelectorAll && N.ENV.supportNodeListSlice ? 
	function(node,selector){
		try {
			return Array.prototype.slice.call(
				(node||document)[QUERY_SELECTOR_NAME](
					selector.replace(/\[[\w\-\_]+\=[^\'\"][^\]]+\]/g, function(s){ 
						return s.replace(/\=.+\]$/,function(s){ 
							return '=\"' + s.substr(1,s.length-2) + '\"]'; 
						}) 
					})
				)
			);
		} catch(e) {
			console.error("Nody::QUERY_SELECTOR_ENGINE error",node,selector);
			if(N.DEBUGER === true)debugger;
		}
	
	}:
	function(node,selector){
		try {
			var nodeList = (node||document)[QUERY_SELECTOR_NAME](
				selector.replace(/\[[\w\-\_]+\=[^\'\"][^\]]+\]/g, function(s){ 
					return s.replace(/\=.+\]$/,function(s){ 
						return '=\"' + s.substr(1,s.length-2) + '\"]'; 
					}) 
				})
			);
		} catch(e) {
			console.error("Nody::QUERY_SELECTOR_ENGINE error",node,selector);
			if(N.DEBUGER === true)debugger;
		}
		var result = [];
		for(var i=0,l=nodeList.length;i<l;i++){
			nodeList[i] && result.push(nodeList[i]);
		} 
		return result;
	};
	//if natvie query selector in browser then alternative engine include
	if(!N.QUERY_SELECTOR_ENGINE){
		if(typeof Sizzle === "function"){
			console.info("nody is sizzle selector engine detected");
			N.QUERY_SELECTOR_ENGINE = function(node,selector){
				return Sizzle(selector,node);
			}
			N.QUERY_SELECTOR_ENGINE_ID = "sizzle";
		} else if(typeof jQuery === "function") {
			console.info("nody is jquery selector engine detected");
			N.QUERY_SELECTOR_ENGINE = function(node,selector){
				return jQuery(selector,node).toArray();
			}
			N.QUERY_SELECTOR_ENGINE_ID = "jquery";
		}
	} else {
		N.QUERY_SELECTOR_ENGINE_ID = "browser";
	}
	if(!N.QUERY_SELECTOR_ENGINE){
		N.QUERY_SELECTOR_ENGINE_ID = null;
		throw new Error("Nody::ENV::IMPORTANT!! - querySelectorEngine is not detected");
	}
	var MATCHES_SELECTOR_NAME = N.ENV.matchesSelectorName;
	N.MATCHES_SELECTOR_ENGINE = N.ENV.supportMatches && function(node,selector){ 
		//selectText fix
		return node[MATCHES_SELECTOR_NAME](
			selector.replace(/\[[\w\-\_]+\=[^\'\"][^\]]+\]/g, function(s){ 
				return s.replace(/\=.+\]$/,function(s){ 
					return '=\"' + s.substr(1,s.length-2) + '\"]'; 
				}) 
			})
		); 
	}; 
	//if natvie matches selector in browser then alternative engine include
	if(!N.MATCHES_SELECTOR_ENGINE){
		if(typeof Sizzle === "function"){
			N.MATCHES_SELECTOR_ENGINE = function(node,selector){
				return Sizzle.matchesSelector(node,selector);
			}
			N.MATCHES_SELECTOR_ENGINE_ID = "sizzle";
		} else if(typeof jQuery === "function") {
			N.MATCHES_SELECTOR_ENGINE = function(node,selector){
				return jQuery(node).is(selector);
			}
			N.MATCHES_SELECTOR_ENGINE_ID = "jquery";
		}
	} else {
		N.MATCHES_SELECTOR_ENGINE_ID = "browser";
	}
	if(!N.MATCHES_SELECTOR_ENGINE){
		N.MATCHES_SELECTOR_ENGINE_ID = null;
		throw new Error("Nody::ENV::IMPORTANT!! - matchesSelectorEngine is not detected");
	}
	
	
	//
	// webkit : store
	//
	if(window.nodyLoadException==true){ throw new Error("Nody Process Foundation init cancled"); return;}
	
	//expireTime default 16h
	var STORE_DEFAULT_EXPIRE_TIME = 57600000;
	var STORE_DEFAULT_PERSISTENT_TIME = 2000000000;
	N.SINGLETON("STORE",{
		//cookie
		setCookie:function (name, value, expire, path) { document.cookie = name + "=" + escape(value) + ((expire == undefined) ?"" : ("; expires=" + expire.toGMTString())) + ";path=" + (typeof path === "undefined"?"/":escape(path)) },
		getCookie:function (name,path) {
		  var search = name + "="; 
		  if (document.cookie.length > 0) {
		    var offset = document.cookie.indexOf(search); 
		    if (offset != -1){
		        offset += search.length;
		        var end = document.cookie.indexOf(";", offset);
		        if (end == -1) 
		          end = document.cookie.length; 
		        return unescape(document.cookie.substring(offset, end)); 
		    }
		  }
		  return null;
		},
		usingCookie:function (name) { if(this.getCookie(name))return true;return false; },
		touchCookie:function (name, expireTime, cookieValue) {
			if(!this.getCookie(name)) {
				if(!cookieValue)cookieValue = "true";
				
				if(!expireTime) expireTime  = STORE_DEFAULT_EXPIRE_TIME;
				var now    = new Date();
				var expire = new Date();
				expire.setTime(now.getTime()+expireTime);
			    setCookie(name, cookieValue, expire); 
				return true;
			}
			return false;
		},
		removeCookie:function(name,path){ path = ";path=" + (typeof path === "undefined"? "/" : escape(path)); document.cookie=name+"="+path+";expires=Thu, 01 Jan 1970 00:00:01 GMT"; },
		setLocalData:(function(){
			if(N.ENV.supportLocalStorage)
				return function(k,v){
					N.ENV.localStorage.setItem(k,N.toDataString(v));
					return true;
				}
			return function(k,v){ return this.setCookie(k,N.toDataString(v)); };
		}()),
		localData:(function(){
			if(N.ENV.supportLocalStorage)
				return function(k){
					if(!arguments.length) return N.ENV.localStorage;
					var bi = N.ENV.localStorage.getItem(k);
					return (bi==null) ? undefined : N.fromDataString(bi);
				}
			return function(k){ N.fromDataString(this.getCookie(k)); };
		}()),
		usingLocalData:(function(){
			if(N.ENV.supportLocalStorage)
				return function(k){
					return (N.ENV.localStorage.getItem(k) ? true : false);
				}
			return function(k){ this.usingCookie(k) };
		}()),
		touchLocalData:(function(){
			if(N.ENV.supportLocalStorage)
				return function(k,v){
					if( !this.usingLocalData(k) ) this.setLocalData(k,v);
				};
			return function(k,v){ this.touchCookie(k,N.toDataString(v)) };
		}()),
		removeLocalData:(function(){
			if(N.ENV.supportLocalStorage)
				return function(k){
					N.ENV.localStorage.removeItem(k);
				};
			return function(k){this.removeCookie(k)}
		}()),
		setSessionData:(function(){
			if(N.ENV.supportSessionStorage)
				return function(k,v){
					N.ENV.sessionStorage.setItem(k,N.toDataString(v));
					return true;
				}
			return function(k,v){ return this.setCookie(k,N.toDataString(v)); };
		}()),
		sessionData:(function(){
			if(N.ENV.supportSessionStorage)
				return function(k){
					if(!arguments.length) return N.ENV.sessionStorage;
					var bi = N.ENV.sessionStorage.getItem(k);
					return (bi==null) ? undefined : N.fromDataString(bi);
				}
			return function(k){ N.fromDataString(this.getCookie(k)); };
		}()),
		usingSessionData:(function(){
			if(N.ENV.supportSessionStorage)
				return function(k){
					return (N.ENV.sessionStorage.getItem(k) ? true : false);
				}
			return function(k){ this.usingCookie(k) };
		}()),
		touchSessionData:(function(){
			if(N.ENV.supportSessionStorage)
				return function(k,v){
					if( !this.usingSessionData(k) ) this.setSessionData(k,v);
				};
			return function(k,v){ this.touchCookie(k,N.toDataString(v)) };
		}()),
		removeSessionData:(function(){
			if(N.ENV.supportSessionStorage)
				return function(k){
					N.ENV.sessionStorage.removeItem(k);
				};
			return function(k){this.removeCookie(k)}
		}()),			
		//clipboard
		setClipboard:function(s){
			//http://stackoverflow.com/questions/7713182/copy-to-clipboard-for-all-browsers-using-javascript
		    if( window.clipboardData && clipboardData.setData ) { 
				clipboardData.setData("Text", s); 
			} else {
		        // You have to sign the code to enable this or allow the action in about:config by changing
		        user_pref("signed.applets.codebase_principal_support", true);
		        netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
		        var clip = Components.classes['@mozilla.org/widget/clipboard;[[[[1]]]]'].createInstance(Components.interfaces.nsIClipboard);
		        if (!clip) return;
		        // create a transferable
		        var trans = Components.classes['@mozilla.org/widget/transferable;[[[[1]]]]'].createInstance(Components.interfaces.nsITransferable);
		        if (!trans) return;
		        // specify the data we wish to handle. Plaintext in this case.
		        trans.addDataFlavor('text/unicode');
		        // To get the data from the transferable we need two new objects
		        var str = new N.HashSource();
		        var len = new N.HashSource();
		        var str = Components.classes["@mozilla.org/supports-string;[[[[1]]]]"].createInstance(Components.interfaces.nsISupportsString);
		        var copytext=meintext;
		        str.data=copytext;
		        trans.setTransferData("text/unicode",str,copytext.length*[[[[2]]]]);
		        var clipid=Components.interfaces.nsIClipboard;
		        if (!clip) return false;
		        clip.setData(trans,null,clipid.kGlobalClipboard);      
		    }
		},
		"toDataString":function(v){ 
			if(typeof v === "boolean") return v ? "true" : "false";
			return N.toString(v,99,true); 
		},
		"fromDataString":function(v){ 
			if(typeof v === "string") { 
				if( v.charAt(0)=="\"" && v.charAt(v.length-1)=="\"" ){
					return v.substr(1,v.length-2);
				} else {
					return /^(\s+|)$/.test(v) ? "" : eval("(" + v + ")");
				}
				console.error("decodeString::디코딩실패 ->",v,"<-"); throw e;
			}
			return v; 
		}
	});
	N.STORE.EACH_TO_METHOD();
	
	
	//FLASH INTERFACE
	var FLASH_STORE_KEY     = "NODY_FLASH_PERSISTANCE_STORE";
	var FLASH_STORE_BEFORE  = N.sessionData(FLASH_STORE_KEY) || {};
	var FLASH_STORE_CURRENT = {};
	window && window.addEventListener("beforeunload",function(e){ 
		N.removeSessionData(FLASH_STORE_KEY);
		if(N.propLength(FLASH_STORE_CURRENT) > 0){
			N.setSessionData(FLASH_STORE_KEY,FLASH_STORE_CURRENT)
		}
	});
	
	N.SINGLETON("FLASH",{
		flash:function(k){
			return arguments.length ? N.fromDataString(FLASH_STORE_BEFORE[k]) : FLASH_STORE_BEFORE;
		},
		nextFlash:function(k,v){
			if(arguments.length > 1){
				FLASH_STORE_CURRENT[k] = N.toDataString(v);
				return true;
			}
			return arguments.length ? FLASH_STORE_CURRENT[k] : FLASH_STORE_CURRENT;
		}
	})
	N.FLASH.EACH_TO_METHOD();
	
	//******************
	//ClientKit
	
	N.SINGLETON("CLIENTKIT",{
		width :function(){ return (window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth); },
		height:function(){ return (window.innerHeight|| document.documentElement.clientHeight|| document.getElementsByTagName('body')[0].clientHeight); },
		bound :function(){ return {"width":this.width(),"height":this.height()}; },
		//document path
		url      : function()    { return window.document.URL.toString(); },
		urlInfo  : function(url) { return N.url.info(); },
		root      : function(url,slash) { return N.url.root(); },
		protocol  : function(url) { var h = this.urlInfo(url); return h.protocol; },
		uri       : function(url) { var h = this.urlInfo(url); return h.path;     },
		filename  : function(url) { var h = this.urlInfo(url); return h.filename; },
		filepath  : function(url,slash) { 
			var h = this.urlInfo(url);
			var root = h.protocol + h.divider + h.hostname + (h.port != ""?":"+h.port:h.port);
			return root + h.path.replace(/\/[^\/]+$/,"") + (slash==false?"":"/");
		},
		getAbsolutePath:function(url,fp){
			if(N.isNothing(url)){
				return this.url();
			} else if(N.likeString(url)){
				if(this.urlInfo(url)==null){
					url = url.trim();
					if(url.indexOf("./") == 0) { url = url.substr(2); } 
					if(url.indexOf("/") == 0 ){
						return this.root(undefined,false)+url;
					} else {
						var rootUp = 0;
						var filePath    = this.filepath(fp);
						var replacePath = url.replace(/\.\.\//gi,function(s){ rootUp++;return "";});
						for(var i=0;i<rootUp;i++) filePath = filePath.replace(/[^\/]+\/$/,"");
						return filePath + replacePath;
					}
				}
			}
			return url;
		},
		query     : function(url) { var h = this.urlInfo(url); return h.query;    },
		fragment  : function(url) { var h = this.urlInfo(url); return h.fragment; },
		queryData : function(url) { var h = this.urlInfo(url); return N.toObject(h.query); },
		//script path
		scriptUrl  : (function(){ var scripturl = N.url.script(); return function(){ return scripturl; } })(),
		scriptInfo : function(url) { return this.urlInfo(url?url:this.scriptUrl()); },
		scriptName : function(url) { return this.scriptInfo(url).filename },
		scriptPath : function(url) { return this.scriptInfo(url).path     },
		scriptRoot : function(url) { return /(.*\/|\/|)[^\/]*$/.exec(this.scriptInfo(url).path)[1]; },
		isEventSupport:function(eventName,tagName){
			var testTag = (typeof tagName === "object") ? tagName : document.createElement( (typeof tagName === "string") ? tagName : "div" );
			var isSupport = ( eventName in testTag );
			if(!isSupport && ( "setAttribute" in testTag)) {
				testTag.setAttribute(eventName,'return;');
				return (typeof testTag[eventName] === "function");
			}
			return isSupport;
		},
		isLocalHTML:function(){
			return (location.href.indexOf("http:" == 0) || location.href.indexOf("https:" == 0)) ? true : false;
		},
		//include
		include:function(aFilename){ return N.include(aFilename); },
		cursorPoint:function(e) {
		    e = e || window.event; 
			var cursor = { x: 0, y: 0 };
		
			if(e.touches && e.touches[0]) {
				cursor.x = e.touches[0].pageX;
				cursor.y = e.touches[0].pageY;
			} else if (e.pageX || e.pageY) {
		        cursor.x = e.pageX;
		        cursor.y = e.pageY;
		    } else {
		        cursor.x = e.clientX + 
		        (document.documentElement.scrollLeft || 
		        document.body.scrollLeft) - 
		        document.documentElement.clientLeft;
		        cursor.y = e.clientY + 
		        (document.documentElement.scrollTop || 
		        document.body.scrollTop) - 
		        document.documentElement.clientTop;
		    }
		    return cursor;
		},
		//flash version check
		getFlashVersion:function(){
		    // ie
		    try {
		      try {
		        var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
		        try { axo.AllowScriptAccess = 'always'; }
		        catch(e) { return '6,0,0'; }
		      } catch(e) {}
		      return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
		    // other browsers
		    } catch(e) {
		      try {
		        if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
		          return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
		        }
		      } catch(e) {}
		    }
			//maybe plugin not exist
		    return '0,0,0';
		},
		getMajorFlashVersion:function(){
			return parseInt(this.getFlashVersion().split(',')[0]);
		}
	});
	
	var ELUT_REGEX = new RegExp("("+ [
		//pseudo
		"\\:[^\\:]+",
		//tag
		"^[\\w\\-\TA\_]+",
		//attr
		"\\[[\\w\\-\\_]+\\]|\\[\\\'[\\w\\-\\_]+\\\'\\]|\\[\\\"[\\w\\-\\_]+\\\"\\]",
		//attr2
		"\\[[\\w\\-\\_]+\\=[^\\]]+\\]|\\[\\\'[\\w\\-\\_]+\\\'\\=\\\'[^\\]]+\\\'\\]|\\[\\\"[\\w\\-\\_]+\\\"\\=\\\"[^\\]]+\\\"\\]",
		//id
		"\\#[\\w\\-\\_]+",
		//class
		"\\.[\\w\\-\\_]+",
		//special?
		"\\?[\\w\\-\\_]+",
		//special!
		"\\![\\w\\-\\_]+",
		//html
		"::.*$"
	].join("|") +")","gi");

	safeParseMap = {
		option : [1,"<select multiple='multiple'>", "</select>" ],
		legend : [1,"<fieldset>", "</fieldset>" ],
		area   : [1,"<map>", "</map>" ],
		param  : [1,"<object>", "</object>" ],
		thead  : [1,"<table>", "</table>" ],
		tr     : [2,"<table><tbody>", "</tbody></table>" ],
		col    : [2,"<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td     : [3,"<table><tbody><tr>", "</tr></tbody></table>" ]
	};
	safeParseMap.optgroup = safeParseMap.option;
	safeParseMap.tbody    = safeParseMap.tfoot 
						  = safeParseMap.colgroup 
						  = safeParseMap.caption 
						  = safeParseMap.thead;
	safeParseMap.th       = safeParseMap.td;

	N.SINGLETON("ELUT",{
		"parseHTML":function(html){
			//if has cache
			var cache = N.cache.get("N.parseHTML",html);
			if(cache) return N.cloneNodes(cache);
		
			//text node
			if( !/<|&#?\w+;/.test(html) ) return [];
		
			//html
			var tagName=/<([\w]+)/.exec(html), tagName=tagName?tagName[1].toLowerCase():"",
			    parseWrapper = document.createElement("div"), parseDepth = 0;
		
			if( tagName in safeParseMap) {
				parseWrapper.innerHTML = safeParseMap[tagName][1] + html + safeParseMap[tagName][2];
				parseDepth = safeParseMap[tagName][0];
			} else {
				parseWrapper.innerHTML = html;
			}
		
			while ( parseDepth-- ) parseWrapper = parseWrapper.lastChild;
		
			N.cache.set("N.parseHTML",html,N.cloneNodes(parseWrapper.children));
			return N.toArray(parseWrapper.children);
		},
		//테그의 속성을 text로 표현합니다.
		"selectorInfo"   : function(tagProperty,attrValue){ 
			tagProperty = (typeof tagProperty !== "string") ? "" : tagProperty;
		
			//캐쉬를 이용해 잦은 표현에 대한 오버해드를 줄입니다.
			var result = N.cache.get("N.selectorInfo",tagProperty);
			if( result ) {
				result = N.cloneObject( result );
			} else {
				var result  = {};
				var matches = [];
				var rest    = tagProperty;
		
				//find regular expression
				rest = rest.replace(ELUT_REGEX,function(ms){
					if(ms)matches.push(ms);
					return "";
				});
			
				var tagprop = matches.concat(N.safeSplit(rest,":","()",true));
				for(var i=0,l=tagprop.length;i<l;i++){
					var sinfo = /(.?)((.?).*)/.exec(tagprop[i]);
					
					switch(sinfo[1]){
						//id
						case "#" :
							//attr value 우선
							if(!result["id"]) result["id"] = sinfo[2];
							break;
						//class
						case "." :
							if(result["class"]) {
								result["class"] += " ";
								result["class"] += sinfo[2];
							} else {
								result["class"] = sinfo[2];
							}
							break;
						case ":" :
							//html
							if(sinfo[3] == ":"){
								result["::"] = sinfo[0].substr(2);
							} else {
								//metaAttribute
								if(!result[":"]) result[":"] = {};
								var attrInfo = /(:([\w\-\_]+))(\((.*)\)$|)/.exec(sinfo[0]);
								
								switch(attrInfo[1]){
									case ":disabled": case ":readonly": case ":checked":
										result[":"][attrInfo[2]] = true;
										break;
									case ":nth-child":
										result[":"][attrInfo[2]] = (attrInfo[4] === undefined) ? null : attrInfo[4].match(/^(even|odd)$/) ? attrInfo[4] : N.toNumber(attrInfo[4]) 
										break;
									case ":contains": case ":has": case ":not":
										result[":"][attrInfo[2]] = attrInfo[4];
										break;
									case ":first-child": case ":last-child": case ":only-child": case ":even": case ":odd": case ":hover":
										result[":"][attrInfo[2]] = null;
										break;
									default :
										result[":"][attrInfo[2]] = attrInfo[4];
										break;
								}
							}
							break;
						//name
						case "!" : result["name"] = sinfo[2]; break;
						//type
						case "?" : result["type"] = sinfo[2]; break;
						//attr
						case "[" :
							var attr = /\[([\"\'\w\-\_]+)(=|~=|)(.*|)\]$/.exec(sinfo[0]);
							result[N.unwrap(attr[1],["''",'""'])] = (attr[3])? N.unwrap(attr[3],["''",'""']) : null;
						break;
						//tagname
						default : 
							switch(sinfo[0].toLowerCase()){
								case "checkbox": case "file": case "hidden": case "hidden": case "password": case "radio": case "submit": case "text": case "reset": case "image": case "number" :
									result["tagName"] = "input";
									result["type"]    = sinfo[0];
									break;
								default:
									result["tagName"] = sinfo[0].toLowerCase();
									break;
							}
							break;
					}
				
				}
			
				//cache save
				N.cache.set("N.selectorInfo",tagProperty,N.cloneObject(result));
			}
		
			// 두번째 파라메터 처리
			var attr = N.clone(N.toObject(attrValue,"html"));
		
			if("html" in attr){
				attr["::"] = attr["html"];
				delete attr["html"];
			} 
		
			for(var key in attr) result[key] = attr[key];
		
			return result;
		},
		"pushCSSExpression":function(node,expression){
			if(N.isElement(node)){
				var attrs = (typeof expression === "string") ? N.selectorInfo(expression) :
							(typeof expression === "object") ? expression :
							undefined;
				if(typeof attrs === "object"){
					for(var key in attrs)switch(key){
						case ":" :case "::":case "tagName": /*skip*/ break;
						default:
							if(attrs[key] === null || attrs[key] === undefined){
								node.setAttribute(key,"");
							} else {
								node.setAttribute(key,attrs[key]);
							}
							break;
					}
				}
			}
			return node;
		},
		//css스타일 태그를 html스타일 태그로 바꿉니다.
		"parseTag" : CORE.PIPE(function(tagProperty,attrValue){
			if(typeof tagProperty === "object"){
				var tagText = [];
				N.each(tagProperty,function(tag){ if(N.isElement(tag)) tagText.push(tag.outerHTML); });
				return tagText.join('');
			}
			//TAG중첩을 지원하기 위한 것
			if((arguments.length > 1) && (typeof attrValue === "string" || typeof attrValue === "number")) {
				var newValue = "";
				for(var i=1,l=arguments.length;i<l;i++) if(typeof arguments[i] !== "undefined") newValue += arguments[i];
				attrValue = newValue;
			}
			//캐쉬를 이용해 잦은 표현에 대한 오버해드를 줄입니다.
			var tagInfo,cacheName,enableCache = (typeof attrValue === "string" || typeof attrValue === "undefined") ? true : false;
			if(enableCache){
				cacheName = tagProperty;
				//캐쉬가 존재하면 바로 리턴
				var result = N.cache.get("N.parseTag",cacheName);
				if(result)if(attrValue){
					return result[0]+attrValue+result[1];
				} else {
					return result[0]+result[1];
				}
			}
			var tagInfo = N.selectorInfo(tagProperty,attrValue);
		
			if(!("tagName" in tagInfo) || tagInfo.tagName == "*") tagInfo.tagName = "div";
			//make attribute text
			var attributedTexts = "";
			for(var name in tagInfo) switch(name){
				case "tagName":case "::":break;
				case ":": 
					for(inkey in tagInfo[name]){
						switch(inkey){
							case "disabled":case "checked":case "selected":
								attributedTexts += (" " + inkey);
								break;
						}
					}
					break;
				default:
					attributedTexts += ((typeof tagInfo[name] == undefined || tagInfo[name] == null) ? " " + name : " " + name + '="' + tagInfo[name] + '"');
					break;
			}
			attributedTexts = attributedTexts.trim();

			//common attribute process
			var name = "<" + tagInfo.tagName + (attributedTexts.length < 1 ? "" : (" " + attributedTexts));
			var tagValue = tagInfo["::"] || "";
			var cachePrefix,cacheSuffix
		
			if(tagInfo.tagName == "input"){
				cachePrefix = name + ' value="';
				cacheSuffix = '"/>';
			} else {
				cachePrefix = name + '>';
				cacheSuffix = '</' + tagInfo.tagName + '>';
			}
			if(cacheName) N.cache.set("N.parseTag",cacheName,[cachePrefix,cacheSuffix]);
		
		
			return (cachePrefix + tagValue + cacheSuffix);
		},1)
	});
	N.ELUT.EACH_TO_METHOD();
	N.SINGLETON("NODEKIT",{
		"attr":function(node,v1,v2){
			if(!N.isElement(node)) { console.error("N.NODEKIT.attr은 element만 가능합니다. => 들어온값" + N.tos(node)); return null; }
			if(arguments.length === 1) {
				return N.inject(node.attributes,function(inj,attr){
					inj[attr.name] = node.getAttribute(attr.name);
				});				
			} else if(typeof v1 === "object") {
				for(var k in v1) node.setAttribute(k,v1[k]);
			} else if(typeof v1 === "string"){
				var readMode   = typeof v2 === "undefined";
				var lowerKey = v1.toLowerCase();
				switch(lowerKey){
					case "readonly":
						if("readOnly" in node){
							if(readMode){
								return node.readOnly;
							} else {
								node.readOnly = v2;
								return node;
							}
						} 
						break;
					case "disabled": case "checked":
						if(lowerKey in node){
							if(readMode){
								return node[lowerKey];
							} else {
								node[lowerKey] = v2;
								return node;
							}
						}
						break;
				}
				if(readMode){
					var result = (node.getAttribute && node.getAttribute(v1)) || null;
			        if( !result ) {
			            var attrs = node.attributes;
			            if(!N.isNothing(attrs)){
			            	var length = attrs.length;
			            	for(var i = 0; i < length; i++)
								if(attrs[i].nodeName === v1) {
									result = attrs[i].value;
									if(typeof result === "undefined") result = attrs[i].nodeValue;
								} 
			            }
			        }
			        return result;
				} else {
					node.setAttribute(v1,v2);
				}
			}
			return node;
		},
		"root":function(node){
			if(!N.isElement(node)) return;
			var findWhile = function(node){ node.parentElement ? findWhile(node.parentElement) : node ; };
			return findWhile(node);
		},
		"parents":function(node){
			if(!N.isElement(node)) return;
			var finded = [];
			var findWhile = function(node){
				if(node.parentElement){
					finded.push(node.parentElement);
					findWhile(node.parentElement);
				}
			};
			findWhile(node);
			return finded;
		},
		//하나의 CSS테스트
		"the":function(node,selectText){
			return N.MATCHES_SELECTOR_ENGINE(node,selectText);
		},
		//다수의 CSS테스트
		"is":function(node,selectText){
			if(!N.isElement(node)) return false;
			if((typeof selectText === "undefined") || selectText == "*" || selectText == "") return true;
			return N.MATCHES_SELECTOR_ENGINE(node,selectText);
		},
		//쿼리셀렉터와 약간 다른점은 부모도 쿼리 셀렉터에 포함된다는 점
		"query":function(query,root){
			//querySelectorSupport
			if(typeof query !== "string" || (query.trim().length == 0)) return [];
			root = ((typeof root === "undefined")?document:N.isElement(root)?root:document);
			if(root == document) {
				return N.QUERY_SELECTOR_ENGINE(root,query);
			} else {
				if(N.MATCHES_SELECTOR_ENGINE(root,query))
				return [root].concat(Array.prototype.slice.call(N.QUERY_SELECTOR_ENGINE(root,query)));
				return N.QUERY_SELECTOR_ENGINE(root,query);
			}
		},
		"feedDownWhile":function(feeder,stopFilter,findChild){
			if( stopFilter.call(feeder,feeder) !== false ){
				var childs = N.toArray(findChild.call(feeder,feeder));
				for(var i=0,l=childs.length;i<l;i++) N.NODEKIT.feedDownWhile(childs[i],stopFilter,findChild);
			}
		},
		"style":function(node,styleName,value){
			if(typeof styleName === "undefined"){
				return N.ENV.supportComputedStyle ? window.getComputedStyle(node,null) : node.currentStyle;
			}
			if(typeof styleName === "string"){
				//mordern-style-name
				var prefixedName = N.ENV.getCSSName(styleName);
				if(arguments.length < 3){
					return N.ENV.supportComputedStyle ? window.getComputedStyle(node,null).getPropertyValue(prefixedName) : node.currentStyle[camelCase(prefixedName)];
				}
				//set
				var wasStyle = N.node.attr(node,"style") || "";
				if(value === null) {
					wasStyle     = wasStyle.replace(new RegExp("(-webkit-|-o-|-ms-|-moz-|)"+styleName+"(.?:.?|)[^\;]+\;","g"),function(s){return ''});
					N.node.attr(node,"style",wasStyle);
				} else {
					var prefixedValue = N.ENV.getCSSName(value);
					//set //with iefix
					wasStyle     = wasStyle.replace(new RegExp("(-webkit-|-o-|-ms-|-moz-|)"+styleName+".?:.?[^\;]+\;","g"),"");
					N.node.attr(node,"style",prefixedName+":"+prefixedValue+";"+wasStyle);
				}
			} else if(typeof styleName === "object") {
				N.propEach(styleName,function(val,name){
					if(typeof name === "string"){ N.NODEKIT.style(node,name,val); }
				});
			}
		},
		//도큐먼트상의 엘리먼트 포지션을 반환합니다.
        position:function(element){
            if(!element) return null;
            var xPosition = 0, yPosition = 0;
            while(element){
                xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                yPosition += (element.offsetTop  - element.scrollTop  + element.clientTop );
                element = element.offsetParent;
            }
            return {x:xPosition,y:yPosition};
        },
        //어떤 이벤트에 대한 마우스의 위치를 추적합니다.
        mousePosition:function(e,root){
            root = !root ? document.documentElement : root;
            var pos = this.position(root);
            pos.x = e.clientX - pos.x, pos.y = e.clientY - pos.y;
            return pos;
        }
	});

	N.SINGLETON("FINDKIT",{
		//루트노드 없이 검색
		"findLite":function(find){
			if( typeof find === 'string' ){
				// [string,null]
				return N.NODEKIT.query(find);
			} else if(N.isElement(find)){
				// [node]
				return [find];
			}  else if(N.isArray(find)) {
				// [array]
				var fc = [];
				for(var i=0,l=find.length;i<l;i++) { 
					if( typeof find[i] === 'string' ) {
						// [array][string]
						var fs = N.NODEKIT.query(find[i]);
						if(fs.length) fc = fc.concat( fs );
					} else if(N.isElement(find[i])) {
						// [array][node]
						fc.push(find[i]);
					} else if(N.isArray(find[i])){
						var fa = N.findLite(find[i]);
						if(fa.length) fc = fc.concat( fa );
					}
				}
				return N.unique(fc);
			}
			return [];
		},
		//여러개의 셀럭터와 하나의 루트노드만 허용
		"findByOnePlace":function(findse,rootNode){
			if(typeof findse === 'string') return N.NODEKIT.query(findse,rootNode);
			if( N.isElement(findse) ) {
				var fs = N.NODEKIT.query(N.node.trace(findse),rootNode);
				for(var i=0,l=fs.length;i<l;i++) if(findse === fs[i]) return [findse];
			}
			if( N.isArray(findse) ) {
				var result = [];
				for(var i=0,l=findse.length;i<l;i++) {
					var fd = N.findByOnePlace(findse[i],rootNode);
					if( fd.length ) result = result.concat(fd);
				}				
				return N.unique(result);
			}
			return [];
		},
		//다수의 로트와 샐렉터를 받고 출력
		"findBySeveralPlaces":function(find,root){
			if(arguments.length === 1 || typeof root === 'undefined' || root === null || root === window.document ) return N.findLite(find);
			// find root
			var targetRoots = N.findLite(root);
			if(targetRoots.length === 0) {
				return N.findLite(find);
			}
			//
			var findes = N.toArray(find);
			var result = [];
			for(var i=0,l=targetRoots.length;i<l;i++) {
				for(var fi=0,fl=findes.length;fi<fl;fi++) {
					var fdr = N.findByOnePlace(findes[fi],targetRoots[i]);
					if( fdr.length ) result = result.concat(fdr);
				}
			}
			return N.unique(result);
		},
		//최적화 분기하여 샐랙터를 실행시킴
		"find" : CORE.PIPE(function(find,root,eq){
			return (typeof root === "number") ? N.findLite(find)[root] :
				   (typeof eq === "number")   ? N.findBySeveralPlaces(find,root)[eq] :
				   N.findBySeveralPlaces(find,root);
		}),
		"findMember":CORE.PIPE(function(sel,offset){
			var target = N.findLite(sel)[0];
			if(!N.isElement(target)) return;
			if(typeof offset !== "number") return N.toArray(target.parentElement.children);
			var currentIndex = -1;
			N.each(target.parentNode.children,function(node,i){ if(target == node) { currentIndex = i; return false; } });
			return target.parentNode.children[currentIndex+offset];
		},1),
		"findNodes":CORE.PIPE(function(nodes){
			return nd.filter.BOOST(nodes,function(node){
				return CORE.TYPEOF.NODE(node);
			});
		},1),
		"attributes":CORE.PIPE(function(node){
			var r={};
			for(var key in node.attributes){
				if(node.attributes.hasOwnProperty(key) && typeof node.attributes[key] == "object"){
					r[node.attributes[key].name] = node.attributes[key].value;
				}
			} 
			return r;
		},1),
		// 하위루트의 모든 노드를 검색함 (Continutiltiy에서 중요함)
		"findIn" : CORE.PIPE(function(root,find,index){
			return (typeof index === 'number') ? N.findBySeveralPlaces(find || '*',N.map(N.findBySeveralPlaces(root),function(node){ return node.children },N.argumentsFlatten))[index] :
				   (typeof find  === 'number') ? N.findBySeveralPlaces('*',N.map(N.findBySeveralPlaces(root),function(node){ return node.children },N.argumentsFlatten))[find]   :
												 N.findBySeveralPlaces(find || '*',N.map(N.findBySeveralPlaces(root),function(node){ return node.children },N.argumentsFlatten)) ;
		},2),
		// 자식루트의 노드를 검색함
		"findOn": CORE.PIPE(function(root,find){
			var finds = N.map(N.findBySeveralPlaces(root),function(node){ return node.children; },N.argumentsFlatten);
			switch(typeof find){
				case "number": return [finds[find]]; break;
				case "string": return N.filter(finds,function(node){ return N.NODEKIT.is(node,find); }); break;
				default      : return finds; break;
			}
		},1),
		"findParents":CORE.PIPE(function(el,require,index){ 
			if(typeof require === 'string') {
				return (typeof index === 'number') ?
				N.filter(N.NODEKIT.parents(N.findBySeveralPlaces(el)[0]),function(el){ return N.node.is(el,require); })[index]:
				N.filter(N.NODEKIT.parents(N.findBySeveralPlaces(el)[0]),function(el){ return N.node.is(el,require); });
			} else if(typeof require === 'number') {
				return N.NODEKIT.parents(N.findBySeveralPlaces(el)[0])[require];
			} else {
				return N.NODEKIT.parents(N.findBySeveralPlaces(el)[0]);
			}
		},1),
		"findRoot":CORE.PIPE(function(el){ 
			return N.NODEKIT.root(N.findLite(el)[0]);
		},1),
		"findBefore":CORE.PIPE(function(node,filter){ 
			node = N.findLite(node)[0];
			var index = N.node.index(node); 
			var result = []; 
			if(typeof index === "number") {
				switch(typeof filter) {
					case 'string':
						for(var i=0,l=index;i<l;i++){
							var fnode = node.parentNode.children[i];
							N.node.is(fnode,filter) && result.push(fnode);
						} 
						break;
					case 'number':
						result.push(node.parentNode.children[index - (filter+1)]);
						break;
					default :
						for(var i=0,l=index;i<l;i++) result.push(node.parentNode.children[i]); 	
						break;
				}
			}
			return result; 
		},1),
		"findAfter":CORE.PIPE(function(node,filter){ 
			node = N.findLite(node)[0];
			var index = N.node.index(node); 
			var result = []; 
			if(typeof index === "number") {
				switch(typeof filter) {
					case 'string':
						for(var i=index+1,l=node.parentNode.children.length;i<l;i++){
							var fnode = node.parentNode.children[i];
							N.node.is(fnode,filter) && result.push(fnode);
						}
						break;
					case 'number':
						result.push(node.parentNode.children[index + (filter+1)]);
						break;
					default :
						for(var i=index+1,l=node.parentNode.children.length;i<l;i++) result.push(node.parentNode.children[i]); 
						break;
				}
			}
			return result; 
		},1),
		"findParent" :CORE.PIPE(function(el,require,index){
			if( (typeof require === 'number') || ((typeof require === 'string') && (typeof index === 'number')) ) return N.first(N.findParents(el,require,index));
			var node = N.findLite(el)[0];
			if(node) {
				if(typeof require === "string"){
					var parents = N.NODEKIT.parents(node);
					for(var i in parents) if( N.NODEKIT.is(parents[i],require) ) return parents[i];
				} else {
					return node.parentElement;
				}
			}
			return undefined;
		},1),
		"findDocument":CORE.PIPE(function(iframeNode){
			var iframe = N.findLite(iframeNode)[0];
			if(iframe) {
				if(iframe.tagName == "IFRAME") return iframe.contentDocument || iframe.contentWindow.document;
				if(N.isDocument(iframe)) return iframe;
			} else {
				console.warn('iframe을 찾을 수 없습니다.',iframeNode);
			}
		},1),
		//
		"findTree":CORE.PIPE(function(node,stringify){
			var treeNode = N.findLite(node)[0];
			if(!treeNode) return [];
			var tree = N.findParents(treeNode,N.map,function(){ return (stringify === true ? N.node.trace(this) : this ); });
			tree.reverse();
			tree.push( (stringify === true ? N.node.trace(treeNode) : treeNode ) );
			return tree;
		},1),
		"inside":CORE.PIPE(function(placeNode,target){
			var inside = N.findLite(placeNode);
			if(!inside.length) return false; 
			return N.find(target,placeNode).length ? true : false;
		},1),
		"outside":CORE.PIPE(function(placeNode,target){
			var insideNode = N.findLite(target);
			return insideNode.length ? (N.find(placeNode,insideNode).length ? false : true) : true;
		},1),
		"findOffset" :function(node,target,debug){
			var node = N.findLite(node)[0];
			if(node) {
				var l=t=0,w=node.offsetWidth,h=node.offsetHeight;
				target = N.findLite(target)[0] || document.body;
				do {
					l += node.offsetLeft;
					t += node.offsetTop;
					if(debug === true)console.log(l,t,node,target);
					if(!node.offsetParent) break;
					if(node === target) break;
					node = node.offsetParent;
				} while(true);
				var dualObject = [l,t,w,h];
				dualObject.x = l;
				dualObject.y = t;
				dualObject.width  = w;
				dualObject.height = h;
				return dualObject;
			}
		}
	});
	N.FINDKIT.EACH_TO_METHOD();

	N.SINGLETON("MAKEKIT",{
		"create" :function(name,attrValue,parent){
			var element,skipRender,name=(typeof name !== "string") ? "div" : name.trim();
			//nf foundation
			name = name.replace(/\[\[[\w\-\=\s]+\]\]/ig,function(s){ 
				s = s.substr(2,s.length-4);
				var pipeIndex = s.indexOf('=');
				//[[key=]]
				if((s.length - 1) === pipeIndex) return '[nd-' + s.substring(0,s.length - 1) + ']';
				//[[key]], [[key=value]]
				return (pipeIndex > 0) ? '[nd-'+s.substr(0,pipeIndex)+'='+s.substr(pipeIndex+1)+']' : '[nd-val='+s+']';
			});
			var dataset,htmlvalue,cacheName=name,cacheEnable=false;
		
			//attr 최적화 작업
			//데이터셋과 HTML은 N.create에서 스스로 처리
			switch(typeof attrValue){
				case "object":
					if("dataset" in attrValue){
						dataset   = attrValue["dataset"];
						attrValue = N.clone(attrValue);
						delete attrValue["dataset"];
					}
					if("html" in attrValue){
						htmlvalue = attrValue["html"];
						delete attrValue["html"];
					}
					if("value" in attrValue){
						htmlvalue = attrValue["value"];
						delete attrValue["value"];
					}
					if(N.isNothing(attrValue)){ 
						cacheEnable = true; 
						attrValue = undefined;
					}
					break;
				case "number":
				case "boolean":
					attrValue = attrValue+"";
				case "string":
					htmlvalue   = attrValue;
					cacheEnable = true;
					attrValue   = undefined; 
					break;
				case "undefined":
					cacheEnable = true;
					break;
				default:
					console.warn("N.create의 두번째 값은 글자나 오브젝트입니다. 들어온 값 ->",attrValue);
					cacheEnable = true;
					attrValue   = undefined;
					break;
			}
		
			//성능향상을 위한 캐시
			if(cacheEnable){
				var cacheNode = N.cache.get("N.create",cacheName);
				if(cacheNode) {
					element    = N.cloneNodes(cacheNode)[0];
					skipRender = true;
				}
			}
		
			//랜더링 시작
			if(!skipRender){
				element = N.parseHTML( (name.indexOf("<") !== 0) ? N.parseTag(name,attrValue) : name )[0];
				//캐시 저장
				if(cacheEnable) N.cache.set("N.create",cacheName,N.cloneNodes(element)[0]);
			}
		
			//랜더링 후처리
			if(dataset) for(var key in dataset) {
				//ie11 lt fix
				if(!element.dataset) element.dataset = {};
				element.dataset[key] = dataset[key];
			}
			if(htmlvalue) {
				if(("value" in element) && !element.tagName.match(/LI|BUTTON/) ) {
					element.setAttribute("value",htmlvalue)
				} else {
					element.innerHTML = htmlvalue;
				}
			}			
		
			//부모에게 어팬딩함
			parent = N.findLite(parent)[0];
			if(parent){
				if(parent==window.document) parent = window.document.getElementsByTagName("body")[0];
				parent.appendChild(element);
			}
			return element;	
		},
		//get text node element
		"makeText":CORE.PIPE(function(t){ return window.document.createTextNode(t); },1),
		"make":CORE.PIPE(function(name,attr,third){
			if ( N.isArray(attr) || N.isElement(attr) || N.isTextNode(attr) ) {
				var createNode = N.create(name);
				N.node.append(createNode,new N.Array(arguments).setSubarr(1).setFlatten().toArray());
				return createNode;
			} else if(N.isElement(third) || N.isTextNode(third)){
				var createNode = N.create(name, attr);
				N.node.append(createNode,new N.Array(arguments).setSubarr(2).setFlatten().toArray());
				return createNode;
			} else {
				return N.create(name, attr);
			}	
		},1),
		"makes":CORE.PIPE(function(fulltag,root){
			if(typeof fulltag !== "string" || !fulltag) return [];
			
			var makeRoot    = N.make('div');
			var hasTemplate = (fulltag.toLowerCase().indexOf("template") > -1)?true:false;
			var divideIndex = fulltag.indexOf(">");
		
			if(divideIndex>0) {
				var currentTag  = fulltag.substr(0,divideIndex);
				var nextTag     = fulltag.substr(divideIndex+1).trim();
				var firstCursor = nextTag.indexOf("^");
				var nnextTag    = nextTag.indexOf(">");
			
				if( firstCursor > 1 ){
					if( nnextTag == -1 || firstCursor < nextTag.indexOf(">") ){
						var nextCursor,cursorDepth,nextTag = nextTag.replace(/\^.+/,function(s){
							nextCursor = s.replace(/[\^]+/,function(s){
								cursorDepth = s.length;
								return "";
							}).trim();
							return "";
						}).trim();
					}
				}
			} else {
				var currentTag  = fulltag
				var nextTag     = ''
			}
			
			var multiMake    = N.safeSplit(currentTag,"+","{}");
			var multiMakeEnd = multiMake.length-1;
			
			N.each(multiMake,function(eachtag,eachTagIndex){
				///////////////
				var repeat = 1;
				//get repeat value
				eachtag = eachtag.replace(/\*[\d]+$/,function(s){
					repeat = parseInt(s.substr(1)); return "";
				});
				
				//get $value
				eachtag = (eachtag+" ").replace(/\$[^i]/,function(s){ return "\\{$i+1}"; });
				
				//var nodyExp = eachtag
				var hasExp = (eachtag.indexOf("\\{") > -1) ? true : false;
				
				//generate
				N.times(repeat,function(i){
					var rtag     = hasExp ? N.exp.seed(i)(eachtag) : eachtag;
					var rtagNode = N.make(rtag);
				
					makeRoot.appendChild(rtagNode);
				
					if(eachTagIndex == multiMakeEnd) {
						if(nextTag.length > 0) N.makes(nextTag,rtagNode);
						if(nextCursor){
							var findRoot = makeRoot;
							N.times(cursorDepth-1,function(){
								if(findRoot && findRoot.parentElement) {
									findRoot = findRoot.parentElement;
								} else {
									return false;
								}
							});
							if(findRoot) N.makes(nextCursor,findRoot);
						}
					}
				});
			});
			
			var makes = N.toArray(makeRoot.children);
			
			if(hasTemplate){
				N.each(N.find("template",makeRoot),function(template){
					if(!("content" in template)) template.content = document.createDocumentFragment();
					N.each(N.toArray(template.childNodes),function(childNode){
						template.content.appendChild(childNode);
					});
				});
			}
			
			if(root){
				var targetRoot = N.findLite(root)[0];
				if(targetRoot) for(var i=0,l=makes.length;i<l;i++) targetRoot.appendChild(makes[i]);
			}
			
			return makes;
		},1),
		"makeWrap":CORE.PIPE(function(wrapper,target,targetParent){
			var wrapNode     = N.make(wrapper);
			var targetNodes  = N.find(target,targetParent);
			if(targetNodes[0] && targetNodes[0].parentElement) {
				N.node.before(targetNodes[0],wrapNode);
			}
			N.node.append(wrapNode,targetNodes);
			return wrapNode;
		},1),
		// 각 arguments에 수치를 넣으면 colgroup > col, col... 의 width값이 대입된다.
		"makeCol":function(){ 
			return N.make('colgroup', N.map(arguments,function(arg){
					return N.create('col', (/^\d/.test(arg)) ? {width:arg} : {'class':arg});
			}) );
		},
		"makeTemplate":function(innerHTML,id){
			var temphtml = (typeof id === "string") ? ('<template id="' + id + '">') : '<template>' ;
				temphtml += innerHTML;
				temphtml += '</template>';
			return N.parseHTML(temphtml)[0];
		},
		"readURL":CORE.PIPE(function(e){
			if(typeof e === "object"){
				if(typeof e.toDataURL === "function") return e.toDataURL();
			}
			throw new Error("Can't not read")
		},1),
		"makeImg":CORE.PIPE(function(src,width){
			if(typeof src === 'string') {
				var param = {src:src};
				if(width) param.style =  'width:'+ N.toPx(width)+';'
				return N.make('img',param);
			} else if (N.isElement(src)){
				if(src.files && src.files[0]){
					if (!src.files[0].type.match(/image.*/)) return;
					var result = N.make('img');
					var reader = new FileReader();
					reader.onload = function(e){
						result.src = e.target.result;
					};
					reader.readAsDataURL(src.files[0]); 
					return result;
				}
			}
		},1),
		"makeCanvas":CORE.PIPE(function(width,height,render){
			var canvas = document.createElement("canvas");
			canvas.setAttribute("width",width?width:"auto");
			canvas.setAttribute("height",height?height:"auto");
		
			function srcToCanvasRender(src){
				var img = document.createElement('img');
				img.onload = function() {  canvas.getContext("2d").drawImage(this, 0, 0,width,height); }
				img.src = src;
			}
		
			if( N.isElement(render) ) {
				if(render.tagName === "IMG") {
					render = render.src;
				} else if(render.files) {
					if(render.files[0]) {
						var file = render.files[0];
						if (!file.type.match(/image.*/)) return;
						var reader = new FileReader();
						reader.onload = function(e){
							srcToCanvasRender(e.target.result);
						};
						reader.readAsDataURL(file); 
						src = undefined;
					}
				} 
			}
			if( typeof render === "string") srcToCanvasRender(render); else N.CALL(render,canvas,canvas.getContext("2d"));
			return canvas;
		},3),
		//노드 배열을 복사함
		"cloneNodes":function(node){
			return N.map(N.findLite(node),function(findNode){ return findNode.cloneNode(findNode,true); });
		},
		"importNodes":function(node){
			if(typeof node === "string") {
				node = node.trim();
				if(/^</.test(node) && />$/.test(node)){
					node = N.parseHTML(node);
				} else if(/^\#[\w\-]+$/.test(node)) {
					node = N.findLite(node);
				} else {
					node = N.makes(node);
				}
			}
			var result=[], targetNodes=N.findLite(node);
			if( targetNodes.length === 0){
				console.warn("importNodes::복사할 노드를 찾을 수 없습니다.",node);
				return result;
			}
			N.each(targetNodes,function(target){
				if('content' in target) {
					N.each( document.importNode(target.content,true).childNodes, function(oneNode){
						result.push(oneNode); 
					});
				} else {
					result.push(target.cloneNode(true));
				}
			});
			return N.findLite(result);
		},
		"makeSampleNode":function(node,rootExp){
			var node = nd.find(node,0);
			if(node) {
				var roleName = N.first(Object.keys(N.attributes(node)),function(keyname){
					console.log("keyname",keyname);
					return /^\:w/.test(keyname);
				});
				console.log("RoleName",roleName);
			}
			
			
			
			
			
			var result, importSample = N.importNodes(node);
			if(importSample.length === 1){
				result = importSample[0];
			} else if(importSample.length > 1) {
				var newRoot = N.make(rootExp);
				for(var i=0,l=importSample.length;i<l;i++) newRoot.appendChild(importSample[i]);
				result = newRoot;
			}
			return result ? (typeof rootExp === "string") ? 
						    N.pushCSSExpression(result,rootExp) : 
						    result : 
			console.warn("makeSampleNode::no result from",node) ;
		},
		"cloneObject":function(inv){ 
			if(typeof inv === "object"){ var result = {}; for(var k in inv) result[k] = inv[k]; return result; } return N.toObject(inv); 
		}
	})
	N.MAKEKIT.EACH_TO_METHOD();
	
	var APPEND_OR_INSERTBEFORE = function(parent,appendNode,index){
		if(typeof index === "number" && parent.children[index]){
			parent.insertBefore(appendNode,parent.children[index]);
		} else {
			parent.appendChild(appendNode);
		}
	};
	var ELKIT = {
		//포커스 상태인지 검사합니다.
		"hasFocus":function(sel){ return document.activeElement == N.findLite(sel)[0]; },
		//케럿을 움직일수 있는 상태인지 검새합니다.
		"caretPossible":function(sel){ var node = N.findLite(sel)[0]; if( N.node.hasFocus(node) == true) if(node.contentEditable == true || window.getSelection || document.selection) return true; return false; },
		"caretPosition":function(e){ var t,n,a,o,r,c=0,l=0;return"number"==typeof e.selectionStart&&"number"==typeof e.selectionEnd?(c=e.selectionStart,l=e.selectionEnd):(n=document.selection.createRange(),n&&n.parentElement()==e&&(o=e.value.length,t=e.value.replace(/\r\n/g,"\n"),a=e.createTextRange(),a.moveToBookmark(n.getBookmark()),r=e.createTextRange(),r.collapse(!1),a.compareEndPoints("StartToEnd",r)>-1?c=l=o:(c=-a.moveStart("character",-o),c+=t.slice(0,c).split("\n").length-1,a.compareEndPoints("EndToEnd",r)>-1?l=o:(l=-a.moveEnd("character",-o),l+=t.slice(0,l).split("\n").length-1)))),{start:c,end:l}},
		//어트리뷰트값을 읽거나 변경합니다.
		"attr":function(sel,v1,v2){ var node = N.findLite(sel)[0]; if(node) return N.NODEKIT.attr.apply(undefined,[node].concat(Array.prototype.slice.call(arguments,1))); },
		//css스타일로 el의 상태를 확인합니다.
		"is":function(sel,value){ var node = N.findLite(sel)[0]; if(node)return N.NODEKIT.is(node,value); },
		//선택한 element중 대상만 남깁니다.
		"filter":function(sel,filter){
			var targets = N.findLite(sel);
			if(typeof filter !== "string") {
				console.warn("N.node.filter는 string filter만 대응합니다.");
				return targets;
			} else {
				var result  = [];
				for(var i=0,l=targets.length;i<l;i++) if(N.node.is(targets[i],filter)) result.push(targets[i]);
				return result;
			}
		},
		"content":function(contentNode,setValue){
			//get
			if(arguments.length < 2){
				var node = N.findLite(contentNode)[0];
				return node ? (node.textContent || node.innerText) : undefined;
			}
			//set
			return N.each(N.findLite(contentNode),function(node){
				if('textContent' in node){
					node.textContent = setValue + '';
				} else {
					node.innerText   = setValue + '';
				}
			});
		},
		"text":function(node,setValue){
			return ELKIT.content.apply(ELKIT,Array.prototype.slice.call(arguments));
		},
		//element value or text change
		"value":function(aNode,value,htmlContent){
			var node,nodes = N.findLite(aNode);
			
			if(nodes.length == 0){
				return;
			} else if(nodes.length > 1){
				var nodeZero     = nodes[0];
				var nodeZeroName = N.node.attr(nodeZero,"name");
				// radio group
				if(N.node.attr(nodeZero,"type") == "radio"){
					//read write
					if(!N.isNothing(nodeZeroName)){
						if(N.likeString(value)){
							var findEl = N.find(N.node.filter(nodes,"[type=radio][name="+nodeZeroName+"]::"+value,0));
							if(findEl) findEl.checked = true;
							return findEl;
						} else {
							return N.find(N.node.filter(nodes,"[type=radio][name="+nodeZeroName+"]:checked"),0) || "";
						}
					}
				}
			}
			node     = N.first(nodes);
			nodeName = node.tagName.toLowerCase();
			
			switch(nodeName){
				case "img" :if(arguments.length < 2) return node.src; node.src = value; return node; break;
				case "link":if(arguments.length < 2) return node.rel; node.rel = value; return node; break;
				case "script":
					var type = node.getAttribute("type");
					//json data
					if(typeof type === "string") if(type.indexOf("json") > -1) {
						if(arguments.length < 2) 
							return N.toObject(N.node.content(node)); 
						return N.node.content(node,N.toString(value));
					}
					if(arguments.length < 2) return node.src; node.src = value; return node;
					break;
				case "input": case "option": case "textarea":
					//get
					if(nodeName == "option"){
						var selNode = N.NODEKIT.query(":selected",node);
						if( N.isElement(selNode) ) return selNode.value;
						return node.value;
					} else {
						if(typeof value === "undefined") return node.value;
					}
					//set
					var setVal = value+"";
					
					// todo
					//if( ELKIT.caretPossible(node) ) {
					//	var gap = node.value.length - value.length;
					//	var cur = ELKIT.caretPosition(node).start;
					//	node.value = value;
					//	ELCARET(node,cur-gap)
					//	return node;
					//} else {
						// alt
						node.value = value;
						return node;
					//}
					break;
				case "select":
					if(typeof value === "undefined") return node.value;
					var valEl = N.find("[value="+ value +"]",node);
					if(valEl.length > 0) {
						var selEl = N.first(valEl);
						selEl.selected = true;
						return selEl;
					}
					return false;
					break;
				default :
					if(arguments.length < 2){
						return htmlContent === true ? N.node.content(node) : node.innerHTML;
					} else {
						if(htmlContent === true){
							node.innerHTML = value;
						} else {
							N.node.content(node,value);
						}
					}						
				break;
			}
			return node;
		},
		"unique":function(sel,root){
			return N.find(sel,root,N.each,function(node){
				if(!N.node.hasAttr(node,"id")) node.setAttribute("id",N.RANDKIT.base26UniqueRandom(8,'uq'));
			});
		},
		"uniqueID":function(sel,root){
			var node = N.find(sel,root,0);
			if(node){
				N.node.unique(node);
				return node.getAttribute("id");
			} 
		},
		//get css style tag info
		"trace"   :function(target,detail){
			var t = N.findLite(target)[0];
			if( t ){
				var tag = t.tagName.toLowerCase();
				var tid = tclass = tname = tattr = tvalue = '';
				N.propEach(N.NODEKIT.attr(t),function(value,sign){
					switch(sign){
						case "id"   : 
							var id = t.getAttribute(sign); 
							id.length && (tid='#'+id) ; 
							break;
						case "class": 
							tclass = t.getAttribute(sign).trim().replace(/\s\s/g,' ').split(' ').join('.'); 
							if(tclass) tclass = "." + tclass;
							break;
						case "name" : tname  = "[name="+t.getAttribute(sign)+"]"; break;
						case "value": break;
						default     :
							if(detail == true) {
								attrValue = t.getAttribute(sign);
								tattr += ( (attrValue == '' || attrValue == null) ? ("["+sign+"]") : ("["+sign+"="+attrValue+"]") );
							}
						break; 
					}
				});
				if(detail == true) {
					if(!/table|tbody|thead|tfoot|ul|ol/.test(tag)) {
						var tv = N.node.value(t);
						if(typeof tv !== undefined || tv !== null ) if(typeof tv === 'string' && tv.length !== 0) tvalue = '::'+tv;
						if(typeof tvalue === 'string') tvalue = tvalue.trim();
					}
				
				}
				return tag+tid+tclass+tname+tattr+tvalue;
			} else {
				console.warn("N.node.trace::target is not element or selector // target =>",target);
			}
		},
		"index":function(el){
			var node = N.findLite(el)[0];
			var parent = N.findParent(node);
			if(parent) return N.index(parent.children,node);
		},
		"append":function(parentIn,childs,needIndex){
			var parent = N.findLite(parentIn)[0];
			if(!N.isElement(parent)) return parentIn;
			
			var appendTarget  = (/^</.test(childs) && />$/.test(childs)) ? N.parseHTML(childs) : N.findLite(childs);
			var parentTagName = parent.tagName.toLowerCase();
			var insertVariant = (typeof needIndex === "number") ? true : false;
			var targetIndex   = typeof needIndex === "number" ? needIndex < 0 ? 0 : needIndex : needIndex;
			
			for(var i=0,l=appendTarget.length;i<l;i++)
				if (N.isElement(appendTarget[i])) {
					switch(parentTagName){
					case "table":
						var tagName = appendTarget[i].tagName.toLowerCase();
						switch(tagName){
							case "colgroup": case "tbody": case "thead": case "tfoot":
								APPEND_OR_INSERTBEFORE(parent,appendTarget[i],insertVariant?targetIndex++:undefined);
								break;
							case "tr": case "td": case "th": default:
								window.tb = parent.tBodies;
								//tbody가 존재하지 않는 테이블이면 tbodies를 임의로 추가한다
								if(!parent.tBodies.length){ 
									if(!!parent.tFoot){
										parent.appendChild(N.create("tbody")) ;
									} else {
										parent.insertBefore(N.create("tbody"),parent.tFoot);
									}
								}
								var tbody = parent.tBodies[parent.tBodies.length - 1];									
								if(tagName == "tr"){
									APPEND_OR_INSERTBEFORE(tbody,appendTarget[i],insertVariant?targetIndex++:undefined);
								} else {
									//td th else
									var tr = tbody.insertRow( tbody.children.length );
									switch(tagName){
										case "td": case "th":
											APPEND_OR_INSERTBEFORE(tr,appendTarget[i],insertVariant?targetIndex++:undefined);
											break;
										default:
											//else
											var td = N.create("td");
											tr.appendChild(td);
											APPEND_OR_INSERTBEFORE(td,appendTarget[i],insertVariant?targetIndex++:undefined);
											break;
									}
								}
								break;
						}
						break;
					case "tr":
						var tagName = appendTarget[i].tagName.toLowerCase();
						switch(tagName){
							case "td" : case "th" :
								APPEND_OR_INSERTBEFORE(parent,appendTarget[i],insertVariant?targetIndex++:undefined);
								break;
							default   :
								var td = N.create("td");
								parent.appendChild(td);
								APPEND_OR_INSERTBEFORE(td,appendTarget[i],insertVariant?targetIndex++:undefined);
								break;
						}
						break;
					default:
						APPEND_OR_INSERTBEFORE(parent,appendTarget[i],insertVariant?targetIndex++:undefined);
						break;
				} 
			} else if(N.isTextNode(appendTarget[i])){
				APPEND_OR_INSERTBEFORE(parent,appendTarget[i],insertVariant?targetIndex++:undefined);
			} else {
				//append faild
				console.warn("N.node.append :: 추가하려는 요소는 Element요소여야 합니다.",appendTarget[i])
			}
			return parent;
		},
		"prepend":function(parentIn,childs){
			var parent = N.findLite(parentIn)[0];
			var appendTarget = (/^</.test(childs) && />$/.test(childs)) ? N.parseHTML(childs) : N.findLite(childs);
			if(N.isOk(parent),N.isOk(appendTarget)){
				N.node.append(parent,appendTarget);
				var newParent = N.findParent(appendTarget[0]);
				if(newParent) {
					N.each(appendTarget,function(node,i){
						newParent.insertBefore(node,newParent.childNodes[i]);
					});
				}
			}
		},
		"appendTo":function(targets,parentEL){ 
			var appendTargets=N.findLite(targets);
			N.node.append(N.findLite(parentEL)[0],appendTargets);
			return appendTargets;
		},
		"prependTo":function(targets,parentEL){ 
			var appendTargets=N.findLite(targets);
			return N.node.prepend(N.findLite(parentEL)[0],appendTargets); 
			return appendTargets;
		},
		"require":function(parent,target,needIndex){
			var parent = N.findLite(parent)[0];
			if(!parent) return target;
			var findTargets = N.findOn(parent,target);
			if(findTargets.length > 1) console.warn('require::require target must be single, please more specific select');
			if(findTargets.length > 0) return findTargets[0];
			var makes = N.makes(target);
			N.node.append(parent,makes,needIndex);
			return (makes.length > 1) ? makes : makes[0];
		},
		"css":function(sel,exp){
			if(!sel || typeof exp !== "string") return N.find(sel);
			return N.find(sel,N.each,function(node){
				N.pushCSSExpression(node,exp);
			});
		},
		"insertAfter":CORE.PIPE(function(node,appendNodes){ 
			var target = N.findLite(node)[0];
			if(!target) return;
			if(!target.parentElement) return;
			var appendTargets = N.findLite(appendNodes);
			if(!appendTargets.length) return;
			var targetIndex = ELKIT.index(target);
			ELKIT.append(target.parentElement,appendTargets,targetIndex+1);
		},2),
		"insertBefore":CORE.PIPE(function(node,appendNodes){ 
			var target = N.findLite(node)[0];
			if(!target) return;
			if(!target.parentElement) return;
			var appendTargets = N.findLite(appendNodes);
			if(!appendTargets.length) return;
			var targetIndex = ELKIT.index(target);
			ELKIT.append(target.parentElement,appendTargets,targetIndex-1);
		},2),
		//이후 엘리먼트를 찾습니다.
		"after" :CORE.PIPE(function(target,appendNodes){ 
			target = N.findLite(target)[0];
			if(!N.isElement(target))    return target; 
			if(arguments.length < 2) return N.findMember(target,1);
			ELKIT.insertAfter(target,appendNodes);
			return target;
		},1),
		//이전 엘리먼트를 찾습니다.
		"before":CORE.PIPE(function(node,appendNodes){ 
			var target = N.findLite(node)[0];
			if(!N.isElement(target)) return node;
			if(arguments.length < 2) return N.findMember(target,-1);
			ELKIT.insertBefore(target,appendNodes);
			return target; 
		},1),
		//대상과 대상의 엘리먼트를 바꿔치기함
		"change":CORE.PIPE(function(left,right){
			left  = N.findLite(left)[0];
			right = N.findLite(right)[0];
			if(left && right ){
				var lp = left.parentNode;
				var rp = right.parentNode;
				if(lp || rp){
					if(lp){
						var lplace = N.make("div");
						ELKIT.insertBefore(left,lplace);
					}
					if(rp){
						var rplace = N.make("div");
						ELKIT.insertBefore(right,rplace);
					}
					if(lplace){
						ELKIT.insertBefore(lplace,right);
						ELKIT.remove(lplace);
					}
					if(rplace){
						ELKIT.insertBefore(rplace,left);
						ELKIT.remove(rplace);
					}
				} else {
					console.warn("node::can't change node",left,lp,right,rp);
				}
			} else {
				console.warn("not found",left,right);
			}
			return [left,right];
		},1),
		"replace":function(target,replaceNode){
			var replaceTarget = N.findLite(replaceNode)[0];
			N.node.after(target,replaceTarget);
			N.node.remove(target);
			return replaceTarget;
		},
		//같은 위치상의 엘리먼트를 위로 올립니다.
		"up"   : function(target){if(!N.isElement(target))return target;var parent=target.parentNode;if(!N.isElement(parent))return target;var prev=target.previousSibling;if(!N.isElement(prev))return target;N.node.before(prev,target);},
		//같은 위치상의 엘리먼트를 아랠로 내립니다.
		"down" : function(target){if(!N.isElement(target))return target;var parent=target.parentNode;if(!N.isElement(parent))return target;var next=target.nextSibling;if(!N.isElement(next))return target;N.node.after(next,target);},
		//스타일을 얻어냅니다.
		"style": function(targets,styleName,value){
			//get
			if(arguments.length < 3){
				var node = N.findLite(targets)[0];
				if(node){
					return N.NODEKIT.style(node,styleName);
				}
			} else {
				return N.each(N.findLite(targets),function(node){ N.NODEKIT.style(node,styleName,value); });
			}
		},
		//내무의 내용을 지웁니다.
		"empty"  : function(target){ return N.find(target,N.map,function(node){ if("innerHTML" in node) node.innerHTML = ""; return node; }); },
		//대상 객체를 제거합니다.
		"remove" : function(node,childs){ var target = N.findLite(node)[0]; if(!N.isElement(target)) return target; if(!N.isElement(target.parentNode)) return target; target.parentNode.removeChild(target); return target; },
		//케럿의 위치를 찾습니다.
		"CARET":function(select,pos){
			//
			var node = N.findLite(select)[0];
			var editable = node.contentEditable === 'true';
			var r1,r2,ran;
			//get
			if (arguments.length < 2) {
				//HTML5
				if (window.getSelection) {
					//contenteditable
					if (editable) {
						node.focus();
						var r1 = window.getSelection().getRangeAt(0),
						r2     = r1.cloneRange();
						r2.selectNodeContents(node);
						r2.setEnd(r1.endContainer, r1.endOffset);
						return r2.toString().length;
					}
					//textarea
					return node.selectionStart;
				}
				//IE<9
				if (document.selection) {
					node.focus();
					//contenteditable
					if (editable) {
						var r1 = document.selection.createRange(),
						r2 = document.body.createTextRange();
						r2.moveToElementText(node);
						r2.setEndPoint('EndToEnd', r1);
						return r2.text.length;
					}
					//textarea
					var pos  = 0,
					ran      = node.createTextRange(),
					r2       = document.selection.createRange().duplicate(),
					bookmark = r2.getBookmark();

					ran.moveToBookmark(bookmark);
					while (ran.moveStart('character', -1) !== 0) pos++;
					return pos;
				}
				//not supported
				return 0;
			}
			//set
			if (pos == -1)
			pos = this[editable? 'text' : 'val']().length;
			//HTML5
			if (window.getSelection) {
				//contenteditable
				if (editable) {
					node.focus();
					window.getSelection().collapse(node.firstChild, pos);
				}
				//textarea
				else
				node.setSelectionRange(pos, pos);
			}
			//IE<9
			else if (document.body.createTextRange) {
				var ran = document.body.createTextRange();
				ran.moveToElementText(node);
				ran.moveStart('character', pos);
				ran.collapse(true);
				ran.select();
			}
			if (!editable)
			node.focus();
			return pos;
		},
		//이벤트를 발생시킵니다.
		"trigger":function(node,eventName,eventParam){
			if(N.isWindow(node)){
				node = W;
			} else {
				node = N.findLite(node)[0];
				if(N.isNothing(node)) throw new Error("N.node.trigger는 element를 찾을수 없습니다. => 들어온값" + N.tos(node));
			}
			var e;
			if ("createEvent" in document) {
			    e = window.document.createEvent("HTMLEvents");
			    e.initEvent(eventName, true, true);
			} else {
				e = {};
			}
			if(eventParam) N.propEach(eventParam,function(v,k){ e[k] = v; });
		    node.dispatchEvent(e);
			return node;
		},
		//이벤트 등록이 가능한 타겟을 찾아냅니다.
		"onTarget":function(node){ return (N.isWindow(node) || N.isDocument(node)) ? node : N.findLite(node); },
		//add event like jquery 
		"on":function(node, eventName, eventHandler, useCapture){
			var nodes  = N.node.onTarget(node);
			var events = eventName.split(" ");
			
			if(typeof arguments[1] === "string" && typeof arguments[2] === "function"){
				//direct event
				N.each(nodes,function(eventNode){
					N.each(events,function(event){
						eventNode.addEventListener(event, eventHandler, useCapture==true ? true : false); 
					});
				});
			} else if(typeof arguments[1] === "string" && typeof arguments[2] === "string" && typeof arguments[3] === "function"){
				var delegateTarget = arguments[2],
					eventHandler   = arguments[3],
					useCapture     = arguments[4];
				//delegate event
				N.each(nodes,function(eventNode){
					N.each(events,function(event){
						eventNode.addEventListener(event, function(e){
							var delegateNodes = N.find(delegateTarget,eventNode);
							N.each(delegateNodes,function(delegateNode){
								if(N.inside(delegateNode,e.target)){
									e['delegateTarget'] = delegateNode;
									eventHandler.call(delegateNode,e);
									return false;
								}
							});
						}, useCapture==true ? true : false); 
					});
				});
			} else {
				//error
				if((typeof eventName !== "string") || (typeof eventHandler !== "function")){
					console.error("N.node.on 노드 , 이벤트이름, 이벤트헨들러 순으로 파라메터를 입력하세요");
					console.error("N.node.on ::",arguments);
				} 
			}
			return nodes;
		},
		//bind touch event
		"punch":function(node, eventName){
			var onTargets = N.node.onTarget(node);
			N.node.on.apply(N.node,[onTargets].concat(Array.prototype.slice.call(arguments,1)));
			if(!('ontouchend' in document)) return onTargets;
			
			if(N.isDocument(onTargets) || onTargets.length){
				N.each(eventName.split(" "),function(mousename){
					var bindnames = mousename === "mousedown" ? ["touchstart"] :
								    mousename === "mouseup"   ? ["touchend","touchcancle"]   :
								    mousename === "mousemove" ? ["touchmove"]  :
								    mousename === "mouseout"  ? ["touchleave"] : null;
					if(bindnames) {
						N.each(onTargets,function(target){
							N.each(bindnames,function(bindEventName){
								target.addEventListener(bindEventName,function(event){
				                    //1개의 터치만 지원
				                    //if(event.touches.length !== || (!event.touches.length && bindnames !== "touchend")){return;}
				                    var newEvent      = document.createEvent("MouseEvents");
				                    var changedTouche = event.changedTouches[0];
                
				                    newEvent.initMouseEvent(
				                        mousename,
				                        true,
				                        true,
				                        null,
				                        null,
				                        changedTouche.screenX,
				                        changedTouche.screenY,
				                        changedTouche.clientX,
				                        changedTouche.clientY
				                    );
									newEvent.touches = event.touches;
				                    target.dispatchEvent(newEvent);
				                });
							});
						});
					}
				});
			}
		},
		"off":function(node, eventName, eventHandler, useCapture){
			if((typeof eventName !== "string") || (typeof eventHandler !== "function")) return console.error("N.node.on 노드 , 이벤트이름, 이벤트헨들러 순으로 파라메터를 입력하세요",node, eventName, eventHandler);
			var nodes  = N.node.onTarget(node);
			var events = eventName.split(" ");
			N.each(nodes,function(eventNode){
				N.each(events,function(event){
					eventNode.removeEventListener(event, eventHandler, useCapture==true ? true : false); 
				});
			});
			return nodes;
		},
		"data":function(node,key,value){
			var nodes = N.findLite(node);
			if(nodes.length == 0) return undefined;
			if(arguments.length == 1) return N.clone(N.first(nodes).dataset);
			if(arguments.length == 2) return N.first(nodes).dataset[nd.camelCase(key)];
			if(arguments.length == 3) { 
				key = nd.camelCase(key);
				N.each(nodes,function(node){ node.dataset[key] = value; }); return nodes; 
			}
		},
		//Disabled
		"disabled":function(node,status){
			var elf = new N.Array(N.findLite(node));
			if( elf.isNone() ){
				console.error("N.node.disabled:: node를 찾을수 없습니다. => 들어온값" + N.tos(node));
			} else {
				elf.each(function(el){
					if("disabled" in el){
						if(typeof status === "undefined") return el.disabled;
						if(status == true || status == "true"){
							el.disabled = true;
							return el;
						}
						if(status == false || status == "false"){
							el.disabled = false;
							return el;
						}
					}
				});
			}
		},
		//Readonly
		"readOnly":function(node,status){
			var elf = new N.Array(N.findLite(node));
			if( elf.isNone() ){
				console.error("N.node.readOnly:: node를 찾을수 없습니다. => 들어온값" + N.tos(node));
			} else {
				elf.each(function(el){
					if( "readOnly" in el ){
						if(typeof status === "undefined") return el.readOnly;
						if(status == true || status == "true"){
							el.readOnly = true;
							return el;
						}
						if(status == false || status == "false"){
							el.readOnly = false;
							return el;
						}
					}
				});
			}
		},
		"CommonString":new N.StringSource(),
		"addAttr":function(node,attrName,attrValue){
			var findNodes = N.findLite(node);
			if(typeof attrValue !== "attrName" && typeof attrValue !== "string") return findNodes;
			for(var i=0,l=findNodes.length;i<l;i++) findNodes[i].setAttribute(attrName,ELKIT.CommonString.set(findNodes[i].getAttribute(attrName)).addModel(attrValue));
			return findNodes;
		},
		"hasAttr":function(node,attrName,attrValue){
			var findNodes = N.findLite(node);
			if(arguments.length === 2) {
				for(var i=0,l=findNodes.length;i<l;i++) if( findNodes[i].getAttribute(attrName) ) return true;
				return false;
			}
			if(typeof attrValue !== "string") return false;
			for(var i=0,l=findNodes.length;i<l;i++) if( !ELKIT.CommonString.set(findNodes[i].getAttribute(attrName)).hasModel(attrValue) ) {
				return false;
			}
			return true;
		},
		"removeAttr":function(node,attrName,attrValue){
			var findNodes = N.findLite(node);
			if(typeof attrName !== "string" && typeof removeClass !== "string") return findNodes;
			for(var i=0,l=findNodes.length;i<l;i++) {
				var didRemoveClassText = ELKIT.CommonString.set(
					findNodes[i].getAttribute(attrName)
				).setRemoveModel(attrValue).trim();
				if( !didRemoveClassText.length ) {
					findNodes[i].removeAttribute(attrName);
				} else {
					findNodes[i].setAttribute(attrName,didRemoveClassText);
				}
			} 
			return findNodes;
		},
		"addClass":function(node,addClass){	
			return ELKIT.addAttr(node,"class",addClass);
		},
		"hasClass":function(node,hasClass){
			return ELKIT.hasAttr(node,"class",hasClass);
		},
		"removeClass":function(node,removeClass){
			return ELKIT.removeAttr(node,"class",removeClass);
		},
		"html":function(node,html){
			var findNode = N.findLite(node)[0];
			if(!findNode) return undefined;
			if(typeof html === "string" || typeof html === "number"){
				return findNode.innerHTML = html;
			} else {
				return findNode.innerHTML;
			}
		},
		"appendHTML":function(node,html,needIndex){
			var findNode = N.findLite(node)[0];
			return findNode && N.node.append(findNode,N.parseHTML(html),needIndex);
		},
		"prependHTML":function(node,html){
			var findNode = N.findLite(node)[0];
			return findNode && N.node.prepend(findNode,N.parseHTML(html));
		},
		"put":function(sel){
			var node = N.findLite(sel)[0];
			if(!N.isElement(node)) return console.warn("N.node.put:: node를 찾을수 없습니다. => 들어온값",arguments);
			N.node.empty(node);
			var newContents = [];
			var params = Array.prototype.slice.call(arguments);
			params.shift();
			N.each( N.argumentsFlatten(params) ,function(content){
				if(N.isElement(content)){
					newContents.push(content);
				} else if((/^</.test(content) && />$/.test(content))){
					newContents.push(N.parseHTML(content));
				} else {
					content = N.toString(content);
					switch(node.tagName){
						case "UL":case "MENU":
							newContents.push(N.make("li",content));
							break;
						case "DL":
							newContents.push(N.make("dd",content));
							break;
						default:
							newContents.push(N.make("span",content));
							break;	
					}
				}
			});
			N.node.append(node,newContents);
			return node;
		},
		"toggleClass":function(el,toggleName,flag){
			var nodes = N.findLite(el);
			if(typeof toggleName !== 'string') return nodes;
			
			if(flag===undefined) {
				return N.each(nodes,function(node){
					N.node.hasClass(node,toggleName) ? N.node.removeClass(node,toggleName) : N.node.addClass(node,toggleName);
				});
			}
			if(N.isArray(flag)) flag = flag.join(" ");
			
			if(typeof flag === "string") {
				N.node.removeClass(el,flag);
				N.node.addClass(el,toggleName);
			}
			
			return flag ? N.node.addClass(el,toggleName) : N.node.removeClass(el,toggleName);
		},
		"coords":function(nodes,coordinate,insertAbsolute,offsetX,offsetY,scale){
			var findNode = N.findLite(nodes,0);
			if(findNode && (typeof coordinate == "string")) {
				scale = (typeof scale === 'number') ? scale : 1;
			
				var coordinateData = [];
				coordinate.replace(/(-|)\d+/g,function(s){ coordinateData.push(s); });
				N.each(coordinateData,function(v,i){
					var styleName;
					switch(i){
						case 0:styleName='left';break;
						case 1:styleName='top';break;
						case 2:styleName='width';break;
						case 3:styleName='height';break;
						default:return false;break;
					}
					var styleValue = (N.toNumber(v)*scale);
					switch(i){
						case 0:styleValue += N.toNumber(offsetX);break;
						case 1:styleValue += N.toNumber(offsetY);break;
					}
					N.node.style(findNode,styleName,styleValue+"px");
				});
				switch(insertAbsolute) {
					case true :
					case 'absolute':
						N.node.style(findNode,'position','absolute');
						break;
					case 'relative':
						N.node.style(findNode,'position','relative');
						break;
				}
			}
			return nodes;
		}
	};
	
	N.EXTEND_MODULE("Array","NodeHandler",{
		find:function(query){ 
			return new N.NodeHandler(N.find.apply(undefined,[query,this].concat(Array.prototype.slice.call(arguments,1)))); 
		},
		parent:function(query){ 
			return new N.NodeHandler(N.findParent.apply(undefined,[this].concat(Array.prototype.slice.call(arguments)))); 
		},
		parents:function(query){ 
			return new N.NodeHandler(N.findParents.apply(undefined,[this].concat(Array.prototype.slice.call(arguments)))); 
		},
		children:function(query){ 
			return new N.NodeHandler(N.findOn(this,query)); 
		},
		hasFocus:function(){ return ELKIT.hasFocus(this); },
		caretPossible:function(){ return ELKIT.caretPossible(this); },
		attr:function(name){ 
			if(arguments.length > 1){
				N.FLATTENCALL(ELKIT.attr,undefined,this,arguments);
				return this;
			} else {
				if(arguments.length == 0) return N.CALL(ELKIT.attr,undefined,this);
				return N.CALL(ELKIT.attr,undefined,this,name);
			}
		},
		addAttr:function(){
			N.FLATTENCALL(ELKIT.addAttr,ELKIT,this,arguments);
			return this;
		},
		removeAttr:function(){
			N.FLATTENCALL(ELKIT.removeAttr,ELKIT,this,arguments);
		},
		hasAttr:function(){ 
			N.FLATTENCALL(ELKIT.hasAttr,ELKIT,this,arguments);
		},
		addClass:function(className){ N.CALL(ELKIT.addClass,ELKIT,this,className);return this; },
		hasClass:function(className){ N.CALL(ELKIT.hasClass,ELKIT,this,className);return this; },
		removeClass:function(className){ N.CALL(ELKIT.removeClass,ELKIT,this,className);return this; },
		toggleClass:function(className,toggle){ N.CALL(ELKIT.toggleClass,ELKIT,this,className,toggle); return this; },
		is     :function(exp){
			return ELKIT.is(this,exp); 
		},
		filter :function(f){ 
			if(typeof f === "function"){
				this.setSource(this._super(f));
			} else {
				this.setSource(N.FLATTENCALL(ELKIT.filter,ELKIT,this,arguments));
			}
			return this;
		},
		content:function(){
			return N.FLATTENCALL(ELKIT.content,ELKIT,this,arguments);
		},
		text:function(){
			return N.FLATTENCALL(ELKIT.text,ELKIT,this,arguments);
		},
		expval:function(exp){
			if(arguments.length > 0)
				N.CALL(ELKIT.value,ELKIT,this,N.exp.apply(undefined,Array.prototype.slice.call(arguments)));
		},
		value  :function(nodeValue){ 
			if(arguments.length > 0){
				N.CALL(ELKIT.value,ELKIT,this,nodeValue);
				return this;
			} else {
				return N.FLATTENCALL(ELKIT.value,ELKIT,this,arguments);
			}
		},
		prop:function(key,value){
			if(arguments.length > 0){
				this.each(function(){ this[key] = value; }); return this;
			} else {
				if(this[0]) return this[0][key];
			}
		},
		trace    :function(){ return N.FLATTENCALL(ELKIT.trace,ELKIT,this,arguments); },
		//index
		index:function(){ 
			return ELKIT.index(this);
		},
		append   :function(targets){ ELKIT.append(this,targets);return this; },
		prepend  :function(targets){ ELKIT.prepend(this,targets);return this; },
		appendTo :function(target){ N.CALL(ELKIT.appendTo,ELKIT,this,target); return this; },
		prependTo:function(target){ N.CALL(ELKIT.prependTo,ELKIT,this,target);return this; },
		put      :function(){ N.FLATTENCALL(ELKIT.put,ELKIT,this,arguments); return this; },
		putTo    :function(target){ N.CALL(ELKIT.put,ELKIT,target,this);; return this;},
		before   :function(){
			if(arguments.length > 0){
				N.FLATTENCALL(ELKIT.before,ELKIT,this,arguments);
				return this;
			} else {
				return N.CALL(ELKIT.before,ELKIT,this);
			}
		},
		after    :function(){
			if(arguments.length > 0){
				N.FLATTENCALL(ELKIT.after,ELKIT,this,arguments);
				return this;
			} else {
				return N.CALL(ELKIT.after,ELKIT,this);
			}
		},
		change:function(){
			var r = N.FLATTENCALL(ELKIT.change,ELKIT,this,arguments);
			this.setSource(r[1]);				
			return this;
		},
		beforeAll:function(){ return N.CALL(ELKIT.beforeAll,ELKIT,this); },
		afterAll :function(){ return N.CALL(ELKIT.afterAll,ELKIT,this); },
		replace  :function(){ N.FLATTENCALL(ELKIT.replace,ELKIT,this,arguments); return this;},
		up:function(){ return N.CALL(ELKIT.up,ELKIT,this); },
		down:function(){ return N.CALL(ELKIT.donw,ELKIT,this); },
		style:function(){ 
			return ELKIT.style.apply(ELKIT,[this].concat(Array.prototype.slice.call(arguments)));
		},
		require:function(){
			return new N.NodeHandler(ELKIT.require.apply(ELKIT,[this].concat(Array.prototype.slice.call(arguments))));
		},
		empty  :function(){ N.CALL(ELKIT.empty,ELKIT,this); return this; },
		remove :function(){ N.CALL(ELKIT.remove,ELKIT,this); return this; },
		caret  :function(){ N.FLATTENCALL(ELKIT.caret,ELKIT,this,arguments); },
		trigger:function(name){ N.CALL(ELKIT.trigger,ELKIT,this,name); return this; },
		on     :function(e,h,c,x){ 
			ELKIT.on.call(ELKIT,this,e,h,c,x); return this; },
		off    :function(e,h,c,x){ 
			ELKIT.off.call(ELKIT,this,e,h,c,x); return this; 
		},
		data   :function(name){
			if(arguments.length > 1){
				N.FLATTENCALL(ELKIT.data,ELKIT,this,arguments);
				return this;
			} else {
				if(arguments.length == 0) return N.CALL(ELKIT.data,ELKIT,this);
				return N.CALL(ELKIT.data,ELKIT,this,name);
			}
		},
		html:function(html){
			var result = N.FLATTENCALL(ELKIT.html,ELKIT,this,arguments);
			return arguments.length ? this : result ;
		},
		appendHTML:function(html){
			N.FLATTENCALL(ELKIT.appendHTML,ELKIT,this,arguments);
			return this;
		},
		prependHTML:function(){
			N.FLATTENCALL(ELKIT.prependHTML,ELKIT,this,arguments);
			return this;
		},
		focus:function(){
			this.each(function(node){
				if(typeof node.focus === "function"){ return node.focus(); }
			});
			return this;
		},
		unique:function(){
			N.FLATTENCALL(ELKIT.unique,ELKIT,this,arguments);
			return this;
		},
		uniqueID:function(){
			return N.FLATTENCALL(ELKIT.uniqueID,ELKIT,this,arguments);
		},
		width:function(){
			return this[0] ? this[0].offsetWidth : -1;
		},
		height:function(){
			return this[0] ? this[0].offsetHeight : -1;
		},
		disabled:function(){ N.FLATTENCALL(ELKIT.disabled,ELKIT,this,arguments); return this; },
		readonly:function(){ N.FLATTENCALL(ELKIT.readOnly,ELKIT,this,arguments); return this; },
	},function(select,parent,i){
		this.setSource(N.find(select,parent,i));
	});
	
	N.METHOD("node",nd.NodeHandler.new);
	for(var key in ELKIT) N.node[key]=ELKIT[key];
	
	
	
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
			this.move(this._tick + N.timeScale(exp));
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
			return this.rate(N.timeScale(exp) / 1000,toggle);
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
		this.defaultStartTime = startTime ? N.timeStamp(startTime): N.timeStamp();
		this.defaultInertval  = interval  ? N.timeScale(interval) : N.timeScale("2s");
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
				var onCaseName = "on"+eventName;
				
				this.ManageModuleEvents.touchDataProp(eventName);
				
				if(withAroundCallback === true){
					var willUpperCase = "will"+eventName;
					var didUpperCase  = "did"+eventName; 
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
		},
		resetEvent:function(){
			//{eventName:[handers...]}
			this.ManageModuleEvents = new N.HashSource();
			//{eventName:{aroundName:[handlers..]}}
			this.ManageModuleAroundEvents = new N.HashSource();
		}
	},function(module){
		if(!N.isModule(module)) console.error("EventListener:: manage object is must be nody module");
		this.ManageModule = module;
		this.resetEvent();
		var _self = this;
	});
	
	N.MODULE("Gesture",{
		dragAction:function(param){
			
			var action = N.dummy({
				resolve:param.resolve,
				start:param.start,
				move:param.move,
				end:param.end,
				cancle:function(e,attr,status){
					param.cancle && param.cancle(e,attr,"cancle",status);
					action.resolveStatus = false;
				},
				gesture:this,
				resolveStatus:false
			});
			
			this.ondrag(function(event,attr,realStatus){
				if(action.resolveStatus == false && realStatus == "start"){
					if((action.resolve === true) || (typeof action.resolve === "undefined")) {
						action.resolveStatus = true;
					} else if(typeof action.resolve === "function") {
						action.resolveStatus = action.resolve(event,attr,"resolve") == true ? true : false;
					}
				}
				if(action.resolveStatus == true) {
					switch(realStatus){
						case "start":
							if(action.start && action.start(event,attr,realStatus) == false) action.cancle(event,attr,realStatus);
							if(action.move  && action.move(event,attr,"move") == false) action.cancle(event,attr,"move");
							break;
						case "move":
							if(action.move && action.move(event,attr,"move") == false) action.cancle(event,attr,"move");
							break;
						case "end":
							if(action.end  && action.end(event,attr,realStatus) == false) action.cancle(event,attr,realStatus);
							action.resolveStatus = false;
							break;
					}
				}
			});
			
			this.GestureActions.push(action);
			return action;
		},		
		resetEvent:function(){
			this.EventListener.resetEvent();
		},
		_gestureReset:function(){
			this._firstPageX = this._lastPageX = undefined;
			this._firstPageY = this._lastPageY = undefined;
			this._firstPinchValue = undefined;
			this._lastGesture = undefined;
			this._lastGestureEvent = undefined;
		},
		stopGesture:function(){
			this._gestureReset();
		},
		inheritGesture:function(gesture){
			if(gesture instanceof N.Gesture){
				var e = gesture._lastGestureEvent;
				
				//stop all
				this.stopGesture();
				gesture.stopGesture();
				
				//start inherit event
				this._gestureStartHandler(e);
			}
		}
	},function(gestureView,layerView){
		this.view      = N.findLite(gestureView)[0];
		this.layerView = N.findLite(layerView)[0]
		
		if(!this.view) return console.error("Gesture::no find gestrue view");
		
		this.GestureListener = {};
		this.GestureActions  = [];
		this._firstPinchValue;
		this._firstPageX;
		this._firstPageY;
		this._lastPageX;
		this._lastPageY;
		this._lastGesture;
		this._lastGestureEvent;
		this.stopPropagation = true;
		this.preventDefault  = true;
		//touch event
		var EventListener = this.EventListener = new N.EventListener(this);
		EventListener.addEventRegister(["drag","pinch"]);
		
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
					pageX:pageX,
					pageY:pageY,
					relativeX:0,
					relativeY:0,
					screenX:e.screenX,
					screenY:e.screenY,
					moveX:0,
					moveY:0,
					offsetX:e.offsetX,
					offsetY:e.offsetY
				};
				
				//layer mouse position
				if(_self.layerView){
					var layerOffset = N.NODEKIT.mousePosition(e,_self.layerView);
					_self._lastGesture.layerX = layerOffset.x;
					_self._lastGesture.layerY = layerOffset.y;
				} else {
					_self._lastGesture.layerX = _self._lastGesture.offsetX;
					_self._lastGesture.layerY = _self._lastGesture.offsetY;
				}
				
				_self._lastGestureEvent = e;
				
				
				if (EventListener.hasListener("pinch") && e.touches && e.touches.length === 2) {
					e.preventDefault();
					_self._firstPinchValue = getPinchDistance(
						 pageX,
						 pageY,
						 e.touches[1].pageX,
						 e.touches[1].pageY
					);
					_self._lastGesture.pinch = 1;
					EventListener.trigger("pinch",e,_self._lastGesture,"start");
				}
				
				EventListener.trigger("drag",e,_self._lastGesture,"start");
				
				if(_self.stopPropagation===true)e.stopPropagation();
				if(_self.preventDefault===true) e.preventDefault();
			}
		}
	
		this._gestureMoveHandler = function(e){
			//TouchMoveX를 체크하는 이유는 시작한 터치무브가 존재하지 않을경우에는 작동되지 않음 (바깥쪽 이벤트가 Touch끼리 서로 섞이지 않게 하기 위함)
			if(EventListener.hasListener() && _self._firstPageX !== undefined){
				var pageX = e.touches ? e.touches[0].pageX : e.pageX;
				var pageY = e.touches ? e.touches[0].pageY : e.pageY;
				
				// update _lastGesture
				_self._lastGesture.pageX=pageX;
				_self._lastGesture.pageY=pageY;
				_self._lastGesture.relativeX=pageX - _self._firstPageX;
				_self._lastGesture.relativeY=pageY - _self._firstPageY;
				_self._lastGesture.screenX=e.screenX;
				_self._lastGesture.screenY=e.screenY;
				_self._lastGesture.moveX=pageX - _self._lastPageX;
				_self._lastGesture.moveY=pageY - _self._lastPageY;
				_self._lastGesture.offsetX=_self._lastGesture.offsetX + _self._lastGesture.moveX;
				_self._lastGesture.offsetY=_self._lastGesture.offsetY + _self._lastGesture.moveY;
				
				//layer mouse position
				if(_self.layerView){
					var layerOffset = N.NODEKIT.mousePosition(e,_self.layerView);
					_self._lastGesture.layerX = layerOffset.x;
					_self._lastGesture.layerY = layerOffset.y;
				} else {
					_self._lastGesture.layerX = _self._lastGesture.offsetX;
					_self._lastGesture.layerY = _self._lastGesture.offsetY;
				}
				
				_self._lastGestureEvent = e;
				
				// update _lastPage
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
					EventListener.trigger("pinch",e,_self._lastGesture,"move");
					
				}
				EventListener.trigger("drag",e,_self._lastGesture,"move");
				
				if(_self.stopPropagation===true)e.stopPropagation();
				if(_self.preventDefault===true) e.preventDefault();
			}
		};
	
		this._gestureEndHandler = function(e){
			if(EventListener.hasListener() && _self._firstPageX !== undefined){
				
				if (EventListener.hasListener("pinch") && (typeof _self._firstPinchValue === "number") && e.touches && e.touches.length === 2) {
					this.EventListener.trigger("pinch",e,_self._lastGesture,"end");
				}
				EventListener.trigger("drag",e,_self._lastGesture,"end");
				
				_self._gestureReset();
				
				if(_self.stopPropagation===true)e.stopPropagation();
				if(_self.preventDefault===true) e.preventDefault();
			}
		};
		
		N.node.punch(this.view,"mousedown",_self._gestureStartHandler);
		N.node.punch(document.body,"mousemove",_self._gestureMoveHandler);
		N.node.punch(document.body,"mouseup",_self._gestureEndHandler);		
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