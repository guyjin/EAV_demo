CORE.create_module("eav-tabs", function (sb) {
	var contracts, rates, access;
	return {
		init: function () {
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
			vendorIDSearchBtn = sb.find('#vendor_id_search_btn')[0];


			slider1 = sb.find('#slider1')[0];
			slider2 = sb.find('#slider2')[0];
			slider3 = sb.find('#slider3')[0];
			
			
			addRateConfirm = sb.find ('#addRateConfirm')[0];
			vendorSearchBtn = sb.find('#vendorSearchBtn')[0];
			useVendorBtn = sb.find('#useVendorBtn')[0];
			
			vendorSearchField = sb.find('#vendorSearchField')[0];

			sb.addEvent(contractstartdate,'blur change keydown keyup', this.updateContractStartDate);
			

			

			sb.addEvent(vendorSearchBtn, 'click', this.populateVendorResults);

			sb.addEvent(vendorSearchField, 'keyup', this.checkVendorSearchKeyStroke);

			sb.addEvent(vendorid, 'change keyup blur keydown', this.populateVendorResults);

			sb.addEvent(useVendorBtn, 'click', this.useVendor);


			sb.listen({
				'enter-a-new-contract' : this.showNewHeaderForm,
				'view-existing-contract' : this.showFilledHeaderForm,
				'contract-end-date-set' : this.computeOptions,
				'options-set' : this.addTailNumOptions,
				'option-set-finished' : this.activateRatesTab,
				'add-line-rate' : this.addLineRate,
				'add-tail-number' : this.saveTailNumRates,
				'cancel-add-tail-number' : this.cancelAddTailNumber,
				'vendor-enter-pressed' : this.populateVendorResults
			});

			//Directly calling the Calendar Popup plugin.
			//Wiring this up otherwise is a P.I.T.A.
			$('#contractStartDate').datepick({showOnFocus: true, showTrigger:'<button  type="button" id="pickstartdatebtn" class="btn btn-info trigger">'+'<i class="icon-calendar icon-white"></i>'+'</button>', showAnim: 'slideDown',dateFormat: 'mm/dd/yyyy',onSelect: this.updateContractStartDate});

			$('#baseEndDate').datepick({showOnFocus: true, showTrigger:'<button  type="button" id="pickbaseenddatebtn" class="btn btn-info trigger">'+'<i class="icon-calendar icon-white"></i>'+'</button>', showAnim: 'slideDown',dateFormat: 'mm/dd/yyyy',onSelect: this.updateBaseEndDate});

			$('#contractEndDate').datepick({showOnFocus: true, showTrigger:'<button  type="button" id="pickcontractenddatebtn" class="btn btn-info trigger">'+'<i class="icon-calendar icon-white"></i>'+'</button>', showAnim: 'slideDown',dateFormat: 'mm/dd/yyyy',onSelect: this.updateContractEndDate});

			$('#vendorLookupModal').on('shown', function() {
				$('#vendorSearchField').focus();
			})

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
			var baseend = baseenddate.value;
			var d = new Date(Date.parse(baseend));
			var o = new Date(Date.parse(baseend));
			///var basesplit = baseend.split('/');
			///var newbaseend = basesplit[2] + "-" + basesplit[0] + "-" + basesplit[1];
			// now convert to milliseconds
			///var newbaseenddate = new Date(newbaseend).getTime();

			//convert to typeof(date);
			///var contractend = contractenddate.value;
			var contractend = new Date(Date.parse(contractenddate.value));
			///var contsplit = contractend.split('/');
			///var newcontractend = contsplit[2] + "-" + contsplit[0] + "-" + contsplit[1];
			// now convert to milliseconds
			///var newcontractenddate = new Date(newcontractend).getTime();

			// find the difference between the dates and convert it from milliseconds to years, but we need to round it.
			///var years = Math.round(Math.abs((newcontractenddate.getTime() - newbaseenddate.getTime()))/oneday/365) ;

			var years = Math.round(Math.abs((contractend.getTime() - d.getTime()))/oneday/365);



			// Find the total number of timeline segments to be displayed. Do some math to get dimensions right.
			var divisor = years + 2;  
			var size = 100/divisor;
			//remove any existing options since the dates can be changed by the user.
			$('.datesegment.option').remove();
			///var thisyear = parseInt(basesplit[2]) + parseInt(years);
			var startyear = d.getFullYear() + years;
			var startday = d.getDate() + years + 1;
			////var startday = parseInt(basesplit[1]) + parseInt(years) + 1; // adding +1 to give the first option a start day one day after the base end day.


			/*
				var d = new Date(Date.parse(baseend));
				console.log(d);
				var day = d.getDate() + 1;
				console.log(day);
				d.setDate(day);
				years = 3;
				var year = d.getFullYear() + years;
				console.log(year);
				d.setFullYear(year);
				console.log(d);
			*/

			for(i=1; i<years; i++){
				var day = o.getDate() + 1;
				var year = o.getFullYear() + 1;
				o.setDate(day);
				o.setFullYear(year);
				
				m = o.getMonth() + 1;
				dt = o.getDate();
				yy = o.getFullYear();
				console.log(yy);
				endyear = yy + 1;
				var optionstart = m + "/" + dt + "/" + yy;
				var optionend  = m + "/" + dt + "/" + endyear;

				//optiondate = o.setDate(startday);
				//$('.datesegment:eq(1)').after("<div class='datesegment option' id='option"+i+"'><span class='segmentname'>Option "+i+" Start Date</span><span class='segmentdate'>"+ contsplit[0] + "/" + startday + "/" + thisyear + "</span><span class='segmentenddate'>"+ contsplit[0] + "/" + startday + "/" + endyear + "</span></div>");
				$('.datesegment:eq('+i+')').after("<div class='datesegment option' id='option"+i+"'><span class='segmentname'>Option "+i+" Start Date</span><span class='segmentdate'>"+optionstart+"</span><span class='segmentenddate'>"+ optionend + "</span></div>");
				//$('#option'+i+'RateStart').empty().val(contsplit[0] + "/" + startday + "/" + thisyear);
				$('#option'+i+'RateStart').empty().val(optionstart);
			}
			$('.datesegment').css('width',(size-.25) + '%');

			sb.notify({
				type: 'options-set',
				data: years-1
			})

		},		
		checkVendorSearchKeyStroke : function (e){
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13){
				sb.notify({
					type: 'vendor-enter-pressed',
					data: null
				})
			}
		},
		populateVendorResults : function(){
			$('#searchvendorlistname').text($('#vendorSearchField').val());
			$('#TNvendorid').val($('#vendorid').val());
			$('#vendorSearchResults').fadeIn();
		},
		useVendor : function(){
			$('#vendorid').val($('#searchvendorlistname').text());
			$('#TNvendorid').val($('#vendorid').val());
			$('#vendorLookupModal').modal('hide');
		},
		addTailNumOptions : function(years){
			$('.addaratebtn').unbind('click');
			$('#tailNumModalForm .modal-body').empty().append('<div class="row"><div class="cell"><label for="addTailNumField">Tail Number</label><input type="text" id="addTailNumField" value="" placeholder="Tail Number" /></div><div class="cell"><label for="tailNumModNum">Mod Number:</label><input type="text" name="tailNumModNum" id="tailNumModNum"></div><div class="cell"><label for="tailNumAircraftType">Aircraft Type</label><select name="" id="tailNumAircraftType"><option value="">Select Aircraft Type</option><option value="46010642">*SL-3/4</option><option value="21010642">204 Super B</option><option value="20010642">204B (UH-1 Series)</option><option value="22010642">205A-1</option><option value="23010642">205A-1++</option><option value="28010642">206B-II</option><option value="29010642">206B-III</option><option value="30010642">206L-1</option><option value="31010642">206L-3</option><option value="32010642">206L-4</option><option value="33010642">210</option><option value="34010642">212</option><option value="35010642">214B</option><option value="36010642">214B1</option><option value="37010642">214ST</option><option value="38010642">222A</option><option value="39010642">222B</option><option value="40010642">222UT</option><option value="41010642">407</option><option value="42010642">412</option><option value="43010642">412HP</option><option value="19010642">47/SOLOY</option><option value="53010642">500C</option><option value="54010642">500D/E</option><option value="55010642">520N</option><option value="56010642">530F</option><option value="57010642">600N</option><option value="58010642">900/902</option><option value="7010642">AS 332L1</option><option value="9010642">AS-330J</option><option value="1010253">AS-350B</option><option value="11010642">AS-350B-1</option><option value="12010642">AS-350B-2</option><option value="13010642">AS-350B-3</option><option value="10010642">AS-350B/350BA</option><option value="2010253">AS-350BA</option><option value="14010642">AS-350D</option><option value="15010642">AS-355F-1/355F-2</option><option value="16010642">AS-365N-1</option><option value="68010642">AW 119 KOALA</option><option value="69010642">AW 139</option><option value="52010642">BK 117</option><option value="51010642">BO 105CBS</option><option value="44010642">BV-107</option><option value="45010642">BV-234</option><option value="63010642">CH 53D</option><option value="64010642">CH 54/S 64</option><option value="71010642">EC 130-B4</option><option value="72010642">EC 145</option><option value="73010642">EC 155B1</option><option value="74010642">EC 225</option><option value="17010642">EC-120</option><option value="18010642">EC-135</option><option value="70010642">EH 101</option><option value="47010642">H-1100B</option><option value="49010642">H43-F</option><option value="78010642">K-1200</option><option value="59010642">S-55T</option><option value="60010642">S-58D/E</option><option value="61010642">S-58T/PT6T-3</option><option value="62010642">S-58T/PT6T-6</option><option value="65010642">S-61N</option><option value="66010642">S-62A</option><option value="67010642">S-70</option><option value="79010642">S-76C+</option><option value="80010642">S-92</option><option value="3010642">SA-315B</option><option value="4010642">SA-316B</option><option value="5010642">SA-318C</option><option value="6010642">SA-319B</option><option value="8010642">SA-341G</option><option value="26010642">TH-1L</option><option value="48010642">UH-12/SOLO</option><option value="24010642">UH-1B</option><option value="75010642">UH-1B Super</option><option value="25010642">UH-1F</option><option value="76010642">UH-1H (13 engine)</option><option value="77010642">UH-1H (17 engine)</option></select></div></div><h4>Base</h4><table class="table table-bordered table-striped table-condensed lineRatesTable"><thead><tr class="lineRateHeader"><th>Rate</th><th>Price Per Unit</th><th>Rate Start Date</th><th>Rate End Date</th></tr></thead><tbody></tbody></table><div class="row addRateFormFields"><div class="cell"><label for="baseRate">Rate</label><select id="baseRate" name="baseRate"><option value="">Select Rate</option><OPTION selected value="">Select Rate</OPTION><OPTION value=2010643>FT - Flight Rate with Govt Pilot</OPTION><OPTION value=7010643>AV - Availability Rate</OPTION><OPTION value=13010643>FT - Specified Flight Rate</OPTION><OPTION value=14010643>FT - Flight Rate Dry</OPTION><OPTION value=15010643>FT - Project Rate</OPTION><OPTION value=23010643>AV - Half-Day Availability Rate</OPTION></select></div><div class="cell"><label for="basePricePerUnit">Price Per Unit</label><input type="text" id="basePricePerUnit" name=""></div><div class="cell"><label for="baseRateStart">Rate Start:</label><input type="text" id="baseRateStart" name=""></div><div class="cell"><label for="baseRateEnd">Rate End:</label><input type="text" id="baseRateEnd" name=""></div><div class="cell"><button class="AddOptionRateButton btn btn-primary btn-small"><i class="icon icon-plus-sign icon-white"></i> Add</button></div></div><div class="row"><div class="cell"><button class="btn btn-small addaratebtn" id="baseaddratebtn"><i class="icon icon-plus-sign"></i> add a rate</button></div></div>');
			for(i=1; i<years; i++){
				$('#tailNumModalForm .modal-body').append('<h4>Option '+i+'</h4><table class="table table-bordered table-striped table-condensed lineRatesTable"><thead><tr class="lineRateHeader"><th>Rate</th><th>Price Per Unit</th><th>Rate Start Date</th><th>Rate End Date</th></tr></thead><tbody></tbody></table><div class="row addRateFormFields"><div class="cell"><label for="option'+i+'Rate">Rate</label><select id="option'+i+'Rate" name="option'+i+'Rate"><option value="">Select Rate</option><OPTION selected value="">Select Rate</OPTION><OPTION value=2010643>FT - Flight Rate with Govt Pilot</OPTION><OPTION value=7010643>AV - Availability Rate</OPTION><OPTION value=13010643>FT - Specified Flight Rate</OPTION><OPTION value=14010643>FT - Flight Rate Dry</OPTION><OPTION value=15010643>FT - Project Rate</OPTION><OPTION value=23010643>AV - Half-Day Availability Rate</OPTION></select></div><div class="cell"><label for="option'+i+'PricePerUnit">Price Per Unit</label><input type="text" id="option'+i+'PricePerUnit" name=""></div><div class="cell"><label for="option'+i+'RateStart">Rate Start:</label><input type="text" id="option'+i+'RateStart" name="" value="'+$('#option'+i+' .segmentdate').text()+'"></div><div class="cell"><label for="option'+i+'RateEnd">Rate End:</label><input type="text" id="option'+i+'RateEnd" value="'+$('#option'+i+' .segmentenddate').text()+'"></div><div class="cell"><button class="AddOptionRateButton btn btn-primary btn-small"><i class="icon icon-plus-sign icon-white"></i> Add</button></div></div><div class="row"><div class="cell"><button class="btn btn-small addaratebtn"><i class="icon icon-plus-sign"></i> add a rate</button></div></div>');
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

			sb.notify({
				type: 'option-set-finished',
				data: null
			})

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
			tail[1] = $('#tailNumModNum').val();
			tail[2] = $('#tailNumAircraftType').val();

			for(i=0;i<2;i++){
				if(tail[i] == ""){
					alert('Please be sure all the Tail Number fields are filled in before finishing.');
					return false;
				}
			}

			if($('.lineRateEntry').length == ''){
				alert('Please add a rate for this Tail Number before finishing');
				return false;
			}

			var plural = '';

			if($('.lineRateEntry').length > 1){
				plural = 's';
			}

			var tailnumbertable = "<table class='table table-condensed table-striped table-bordered'><thead><tr><th>Tail Number</th><th>Mod Number</th><th>Aircraft Type</th></tr></thead><tbody><tr><td>"+tail[0]+"</td><td>"+tail[1]+"</td><td>"+tail[2]+"</td></tr></tbody></table>";

			var ratetableHead = "<table class='table table-condensed table-striped table-bordered'><thead><tr><th>Rate</th><th>Price Per Unit</th><th>Rate Start Date</th><th>Rate End Date</th></tr></thead><tbody>";
			var ratetableBody = '';
			var ratetableTail = "</tbody></table>";

			var ratetable = $('.lineRateEntry').each(function(i){
				ratetableBody = ratetableBody + "<tr>" + $(this).html() + "</tr>";
			})

			var ratetable = ratetableHead + ratetableBody + ratetableTail;

			$('#tailnumberlist').append("<li class='btn btn-success'><i class='icon icon-plane icon-white'></i> " + tail[0] + " ( " + $('.lineRateEntry').length + " rate"+ plural +" )</li><div class='addedrates'>" + tailnumbertable + ratetable + "</div>");

			$('#tailNumModalForm').modal('hide');
			$('#addTailNumField').val('');
			$('#tailNumModNum').val('');
			$('#tailNumAircraftType').val('');
			$('.lineRatesTable tbody').empty();
			$('.lineRatesTable').hide();
			$('.addRateFormFields').removeClass('open').hide();
			$('.addRateFormFields .cell select').val('');
			$('.addRateFormFields .cell:nth-child(2) input').val('');

			$('#tailnumberlist li').unbind('click').click(function(){
				$(this).next().toggle();
			});

		},
		cancelAddTailNumber : function(){
			$('#tailNumModalForm').modal('hide');
			$('#addTailNumField').val('');
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

CORE.create_module("baserates", function (sb) {
	return {
		init : function () {
			addBaseRateBtn = sb.find('#addBaseRateBtn')[0];
			clearBaseRateBtn = sb.find('#clearBaseRateBtn')[0];
			addBaseRateBtn = sb.find('#addBaseRateBtn')[0];
			selectBaseRate = sb.find('#selectBaseRate')[0];
			baseRatePrice = sb.find('#baseRatePrice')[0];
			
			sb.addEvent(clearBaseRateBtn, 'click', this.clearBaseRate);
			sb.addEvent(addBaseRateBtn, 'click', this.addBaseRate);
			sb.addEvent(selectBaseRate, 'change', this.populateBasePrice);

			$('#baseRateEffDate').datepick({showOnFocus: true, showTrigger:'<button  type="button" id="baserateeffdatebtn" class="btn btn-info">'+'<i class="icon-calendar icon-white"></i>'+'</button>', showAnim: 'slideDown',dateFormat: 'mm/dd/yyyy'});

			$('#baseRateExpDate').datepick({showOnFocus: true, showTrigger:'<button  type="button" id="baserateexpdatebtn" class="btn btn-info">'+'<i class="icon-calendar icon-white"></i>'+'</button>', showAnim: 'slideDown',dateFormat: 'mm/dd/yyyy'});
		},
		destroy : function () {

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
				var type = $('#selectBaseRate option:selected').text();
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
		populateBasePrice : function () {
			if(selectBaseRate.value === '0'){
				baseRatePrice.value = '';
			} else {
				baseRatePrice.value = selectBaseRate.value;
			}			
		}
	}
});



CORE.start_all();