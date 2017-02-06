## Welcome to Multi Items 

Multi-items is a widget to allow multiple entries in a input field.

This widget is built using the base code of [Jquery-tags-input](https://github.com/xoxco/jQuery-Tags-Input).

The initial version uses Jquery, angular and react versions are in the works.

### How to get it 

Get it on npm [here](https://www.npmjs.com/package/multi-input)

Use it as follows
```markdown
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
		 	'onAddTag':srm.onAddTag,
		 	'onRemoveTag':srm.onRemoveTag,
		 	'onChangeTag' : srm.onChangeTag,
		 	'onInsertTag' : srm.onInsertTag,
			'checkValidity' : srm.checkValidity,
		 	'delimiter': [',',';'],   // Or a string with a single delimiter. Ex: ';'
		 	'removeWithBackspace' : true,
		 	'minChars' : 0,
		 	'maxTags' : srm.maxAllowed,
		 	//'maxChars' : 10, // if not provided there is no limit
		 	'placeholderColor' : '#55595c'
		});
```

#[DEMO link](https://rahulbats.github.io/multi-input/)

##[Source for the demo](https://github.com/rahulbats/multi-input/tree/gh-pages)