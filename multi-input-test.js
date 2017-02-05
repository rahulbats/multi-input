var multi = {
	tags: [],
	maxAllowed: 5,

	init: function(settings) {
		multi.eventTriggers();

		$("#srm-search-initial-number-text_tag").focus();
		$("#srm-search-initial-number-text_tag").bind('paste', function(e){
			var inputTags = e.originalEvent.clipboardData.getData('Text').replace(/\n/g,',').replace(/;/g,',').split(',');
			inputTags.map(function(inputTag){
				if(inputTag!='')
				{
					$('#srm-search-initial-number-text').addTag(inputTag);
				}
				$("#srm-search-initial-number-text_tag").focus();
			});
			
			 e.preventDefault();
		});
	

		
	},

	eventTriggers: function() {
		
		$('#edit_whole').bind('click', function(event){
			$('#edit-whole-value').val(multi.tags.toString());
			$('#editWholeModal').modal();
		});

		$('#editWholeFm').submit( function(event) {
			multi.tags = $('#edit-whole-value').val().split(/[;,]+/);
			multi.renderTags( $('#srm-search-initial-number-text'));
			$('#editWholeModal').modal('hide')
			event.preventDefault();
		});

		var tagsInput = $('#srm-search-initial-number-text').tagsInput({
			//'autocomplete_url': url_to_autocomplete_api,
		 	//'autocomplete': { option: value, option: value},
		 	'min-height':'45px',
		 	'height' : 'auto',
		 	'maxheight' : '100px',
		 	'width':'100%',
		 	'minInputWidth': '145px',
		 	'interactive':true,
		 	'defaultText':'Add equipment',
		 	'onAddTag':multi.onAddTag,
		 	'onRemoveTag':multi.onRemoveTag,
		 	'onChangeTag' : multi.onChangeTag,
		 	'onInsertTag' : multi.onInsertTag,
			'checkValidity' : multi.checkValidity,
		 	'delimiter': [',',';'],   // Or a string with a single delimiter. Ex: ';'
		 	'removeWithBackspace' : true,
		 	'minChars' : 0,
		 	'maxTags' : multi.maxAllowed,
		 	//'maxChars' : 10, // if not provided there is no limit
		 	'placeholderColor' : '#55595c'
		});

		
		$("#remove_invalids").bind('click', function(event) {
			multi.removeInvalids();
		});
	},

	resetTags: function(target) {
		target.importTags('');
		multi.tags = [];
		$('#equipment-helper').text('').hide();
		$('#srm-search-initial-number-text_tag').show();
		$('#srm-search-initial-number-text_tagsinput').removeClass('invalid');
		$('#remove_invalids').hide("slow");
	},

	renderTags: function(target, position) {
		$("#srm-search-submit-button").prop('disabled', false);
		//var target = $(e.target);
		target.importTags('');
		var temp = multi.tags;
		multi.tags = [];
		temp.forEach(function(tag, index) {
			 var tag = $.trim(tag);
			 if (index === position) {
			 	target.addTag(tag, {animate: true, checkForInvalidTags: false});
			 } else {	
			 	target.addTag(tag, {checkForInvalidTags: false});
			 }
		});
		multi.checkForInvalidTags();
		if (multi.tags.length == 0) {
			multi.resetTags(target);
		}
	},

	removeInvalids: function(e) {
		var validTags = [];
		var invalidTags = [];

		multi.tags.forEach(function(tag){
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
			multi.tags = validTags;
			multi.tags = multi.tags.filter(function(tag,i) {
				return multi.tags.indexOf(tag) === i;
			});

			multi.renderTags( $('#srm-search-initial-number-text'));
			$('#removeWarningModal').modal('hide')
		});
	},

	tidyTags : function(e) {
		var temp = e.tags.split(',');
	
		multi.tags = multi.tags.concat(temp.splice(0, multi.maxAllowed-multi.tags.length));
		multi.renderTags($(e.target));
		var dropped = temp.splice(multi.maxAllowed-multi.tags.length);

		if (dropped.length > 0) {
			var clipBoardString='';
			var modalString='';
			dropped.forEach(function(invalidTag) {
				clipBoardString=clipBoardString+invalidTag+'\n';
				modalString=modalString+invalidTag+'\n';
			});

			$('#dopped-equipments').text(modalString);
			$('#copy-exceeded').attr('data-clipboard-text',clipBoardString);

			$('#srm-search-initial-number-text_tag').popover('dispose');
			$("#pasteModal").modal();
		}
	},

	onChangeTag: function(position, newVal) {
		var validityMessage = multi.checkValidity(newVal);
		if (validityMessage!='') {
			$('#equipment-helper').text(validityMessage).addClass('invalid');
		} else {
			$('#equipment-helper').text('Entry count: '+(multi.tags.length)).removeClass('invalid');
		}

		multi.tags[position] = newVal; 
		multi.renderTags($('#srm-search-initial-number-text'));
	},

	onRemoveTag: function(tag) {
		var index = multi.tags.indexOf(tag);
		multi.tags.splice(index,1);
		multi.renderTags($('#srm-search-initial-number-text'));
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
          }  else if (thechar.length < 2 || thechar.length > 4) {
                 return 'Invalid format. Equipment Initial must be 2 to 4 alpha characters';
          } else if ((thechar.length + ('' + thenum).length) < tag.length) {
                 return 'Invalid entry';
          } else {
                 return '';
          }
    },
	
	checkForInvalidTags: function(){
		if ($('#srm-search-initial-number-text_tagsinput .not_valid').length > 0) {
			$("#remove_invalids").show( "slow" );
			$("#srm-search-submit-button").prop('disabled', true);
		} else {
			$("#remove_invalids").hide( "slow" );
			$("#srm-search-submit-button").prop('disabled', false);
		}
	},
	
	onInsertTag: function(position, tag){
		multi.tags.splice(position, 0, tag);
		multi.renderTags($('#srm-search-initial-number-text'), position);
	},

	onAddTag: function(tag, checkForInvalidTags) {
		$('#srm-search-initial-number-text_tag').show();
		$('#equipment-helper').show();
		tag = tag.replace(/\n/g,',').replace(/;/g,',');

		if (tag.indexOf(',') > 0) {
			multi.tidyTags({target: '#srm-search-initial-number-text', tags : tag});
		} else {
			var thenum = -1;
			if (tag.match(/\d+/)) {
				thenum = tag.match(/\d+/)[0];
			}
			var thechar = tag.replace(/[0-9]/g, '');
			multi.tags.push(tag);
		}
		if(checkForInvalidTags==true)
			{
				multi.checkForInvalidTags();
			}
		
	},

};
$(document).ready(multi.init);
