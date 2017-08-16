multi = {
	
		maxAllowed: 5,
		tagsInput: null,
		loadModal: function(modalId) {
			var dialog = $("#" + modalId).show().dialog("open");
			$("#" + modalId).parent().show();
			$('.container').before("<div class='backdrop'></div>");
			$('.backdrop').height($(document).height());
			dialog.on('dialogclose', function(event) {
				$('.backdrop').remove();
				$("#" + modalId).hide();
			});
		},

		init: function(settings) {
			
	
			multi.eventTriggers();
			multi.setEquipmentFocus();
			
	
			$("#srm-search-error-message").hide();
			
	
	
			$("#srm-search-initial-number-text_tag").bind('paste', function(e) {
	
				$("#srm-search-initial-number-text_tag").focus();
	
				var clipboardData = e.originalEvent.clipboardData;
	
				//IE bug fix
				if (clipboardData === null || clipboardData === undefined) {
					clipboardData = window.clipboardData;
				}
	
				var inputTags = clipboardData.getData('Text').replace(/\n/g, ',').replace(/;/g, ',').split(',');
				inputTags[0] = $(e.target).val() + inputTags[0];
				var tags = multi.getTagValues();
				var dropped = inputTags.splice(multi.maxAllowed - tags.length);
				inputTags = inputTags.splice(0, multi.maxAllowed - tags.length);
	
				$('#srm-search-initial-number-text_addTag').prepend('<span id="loader"><i class="fa fa-spinner fa-spin" aria-hidden="true" />&nbsp;Loading..</span>');
	
				setTimeout(function() {
					inputTags.map(function(inputTag, index) {
						if (inputTag != '') {
							$('#srm-search-initial-number-text').addTag(inputTag);
						}
	
						if (index == inputTags.length - 1) {
	
							$('#srm-search-initial-number-text_addTag #loader').remove();
	
							if (dropped.length > 0 && dropped[0] !== '') {
								var clipBoardString = '';
								var modalString = '';
								dropped.forEach(function(invalidTag) {
									clipBoardString = clipBoardString + invalidTag + '\n';
									modalString = modalString + invalidTag + '\n';
								});
	
								$('#dopped-equipments').text(modalString);
								$('#copy-exceeded').attr('data-clipboard-text', clipBoardString.trim());
	
								$('#srm-search-initial-number-text_tag').popover('dispose');
								multi.loadModal('pasteModal');
								new Clipboard('#copy-exceeded');
							}
						}
					});
	
					$("#srm-search-initial-number-text_tag").focus();
				}, 10);
	
				e.preventDefault();
			});
		},
	
		
		eventTriggers: function() {
			multi.isFormValid = true;
			//Search form fields on Keyup
			$("#srm-search-form").on('keyup change blur', 'input[type=text],input[type=datetime],input[type=checkbox],textarea,select', function(e) {
				multi.clearErrorForBlankFields();
				multi.validateOnKeyPress();
				multi.initializeCustomerRole();
				multi.enableCustomerNameExactMatch();
			});
	
			// Shipment request ID on Keydown
			$("input#srm-search-shipment-request-id-text").on("keydown", function(e) {
				var keycode = (e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode));
				if (keycode == 13 && !e.shiftKey) {
					e.preventDefault();
					var validation = multi.validateOnKeyPress();
					if (validation) {
						$("#srm-search-submit-button").click();
					}
				}
			});
	
			// Shipment Request From Date on Keydown
			$("input#srm-search-waybill-from-date-date").on("keydown", function(e) {
				var keycode = (e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode));
				if (keycode == 13 && !e.shiftKey) {
					// e.preventDefault();
					var validation = multi.validateOnKeyPress();
					if (validation) {
						$("#srm-search-submit-button").click();
					}
				}
			});
	
			// Shipment Request To Date on Keydown
			$('#srm-search-waybill-to-date-date').on("keydown", function(e) {
				var keycode = (e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode));
				if (keycode == 13 && !e.shiftKey) {
					e.preventDefault();
					var validation = multi.validateOnKeyPress();
					if (validation) {
						$("#srm-search-submit-button").click();
					}
				}
			});
	
			// Search - Title bar
			$("#srm-search-panel-title").on("click", function(e) {
				e.preventDefault();
				//$(this).addClass("panel-heading-open");
			});
	
			// Search - ENTER key
			$("#srm-search-initial-number-text").on("keydown", function(e) {
				// track enter key
				var keycode = (e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode));
				if (keycode == 13 && !e.shiftKey) {
					// prevent ENTER key to go to next line unless SHIFT + ENTER
					e.preventDefault();
					// process action
					multi.performSearchAction(e);
				}
			});
	
			// Search - Search click
			$("input:not([id$=typeahead])").on("keydown", function(e) {
				// track enter key
				var keycode = (e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode));
				if (keycode == 13) {
					// process action
					multi.performSearchAction(e);
				}
			});
	
			// Search - Clear
			$("#srm-search-form").on("click", "#srm-search-clear-button", function(e) {
				e.preventDefault();
				multi.performClearAction(e);
				multi.validateOnKeyPress();
				multi.setEquipmentFocusTo();
				multi.setDefaultFromAndToDate();
				multi.clearErrorForBlankFields();
				$("#srm-search-customer-role-select").prop("disabled", true);
			});
	
			// Search - Submit
		   $("#srm-search-form").on("click", "#srm-search-submit-button", function(e) {
			   e.preventDefault();
			   if (multi.validateOnSubmit()) {
				   multi.isFormValid = true;
				   $("#srm-search-customer-name-error-message").hide();
				   $("#srm-search-origin-error-message").hide();
				   $("#srm-search-destination-error-message").hide();
				   $("#srm-search-origin-typeahead").removeClass("invalid");
				   $("#srm-search-destination-typeahead").removeClass("invalid");
				   srm.searchResultSummary.displaySearchResultSummary();
				   srm.common.loadingSpinner("start");
				   srm.searchResultSummary.adjustSummaryTableWidth();
			   } else {
				   multi.isFormValid = false;
			   }
		   });
	
			// Remove - Equipments
			$("#removeInvEqCancel,.close,#cancel").on("click", function(e) {
				multi.setEquipmentFocusTo();
			});
	
			// CreatedFromTo - Date
			$("#srm-search-waybill-from-date-calendar").click(function() {
				$('#srm-search-waybill-from-date-date').focus();
			});
	
			$("#srm-search-waybill-to-date-calendar").click(function() {
				$('#srm-search-waybill-to-date-date').focus();
			});
	
			multi.tagsInput = $('#srm-search-initial-number-text').tagsInput({
				//'autocomplete_url': url_to_autocomplete_api,
				//'autocomplete': { option: value, option: value},
				'min-height': '45px',
				'height': 'auto',
				'maxheight': '100px',
				'width': '100%',
				'minInputWidth': '145px',
				'interactive': true,
				'defaultText': 'Add equipment',
				'beforeAddTag': multi.beforeAddTag,
				'onAddTag': multi.onAddTag,
				'onRemoveTag': multi.onRemoveTag,
				'onChangeTag': multi.onChangeTag,
				'onInsertTag': multi.onInsertTag,
				'checkValidity': multi.checkValidity,
				'delimiter': [',', ';'], // Or a string with a single delimiter. Ex: ';'
				'removeWithBackspace': true,
				'minChars': 0,
				'maxTags': multi.maxAllowed,
				//'maxChars' : 10, // if not provided there is no limit
				'placeholderColor': '#55595c'
			});
	
			$("#remove_invalids").bind('click', function(event) {
				multi.removeInvalids();
				multi.validateOnKeyPress();
			});
	
			// Search - advanced search
			$("#srm-search-advanced-search-link").on("click", function(e) {
				e.preventDefault();
				$("#srm-search-content-panel").find('div.card-section').not(':nth-child(1)').slideToggle(200, "linear");
				$(this).find('i').toggleClass('fa-angle-up fa-angle-down');
			});     
			$('#srm-search-customer-name-typeahead').autocomplete({
				source: function(request, response) {
					$("#srm-search-customer-name-error-message").hide();
					var fieldName = 'customer-name';
					var params = srm.common.createAjaxParam("getCustomerNameTypeahead", "GET", "json", "application/json; charset=utf-8", {
						"customerName": $('#srm-search-customer-name-typeahead').val().trim()
					}, true, true, true, "Customer Name Typeahead");
					srm.common.invokeAjaxCommand(params, multi.loadCustomerNameSuccessCallback(request, response), "false", multi.typeAheadErrorCallback(request, response, fieldName), multi.loadTypeAheadCompleteCallback);
				},
				minLength: 3,
				select: function(event, ui) {
					if (ui.item.label.length >= 30) {
						$('#srm-search-customer-name-typeahead').val(ui.item.label.substring(0, 30));
						$('#srm-search-customer-name-exact-match-checkbox').prop('checked', false);
						$('#srm-search-customer-name-exact-match-checkbox').prop('disabled', true);
						$('#srm-search-customer-name-info-message').show();
						return false;
					}
					$('#srm-search-error-message').hide();
					/*var cifRegExp = /\=([^)]+)\)/;
					var cif = !srm.common.isBlank(cifRegExp.exec(ui.item.label))?cifRegExp.exec(ui.item.label)[0].slice(1, -1):"";
					$('#srm-search-cif-text').val(cif);*/
				},
			});
	
	
		   $('#srm-search-origin-typeahead').autocomplete({
			   source: function(request, response) {
				   var fieldName = 'origin';
				   $("#srm-search-origin-error-message").hide();
				   $("#srm-search-origin-typeahead").removeClass("invalid");
				   if (multi.validateLocationTypeAhead('#srm-search-origin-typeahead')) {
					   var params = srm.common.createAjaxParam("getLocationTypeahead", "GET", "json", "application/json; charset=utf-8", {
						   "location": $('#srm-search-origin-typeahead').val().trim(),
						   "fieldName": $('#srm-search-origin-typeahead').prop("title") + " Typeahead"
					   }, true, true, true, "Origin Typeahead");
					   srm.common.invokeAjaxCommand(params, multi.loadStationSuccessCallback(request, response, fieldName), "false", multi.typeAheadErrorCallback(request, response, fieldName), multi.loadTypeAheadCompleteCallback);
				   }
			   },
			   minLength: 3,
			   select: function(event, ui) {
				   console.log('You selected: ' + ui.item.label);
				   $("#srm-search-origin-error-message").hide();
				   $("#srm-search-origin-typeahead").removeClass("invalid");
				   $('#srm-search-error-message').hide();
			   },
		   });
	
		  $('#srm-search-destination-typeahead').autocomplete({
			  source: function(request, response) {
				  var fieldName = 'destination';
				  $("#srm-search-destination-error-message").hide();
				  $("#srm-search-destination-typeahead").removeClass("invalid");
				  if (multi.validateLocationTypeAhead('#srm-search-destination-typeahead')) {
					  var params = srm.common.createAjaxParam("getLocationTypeahead", "GET", "json", "application/json; charset=utf-8", {
						  "location": $('#srm-search-destination-typeahead').val().trim(),
						  "fieldName": $('#srm-search-destination-typeahead').prop("title") + " Typeahead"
					  }, true, true, true, "Destination Typeahead");
					  srm.common.invokeAjaxCommand(params, multi.loadStationSuccessCallback(request, response, fieldName), "false", multi.typeAheadErrorCallback(request, response, fieldName), multi.loadTypeAheadCompleteCallback);
				  }
			  },
			  minLength: 3,
			  select: function(event, ui) {
				  console.log('You selected: ' + ui.item.label);
				  $('#srm-search-error-message').hide();
				  $("#srm-search-destination-error-message").hide();
				  $("#srm-search-destination-typeahead").removeClass("invalid");
			  },
		  });
		},
	
		enableCustomerNameExactMatch: function() {
			var customerName = $("#srm-search-customer-name-typeahead").val(),
				isCustomerNameExactMatchDisabled = customerName.length <3 || customerName.length >= 30;
				$("#srm-search-customer-name-info-message").hide();
				if (customerName.length < 3) {
					$("#srm-search-customer-name-exact-match-checkbox").prop("checked", true);
				} else if (customerName.length >= 30) {
					$("#srm-search-customer-name-exact-match-checkbox").prop("checked", false);
					$("#srm-search-customer-name-info-message").show();
				}	
			
			// enable Customer Name Exact match when at least 3 non-blank chars entered
			$("#srm-search-customer-name-exact-match-checkbox").prop("disabled", isCustomerNameExactMatchDisabled);
		},
	
		loadCustomerNameSuccessCallback: function(request, response) {
			return function(message) {
				if (!_.isUndefined(message)) {
					if (message.messageType === "SUCCESS") {
						var locationObjects = JSON.parse(message.messageBody);
						var locations = _.chain(locationObjects).pluck("locname").uniq().value();
						response(locations);
					} else if (message.messageType === "NOT_FOUND") {
						var result = [{
							label: message.errorMessage
						}];
						response(result);
					} else {
						$('.ui-autocomplete').hide();
						$("#srm-search-customer-name-error-message").show();
						$("#srm-search-customer-name-error-message").html(message.errorMessage);
						console.log("Error occurred:" + message.messageType + ":" + message.errorMessage);
					}
				}
			}
		},
	
		typeAheadErrorCallback: function(request, response, fieldName) {
			return function(jqXHR, textStatus, errorThrown) {
				response([]);
				console.error("Status:" + xhr.status + "Error: " + thrownError);
				$("#srm-search-" + fieldName + "-error-message").show();
				$("#srm-search-" + fieldName + "-error-message").html(thrownError);
				$("#srm-search-" + fieldName + "-typeahead").removeClass('ui-autocomplete-loading');
			}
		},
	
		loadTypeAheadCompleteCallback: function(data, textStatus, jqXHR) {
			$('[id^="srm-"][id$="-typeahead"]').removeClass('ui-autocomplete-loading');
		},
	
		loadStationSuccessCallback: function(request, response, fieldName) {
			return function(message) {
				if (!_.isUndefined(message)) {
					if (message.messageType === "SUCCESS") {
						var locations = JSON.parse(message.messageBody);
						response(locations.map(function(locationObject) {
							var city = !srm.common.isBlank(locationObject.station) ? locationObject.station.trim() : "";
							var state = !srm.common.isBlank(locationObject.state) ? locationObject.state.trim() : "";
							return {
								label: city + ", " + state,
								value: city + ", " + state
							}
						}));
					} else if (message.messageType === "NOT_FOUND") {
						var result = [{
							label: message.errorMessage
						}];
						response(result);
					} else {
						$('.ui-autocomplete').hide();
						$("#srm-search-" + fieldName + "-error-message").show();
						$("#srm-search-" + fieldName + "-error-message").html(message.errorMessage);
						console.log("Error occurred:" + message.messageType + ":" + message.errorMessage);
					}
				}
			}
		},
	
		validateOnSubmit: function() {
			var validOrigin = multi.validateLocation('#srm-search-origin-typeahead');
			var validDestination = multi.validateLocation('#srm-search-destination-typeahead');
			return validOrigin && validDestination;
		},
	
		validateLocation: function(elementId) {
			var valid = true;
			var location = $(elementId).val().split(",");
			if (!srm.common.isBlank(location)) {
	
				var city = location[0], state = location[1];
				var errorMessageId = elementId.replace("typeahead", "") + 'error-message';
	
				switch (true) {
					case srm.common.isBlank(city) || srm.common.isBlank(state):
						$(elementId).addClass("invalid");
						$(errorMessageId).text('Invalid input');
						$(errorMessageId).show();
						valid = false;
						break;
					default:
						$(elementId).removeClass("invalid");
						$(errorMessageId).hide();
						valid = true;
				}
			}
			return valid;
		},
	
		resetTags: function(target) {
			target.importTags('');
			$('#equipment-helper').text('').hide();
			$('#srm-search-initial-number-text_tag').show();
			$('#srm-search-initial-number-text_tagsinput').removeClass('invalid');
			$('#remove_invalids').hide();
		},
	
		getTagValues: function() {
			var tagSpans = $.makeArray($('#srm-search-initial-number-text_tagsinput .text'));
			return tagSpans.map(function(tagSpan) {
				return $(tagSpan).attr('id').replace("tag_", "").trim();
			});
		},
	
		removeInvalids: function(e) {
			var validTags = [];
			var invalidTags = [];
	
			multi.getTagValues().forEach(function(tag){
				if (multi.checkValidity(tag)=='') {
					validTags.push(tag);
				} else {
					invalidTags.push(tag);
				}
			});
	
			var clipBoardString = '';
			var modalString = '';
	
			invalidTags.forEach(function(invalidTag) {
				clipBoardString=clipBoardString+invalidTag+'\n';
				modalString=modalString+invalidTag+'\n';
			});
	
			$('#removed-equipments').text(modalString);
			$('#copy-invalids').attr('data-clipboard-text',clipBoardString);
			$('#removeWarningModal').modal();
			$("#removeWarningModal").draggable();
			$("#pasteModal").draggable();
			$('#removeWarningModal #remove-invalids').bind('click', function(event) {
				validTags = validTags.filter(function(tag, i) {
					return multi.getTagValues().indexOf(tag) === i;
				});
	
				$('#srm-search-initial-number-text_tagsinput .not_valid').each(function(i, elem) {
					multi.tagsInput.removeTag($(elem));
				});
	
				$('#removeWarningModal').modal('hide');
				multi.validateOnKeyPress();
				$("#srm-search-initial-number-text_tag").focus();
			});
		},
	
		beforeAddTag: function(value) {
			value = jQuery.trim(value).replace(/ /g, '').replace(/\t/g, '').replace(/\xa0/g, '').toUpperCase();
			if (value.match(/\d+/)) {
				var thenum = value.match(/\d+/)[0];
				var thechar = value.substring(0, value.indexOf(thenum));
				thenum = parseInt(thenum, 10);
				var theRemain = value.substring(value.indexOf(thenum) + ('' + thenum).length);
				value = thechar + (thenum > 0 ? thenum : '') + theRemain;
			}
			return value;
		},
	
		onRemoveTag: function(tag) {
	
			$('#equipment-helper').text('Entry count: ' + ($('#srm-search-initial-number-text_tagsinput .text').length)).removeClass('invalid');
			$('#srm-search-initial-number-text_tag').show();
	
			if ($('#srm-search-initial-number-text_tagsinput .not_valid').length == 0) {
				$('#srm-search-initial-number-text_tagsinput').removeClass('invalid');
				$("#remove_invalids").hide();
				multi.validateOnKeyPress();
			}
	
			if ($('#srm-search-initial-number-text_tagsinput .tag').length == 0) {
				$('#equipment-helper').text('').hide();
				multi.validateOnKeyPress();
			}
			$('#srm-search-initial-number-text_tagsinput .insert').show()
			multi.setEquipmentFocusTo();
		},
	
		checkValidity: function(tag) {
			var thenum = -1;
			if (tag.match(/\d+/)) {
				thenum = tag.match(/\d+/)[0];
			}
	
			var thechar = tag.substring(0, tag.indexOf(thenum));
	
			if (thenum > 9999999999) {
				return 'Invalid format. Equipment Number must be 1 to 10 digits';
			}
	
			if (thenum < 0) {
				return 'Invalid format. Equipment Initial must be 2 to 4 alpha characters. Equipment Number must be 1 to 10 digits';
			} else if (thechar.length < 2 || thechar.length > 4) {
				return 'Invalid format. Equipment Initial must be 2 to 4 alpha characters';
			} else if ((thechar.length + ('' + thenum).length) < tag.length) {
				return 'Invalid format. Equipment Number must be 1 to 10 digits';
			} else {
				return '';
			}
		},
	
		checkForInvalidTags: function() {
			if (($('#srm-search-initial-number-text_tagsinput .not_valid').length > 0)) {
				$("#remove_invalids").show();
				return false;
			} else {
				$("#remove_invalids").hide();
				return true;
			}
		},
	
		validateOnKeyPress: function() {
			if (!multi.checkForInvalidTags()) {
				$('#srm-search-initial-number-text_tagsinput').addClass('invalid');
			} else {
				$('#srm-search-initial-number-text_tagsinput').removeClass('invalid');
			}
	
			var isEquipmentValid = multi.checkForInvalidTags();
			
		},
	
	
		
	
		onInsertTag: function(position, tag) {
			console.log('insert tag called');
			//multi.tags.splice(position, 0, tag);
			//multi.renderTags($('#srm-search-initial-number-text'), position);
		},
	
		onAddTag: function(tag, checkForInvalidTags) {
			$('#srm-search-initial-number-text_tag').show();
			$('#equipment-helper').show();
			tag = tag.replace(/\n/g, ',').replace(/;/g, ',');
	
			var thenum = -1;
	
			if (tag.match(/\d+/)) {
				thenum = tag.match(/\d+/)[0];
			}
	
			var thechar = tag.replace(/[0-9]/g, '');
			var tags = multi.getTagValues();
	
			if (tags.length == multi.maxAllowed) {
				$('#equipment-helper').text('Maximum allowed entries reached');
				$('#srm-search-initial-number-text_tag').hide();
			} else {
				$('#equipment-helper').text('Entry count: ' + (tags.length));
			}
	
			if (checkForInvalidTags) {
				multi.validateOnKeyPress();
			}
		},
	
		displaySearchCriteria: function(criteriaMessage) {
			if (!srm.common.isEmpty(criteriaMessage)) {
				$("#srm-search-result-criteria-banner").html("").append('<span id="srm-search-result-criteria-banner-label"><i class="hint-text"/>&nbsp;Search criteria:</span>&nbsp;' + criteriaMessage);
			} else {
				$("#srm-search-error-message").text("No criteria specified. Enter search criteria and try again");
				$("#srm-search-error-message").show();
			}
		},
	
		performSearchAction: function(e) {
			if (multi.validateOnKeyPress()) {
				var searchCriteria = multi.validateSearchCriteria(e);
				$("#srm-search-result-criteria-banner").html("<strong>Search criteria<strong>: ").append(searchCriteria);
	
				if (!srm.common.isEmpty(searchCriteria)) {
					// force the 'Enter Key' to implicitly click
					$("#srm-search-submit-button").click();
				} else {
					$("#srm-search-error-message").text("No criteria specified. Enter search criteria and try again");
					$("#srm-search-error-message").show();
				}
			}
		},
	
		performClearAction: function(e) {
			$("#srm-search-initial-number-text").val("");
			$("#srm-search-customer-name-typeahead").val("");
			multi.enableCustomerNameExactMatch();
			$("#srm-search-customer-role-select").get(0).selectedIndex = 0;
			$("#srm-search-cif-text").val("");
			$("#srm-search-origin-typeahead").val("");
			$("#srm-search-destination-typeahead").val("");
			$("#srm-search-shipment-request-id-text").val("");
			$("#srm-search-waybill-id-text").val("");
			//$("#srm-search-waybill-from-date-date").val("");
			//$("#srm-search-waybill-to-date-date").val("");
			$("#srm-search-process-from-date-date").val("");
			$("#srm-search-process-to-date-date").val("");
			$("#srm-search-initial-number-text_tag").val("");
			// temporary commented out 'til we support the filters below
			//$("#srm-search-active-checkbox").prop('checked',true);
			//$("#srm-search-accepted-checkbox").prop('checked',true);
			//$("#srm-search-rejected-checkbox").prop('checked',true);
			//$("#srm-search-closed-checkbox").prop('checked',true);
			//$("#srm-search-load-checkbox").prop('checked',true);
			//$("#srm-search-empty-checkbox").prop('checked',true);
	
			$("#srm-search-error-message").html("");
			$("#srm-search-error-message").hide();
			$("#srm-search-initial-number-text").focus();
			multi.resetTags($('#srm-search-initial-number-text'));
			$("#srm-search-shipment-request-id-text").removeClass("invalid");
			$("#srm-search-shipment-request-id-errorMessage").hide();
			$("#srm-search-submit-button").prop('disabled', false);
		},
	
		
	
		disableFields: function(data) {
			if (!isEmpty(data)) {
				var fieldId = data.split(',');
				$.each(fieldId, function(index, value) {
					$('#' + value).prop('disabled', true);
				});
			}
		},
	
	
		setEquipmentFocus: function() {
			$("#srm-search-initial-number-text_tag").focusin(function() {
				if (!$('#srm-search-initial-number-text_tagsinput .not_valid').length >= 0) {
					$("#srm-search-initial-number-text_tagsinput").addClass("inputFocus");
				}
			});
	
			$("#srm-search-initial-number-text_tag").focusout(function() {
				$("#srm-search-initial-number-text_tagsinput").removeClass("inputFocus");
			});
			multi.setEquipmentFocusTo();
		},
	
		setEquipmentFocusTo: function() {
			$("#srm-search-initial-number-text_tag").focus();
		},
	
	};
	
	$(document).ready(multi.init);
	
