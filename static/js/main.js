
$(document).ready(function(){
	

	var dirs = new Array(new Array(), new Array());
	var folders = new Array();
	var isLeftShow = 1;

	var progressInfo = [];

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

		//combobox
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

		//
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
	
	init();
	
	function init(){
		var width=window.innerWidth;
		var height=window.innerHeight;

		var slidenum = 0;

		addBigSlides();

		function addBigSlides(){
			slidenum++;
			var newSlideHtml = "";

			var curWidth;
			if (isLeftShow) {
				curWidth = width - 250;
			}
			else{
				curWidth = width;
			}
				
			newSlideHtml +="<div id='dropzone' class='slides slide-"+slidenum+ " dropzone' style='position:absolute; top:0;left:0;width:100%;height:100%'></div>";
			$('.right-panel').append(newSlideHtml);


			function dragStyle(e){
				e.stopPropagation();
				e.preventDefault();
				$('#dropzone').addClass('rounded');
				$('#dropzone').css("z-index",100);
			}
			function removeDragStyle(e){
				e.stopPropagation();
				e.preventDefault();
				$('#dropzone').removeClass('rounded');
				$('#dropzone').css("z-index",0);
			}

			document.getElementById('dropzone').addEventListener('dragenter', function(e) {
				dragStyle(e);
			});
			document.getElementById('dropzone').addEventListener('dragover', function(e) {
				dragStyle(e);
			});
			document.getElementById('dropzone').addEventListener('dragleave', function(e) {
				removeDragStyle(e);
			});

			document.getElementById('dropzone').addEventListener('drop', function(e) {
				removeDragStyle(e);

				if ( ! e.dataTransfer.files.length ) {  //drop img from left list

					var data = e.dataTransfer.getData('text/plain');
					if(data){
						data = JSON.parse(data);
					}
					var $box = createImageBox(data.src, e.pageX, e.pageY);

					$('#dropzone').append($box);

				}
				else{  //drop img from desktop

					var reader = new FileReader();
					reader.onload = function(evt) {
						
						var $box = createImageBox(evt.target.result, e.pageX, e.pageY)
						$('#dropzone').append( $box );

					};
					reader.readAsDataURL(e.dataTransfer.files[0]);
				}
				
			}, false);

		}


		  

		$('.closeLeftBtn').click(function(e){
			if(isLeftShow == 1){// close left
				$('.left-panel').css("width",0);
				$(this).animate({ left:4 },150);
				isLeftShow = 0;
			}
			else{// open left
				$('.left-panel').css("width",200);
				$(this).animate({ left:204 },150);
				isLeftShow = 1;
			}
		});

	}

	var createImageBox = (function(){
		var imageId = 0;

		return function(src,x,y){

			var img =document.createElement('img');
			img.id="img"+imageId;

			img.onload = function(){
				$(img).attr('width', img.width+'px');
				$(img).attr('height', img.height+'px');

				$(img).resizable();

				$box.css({
					left : (x-img.width/2)+'px',
					top : (y-img.height/2) + 'px'
				})
			}
			img.src= src;

			if (isLeftShow)
				x -= 250;

			var $box = $("<div id='imgBox"+imageId+"' style='position:absolute;' class='img-box'></div>");
			$box.append(img);
			$box.append("<div class='scaleControl'></div>\
						<div class='deletePic'>\
							<div class='deleteBtn'></div>\
							<div class='text'>\
								<span>Really?</span>\
								<a click='' class='do_click'>Yes</a>\
								<span>/</span>\
								<a click=''>No</a>\
							</div>\
						</div>\
						<div class='timelineControl'>\
							<div class='add addTop'></div>\
							<div class='add addLeft'></div>\
							<div class='add addOpacity'></div>\
						</div>");
			// delete image
			$box.find('.do_click').click(function(){
				$box.remove();
			});	    
						// make image dragable
			$box.draggable({
	            start: function() {
	                exitSetProgressMode();
	            }
	        });

			// add animation mode
			$box.find('.timelineControl div').click(function(){

				if ($(this).hasClass('sel')) {
					exitSetProgressMode();
				}
				else{

					$('.control').remove();
					var currentID = $box.find('img').attr('id');
					var currentType = 0;
					
					$(this).parent().css("opacity",1);
					$(this).parent().children(".add").removeClass("sel");
					$(this).addClass('sel');
					var curX = parseInt($(this).parent().parent().css("left"));
					var curY = parseInt($(this).parent().parent().css("top")) + img.height;
					
					if($(this).hasClass("addTop")){
						currentType = 1;
						var $box2 = createControlBox("top",curX,curY);
					}
					else if ($(this).hasClass("addLeft")) {
						currentType = 2;
						var $box2 = createControlBox("left",curX,curY);
					}
					else{
						currentType = 3;
						var $box2 = createControlBox("opacity",curX,curY);
					}
					
					$('#dropzone').append($box2);
					initData();

					// init data for control bar
					function initData(){
						for(var i=0; i<progressInfo.length; i++){
							if(progressInfo[i].id == currentID){
								if (progressInfo[i].type == 1){
									$div = $("<div title='top' class='topAnimation sel'><p>top:"+progressInfo[i].value+"</p></div>");
								} 
								else if (progressInfo[i].type == 2){
									$div = $("<div title='left' class='leftAnimation sel'><p>left:"+progressInfo[i].value+"</p></div>");
								}
								else if (progressInfo[i].type == 3){
									$div = $("<div title='opacity' class='opacityAnimation sel'><p>opacity:"+progressInfo[i].value+"</p></div>");
								}

								var n = parseInt(progressInfo[i].progress)/2+1;
								$box2.find('.progress li:nth-child('+n+')').append($div);
							}
						}
						for(var i = 0; i<50; i++){
							if (currentType == 1){
								$p = $("<p><span>-100%</span> <span>0%</span> <span>100%</span>(top)</p>");
							} 
							else if (currentType == 2){
								$p = $("<p><span>-100%</span> <span>0</span> <span>100%</span>(left)</p>");
							}
							else if (currentType == 3){
								$p = $("<p><span>0%</span> <span>100%</span>(opacity)</p>");
							}
							$box2.find('.progress li:nth-child('+(i+1)+')').append($p);
						}
					}

					$box2.find('span').click(function(){
						progressInfo.push({
							id : currentID,
							type : currentType,
							progress : $(this).parent().parent().attr('title'),
							value : $(this).html()
						});
						if (currentType == 1) {
			        		var $a = $("<div title='top' class='topAnimation sel'><p>top:"+$(this).html()+"</p></div>");
			        	}
			        	else if(currentType == 2) {
			        		var $a = $("<div title='left' class='leftAnimation sel'><p>left:"+$(this).html()+"</p></div>");
			        	}
			        	else if(currentType == 3){
			        		var $a = $("<div title='opacity' class='opacityAnimation sel'><p>opacity:"+$(this).html()+"</p></div>");
			        	}

			        	$(this).parent().parent().append($a);
			        	$(this).parent().remove();
					});

				}
			});// end add animation mode

			imageId++;

			return $box;
		}
	})()

    
      

	var createTextBox = (function(){
		var textId = 0;
		var color1 = (60,204,255);
		var color2 = (151,223,249);
		var color3 = (255,255,255);
		var color4 = (195,195,195);
		var color5 = (0,0,0);

		var textcolor = "rgb(60,204,255)";
		var textbgcolor = new Array();
		textbgcolor[0] = 255;
		textbgcolor[1] = 255;
		textbgcolor[2] = 255;
		var textsize = 30;
		var textbgalpha = 60;

		textbgA = generateRGBA(textbgcolor, textbgalpha);
		textbg = generateRGB(textbgcolor);

		var isEditMode = 0;

		return function(x,y){
			var tempWidth = 540;
			var tempHeight = 135;
			var winWidth = window.innerWidth;

			if(isLeftShow){
				x -= 250;
				winWidth -=250;
			}

			if((x+tempWidth)>window.innerWidth)
				x = winWidth - tempWidth;

			if((y+tempHeight)>window.innerHeight)
				y = window.innerHeight - tempHeight;

			var $box = $("<div class='text-editor' style='left:"+x+"px;top:"+y+"px;position:absolute' id='text-editor"+textId+"'>");

			$box.append("<div class='textArea'>\
					<input type='text' class='text' style='color:"+textcolor+"; background:"+textbgA+";font-size:"+textsize+"' value=''>\
					<div class='textDone'></div>\
					<div class='textDelete' style='display:none'></div>\
				</div>\
				<div class='timelineControl' style='display:none'>\
					<div class='add addTop'></div>\
					<div class='add addLeft'></div>\
					<div class='add addOpacity'></div>\
				</div>\
      			<div class='attr'>\
        			<div class='block background'>\
        				<div class='bgcolor block' style='background:"+textbgA+"'></div>\
        				<div class='color1 block' val='1'></div>\
          				<div class='color2 block' val='2'></div>\
         				<div class='color3 block' val='3'></div>\
          				<div class='color4 block' val='4'></div>\
          				<div class='color5 block' val='5'></div>\
        			</div>\
        			<div class='block bg-alpha' style='color:"+textbg+";background:"+textbgA+"'><p class='TKAdjustableNumber ' data-var='bgalpha' data-min='0' data-max='100'>%</p></div>\
        			<div class='block fontsize' style='color:"+textcolor+";background:"+textbgA+"'><p class='TKAdjustableNumber ' data-var='fontsize' data-min='10' data-max='60'></p></div>\
        			<div class='block fontcolor'>\
        				<div class='fontcolor block' style='background:"+textcolor+"'></div>\
        				<div class='color1 block' val='1'></div>\
          				<div class='color2 block' val='2'></div>\
         				<div class='color3 block' val='3'></div>\
          				<div class='color4 block' val='4'></div>\
          				<div class='color5 block' val='5'></div>\
        			</div>\
     			</div></div>");

			// make image dragable
			$box.draggable({
	            start: function() {
	                exitSetProgressMode();
	            }
	        });

			$box.hover(
				function(){
					if(!isEditMode){
						setNotEditMode();
					}
				},
				function(){
					setEditMode();
				}
			);
			
			// click delete btn
			$box.find('.textDelete').click(function(e){
				$box.remove();
			});

			// click ok btn
			$box.find('.textDone').click(function(e){
				$box.find('input.text').blur();
			});

			// press key enter
			$box.find('input.text').bind('keyup',function(event) {  
          		if(event.keyCode==13){  
                	$box.find('input.text').blur();
        		}  
         	}); 

			// replace the input element with p element 
			$box.find('input.text').blur(blur)
			function blur(e){
				isEditMode = 0;
				if($(this).val() == ""){
					$(this).parent().parent().remove();
				}
				else{
					$box.find('.attr').fadeOut(150);
					//$box.css("height",70);
					$box.find('.textDone').fadeOut(150);
					e.stopPropagation();

					var text = $(this).val();
					var $p = $("<p class='text' >"+text+"</p>");
					$(this).replaceWith($p);
					resetStyle();
					// click to show the input element
					// enter edit mode
					$p.dblclick(function(e){
						e.stopPropagation();
						isEditMode = 1;
						setEditMode();

						var $input = $("<input type='text' class='text' />");
						$box.find('.attr').fadeIn(150);
						$box.find('.textDone').fadeIn(150);
						$box.css("height",135);
						// use the text in the closure
						$input.val(text);
						$(this).replaceWith($input);
						resetStyle();
						$input.focus();

						$input.blur( blur );

						$input.bind('keyup',function(event) {  
			          		if(event.keyCode==13){  
			                	$box.find('input.text').blur();
			        		}  
			         	}); 
					})
				}
			}

			// change font color
			$box.find('.block.fontcolor .block').click(function(e){
				var color = $(this).css("background-color");
				$(this).parent().children(".block").removeClass("sel");
				$(this).addClass("sel");
				var parts = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
				textcolor = "rgb("+parseInt(parts[1])+","+parseInt(parts[2])+","+parseInt(parts[3])+")";

				resetStyle();
			});

			// change background color
			$box.find('.block.background .block').click(function(e){
				var color = $(this).css("background-color");
				$(this).parent().children(".block").removeClass("sel");
				$(this).addClass("sel");
				var parts = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
				for (var i = 0; i < 3; i++) {
				    textbgcolor[i] = parseInt(parts[i+1]);
				}

				resetStyle();
			});

			// change fontsie bg-alpha
			setUpTangle();
			function setUpTangle () {

	            var tangle = new Tangle($box[0], {
	                initialize: function () {
	                    this.fontsize = textsize;
	                    this.bgalpha = textbgalpha;
	                },
	                update: function () {
	                	textsize = this.fontsize;
	                	textbgalpha = this.bgalpha;
	                	resetStyle();

	                    $box.find('.text').css({
	                    		"font-size": this.fontsize,
	                    		"background": "rgba("+textbgcolor[0]+","+textbgcolor[1]+","+textbgcolor[2]+","+this.bgalpha/100.0+")"
	                    });
	                    $box.find('.bg-alpha').css({
	                    	"background": "rgba("+textbgcolor[0]+","+textbgcolor[1]+","+textbgcolor[2]+","+this.bgalpha/100.0+")"
	                    });
						$box.find('.fontsize').css({
							"background": "rgba("+textbgcolor[0]+","+textbgcolor[1]+","+textbgcolor[2]+","+this.bgalpha/100.0+")"
						});
	                }
	            });
	        }
	        function resetStyle(){
	        	textbg = generateRGB(textbgcolor);
	        	textbgA = generateRGBA(textbgcolor,textbgalpha);

	        	$box.find('.text').css("color",textcolor);
				$box.find('.block.fontsize').css("color",textcolor);
				$box.find('.block.fontcolor .block.fontcolor').css("background",textcolor);
				
				$box.find('.text').css("font-size",textsize);

				$box.find('.text').css("background",textbgA);
				$box.find('.block .bgcolor.block').css("background",textbg);
				$box.find('.block.bg-alpha').css("background",textbgA);
				$box.find('.block .block.bg-alpha').css("color",textbg);
				$box.find('.block.fontsize').css("background",textbgA);

	        }
	        function setEditMode(){
				$('.textDelete').css('display','none').fadeOut(150);
				$('.timelineControl').css('opacity',0).fadeOut(150);
			}
			function setNotEditMode(){
				$('.textDelete').fadeIn(150);
				$('.timelineControl').css('opacity',1).fadeIn(150);
			}

			// add animation mode <- the same!!
			$box.find('.timelineControl div').click(function(){

				isControlMode = 1;
				if ($(this).hasClass('sel')) {
					exitSetProgressMode();
				}
				else{

					$('.control').remove();
					var currentID = $box.attr('id'); // diff
					var currentType = 0;
					
					$(this).parent().css("opacity",1);
					$(this).parent().children(".add").removeClass("sel");
					$(this).addClass('sel');
					var curX = parseInt($(this).parent().parent().css("left"));
					var curY = parseInt($(this).parent().parent().css("top")) + 135; // diff
					
					if($(this).hasClass("addTop")){
						currentType = 1;
						var $box2 = createControlBox("top",curX,curY);
					}
					else if ($(this).hasClass("addLeft")) {
						currentType = 2;
						var $box2 = createControlBox("left",curX,curY);
					}
					else{
						currentType = 3;
						var $box2 = createControlBox("opacity",curX,curY);
					}
					
					$('#dropzone').append($box2);
					initData();

					// init data for control bar
					function initData(){
						for(var i=0; i<progressInfo.length; i++){
							if(progressInfo[i].id == currentID){
								if (progressInfo[i].type == 1){
									$div = $("<div title='top' class='topAnimation sel'><p>top:"+progressInfo[i].value+"</p></div>");
								} 
								else if (progressInfo[i].type == 2){
									$div = $("<div title='left' class='leftAnimation sel'><p>left:"+progressInfo[i].value+"</p></div>");
								}
								else if (progressInfo[i].type == 3){
									$div = $("<div title='opacity' class='opacityAnimation sel'><p>opacity:"+progressInfo[i].value+"</p></div>");
								}

								var n = parseInt(progressInfo[i].progress)/2+1;
								$box2.find('.progress li:nth-child('+n+')').append($div);
							}
						}
						for(var i = 0; i<50; i++){
							if (currentType == 1){
								$p = $("<p><span>-100%</span> <span>0%</span> <span>100%</span>(top)</p>");
							} 
							else if (currentType == 2){
								$p = $("<p><span>-100%</span> <span>0</span> <span>100%</span>(left)</p>");
							}
							else if (currentType == 3){
								$p = $("<p><span>0%</span> <span>100%</span>(opacity)</p>");
							}
							$box2.find('.progress li:nth-child('+(i+1)+')').append($p);
						}
					}

					$box2.find('span').click(function(){
						progressInfo.push({
							id : currentID,
							type : currentType,
							progress : $(this).parent().parent().attr('title'),
							value : $(this).html()
						});
						if (currentType == 1) {
			        		var $a = $("<div title='top' class='topAnimation sel'><p>top:"+$(this).html()+"</p></div>");
			        	}
			        	else if(currentType == 2) {
			        		var $a = $("<div title='left' class='leftAnimation sel'><p>left:"+$(this).html()+"</p></div>");
			        	}
			        	else if(currentType == 3){
			        		var $a = $("<div title='opacity' class='opacityAnimation sel'><p>opacity:"+$(this).html()+"</p></div>");
			        	}

			        	$(this).parent().parent().append($a);
			        	$(this).parent().remove();
					});

				}
			});// end add animation mode


			textId++;
			isEditMode = 1;
			return $box;
		}
		function generateRGBA(rgb,a){
	        return "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+a/100.0+")";
	    }
	    function generateRGB(rgb){
	    	return "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")";
	    }
	})()

	var isAddText = false;
	$('.addText').click(function(e){
		toggleTextMode();
	});

	$('#dropzone').click(function(e){
		if(isAddText){
			var $box = createTextBox(e.pageX,e.pageY);
			$(this).append($box);
			$box.find('.text').focus();

			toggleTextMode();
		}
	});

	function toggleTextMode(){

		isAddText = ! isAddText;
		if(isAddText){
			$('.addText').addClass('active');
			exitSetProgressMode();
		}else{
			$('.addText').removeClass('active');
		}
	}


	
	$(window).resize(function() {
		
	});

	var createControlBox = (function(){

		return function(type,x,y){

			var colorTop = "#D71921";
			var colorLeft = "#00AEEF";
			var colorOpacity = "#29AE6E";

			$box = $("<div class='control' style='left:"+(x-80)+"px;top:"+(y+30)+"px'></div>");

			var html = "";
			if (type == "top") {
				html += "<p class='title' style='border-top:5px solid "+colorTop+";'>PROGRESS</p>";
			}
			else if(type == "left"){
				html += "<p class='title' style='border-top:5px solid "+colorLeft+";'>PROGRESS</p>";
			}
			else{
				html += "<p class='title' style='border-top:5px solid "+colorOpacity+";'>PROGRESS</p>";
			}
			
			html += 	"<div class='bar'>";
			html += 		"<ul class='progress'>";
			
	          
	        for(var i = 0; i<100; i+=2){
	        	html += 		"<li title='"+i+"%'></li>";
	        }
	        html += 		"</ul>";
	        html += 		"<ul class='percent'>";

	        for(i=0; i<=100; i+=10){
	        	html += 		"<li>"+i+"</li>";
	        }

	        html += 		"</ul>";
	        html += 	"</div>";

	        $box.append(html);


			return $box;
		}
	})()
	
	function exitSetProgressMode(){
		$('.timelineControl').removeAttr('style');
		$('.timelineControl .add').removeClass('sel');
		$('.control').remove();
	}

	var isPlay = false;
	var jarallax;
	$('.play').click(function(e){

		togglePlayMode();
		if (isPlay){
			exitSetProgressMode();
			initAnimation();
		}
	});

	function togglePlayMode(){
		isPlay = ! isPlay;
		if(isPlay){
			$('.play').addClass('active');
		}else{
			$('.play').removeClass('active');
			jarallax = new Jarallax();
		}
	}

	function initAnimation(){

		jarallax = new Jarallax();
		
		// sort by type
		progressInfo.sort(
			function(a,b){
				return a.type-b.type
		});

		// sort by progress
		var num = new Array();
		num[0] = num[1] = num[2] = 0;
		progressInfo.sort(
			function(a,b){
				if (a.type == b.type == 1){
					num[0] ++;
				}
				else if (a.type == b.type == 2){
					num[1] ++;
				}
				else if (a.type == b.type == 3){
					num[2] ++;
				}
				return a.progress-b.progress
		});

		// generate
		for(var i = 0; i<num[0]-1; i++)
			jarallax.addAnimation("#"+progressInfo[i].id,
				[{progress: progressInfo[i].progress, top: progressInfo[i].value}, 
				 {progress: progressInfo[i+1].progress, top: progressInfo[i+1].value}]
			);
		
		for(i = num[0]; i<num[0]+num[1]-1; i++)
			jarallax.addAnimation("#"+progressInfo[i].id,
				[{progress: progressInfo[i].progress, left: progressInfo[i].value}, 
				 {progress: progressInfo[i+1].progress, left: progressInfo[i+1].value}]
			);
		
		for(i = num[0]+num[1]; i<num[0]+num[1]+num[2]-1; i++)
			jarallax.addAnimation("#"+progressInfo[i].id,
				[{progress: progressInfo[i].progress, opacity: progressInfo[i].value}, 
				 {progress: progressInfo[i+1].progress, opacity: progressInfo[i+1].value}]
			);

		jarallax.setProgress(0.5);
	}


});