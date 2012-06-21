var CORE = (function () {
    var moduleData = {},
    to_s = function (anything) { return Object.prototype.toString.call(anything); },
    debug = true;

	return {
		debug: function(on){
            debug = on ? true : false;
        },
		create_module: function(moduleID, creator){
			var temp;
			if(typeof moduleID === 'string' && typeof creator === 'function'){
				temp = creator(Sandbox.create(this, moduleID));
				if(temp.init && temp.destroy && typeof temp.init === 'function' && typeof temp.destroy === 'function'){
					moduleData[moduleID] = {
						create : creator,
						instance : null
					};
					temp = null;
				} else {
					this.log(1, "Module '" + moduleID + "' Registration: FAILED: instance has no init or destroy functions.");
				}
			} else {
				this.log(1, "Module  '" + moduleID + "' Registration: FAILED: one or more arguments are of incorrect type.");
			}
		},
		start : function(moduleID){
			var mod = moduleData[moduleID];
			if(mod){
				mod.instance = mod.create(Sandbox.create(this, moduleID));
				mod.instance.init();
			}
		},
		start_all : function(){
			var moduleID;
			for(moduleID in moduleData){
				if(moduleData.hasOwnProperty(moduleID)){
					this.start(moduleID);
				}
			}
		},
		stop : function(moduleID){
			var data;
			if(data = moduleData[moduleID] && data.instance){
				data.instance.destroy();
				data.instance = null;
			} else {
				this.log(1, "Stop Module '" + moduleID + "': FAILED : module does not exist or has not been started");
			}
		},
		stop_all : function(){
			var moduleID;
			for(moduleID in moduleData){
				if(moduleData.hasOwnProperty(moduleID)) {
					this.stop(moduleID);
				}
			}
		},
		registerEvents : function(evts, mod){
			if(this.is_obj(evts) && mod){
				if(moduleData[mod]){
					moduleData[mod].events =evts;
				} else {
					this.log(1, "Register events for module '" + mod + "': FAILED: module data does not exist.");
				}
			} else {
				this.log(1, "The object of events for module '" + mod + "': FAILED: The object has not been defined or the registering module is not defined.");
			}
		},
		triggerEvent : function(evt){
			var mod;
			for(mod in moduleData){
				if(moduleData.hasOwnProperty(mod)){
					mod = moduleData[mod];
					if(mod.events && mod.events[evt.type]){
						mod.events[evt.type](evt.data);
					}
				}
			}
		},
		removeEvents : function(evts, mod){
			var i = 0, evt;
			if(this.is_arr(evts) && mod && (mod = moduleData[mod]) && mod.events){
				for(; evt = evts[i++] ;){
					delete mod.events[mod];
				}
			}
		},
		log : function(severity, message){
			if(debug){
				console[ (severity === 1) ? 'log': (severity === 2) ? 'warn' : 'error'](message);
			} else {
				// send to server
			}
		},
		dom : {
			query : function (selector, context){
				var ret = {}, that = this, jqEls, i = 0;

				if(context && context.find){
					jqEls = context.find(selector);
				} else {
					jqEls = jQuery(selector);
				}

				ret = jqEls.get();
				ret.length = jqEls.length;
				ret.query = function(sel){
					return that.query(sel, jqEls);
				}
				return ret;
			},
			bind : function(element, evt, fn) {
				if(element && evt){
					if(typeof evt === 'function'){
						fn = evt;
						evt = 'click'
					} jQuery(element).bind(evt, fn);
				} else {
					console.log('wrong arguments to bind events in core.' + element, evt, fn);
				}
			},
			unbind : function(element, evt, fn){
				if(element && evt){
					if(typeof evt === 'function'){
						fn = evt;
						evt = 'click';
					}
					jQuery(element).unbind(evt, fn);
				} else {
					console.log('wrong arguments to unbind events in core');
				}
			},
			create : function(el){
				return document.createElement(el);
			},
			apply_attrs : function(el, attrs){
				jQuery(el).attr(attrs);
			},
			enable : function(el){
				jQuery(el).removeAttr('disabled');	
				jQuery(el).removeClass('disabled');		
			},
			disable : function(el){
				jQuery(el).attr('disabled','disabled').addClass('disabled');
			},
			addClass : function(el, cl){
				var theClass = cl;
				$(el).addClass(theClass);
			},
			removeClass : function(el, cl){
				var theClass = cl;
				$(el).removeClass(theClass);				
			}
		},
		is_arr : function(arr){
			return jQuery.isArray(arr);
		},
		is_obj : function(obj){
			return jQuery.isPlainObject(obj);
		}
	};
}());