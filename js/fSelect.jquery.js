/* ========================================================================
 * fSelect: fselect.jquery.js v0.5 beta
 * http://github.com/fzhantw/fselect
 * ========================================================================
 * Copyright 2015 fivil52@gmail.com.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
'use Strict';
(function($){

	function _removeResult(){
		$this = $(this);

		var $thisOption = $this.parents('li').first(); 
		var $container = $this.parents('.f-select-container');
		var $select = $container.prev();
		var _value = $thisOption.find('.jump-area').data('value');

		var origValue = $select.val();
		var isMultiple = $container.data('fSelect.isMultiple');

		if(isMultiple){
			var oldValueIndex = origValue.indexOf('' + _value);
			origValue.splice(oldValueIndex, 1);
			$select.val(origValue);
		}
		else{
			$select.val('');
		}


		$thisOption .removeClass('active');
		$select.trigger('fs.valueUpdate');
	}

	function _showTheContainer(parentValue, item){
		$container = $(item).parents('.f-select-container');
		optionMapping = $container.data('fSelect.optionMapping');

		var parentsCollectionValue = optionMapping.indexOf( '' + parentValue);

		$targetContainer = $container.find('.f-dropdown-container.f-parent-' + parentsCollectionValue);

		if($targetContainer.length !== 0){
			$container.find('.f-dropdown-container').removeClass('open');
			$targetContainer.addClass('open');
		}
		else{
			var stack = $container.data('fSelect.stack');
			stack.pop();
			$container.data('fSelect.stack', stack);
		}
	}

	function _onOptionClick(){
		var $this = $(this);
		var value = $this.data('value');
		var $container = $this.parents('.f-select-container');
		var $select = $container.prev();
		var $currentUlContainer = $container.find('.open.f-dropdown-container');

		$select.trigger('fs.beforeSelect');

		var stack = $container.data('fSelect.stack');
		stack.push($currentUlContainer.data('parentValue'));
		$container.data('fSelect.stack', stack);

		_showTheContainer(value, $this);

		$select.trigger('fs.afterSelect');
	}

	function _onBackOptionClick(){
		var stack = $container.data('fSelect.stack');
		var parentValue = stack.pop();
		var $select = $container.prev();
		$container.data('fSelect.stack', stack);

		$select.trigger('fs.backToParent');

		_showTheContainer(parentValue, this);
	}

	function _chooseTheItem(e){
		e.preventDefault();

		$this = $(this);

		var $thisOption = $this.parents('li').first(); 
		var _value = $thisOption.find('.jump-area').data('value');
		var _name = $thisOption.find('.jump-area').data('name');

		var $container = $this.parents('.f-select-container').first(); 
		var $select = $container.prev();

		var isMultiple = $container.data('fSelect.isMultiple'); 

		var isDuplicate = false;
		$container.find('.fSelect-result').each(function(index, item){
			$item = $(item);
			if( $item.data('value') == _value){
				isDuplicate = true;
			}
			else{
			}
		});
		if( isDuplicate ){
			return;
		}

		if(!isMultiple){
			$container.find('li.active').each(function(index, item){
				$(item).removeClass('active');
			});
		}

		$thisOption.addClass('active');

		var isMultiple = $container.data('fSelect.isMultiple')? true: false;

		if( !isMultiple ){
			$container.find('.alert').remove();
			$select.val(_value);
		}
		else{
			var origValue = $select.val();

			if( origValue === null ){
				origValue = [];
			}

			origValue.push(_value);
			$select.val(origValue);
		}

		$select.trigger('fs.valueUpdate');
	}

	$.fSelect = function(container, datas, option){
		$container = $(container);
		$select = $container.prev();
		$container.addClass('f-select-container');

		var _options = {
			isMultiple: false,
			logArea: '',
			logMethod: function(datas){
				var result = '';
				datas.forEach(function(data,index){
					var name = data.name;
					var value = data.value;
					result += name + ' : ' + value + '<br>';
				});
				return result;
			},
			showLog: false
		};
		_options = $.extend(_options, option);

		var $logArea = $(_options.logArea);
		if( $logArea.length === 0 ){
			$logArea = $('<div>')
				.addClass('log-area')
				;
			$container.after($logArea);
		}

		$select.on('fs.valueUpdate', function(){
			if( !_options.showLog ){
				return;
			}
			$this = $(this);
			$container = $this.next();
			var datas = [];
			$container.find('.active').each(function(index, item){
				$item = $(item);
				console.log($item);
				datas.push({
					value: $item.find('.jump-area').data('value'),
					name: $item.find('.jump-area').data('name')
				});
			});
			console.log(_options);
			var result = _options.logMethod(datas);
			$logArea.html(result);
		});

		$container.data('fSelect.isMultiple', _options.isMultiple);

		/*
		 * optionMapping: [optionCollectionIndex: parentId]
		 * optionCollection: [optionCollectionIndex: [options]]
		 */
		var optionCollection=[[]], optionMapping = ['0'];
		//for(var item of datas){
		datas.forEach(function(item){
			var _name = item.name,
				_value = item.value,
				_parentValue = item.parent
				;
			var optionCollectionIndex = -1;
			if(_parentValue === undefined){
				optionCollectionIndex = 0;
			}
			else if( (optionCollectionIndex = optionMapping.indexOf(''+ _parentValue)) === -1 ){
				optionMapping.push( '' + _parentValue);
				optionCollectionIndex = optionMapping.length - 1;
				optionCollection[optionCollectionIndex] = [];
			}

			optionCollection[optionCollectionIndex].push(item);
		});

		optionMapping.forEach(function(index, optionCollectionIndex){
			var collection = optionCollection[optionCollectionIndex];
			var $ulContainer = $('<div>')
				.addClass('f-dropdown-container f-parent-' + optionCollectionIndex)
				.data('parentValue', optionCollectionIndex)
				.appendTo($container)
				;
			var $menuContainer = $('<ul>')
				.addClass('dropdown-menu')
				.appendTo($ulContainer)
				;
			collection.forEach(function(_option, index){

				childCollectionIndex = optionMapping.indexOf('' + _option.value);
				childCount = '';
				if(childCollectionIndex != -1){
					var childCollection = optionCollection[childCollectionIndex];
					childCount = "(" + childCollection.length + ")" + '&nbsp;&nbsp;<i class="fa fa-long-arrow-right"></i>';
				}

				$liOption = $('<li>')
					.appendTo($menuContainer)
					;
				$buttons = $('<span>');
				$removeButton = $('<button>')
					.html('&#x02715;')
					.addClass('btn btn-danger btn-sm btn-action btn-cancel pull-right')
					.click(_removeResult)
					.appendTo($buttons)
					;
				$chooseButton = $('<button>')
					.html('&#x02713;')
					.addClass('btn btn-success btn-sm btn-action btn-check pull-right')
					.click(_chooseTheItem)
					.appendTo($buttons)
					;

				var trimmed_name = _option.name.substr(0, 19);
				if( _option.name.length >= 19 ){
					trimmed_name += '...';
				}
				$aJumpArea = $('<span>')
					.addClass('jump-area')
					.click(_onOptionClick)
					.html(trimmed_name + '&nbsp;' + childCount)
					.data({
						value: _option.value,
						name: _option.name,
					})
					;
				$aItem= $('<a>')
					.append($buttons)
					.append($aJumpArea)
					.appendTo($liOption)
					;
			});
			if( optionCollectionIndex !== 0 ){
				$backLi = $('<li>');
				$backOption = $('<a>')
					.html('<i class="fa fa-long-arrow-left"></i>')
					.click(_onBackOptionClick)
					.appendTo($backLi)
				;
				$menuContainer.prepend($backLi);
			}
		});

		$container.data('fSelect.optionMapping', optionMapping);

		$container.find('.f-parent-0').addClass('open');

		$container.data('fSelect.stack',[]);
	};
	$.fn.fSelect = function(option){
		return this.each(function(index, item){
			if(item.tagName !== 'SELECT') return item;

			$this = $(item);

			$container = $('<div class="fSelect-container">');
			$this.after($container);

			var datas = [];

			$this.find('option[value]').each(function(index, _option){
				$option = $(_option);
				var _name = $option.html(),
					_value = $option.val(),
					_parentValue = $option.data('parent')
				;
				if(_value){
					datas.push({
						name: _name,
						value: _value,
						parent: _parentValue,
					});
				}
			});

			$this.hide();

			option = $.extend({
				isMultiple: (($this.attr('multiple') !== undefined) ? true: false),
				showLog: false
			}, option);

			$.fSelect($container, datas, option);

			return $this;
		});
	};
})(jQuery);
