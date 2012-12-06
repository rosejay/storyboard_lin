

	var dirs = new Array(new Array(), new Array()); // data of image dirs and folders 
	var folders = new Array(); // folder names

	/**
	 * get file names and folders
	 */
	$.get('http://localhost:8888/get/files', function(res){
		//generate files dirs
		var temphtml = "";
		var temphtmldrop = "";
		var currentFolder= 0;

		for(var i = 0; i<res.files.length; i++){
			var attr = res.files[i].split("/");

			if(folders.length){
				for(var j = 0; j<folders.length; j++){
					if(folders[j].indexOf(attr[2]) != -1){
						break;
					}
				}
				if(j == folders.length){
					dirs[folders.length][0] = attr[3];
					folders[folders.length] = attr[2];
				}
				else{
					var index = dirs[folders.length-1].length;
					dirs[folders.length-1][index] = attr[3];
				}
			}
			else{
				dirs[0][0] = attr[3];
				folders[0] = attr[2];
			}
		}

		//init left combobox
		for(i = 0; i<folders.length; i++)
			temphtmldrop += "<li><a href='javascript:void(0)' val='"+i+"'>"+folders[i]+"</a></li>";
		$('.J_select_drop ul').append(temphtmldrop);
		$('.J_input_show').val(folders[0]);
		$('.J_input_post').val(0);

		change_folder(0);

		/**
	 	 * combox
	 	 */
		$('.J_select_current_option').each(function(){
			$(this).click(function(){
				var $this = $(this), select_drop = $this.siblings('.J_select_drop'), show_input = $this.find('.J_input_show');
				if(!$this.siblings('.J_select_drop:visible').length){
					select_drop.slideDown(function(){
						$this.addClass('selecting');
						show_input.focus();
						clearDrop(show_input);
					})
				}else{
					select_drop.slideUp(function(){
						$this.removeClass('selecting');	
					})
				}
			})
		});
		$('.J_select_drop li').each(function(){
			$(this).bind('mousedown', function(){
				var $this = $(this),
				show_input = $this.parents('.J_select_drop').siblings('.J_select_current_option').find('.J_input_show'),
				post_input = show_input.siblings('.J_input_post'),
				clickItem=$this.find('a');
				
				show_input.val(clickItem.text());
				post_input.val(clickItem.attr('val'));
				change_folder(clickItem.attr('val'));
				var opt = show_input.parents('.J_select_current_option');
				opt.siblings('.J_select_drop').slideUp(function(){
					opt.removeClass('selecting');
				});
				return false;
			})
		});
		function clearDrop(show_input){
			show_input.blur(function(){
				var opt = show_input.parents('.J_select_current_option');
				opt.siblings('.J_select_drop').slideUp(function(){
					opt.removeClass('selecting');
				})
			});
		}

		/**
	 	 * change folders, reset file list
	 	 */
		function change_folder(num){
			$('.material-list ul li').remove();
			temphtml = "";
			for(i = 0; i<dirs[num].length; i++)
				temphtml += "<li val='"+num+"' draggable='true'>"+dirs[num][i]+"</li>";
			$('.material-list ul').append(temphtml);

			$('.material-list li').hover(
				function(){
					var offset = $(this).offset();
			    	var index = $(this).attr("val");
			    	var temphtml = "<div id='imgPreview' style='height:150px; top:"+ (offset.top - 75 + 16)+"px' class='popup-tip' ><div class='bd'><img src='materials/"+folders[index]+"/"+$(this).html()+"'></div><div class='x1'></div></div>";
			    	$('body').append(temphtml);  
				},
				function(){
					$('#imgPreview').remove();
				}
			);

			currentFolder = num;
			$('.material-list li').each(function(){
				var img = $(this).find('')
				this.addEventListener('dragstart', function(e){
					e.dataTransfer.setData('text/plain', JSON.stringify({
						src : "materials/"+folders[currentFolder]+"/"+e.target.innerHTML
					}))
				  	this.style.opacity = '0.4';  // this / e.target is the source node.
				}, false);
			})
		}
	}) 
	
