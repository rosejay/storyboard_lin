
$(document).ready(function(){
	init();

	var dirs = new Array(new Array(), new Array());
	var folders = new Array();

	$.get('http://localhost:8888/get/files', function(res){
		var temphtml = "";
		var temphtmldrop = "";

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
			//temphtml += "<li>"+res.files[i].split("/")[3]+"</li>";

		}

		for(i = 0; i<folders.length; i++)
			temphtmldrop += "<li><a href='javascript:void(0)' val='"+i+"'>"+folders[i]+"</a></li>";
		$('.J_select_drop ul').append(temphtmldrop);
		$('.J_input_show').val(folders[0]);
		$('.J_input_post').val(0);

		change_folder(0);

		//
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

		//
		function clearDrop(show_input){
			show_input.blur(function(){
				var opt = show_input.parents('.J_select_current_option');
				opt.siblings('.J_select_drop').slideUp(function(){
					opt.removeClass('selecting');
				})
			});
		}

		function change_folder(num){
			$('.material-list ul li').remove();
			temphtml = "";
			for(i = 0; i<dirs[num].length; i++)
				temphtml += "<li val='"+num+"'>"+dirs[num][i]+"</li>";
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

		}
	}) 
	
	
		
	function init(){
		var width=window.innerWidth;
		var height=window.innerHeight;
		$('.left-panel').css("height",height);
		$('.left-panel .material-list').css("height",height-70);

		var isLeftShow = 1;
		var slidenum = 0;
		var imagenum = 0;
		var topDistance = 0;

		addBigSlides();

		console.log(isLeftShow,slidenum);

		function addBigSlides(){
			slidenum++;
			var newSlideHtml = "";

			var curWidth, curLeft;
			if (isLeftShow) {
				curWidth = width - 250;
				curLeft = 250;
			}
			else{
				curWidth = width;
				curLeft = 0;
			}
				
			console.log(isLeftShow,curWidth,slidenum);
			newSlideHtml +="<div id='dropzone' class='slides slide-"+slidenum+ " dropzone' style='position:absolute;top:"+topDistance+";left:"+curLeft+"px;width:"+curWidth+"px;height:"+height+"px'></div>";
			$('.right-panel').append(newSlideHtml);

			function dragStyle(e){
				e.stopPropagation();
				e.preventDefault();
				$('#dropzone').addClass('rounded');
				$('#dropzone').html('Drop in images from your desktop!');
				$('#dropzone').css("z-index",100);
			}
			/*
			function removeDragStyle(e){
				e.stopPropagation();
				e.preventDefault();
				$('#dropzone').removeClass('rounded');
				$('#dropzone').empty();
				$('#dropzone').css("z-index",0);
				$('.addpicBtn').addClass('sel');
			}
			$('#dropzone').bind('dragenter', function(e) {
				dragStyle(e);
			}, false);
			$('#dropzone').bind('dragover', function(e) {
				dragStyle(e);
			}, false);
			$('#dropzone').bind('dragleave', function(e) {
				removeBGimg();
				removeDragStyle(e);
			}, false);
*/
			document.getElementById('dropzone').addEventListener('drop', function(e) {
				//removeDragStyle(e);
				imagenum++;
				e.stopPropagation();
				e.preventDefault();

				var reader = new FileReader();
				reader.onload = function(evt) {
					var img =document.createElement('img');
					img.id="img"+imagenum;
					img.src=evt.target.result;
					
					document.getElementById('dropzone').appendChild(img);
					topDistance += curWidth*height/width;

					img.onload = function(){
						if(img.width>img.height){
							;
							//document.getElementById('img'+imagenum).css("width","100%");
						}
						else
							;
							//document.getElementById('img'+imagenum).css("height","100%");
					}
					// make image dragable
					$('#img'+imagenum).addClass("ui-widget-content").draggable();

					// click image remove scale btn
					$('#img'+imagenum).mousedown(function(e){
						$('.scaleControl').remove();
					});
					// click image add scale btn
					$('#img'+imagenum).click(function(e){
						var img = $(this);
				        var x = parseInt($(this).css("left"));
				        var y = parseInt($(this).css("top"));
				        if (!x) 
				        	x = 0;
				        if (!y) 
				        	y = 0;

				        var w = $(this).width();
				        var h = $(this).height();
				        console.log(x,y,w,h);
				        var div = 10;
				        var wid = 20;
				        var wid2 = 60;

				        var xA = x+w-div-wid;
				        var yA = y+h-div-wid;
				        var xA2 = x+w-(div+wid+wid2)/2;
				        var yA2 = y+h-(div+wid+wid2)/2;


				        $('body').append("<div class='scaleControl br5' style='left:"+xA+"px;top:"+yA+"px'></div><div class='scaleControl-alpha' style='left:"+xA2+"px;top:"+yA2+"px'></div>");
				        
				        console.log(xA,yA);
				        var isScale = false;
				        $('.scaleControl-alpha').mousedown(function(e){
				        	if (!isScale) {
				        		setPosition(e, $(this));
					        	isScale = true;
				        	}
				        });
				        $('.scaleControl-alpha').mousemove(function(e){
				        	if (isScale) {
				        		setPosition(e, $(this));
				        	}
				        });
				        $('.scaleControl-alpha').mouseup(function(e){
				        	setPosition(e, $(this));
				        	isScale = false;
				        });
				        function setPosition(e, obj){
				        	img.css("width",(e.pageX - x + wid/2 + div));
				        	img.css("height",(e.pageY - y + wid/2 + div));
				        	obj.css("left", e.pageX - wid2/2);
				        	obj.css("top", e.pageY - wid2/2);
				        	$('.scaleControl').css("left", e.pageX - wid/2);
				        	$('.scaleControl').css("top", e.pageY - wid/2);

				        }
				    });



				};
				
				reader.readAsDataURL(e.dataTransfer.files[0]);
				
			}, false);

		}

		$('.closeLeftBtn').click(function(e){
			if(isLeftShow == 1){
				$('.left-panel').animate({ left:-250 },150);
				$('.right-panel').animate({ left:0 },150).animate({width: width},150);
				$(this).animate({ left:15 },150).css("color", "#aaa");
				isLeftShow = 0;
			}
			else{
				$('.left-panel').animate({ left:0 },150);
				$('.right-panel').animate({ left:250 },150).animate({width: width-250},150);
				$(this).animate({ left:220 },150).css("color", "#444");
				isLeftShow = 1;
			}
		});

	}

	
	


	



	

	
});