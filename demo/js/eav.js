jQuery(document).ready(function() {
	CORE.create_module("contract-search-box", function(sb){
		var input, button, clear;

		return {
			init: function() {
				input = sb.find('#contract-number')[0];
				button = sb.find('#contract-search-submit')[0];
				clear = sb.find('#contract-search-clear')[0];

				sb.addEvent(button, 'click', this.handleSearch);
				sb.addEvent(clear,'click', this.quitSearch);
				sb.addEvent(input, 'keyup', this.checkFormat);
			},
			destroy: function() {
				sb.removeEvent(button,'click', this.handleSearch);
				input = null;
				button = null;
				clear = null;
			},
			handleSearch: function(){
				var query = input.value;
				if(query){
					sb.notify({
						type: 'perform-contract-search',
						data: query
					});
				}
			},
			quitSearch: function(){
				input.value='';
				sb.notify({
					type: 'quit-contract-search',
					data: null
				})
				return false;
			},
			checkFormat: function(){
				var num = input.value;
				console.log(num);
			},
			enableSearch: function(){
				button.removeAttr('disabled');
			},
			disableSearch: function(){
				button.attr('disabled','disabled');
			}
		};
	});

	CORE.create_module("eav-tabs", function(sb){
		var contracts, rates, access;

		init: function(){
			// setup individual tabs and one group object
			var contracts = sb.find('#contract-tab')[0];
			var rates = sb.find('#rates-tab')[0];
			var access = sb.find('#access-tab')[0];
			var tabs = sb.find('ul.eav-tabs li a');

			// Contract tab can always accept a click;
			sb.addEvent(contracts, 'click', this.handleContract);
			// Make sure clicks on disabled tabs don't do anything to begin with.
			sb.addEvent(rates, 'click', this.falseClick);  
			sb.addEvent(access, 'click', this.falseClick);

			// listen for messages from the forms to know when to enable the tabs.
			sb.listen({
				'header-ready': this.enableTab('rates');
				'rates-ready': this.enableTab('access');
				'header-not-ready': this.disableBothTabs();
				'rates-not-ready': this.disableTab('access');
			})
		},
		destroy: function(){
			this.disableBothTabs();
			contracts = null;
			rates = null;
			access = null;
			tabs = null;
		},
		enableTab: function(tab){
			tab.parent().removeClass('inactive');
			sb.removeEvent(tab, 'click', this.falseClick);
		},
		disableTab: function(tab){
			tab.parent().addClass('inactive');
			sb.addEvent(tab,'click'.falseClick);
		},
		disableBothTabs: function(){
			rates.parent().addClass('inactive');
			access.parent().addClass('inactive');
		},
		handleContract: function() {
			sb.notify({
				type: 'tab-to-contract',
				data: null
			});
		},
		falseClick: function(){
			return false;
		}
	});
});
