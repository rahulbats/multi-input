/*
	jQuery Tags Input Plugin 1.3.3
	Copyright (c) 2011 XOXCO, Inc
	Documentation for this plugin lives here:
	http://xoxco.com/clickable/jquery-tags-input
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
	ben@xoxco.com
*/

(function($) {

	var delimiter = new Array();
	var tags_callbacks = new Array();
	var maxEntries = 300;
	$.fn.doAutosize = function(o){
	    var minWidth = $(this).data('minwidth'),
	        maxWidth = $(this).data('maxwidth'),
	        val = '',
	        input = $(this),
	        testSubject = $('#'+$(this).data('tester_id'));

	    if (val === (val = input.val())) {return;}

	    // Enter new content into testSubject
	    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	    testSubject.html(escaped);
	    // Calculate new width + whether to change
	    var testerWidth = testSubject.width(),
	        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
	        currentWidth = input.width(),
	        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
	                             || (newWidth > minWidth && newWidth < maxWidth);

	    // Animate width
	    if (isValidWidthChange) {
	        input.width(newWidth);
	    }


  };
  $.fn.resetAutosize = function(options){
    // alert(JSON.stringify(options));
    var minWidth =  $(this).data('minwidth') || options.minInputWidth || $(this).width(),
        maxWidth = $(this).data('maxwidth') || options.maxInputWidth || ($(this).closest('.tagsinput').width() - options.inputPadding),
        val = '',
        input = $(this),
        testSubject = $('<tester/>').css({
            position: 'absolute',
            top: -9999,
            left: -9999,
            width: 'auto',
            fontSize: input.css('fontSize'),
            fontFamily: input.css('fontFamily'),
            fontWeight: input.css('fontWeight'),
            letterSpacing: input.css('letterSpacing'),
            whiteSpace: 'nowrap'
        }),
        testerId = $(this).attr('id')+'_autosize_tester';
    if(! $('#'+testerId).length > 0){
      testSubject.attr('id', testerId);
      testSubject.appendTo('body');
    }

    input.data('minwidth', minWidth);
    input.data('maxwidth', maxWidth);
    input.data('tester_id', testerId);
    input.css('width', minWidth);
  };


	$.fn.addTag = function(value, options , insertPosition) {
			options = jQuery.extend({focus:false,callback:true},options);
			this.each(function() {
				var id = $(this).attr('id');

				var tagslist = $(this).val().split(delimiter[id]);
				if (tagslist[0] == '') {
					tagslist = new Array();
				}

				
				if (options.callback && tags_callbacks[id] && tags_callbacks[id]['beforeAddTag']) {
					var f = tags_callbacks[id]['beforeAddTag'];
					value = f.call(this, value);
				}
				var skipTag = false;
				if(tagslist.length>=maxEntries) {
				    //Marks fake input as not_valid to let styling it
				    $('#'+id+'_tag').addClass('not_valid');
				    skipTag=true;
				}
				else{
					if (options.unique) {
						skipTag = $(this).tagExist(value);
						if(skipTag == true) {
						    //Marks fake input as not_valid to let styling it
	    				    $('#'+id+'_tag').addClass('not_valid')
	    				    .tooltip({ title: '<p class="invalid_tip">Duplicate entry</p>', placement: 'top', trigger: 'hover' , html: true});
	    				    
	    				}
						else{
							 $('#'+id+'_tag').tooltip('dispose');
						}
					} else {
						skipTag = false;
					}
				}
				

				if (value !='' && skipTag != true) {
					
				
					
					var insertTag =  $('<span>').addClass('tag').addClass('insert');
					insertTag.html('<i class="fa fa-plus-square-o" aria-hidden="true"></i>');
					insertTag.find('i')
					.mouseenter( function(event){
						$(this).removeClass('fa-plus-square-o').addClass('fa-plus-square');
					} )
					.mouseleave( function(event){
						$(this).removeClass('fa-plus-square').addClass('fa-plus-square-o');
					} );
					if(insertPosition!==undefined) {
						var insertTagPosition = 2*insertPosition+2;
					}
					
					insertTag.insertBefore((insertPosition!==undefined && tagslist.length!==insertPosition)?"#"+id+"_tagsinput .text:nth-child(" + insertTagPosition + ")": '#' + id + '_addTag');
					
					
					var spanTag =  $('<span  id=tag_'+value+'>').addClass('text').addClass('tag');
					if(options.animate) {
						spanTag.addClass('animate');
					}
					
					if (options.callback && tags_callbacks[id] && tags_callbacks[id]['checkValidity']) {
						var f = tags_callbacks[id]['checkValidity'];
						var validationError = f.call(this, value);
						if (validationError === '' && $(this).tagExist(value)) {
							validationError = 'Duplicate entry';
                        }
						if (validationError != '') {
							spanTag.addClass('not_valid');
							spanTag.attr("data-html", "true");
							spanTag.attr('data-delay', '1');
							spanTag.tooltip({'title':'<p class="invalid_tip">'+validationError+'</b>'});
						}
						
					}
					
                    spanTag
                    //.popover(popOverSettings)
                    .append(
                        $('<span id=tag_'+value+'>').text(value).append('&nbsp;&nbsp;'),
                        $('<a>', {
                            href  : '#',
                            text  : 'x'
                        }).click(function () {
                            return $('#' + id).removeTag($(this).parent());
                        })
                    ).insertBefore((insertPosition!==undefined && tagslist.length!==insertPosition)?"#"+id+"_tagsinput .tag:nth-child(" + (insertTagPosition) + ")": '#' + id + '_addTag');
                    if(insertPosition!==undefined) {
                    	tagslist.splice(insertPosition, 0, value);
                    } else {
                    	tagslist.push(value);
                    }
					
					$('#'+id+'_tag').val('');
					if (options.focus) {
						$('#'+id+'_tag').focus();
					} else {
						$('#'+id+'_tag').blur();
					}
					
					$.fn.tagsInput.updateTagsField(this,tagslist);
					if(tagslist.length>=maxEntries) {
						$('#'+id+'_tagsinput .insert').hide();
					}
					if(options.checkForInvalidTags==undefined)
						{
							options.checkForInvalidTags=true;
						}	
					if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
						var f = tags_callbacks[id]['onAddTag'];
						f.call(this, value, options.checkForInvalidTags);
					}
					
					
					
				}

			});

			return false;
		};

	$.fn.removeTag = function(tagNode) {
		$('.tooltip').remove();
		$('.popover').remove();
			//value = unescape(value);
			this.each(function() {
				
				var id = $(this).attr('id');
				$('#'+id+'_tagsinput .insert').show();
				var tagslist = $(this).val().split(delimiter[id]);
				
				var indexToDelete  = $('#' + id + '_tagsinput .tag').index(tagNode);
				var value = tagNode.find("span").text().trim();
				
				
				//first remove the insert tag
				$('#'+id+'_tagsinput .tag:nth-child('+indexToDelete+')').remove();
				if (tagNode[0].tagName == "INPUT") {
				    $(tagNode).removeClass("not_valid");
				    $(tagNode).popover('dispose');
				    $(tagNode).val('');
				    $(tagNode).focus();
				} else {
				    tagNode.remove();
				}
				tagslist.splice((indexToDelete-1)/2,1);
				
				var texTags = $('#' + id + '_tagsinput .text');
				texTags.each(function(index, elem) {
					 if(value === $(elem).find("span").text().trim())
					 {
						 if($(elem).hasClass("not_valid"))
							 {
							 if ( tags_callbacks[id]['checkValidity']) {
									var f = tags_callbacks[id]['checkValidity'];
									var validationError = f.call(this, value);
									if( validationError === '') {
										 $(elem).removeClass("not_valid");
										 $(elem).tooltip('disable');
									 }
										return false;
									}
								}
								
						  return false;					
					 }
				});
				
				$.fn.tagsInput.updateTagsField(this,tagslist);
				
				if (tags_callbacks[id] && tags_callbacks[id]['onRemoveTag']) {
					var f = tags_callbacks[id]['onRemoveTag'];
					f.call(this, tagNode);
				}
			});

			return false;
		};

	$.fn.checkMax = function(val) {	
		var id = $(this).attr('id');
		var tagslist = $(this).val().split(delimiter[id]);
		return (tagslist.length >=maxEntries); //return false when max reached
	};
	
	$.fn.tagExist = function(val) {
		var id = $(this).attr('id');
		var tagslist = $(this).val().split(delimiter[id]);
		return (jQuery.inArray(val, tagslist) >= 0); //true when tag exists, false when not
	};

   // clear all existing tags and import new ones from a string
   $.fn.importTags = function(str) {
      var id = $(this).attr('id');
      $('#'+id+'_tagsinput .tag').remove();
      $('#'+id+'_tag').popover('dispose');
      $('#'+id+'_tag').removeClass("not_valid");
      $('#'+id+'_tag').tooltip('dispose');
      $.fn.tagsInput.importTags(this,str);
   }

	$.fn.tagsInput = function(options) {
    var settings = jQuery.extend({
      interactive:true,
      defaultText:'add a tag',
      minChars:0,
      width:'300px',
      height:'100px',
      autocomplete: {selectFirst: false },
      hide:true,
      delimiter: ',',
      unique:true,
      removeWithBackspace:true,
      placeholderColor:'#666666',
      autosize: true,
      comfortZone: 20,
      inputPadding: 6*2
    },options);

    	var uniqueIdCounter = 0;

		this.each(function() {
         // If we have already initialized the field, do not do it again
         if (typeof $(this).attr('data-tagsinput-init') !== 'undefined') {
            return;
         }

         // Mark the field as having been initialized
         $(this).attr('data-tagsinput-init', true);

			if (settings.hide) {
				$(this).hide();
			}
			var id = $(this).attr('id');
			if (!id || delimiter[$(this).attr('id')]) {
				id = $(this).attr('id', 'tags' + new Date().getTime() + (uniqueIdCounter++)).attr('id');
			}

			var data = jQuery.extend({
				pid:id,
				real_input: '#'+id,
				holder: '#'+id+'_tagsinput',
				input_wrapper: '#'+id+'_addTag',
				fake_input: '#'+id+'_tag'
			},settings);

			delimiter[id] = data.delimiter;
			maxEntries = data.maxTags;
			if (settings.onAddTag || settings.onRemoveTag || settings.onChange) {
				tags_callbacks[id] = new Array();
				tags_callbacks[id]['beforeAddTag'] = settings.beforeAddTag;
				tags_callbacks[id]['onAddTag'] = settings.onAddTag;
				tags_callbacks[id]['onRemoveTag'] = settings.onRemoveTag;
				tags_callbacks[id]['onChange'] = settings.onChange;
				tags_callbacks[id]['onChangeTag'] = settings.onChangeTag;
				tags_callbacks[id]['onInsertTag'] = settings.onInsertTag;
				tags_callbacks[id]['checkValidity'] = settings.checkValidity;
			}

			var markup = '<div id="'+id+'_tagsinput" class="form-control tagsinput"><div id="'+id+'_addTag">';

			if (settings.interactive) {
				markup = markup + '<input id="'+id+'_tag" autocomplete="off" value="" style="height:30px" placeholder="'+settings.defaultText+'" />';
				
			}

			markup = markup + '</div><div class="tags_clear"></div></div>';

			$(markup).insertAfter(this);

			$(data.holder).css('width',settings.width);
			//$(data.holder).css('min-height',settings.min-height);
			$(data.holder).css('height',settings.height);
			$(data.holder).css('max-height',settings.maxheight);

			if ($(data.real_input).val()!='') {
				$.fn.tagsInput.importTags($(data.real_input),$(data.real_input).val());
			}
			$(data.holder).on('click', function(){
				$(data.fake_input).focus();
			});
			if (settings.interactive) {
				$(data.fake_input).val($(data.fake_input).attr('data-default'));
				$(data.fake_input).css('color',settings.placeholderColor);
		        $(data.fake_input).resetAutosize(settings);

				/*$(data.holder).bind('click',data,function(event) {
					$(event.data.fake_input).focus();
				});*/

				$(data.fake_input).bind('focus',data,function(event) {
					if ($(event.data.fake_input).val()==$(event.data.fake_input).attr('data-default')) {
						$(event.data.fake_input).val('');
					}
					$(event.data.fake_input).css('color','#000000');
				});

				if (settings.autocomplete_url != undefined) {
					autocomplete_options = {source: settings.autocomplete_url};
					for (attrname in settings.autocomplete) {
						autocomplete_options[attrname] = settings.autocomplete[attrname];
					}

					if (jQuery.Autocompleter !== undefined) {
						$(data.fake_input).autocomplete(settings.autocomplete_url, settings.autocomplete);
						$(data.fake_input).bind('result',data,function(event,data,formatted) {
							if (data) {
								$('#'+id).addTag(data[0] + "",{focus:true,unique:(settings.unique)});
							}
					  	});
					} else if (jQuery.ui.autocomplete !== undefined) {
						$(data.fake_input).autocomplete(autocomplete_options);
						$(data.fake_input).bind('autocompleteselect',data,function(event,ui) {
							$(event.data.real_input).addTag(ui.item.value,{focus:true,unique:(settings.unique)});
							return false;
						});
					}


				} else {
						// if a user tabs out of the field, create a new tag
						// this is only available if autocomplete is not used.
						$(data.fake_input).bind('blur',data,function(event) {
							var d = $(this).attr('data-default');
							if ($(event.data.fake_input).val()!='' && $(event.data.fake_input).val()!=d) {
								if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
									$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
							} else {
								$(event.data.fake_input).val($(event.data.fake_input).attr('data-default'));
								$(event.data.fake_input).css('color',settings.placeholderColor);
							}
							return false;
						});

				}
				// if user types a default delimiter like comma,semicolon and then create a new tag
				$(data.fake_input).bind('keypress',data,function(event) {
					if (_checkDelimiter(event)  ) {
						//there aren't jasmine tests yet for jquery.tagsinput.js. We will do it after MVP
						if(event.which !== 13 || (event.which == 13 && $(event.target).val()!='')) {
						    event.preventDefault();
							if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
								$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
						  	$(event.data.fake_input).resetAutosize(settings);
							return false;
						}
					} else if (event.data.autosize) {
			            $(event.data.fake_input).doAutosize(settings);

          			}
				});
				//Delete last tag on backspace
				data.removeWithBackspace && $(data.fake_input).bind('keydown', function(event)
				{
					if(event.keyCode == 8 && $(this).val() == '')
					{
						 event.preventDefault();
						 var last_tag = $(this).closest('.tagsinput').find('.tag:last').text();
						 var id = $(this).attr('id').replace(/_tag$/, '');
						 last_tag = last_tag.replace(/[\s]+x$/, '');
						 var textChildren = $('#' + id + '_tagsinput .text')
						 
						 $('#' + id).removeTag( $(textChildren[textChildren.length-1]) );
						 $(this).trigger('focus');
					}
				});
				$(data.fake_input).blur();

				//Removes the not_valid class when user changes the value of the fake input
				if(data.unique) {
				    $(data.fake_input).keydown(function(event){
				        if(event.keyCode == 8 || String.fromCharCode(event.which).match(/\w+|[Ã¡Ã©Ã­Ã³ÃºÃ�Ã‰Ã�Ã“ÃšÃ±Ã‘,/]+/)) {
				            $(this).removeClass('not_valid');
						    $(this).tooltip('dispose');
				        }
				    });
				}
			} // if settings.interactive
			
			
			// Attach a delegated event handler to insert  tags
			$( "#"+id+'_tagsinput' ).on( "click", ".insert", function( event ) {
				$('#'+id+'_tagsinput .tag').popover('dispose');
				var popupContent =  '<div id="edit-form-container"> \
			         <form class="form-inline" id="insertFm" action="#">\
			            <div class="modal-body"> \
			              <div class="flex-column" id="new-equipment-container">\
			                <input id="new-equipment-value" name="new-equipment-value" autocomplete="off"  class="form-control"  value=""/>\
			                <div class="form-control-feedback" id="new-equipment-error"></div>\
			              </div> \
			            </div>\
			            <div class="modal-footer">\
			                <button type="button" id="cancel" class="btn btn-raised btn-default">Cancel</button>\
			                <button type="submit" class="btn btn-raised btn-primary" id="save-edit">\
			                Save</button>\
			            </div>\
			        </form>\
			 	</div>';
				insertTag = $(this);
				var insertPopoverSettings = {
						placement: 'bottom',
					    container: 'body',
					    html: true,
					    trigger: 'click',
					    animation: true,
						title: 'Insert equipment',
						content: popupContent
					}
				
				var insertPopover = insertTag.popover(insertPopoverSettings);
				insertPopover.on('shown.bs.popover', function(event) {
					$('.popover').before( "<div class='backdrop'></div>" );
					$('#insertFm #new-equipment-value').focus();
					$('body').keydown(function(e){
					    if (e.which==27){
					        insertTag.popover('dispose');
					        $('.backdrop').remove();
					        $('#'+id+'_tag').focus();
					    }
					});
				});
				
				insertTag.popover('show');
				$('#insertFm #new-equipment-container').removeClass('has-danger'); 
				$('#insertFm #new-equipment-error').text('').hide();
				$('#insertFm #new-equipment-value').val('');
				
				
				$('#insertFm #cancel').bind('click', function(event){
					insertTag.popover('dispose');
					$('.backdrop').remove();
					srm.search.setEquipmentFocusTo();
				});
				$('#insertFm #new-equipment-value').bind('keyup',data,function(event) {
					var newVal = $(this).val();
					if (tags_callbacks[id]['beforeAddTag']) {
						var f = tags_callbacks[id]['beforeAddTag'];
						newVal = f.call(this, newVal);
					}
					 if (tags_callbacks[id]['checkValidity']) {
							var f = tags_callbacks[id]['checkValidity'];
							var validationError = f.call($('#'+id), newVal);
							if (validationError === '' && $.fn.tagExist.call($('#'+id),newVal)) {
								validationError = 'Duplicate entry';
	                        }
							if( validationError != '') {
								$('#insertFm #new-equipment-container').addClass('has-danger'); 
								$('#insertFm #new-equipment-error').text(validationError).show();
								$('#insertFm  #save-edit').prop("disabled",true);
								return false;
							}
							else {
								$('#insertFm #new-equipment-container').removeClass('has-danger'); 
								$('#insertFm #new-equipment-error').text('').hide();
								$('#insertFm  #save-edit').prop("disabled",false);
								return false;
							}
						}
				});
				$('#insertFm').submit(function(saveevent){
					var newVal = $('#insertFm #new-equipment-value').val();
					if (tags_callbacks[id]['beforeAddTag']) {
						var f = tags_callbacks[id]['beforeAddTag'];
						newVal = f.call(this, newVal);
					}
					 
					 if ( tags_callbacks[id]['checkValidity']) {
							var f = tags_callbacks[id]['checkValidity'];
							var validationError = f.call(this, newVal);
							if (validationError === '' && $.fn.tagExist.call($('#'+id),newVal)) {
								validationError = 'Duplicate entry';
	                        }
							if( validationError != '') {
								$('#insertFm #new-equipment-container').addClass('has-danger'); 
								$('#insertFm #new-equipment-error').text(validationError).show();
								return false;
							}
						}
					 
					
					insertTag.popover('dispose');
					$('.backdrop').remove();
					var insertTagPosition =  $('#' + id + '_tagsinput .insert').index(insertTag);
					$.fn.addTag.call($('#'+id), newVal, {}, insertTagPosition);
					
					if ( tags_callbacks[id] && tags_callbacks[id]['onInsertTag']) {
						var f = tags_callbacks[id]['onInsertTag'];
						f.call(this, insertTagPosition, newVal);
					}
					
					saveevent.preventDefault();
					srm.search.setEquipmentFocusTo();
				});
				event.stopPropagation();
			});	
			
			
			// Attach a delegated event handler to span text tags
			$( "#"+id+'_tagsinput' ).on( "click", ".text", function( event ) {
				$('#'+id+'_tagsinput .tag').popover('dispose');
				var popupContent =  '<div id="edit-form-container"> \
							         <form class="form-inline" id="saveFm" action="#">\
							            <div class="modal-body"> \
							              <div class="flex-column" id="new-equipment-container">\
							                <input id="new-equipment-value" autocomplete="off" name="new-equipment-value"  class="form-control"  value=""/>\
							                <div class="form-control-feedback" id="new-equipment-error"></div>\
							              </div> \
							            </div>\
										<input id="new-equipment-value-hidden" name="new-equipment-value-hidden"  type="hidden"  value=""/>\
										<div class="modal-footer">\
											<button type="button" id="cancel" class="btn btn-raised btn-default">Cancel</button>\
							                <button type="submit" class="btn btn-raised btn-primary" id="save-edit">\
							                Save</button>\
							            </div>\
							        </form>\
							 	</div>';
				
				var popOverSettings = 
				{
				    placement: 'bottom',
				    container: 'body',
				    html: true,
				    //trigger: 'focus',
				    animation: true,
				    title: 'Edit equipment',
				    //content:" <div style='color:red'>This is your div content</div>"
				    content: popupContent
				}
				
				var value = $( this ).find('span').text().trim();
				spanTag = $(this);
				var spanTagPopover  = spanTag.popover(popOverSettings);
				spanTagPopover.on('shown.bs.popover', function(event){
					$('.popover').before( "<div class='backdrop'></div>" );
					
					$('#saveFm #new-equipment-value').focus();
					$('body').keydown(function(e){
					    if (e.which==27){
					        spanTag.popover('dispose');
					        $('.backdrop').remove();
					        $('#'+id+'_tag').focus();
					    }
					});
				});
				
				spanTag.popover('show');
				value = value.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1' );
				$('#saveFm  #new-equipment-container').removeClass('has-danger'); 
				$('#saveFm  #new-equipment-error').text('').hide();
				var unescapedValue =  event.target.id.replace('tag_','');
				
				 value = unescapedValue.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1' );
				$('#saveFm  #new-equipment-value').val(unescapedValue);
				$('#saveFm  #new-equipment-value-hidden').val(unescapedValue);
				$('#saveFm  #save-edit').prop("disabled",true);
				
				 if (tags_callbacks[id]['checkValidity']) {
						var f = tags_callbacks[id]['checkValidity'];
						var validationError = f.call(this, value);
						if (validationError === '' && $(this).tagExist(value)) {
							validationError = 'Duplicate entry';
                        }
						if (!(validationError == '') ) {
							$('#saveFm #new-equipment-container').addClass('has-danger'); 
							$('#saveFm #new-equipment-error').text(validationError).show();
						}
					}	 
				
				$('#saveFm #cancel').bind('click', function(event){
					spanTag.popover('dispose');
					$('.backdrop').remove();
					srm.search.setEquipmentFocusTo();
				});
				
				$('#saveFm #new-equipment-value').bind('keyup',data,function(event) {
					var newVal = $(this).val();
					 if (tags_callbacks[id]['checkValidity']) {
							var f = tags_callbacks[id]['checkValidity'];
							newVal = newVal.replace(/ /g,"").toUpperCase();
							var validationError = f.call($('#'+id), newVal);
							if( validationError != '') {
								$('#saveFm #new-equipment-container').addClass('has-danger'); 
								$('#saveFm #new-equipment-error').text(validationError).show();
								$('#saveFm  #save-edit').prop("disabled",true);
								return false;
							}
							else {
								$('#saveFm #new-equipment-container').removeClass('has-danger'); 
								$('#saveFm #new-equipment-error').text('').hide();
								if($('#saveFm  #new-equipment-value').val()!==$('#saveFm  #new-equipment-value-hidden').val()) {
									if ($.fn.tagExist.call($('#'+id),newVal)) {
										validationError = 'Duplicate entry';
										$('#saveFm #new-equipment-container').addClass('has-danger'); 
										$('#saveFm #new-equipment-error').text(validationError).show();
										$('#saveFm  #save-edit').prop("disabled",true);
			                        }
									else {
										$('#saveFm  #save-edit').prop("disabled",false);
									}
									
								} else {
									$('#saveFm  #save-edit').prop("disabled",true);
								}
								
								return false;
							}
						}
				});
				
				$(document).on('submit','#saveFm', function(saveevent){
					var newVal = $('#saveFm #new-equipment-value').val().replace(/ /g,"").toUpperCase();
					 
					 if (tags_callbacks[id]['checkValidity']) {
							var f = tags_callbacks[id]['checkValidity'];
							var validationError = f.call($('#'+id), newVal);
							
							if ($.fn.tagExist.call($('#'+id),newVal)) {
								validationError = 'Duplicate entry';
	                        }
							if( validationError != '') {
								$('#saveFm #new-equipment-container').addClass('has-danger'); 
								$('#saveFm #new-equipment-error').text(validationError).show();
								return false;
							}
						}
 
					 
					 
					spanTag.popover('dispose');
					$('.backdrop').remove();
					var positionToInsert = $('#' + id + '_tagsinput .text').index(spanTag)
					$.fn.removeTag.call($('#'+id), spanTag);
					$.fn.addTag.call($('#'+id), newVal, {},  positionToInsert);
					
				
					srm.search.setEquipmentFocusTo();
					saveevent.preventDefault();
				});
				event.stopPropagation();	
			   
			});
			
		});
		
		return this;

	};

	$.fn.tagsInput.updateTagsField = function(obj,tagslist) {
		var id = $(obj).attr('id');
		$(obj).val(tagslist.join(delimiter[id]));
	};

	$.fn.tagsInput.importTags = function(obj,val) {
		$(obj).val('');
		var id = $(obj).attr('id');
		var tags = val.split(delimiter[id]);
		for (i=0; i<tags.length; i++) {
			$(obj).addTag(tags[i],{focus:false,callback:false});
		}
		if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
		{
			var f = tags_callbacks[id]['onChange'];
			f.call(obj, obj, tags[i]);
		}
	};

   /**
     * check delimiter Array
     * @param event
     * @returns {boolean}
     * @private
     */
   var _checkDelimiter = function(event){
      var found = false;
      if (event.which == 13) {
         return true;
      }

      if (typeof event.data.delimiter === 'string') {
         if (event.which == event.data.delimiter.charCodeAt(0)) {
            found = true;
         }
      } else {
         $.each(event.data.delimiter, function(index, delimiter) {
            if (event.which == delimiter.charCodeAt(0)) {
               found = true;
            }
         });
      }

      return found;
   }
})(jQuery);
