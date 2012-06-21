	CORE.create_module("eav-tabs", function(sb){
		var contracts, rates, access;
		return {
			init: function() {
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
					'header-ready': this.enableTab('rates'),
					'rates-ready': this.enableTab('access'),
					'header-not-ready': this.disableBothTabs(),
					'rates-not-ready': this.disableTab('access')
				});
			},
			destroy: function() {
				this.disableBothTabs();
				contracts = null;
				rates = null;
				access = null;
				tabs = null;
			},
			enableTab: function(tab){
				$(tab).parent().removeClass('inactive');
				sb.removeEvent(tab, 'click', this.falseClick);
			},
			disableTab: function(tab){
				$(tab).parent().addClass('inactive');
				sb.addEvent(tab,'click',this.falseClick);
			},
			disableBothTabs: function(){
				$(rates).parent().addClass('inactive');
				$(access).parent().addClass('inactive');
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
		}
	});

	CORE.create_module("contract-search-box", function(sb){
		var input, button, clear, form, number, result;
		return {
			init: function() {
				form = sb.find('#contract-search-form')[0];
				input = sb.find('#contract-number')[0];
				button = sb.find('#contract-search-submit')[0];
				clear = sb.find('#contract-search-clear')[0];
				spinner = sb.find('#contract-search-spinner')[0];
				result = sb.find('#contract-search-result')[0];
				notfound = sb.find('#contract-not-found')[0];
				continuebtn = sb.find('#enter-new-contract')[0];
				searchagainbtn = sb.find('#search-contract-again')[0];
				sb.addEvent(button,'click',this.startSearch);
				sb.addEvent(clear,'click', this.clearSearch);
				sb.addEvent(searchagainbtn,'click',this.clearSearch);
				sb.addEvent(continuebtn,'click',this.moveToNewContract);
				sb.addEvent(input, 'change keyup keydown blur', this.checkFormat);
				sb.listen({  
		            'perform-contract-search' : this.contractSearch,  
		            'contract-search-verdict' : this.showResult
		        });
		        input.value = ''; 

			},
			destroy: function() {
				sb.removeEvent(button,'click', this.startSearch);
				input = null;
				button = null;
				clear = null;
			},
			startSearch: function(){
				if(input.value != ""){
					sb.addClass(form,'inProgress');			
					var query = input.value;
					if(query){
						sb.notify({
							type: 'perform-contract-search',
							data: query
						});
					};
					return false;
				} else {
					return false;
				}
										
			},
			clearSearch: function(){
				input.value='';
				sb.notify({
					type: 'quit-contract-search',
					data: null
				});
				sb.removeClass(form,'inProgress');				
				sb.addClass(button,'disabled');
				sb.disable(button);	
				if($('#contract-not-found').css('display') == 'block'){
					$('#contract-not-found').slideUp('slow');
				}			
				return false;
			},
			contractSearch : function(query) {
				number = query;
				var verdict = 'false';
				// perform db search using query value
				// set verdict: true/false;
				// send notification
				sb.notify({
					type: 'contract-search-verdict',
					data: verdict
				}); 
			},
			showResult : function(verdict) {
				if(verdict == 'true'){
					sb.notify({
						type: 'contract-is-found',
						data: number
					});
					// Move to next section of the tool.  edit those contract headers!
				} else {
					$('#contract-not-found').fadeIn('slow');
				};
				sb.removeClass(form,'inProgress');				
			},
			checkFormat: function(){
				var contract = input.value;
				var reg = /[A-Z]{2}-[A-Z0-9]{4}-[A-Z]-[0-9]{2}-[0-9]{4}/gi;
				if(contract.search(reg) == -1){					
					sb.disable(button);
				} else {
					sb.enable(button);
				}				
			},
			moveToNewContract : function(){
				$('#contract-search-box').hide();
				sb.notify({
					type: 'enter-a-new-contract',
					data: number					
				});
			}
			

		};
	});


	CORE.create_module("contract-headers", function(sb){
		var contract_number, vendor_id, remit_to, aircraft_type, contract_type, start_date, base_end_date, end_date, unavail_time_rounding, standby_time_rounding, ext_standby_time_rounding, disc_percent_1, disc_days_1, disc_percent_2, disc_days_2, disc_percent_3, disc_days_3 = '';
		var contractHeaders = this;
		return {
			init : function() {
				rates = sb.find('#rates-tab')[0];
				headerform = sb.find('#contract-headers')[0];
				intro = sb.find('#header-intro-text')[0];
				contractnumber = sb.find('#thecontractnumber')[0];
				vendorid = sb.find('#vendorid')[0];
				tnvendorid = sb.find('#TNvendorid')[0];
				remitto = sb.find('#remitto')[0];
				aircraftype = sb.find('#aircraft_type')[0];
				contracttype = sb.find('#contract_type')[0];
				contractstartdate = sb.find('#contractStartDate')[0];
				baseenddate = sb.find('#baseEndDate')[0];
				contractenddate = sb.find('#contractEndDate')[0];
				baseRateEffDate = sb.find('#baseRateEffDate')[0];
				baseRateExpDate = sb.find('#baseRateExpDate')[0];
				timelinestartdate = sb.find('#timelinestartdate')[0];
				timelinebaseenddate = sb.find('#timelinebaseenddate')[0];
				timelinecontractenddate = sb.find('#timelinecontractenddate')[0];
				saveTailNumRatesBtn = sb.find('#saveTailNumRatesBtn')[0];
				slider1 = sb.find('#slider1')[0];
				slider2 = sb.find('#slider2')[0];
				slider3 = sb.find('#slider3')[0];
				addBaseRateBtn = sb.find('#addBaseRateBtn')[0];
				clearBaseRateBtn = sb.find('#clearBaseRateBtn')[0];
				addRateConfirm = sb.find ('#addRateConfirm')[0];
				vendorSearchBtn = sb.find('#vendorSearchBtn')[0];
				useVendorBtn = sb.find('#useVendorBtn')[0];
				addBaseRateBtn = sb.find('#addBaseRateBtn')[0];

				sb.addEvent(contracttype, 'change', this.activateRatesTab);

				sb.addEvent(contractstartdate,'blur change keydown keyup', this.updateContractStartDate);
				sb.addEvent(clearBaseRateBtn, 'click', this.clearBaseRate);

				sb.addEvent(addBaseRateBtn, 'click', this.addBaseRate);

				sb.addEvent(vendorSearchBtn, 'click', this.populateVendorResults);
				sb.addEvent(vendorid, 'change keyup blur keydown', this.populateVendorResults);

				sb.addEvent(useVendorBtn, 'click', this.useVendor);
				
				sb.listen({
					'enter-a-new-contract' : this.showNewHeaderForm,
					'view-existing-contract' : this.showFilledHeaderForm,
					'contract-end-date-set' : this.computeOptions,
					'options-set' : this.addTailNumOptions,
					'add-line-rate' : this.addLineRate,
					'add-tail-number' : this.saveTailNumRates,
					'cancel-add-tail-number' : this.cancelAddTailNumber
				});

				//Directly calling the Calendar Popup plugin.
				//Wiring this up otherwise is a P.I.T.A.
				$('#contractStartDate').datepick({showOnFocus: true, showTrigger:'<button  type="button" id="pickstartdatebtn" class="btn btn-info trigger">'+'<i class="icon-calendar icon-white"></i>'+'</button>', showAnim: 'slideDown',dateFormat: 'mm/dd/yyyy',onSelect: this.updateContractStartDate});

				$('#baseEndDate').datepick({showOnFocus: true, showTrigger:'<button  type="button" id="pickbaseenddatebtn" class="btn btn-info trigger">'+'<i class="icon-calendar icon-white"></i>'+'</button>', showAnim: 'slideDown',dateFormat: 'mm/dd/yyyy',onSelect: this.updateBaseEndDate});

				$('#contractEndDate').datepick({showOnFocus: true, showTrigger:'<button  type="button" id="pickcontractenddatebtn" class="btn btn-info trigger">'+'<i class="icon-calendar icon-white"></i>'+'</button>', showAnim: 'slideDown',dateFormat: 'mm/dd/yyyy',onSelect: this.updateContractEndDate});

				$('#baseRateEffDate').datepick({showOnFocus: true, showTrigger:'<button  type="button" id="baserateeffdatebtn" class="btn btn-info">'+'<i class="icon-calendar icon-white"></i>'+'</button>', showAnim: 'slideDown',dateFormat: 'mm/dd/yyyy'});

				$('#baseRateExpDate').datepick({showOnFocus: true, showTrigger:'<button  type="button" id="baserateexpdatebtn" class="btn btn-info">'+'<i class="icon-calendar icon-white"></i>'+'</button>', showAnim: 'slideDown',dateFormat: 'mm/dd/yyyy'});

				$('#slider1').slider({
					value:00,
					min: 00,
					max: 60,
					step: 30,
					slide: function (event, ui){
						$('#slider1mins').text(function(index){
						if(ui.value == '30'){
							return '15';
						} else {
							return ui.value;
						}
					});
					}
				});

				$('#slider1mins').text(function(index){
					if($('#slider1').slider("value") == '30'){
						return '15';
					} else {
						return $('#slider1').slider("value");
					}
				});		

				$('#slider2').slider({
					value:00,
					min: 00,
					max: 60,
					step: 30,
					slide: function (event, ui){
						$('#slider2mins').text(function(index){
						if(ui.value == '30'){
							return '15';
						} else {
							return ui.value;
						}
					});
					}
				});
				$('#slider2mins').text($('#slider2').slider("value"));

				$('#slider3').slider({
					value:00,
					min: 00,
					max: 60,
					step: 30,
					slide: function (event, ui){
						$('#slider3mins').text(function(index){
						if(ui.value == '30'){
							return '15';
						} else {
							return ui.value;
						}
					}         );
					}
				});
				$('#slider3mins').text($('#slider3').slider("value"));

				$('.ui-slider a').append('<i class="icon-resize-horizontal icon-white"></i>');

				$('.addaratebtn').click(function(){
					var that = this;
					if($('.addRateFormFields:visible').length > 0){
						$('.addRateFormFields:visible').removeClass('open').slideUp('fast',function(){
							$(that).parent().parent('.row').prev('.addRateFormFields').slideDown('slow',function(){
								$(this).addClass('open');
							});					
						})
					} else {
						$(that).parent().parent('.row').prev('.addRateFormFields').slideDown('slow',function(){
							$(this).addClass('open');
						});
					}				
				});

				$('#saveTailNumRatesBtn').click(function(){
					sb.notify({
						type: 'add-tail-number',
						data: null
					})
				})

				$('#cancelAddTailNum').click(function(){
					sb.notify({
						type: 'cancel-add-tail-number',
						data: null
					})
				})
			},
			destroy : function(){
 				
			},
			activateRatesTab : function(){
				$('#rates-tab').unbind('click', this.falseClick);
				$('#rates-tab').parent('li').removeClass('inactive');
			},
			showNewHeaderForm : function(number) {
				contract_number = number;
				contractnumber.value = contract_number;
				$('#TNcontractnumber').val(contract_number);
				$('#contract-headers').show();
				$('#header-intro-text').empty().text("You're entering a new contract!  We've added the contract number into the form for you, but you'll need to add the rest.");
			},
			showFilledHeaderForm : function(number) {
				contract_number = number;
				contractnumber.value = contract_number;
				$('#contract-headers').show();
				$('#header-intro-text').empty().text("Below is the information for the contract number you entered.");
			},
			updateContractStartDate : function(){
				stdt = contractstartdate.value;
				$('#timelinestartdate').empty().text(stdt);
				$('#baseRateStart').empty().val(stdt);				
			},
			updateBaseEndDate : function(){
				bedt = baseenddate.value;
				$('#timelinebaseenddate').empty().text(bedt);
				$('#baseRateEnd').empty().val(bedt);
			},
			updateContractEndDate : function(){
				cedt = contractenddate.value;
				$('#timelinecontractenddate').empty().text(cedt);
				sb.notify({
					type: 'contract-end-date-set',
					data: null
				});
			},
			computeOptions : function(){
				var oneday = 24*60*60*1000;
				// convert to typeof(date)
				var baseend = baseenddate.value;
				var basesplit = baseend.split('/');
				var newbaseend = basesplit[2] + "-" + basesplit[0] + "-" + basesplit[1];
				// now convert to milliseconds
				var newbaseenddate = new Date(newbaseend).getTime();

				//convert to typeof(date);
				var contractend = contractenddate.value;
				var contsplit = contractend.split('/');
				var newcontractend = contsplit[2] + "-" + contsplit[0] + "-" + contsplit[1];
				// now convert to milliseconds
				var newcontractenddate = new Date(newcontractend).getTime();

				// find the difference between the dates and convert it from milliseconds to years, but we need to round it.
				var years = Math.round(Math.abs((newcontractenddate - newbaseenddate))/oneday/365) ;
				

				// Find the total number of timeline segments to be displayed.  
				var divisor = years + 3;  //startdate/baseend/contractend + options
				var size = 100/divisor;
				$('.datesegment.option').remove();
				var thisyear = parseInt(basesplit[2]) + parseInt(years);
				var startday = parseInt(basesplit[1]);// + parseInt(years);
				for(i=years; i>0; i--){
					endyear = thisyear ;
					thisyear--;
					startday;
					$('.datesegment:eq(1)').after("<div class='datesegment option' id='option"+i+"'><span class='segmentname'>Option "+i+" Start Date</span><span class='segmentdate'>"+ contsplit[0] + "/" + startday + "/" + thisyear + "</span><span class='segmentenddate'>"+ contsplit[0] + "/" + startday + "/" + endyear + "</span></div>");
					$('#option'+i+'RateStart').empty().val(contsplit[0] + "/" + startday + "/" + thisyear);
				}
				$('.datesegment').css('width',(size-.25) + '%');

				sb.notify({
					type: 'options-set',
					data: years
				})
				
			}, 
			addBaseRate : function (){
				var valid = 'false';
				$('.baseratesbox input').each(function(){
				    if($(this).val() === ''){
				    	valid = 'false';
				    } else {
				    	valid = 'true';

				    }
				})

				if($('#selectBaseRate').val() === ''){
					valid = 'false';
				} else {
					valid = 'true';
				}

				if(valid === 'true'){
					$('#confirmRateAdd').modal('hide');
					var type = $('#selectBaseRate').val();
					var price = $('#baseRatePrice').val();
					var effdate = $('#baseRateEffDate').val();
					var expdate = $('#baseRateExpDate').val();
					if($('#baseratestable').css('display') == 'none'){
						$('#baseratestable').fadeIn();
					}					
					$('#baseratestable tbody').append('<tr><td>'+type+'</td><td>' + price + '</td><td>' + effdate + '</td><td>' + expdate + '</td></tr>');
					return false;
				} else {
					$('#confirmRateAdd').modal('hide');
					alert("Not all of the Base Contract Rates have been filled.  Please fill them and retry your submission.");
					return false;
				}
				
			},
			clearBaseRate : function (){
				$('#baserates input').val('');
				$('#selectBaseRate').val('');
				return false;
			},
			populateVendorResults : function(){ 
				$('#searchvendorlistname').text($('#vendorSearchField').val());
				$('#TNvendorid').val($('#vendorid').val());
				$('#vendorSearchResults').fadeIn();
			},
			useVendor : function(){
				$('#vendorid').val($('#searchvendorlistname').text());
				$('#vendorLookupModal').modal('hide');
			},
			addTailNumOptions : function(years){
				$('.addaratebtn').unbind('click');
				$('#tailNumModalForm .modal-body').empty().append('<div class="row"><div class="cell"><label for="addTailNumField">Tail Number</label><input type="text" id="addTailNumField" value="" placeholder="Tail Number" /></div><div class="cell"><label for="tailNumLineNum">Line Number:</label><input type="text" name="tailNumLineNum" id="tailNumLineNum" /></div><div class="cell"><label for="tailNumModNum">Mod Number:</label><input type="text" name="tailNumModNum" id="tailNumModNum"></div><div class="cell"><label for="tailNumAircraftType">Aircraft Type</label><select name="" id="tailNumAircraftType"><option value="">Select Aircraft Type</option><option value="212">212</option></select></div></div><h4>Base</h4><table class="table table-bordered table-striped table-condensed lineRatesTable"><thead><tr class="lineRateHeader"><th>Rate</th><th>Price Per Unit</th><th>Rate Start Date</th><th>Rate End Date</th></tr></thead><tbody></tbody></table><div class="row addRateFormFields"><div class="cell"><label for="baseRate">Rate</label><select id="baseRate" name="baseRate"><option value="">Select Rate</option><option value="av">AV - Availability Rate</option></select></div><div class="cell"><label for="basePricePerUnit">Price Per Unit</label><input type="text" id="basePricePerUnit" name=""></div><div class="cell"><label for="baseRateStart">Rate Start:</label><input type="text" id="baseRateStart" name=""></div><div class="cell"><label for="baseRateEnd">Rate End:</label><input type="text" id="baseRateEnd" name=""></div><div class="cell"><button class="AddOptionRateButton btn btn-primary btn-small"><i class="icon icon-plus-sign icon-white"></i> Add</button></div></div><div class="row"><div class="cell"><button class="btn btn-small addaratebtn" id="baseaddratebtn"><i class="icon icon-plus-sign"></i> add a rate</button></div></div>');
				for(i=1; i<=years; i++){
					$('#tailNumModalForm .modal-body').append('<h4>Option '+i+'</h4><table class="table table-bordered table-striped table-condensed lineRatesTable"><thead><tr class="lineRateHeader"><th>Rate</th><th>Price Per Unit</th><th>Rate Start Date</th><th>Rate End Date</th></tr></thead><tbody></tbody></table><div class="row addRateFormFields"><div class="cell"><label for="option'+i+'Rate">Rate</label><select id="option'+i+'Rate" name="option'+i+'Rate"><option value="">Select Rate</option><option value="av">AV - Availability Rate</option></select></div><div class="cell"><label for="option'+i+'PricePerUnit">Price Per Unit</label><input type="text" id="option'+i+'PricePerUnit" name=""></div><div class="cell"><label for="option'+i+'RateStart">Rate Start:</label><input type="text" id="option'+i+'RateStart" name="" value="'+$('#option'+i+' .segmentdate').text()+'"></div><div class="cell"><label for="option'+i+'RateEnd">Rate End:</label><input type="text" id="option'+i+'RateEnd" value="'+$('#option'+i+' .segmentenddate').text()+'"></div><div class="cell"><button class="AddOptionRateButton btn btn-primary btn-small"><i class="icon icon-plus-sign icon-white"></i> Add</button></div></div><div class="row"><div class="cell"><button class="btn btn-small addaratebtn"><i class="icon icon-plus-sign"></i> add a rate</button></div></div>');
				}

				$('#baseRateStart').val($('#contractStartDate').val());	
				$('#baseRateEnd').val($('#baseEndDate').val());

				for(i=1; i<=years; i++){ 

				}


				$('.addaratebtn').click(function(){
					var that = this;
					if($('.addRateFormFields:visible').length > 0){
						$('.addRateFormFields:visible').removeClass('open').slideUp('fast',function(){							
							$(that).parent().parent('.row').prev('.addRateFormFields').slideDown('slow',function(){
								$(this).addClass('open');
							});					
						})
					} else {
						$(that).parent().parent('.row').prev('.addRateFormFields').slideDown('slow',function(){
								$(this).addClass('open');
							});

					}
				});			

				$('.AddOptionRateButton').click(function(){
					if($(this).hasClass('disabled')){
						return false;
					} else {
						sb.notify({
							type: "add-line-rate",
							data: null
						});						
					}					
				});

			},
			addLineRate : function(){
				var newRate = new Array();
				var contractSection = $('.addRateFormFields.open').prev().prev().text().toLowerCase();
				contractSection = contractSection.replace(/\s/g, "");

				newRate[0] = $('.addRateFormFields.open>.cell>select').val();
				newRate[1] = $('.addRateFormFields.open>.cell>#'+contractSection+'PricePerUnit').val();
				newRate[2] = $('.addRateFormFields.open>.cell>#'+contractSection+'RateStart').val();
				newRate[3] = $('.addRateFormFields.open>.cell>#'+contractSection+'RateEnd').val();

				for(i=0;i<3;i++){
					if(newRate[i] == ""){
						alert('Please be sure all the fields are filled in before adding a rate.');
						return false;
					}
				}

				$('.addRateFormFields.open').prev('.lineRatesTable').fadeIn('slow',function(){
					$('.addRateFormFields.open').prev().children('tbody').append('<tr class="lineRateEntry"><td class="cell">'+newRate[0]+'</td><td>'+newRate[1]+'</td><td>'+newRate[2]+'</td><td>'+newRate[3]+'</td></tr>');

					$('.addRateFormFields.open select').val('');
					$('.addRateFormFields.open #PricePerUnit').val('');
				});


			},
			saveTailNumRates : function(){
				var tail = new Array();
				tail[0] = $('#addTailNumField').val();
				tail[1] = $('#tailNumLineNum').val();
				tail[2] = $('#tailNumModNum').val();
				tail[3] = $('#tailNumAircraftType').val();

				for(i=0;i<3;i++){
					if(tail[i] == ""){
						alert('Please be sure all the Tail Number fields are filled in before finishing.');
						return false;
					}
				}

				if($('.lineRateEntry').length == ''){
					alert('Please add a rate for this Tail Number before finishing');
					return false;
				}

				$('#tailnumberlist').append("<li>" + tail[0] + " (" + $('.lineRateEntry').length + ")");

				$('#tailNumModalForm').modal('hide');
				$('#addTailNumField').val('');
				$('#tailNumLineNum').val('');
				$('#tailNumModNum').val('');
				$('#tailNumAircraftType').val('');
				$('.lineRatesTable tbody').empty();
				$('.lineRatesTable').hide();
				$('.addRateFormFields').removeClass('open').hide();
				$('.addRateFormFields .cell select').val('');
				$('.addRateFormFields .cell:nth-child(2) input').val('');
			},
			cancelAddTailNumber : function(){
				$('#tailNumModalForm').modal('hide');
				$('#addTailNumField').val('');
				$('#tailNumLineNum').val('');
				$('#tailNumModNum').val('');
				$('#tailNumAircraftType').val('');
				$('.lineRatesTable tbody').empty();
				$('.lineRatesTable').hide();
				$('.addRateFormFields').removeClass('open').hide();
				$('.addRateFormFields .cell select').val('');
				$('.addRateFormFields .cell:nth-child(2) input').val('');
			}
		}
	});
	


CORE.start_all();