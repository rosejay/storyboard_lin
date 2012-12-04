
$(document).ready(function(){
	

	var dirs = new Array(new Array(), new Array()); // data of image dirs and folders 
	var folders = new Array(); // folder names

	var isLeftShow = true; // toggle to show left window
	var isAddText = false; // toggle to enter add text mode
	var isProgressMode = false; // toggle to enter setting of animation mode
	var isEditMode = false; // toggle to enter text edit mode
	var progressInfo = []; // animation info array
	var deleteObject;

	/**
	 * toggle to show left window
	 */
	$('.closeLeftBtn').click(function(e){
		toggleShowLeftWindow();
	});
	function toggleShowLeftWindow(){
		isLeftShow = ! isLeftShow;
		if(isLeftShow){
			$('.left-panel').css("width",200);
			$('.closeLeftBtn').animate({ left:204 },150);
		}
		else{
			$('.left-panel').css("width",0);
			$('.closeLeftBtn').animate({ left:4 },150);
		}
	}

	/**
	 * toggle to enter add text mode
	 */
	$('.addText').click(function(e){
		toggleTextMode();
	});
	function toggleTextMode(){
		isAddText = ! isAddText;
		if(isAddText){
			$('.addText').addClass('active');
			exitProgressMode();
		}
		else{
			$('.addText').removeClass('active');
		}
	}




	function toggleProgressMode(){
		isProgressMode = !isProgressMode;
		if(isProgressMode){

		}
		else{
			exitProgressMode();
		}
	}

	function exitProgressMode(){
		$('.timelineControl').removeAttr('style');
		$('.timelineControl .add').removeClass('sel');
		$('.control').remove();
	}



	
	$(window).resize(function() {
		
	});



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
					exitProgressMode();
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

			var html = "<canvas width='100%' height = '100%' data-processing-sources='js/draw.pde'></canvas>"
			$('.right-panel').append(html);

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

			$('#dropzone').click(function(e){
				if(isAddText){
					var $box = createTextBox(e.pageX,e.pageY);
					$(this).append($box);
					$box.find('.text').focus();

					toggleTextMode();
				}
				if(isProgressMode){
					isProgressMode = !isProgressMode;
					exitProgressMode();
				}
			});

			$('#dropzone').dblclick(function(e){
				e.stopPropagation();
				var $box = createTextBox(e.pageX,e.pageY);
				$(this).append($box);
				$box.find('.text').focus();
				//toggleTextMode();
			});

		}


		  



	}

	/**
	 * class of imageBox
	 */
	var createImageBox = (function(){
		var imageId = 0; // image id

		return function(src,x,y){

			var img =document.createElement('img');
			img.id="img"+imageId;

			img.onload = function(){

				// image resizable
				$(img).attr('width', img.width+'px');
				$(img).attr('height', img.height+'px');
				$(img).resizable(); 

				// image located according current cursor position
				// cursor position is the center of a image
				$box.css({
					left : (x-img.width/2)+'px',
					top : (y-img.height/2) + 'px'
				})
			}
			img.src= src;

			if (isLeftShow)
				x -= 250;

			// imageBox templates
			var $box = $("<div id='imgBox"+imageId+"' style='position:absolute;' class='img-box'></div>");
			$box.append(img);
			$box.append("<div class='scaleControl'></div>\
						<div class='deletePic'>\
							<div class='deleteBtn'></div>\
							<div class='text'>\
								<span>Really?</span>\
								<a click='' class='do_click'>Yes</a>\
								<span>/</span>\
								<a click='' class='cancel_click'>No</a>\
							</div>\
						</div>\
						<div class='timelineControl'>\
							<div class='add addTop'></div>\
							<div class='add addLeft'></div>\
							<div class='add addOpacity'></div>\
						</div>");

			/**
			 * delete an image
			 */
			$box.find('.do_click').click(function(){
				deleteObject = $box;
				$box.remove();
			});	    

			/**
			 * drag an image
			 */
			$box.draggable({
	            start: function() {
	                exitProgressMode();
	            }
	        });

			// setting of animation mode
			$box.find('.timelineControl div').click(function(e){
				e.stopPropagation();
				timelineListener($(this));
			});

			imageId++;

			return $box;
		}
	})()

    
      
	/**
	 * class of textBox
	 */
	var createTextBox = (function(){
		
		// init font style variables
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

		return function(x,y){

			// init variables
			var tempWidth = 540;
			var tempHeight = 135;
			var winWidth = window.innerWidth;

			if(isLeftShow){
				x -= 250;
				winWidth -=250;
			}

			// calculate for x, y box position
			if((x+tempWidth)>window.innerWidth)
				x = winWidth - tempWidth;

			if((y+tempHeight)>window.innerHeight)
				y = window.innerHeight - tempHeight;

			// html template for text box
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

			/**
			 * make text box dragable
			 */
			$box.draggable({
	            start: function() {
	                exitProgressMode();
	            }
	        });

			/**
			 * hover on box to show buttons
			 */
			$box.hover(
				function(){
					if(!isEditMode){
						$box.find('.timelineControl').css('opacity',1).css('display','none');

						setNotEditMode();
					}
				},
				function(){
					setEditMode();
				}
			);
			
			/**
			 * delete a text box
			 */
			$box.find('.textDelete').click(function(e){
				$box.remove();
			});

			/**
			 * click ok button equals to the focus of textinput blured
			 */
			$box.find('.textDone').click(function(e){
				$box.find('input.text').blur();
			});

			/**
			 * press key enter equals to the focus of textinput blured 
			 */ 
			$box.find('input.text').bind('keyup',function(event) {  
          		if(event.keyCode==13){  
                	$box.find('input.text').blur();
        		}  
         	}); 

			/**
			 * the focus of textinput blur, replace the input element with p element
			 */ 
			$box.find('input.text').blur(blur)
			function blur(e){
				isEditMode = false;
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
						isEditMode = true;
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

			/**
			 * change font color
			 */
			$box.find('.block.fontcolor .block').click(function(e){
				var color = $(this).css("background-color");
				$(this).parent().children(".block").removeClass("sel");
				$(this).addClass("sel");
				var parts = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
				textcolor = "rgb("+parseInt(parts[1])+","+parseInt(parts[2])+","+parseInt(parts[3])+")";

				resetStyle();
			});

			/**
			 * change background color
			 */
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

			
			setUpTangle();
			/**
			 * use tangle to change fontsize and bg-alpha
			 */
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

	        /**
			 * update font styles
			 */
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
				$box.find('.block.bg-alpha p').css("color",textbg);
				$box.find('.block.bg-alpha p span').css("color",textbg);
				$box.find('.block.fontsize').css("background",textbgA);

	        }

	        /**
			 * enter edit mode
			 */
	        function setEditMode(){
				$box.find('.textDelete').css('display','none').fadeOut(150);
				$box.find('.timelineControl').css('opacity',0).fadeOut(150);
			}
			/**
			 * exit edit mode
			 */
			function setNotEditMode(){
				$box.find('.textDelete').fadeIn(150);
				$box.find('.timelineControl').css('opacity',1).fadeIn(150);
			}

			/**
			 * set animation mode
			 */
			$box.find('.timelineControl div').click(function(e){
				e.stopPropagation();
				timelineListener($(this));
			});

			textId++;
			isEditMode = true;
			return $box;
		}

		/**
		 * generate colors with alpha chanel
		 */
		function generateRGBA(rgb,a){
	        return "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+a/100.0+")";
	    }
	    /**
		 * generate colors without alpha chanel
		 */
	    function generateRGB(rgb){
	    	return "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")";
	    }
	})()

	/**
	 * class of controlBox
	 */
	var createControlBox = (function(){

		return function(type,x,y){

			var colorTop = "#D71921";
			var colorLeft = "#00AEEF";
			var colorOpacity = "#29AE6E";

			// template of controlBox
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
			
			// progress ul
			html += 		"<ul class='progress'>";
	        for(var i = 0; i<100; i+=2){
	        	html += 		"<li title='"+i+"%'></li>";
	        }
	        html += 		"</ul>";
	        
	        // percent ul
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
	
	/**
	 * progress bar
	 */
	function timelineListener(item){
		$this = item;
		$box = $this.parent().parent();

		if ($this.hasClass('sel')) {
			isProgressMode = false;
			exitProgressMode();
		}
		else{
			isProgressMode = true;
			$('.control').remove();
			// generate a new progress bar

			var currentID = $box.attr('id');
			var currentType = 0;

			// set style
			$this.parent().css("opacity",1);
			$this.siblings().removeClass("sel");
			$this.addClass('sel');

			// get position of the current object
			var curX = parseInt($this.parent().parent().css("left"));
			var t = $box.attr('id');
			if ( t.indexOf('img')!=-1){
				var curY = parseInt($this.parent().parent().css("top")) + parseInt($box.find('img').attr('height'));
			}
			else{
				var curY = parseInt($this.parent().parent().css("top")) + 135;	
			}
				
			// create control box
			if($this.hasClass("addTop")){
				currentType = 1;
				var $box2 = createControlBox("top",curX,curY);
			}
			else if ($this.hasClass("addLeft")) {
				currentType = 2;
				var $box2 = createControlBox("left",curX,curY);
			}
			else{
				currentType = 3;
				var $box2 = createControlBox("opacity",curX,curY);
			}
			
			// add text box
			$('#dropzone').append($box2);
			initData();

			// init data for control bar
			function initData(){
				for(var i=0; i<progressInfo.length; i++){
					if(progressInfo[i].id == currentID){
						if (progressInfo[i].type == 1){
							$div = $("<div title='top' class='topAnimation sel'><p>V:"+progressInfo[i].value+"</p></div>");
						} 
						else if (progressInfo[i].type == 2){
							$div = $("<div title='left' class='leftAnimation sel'><p>H:"+progressInfo[i].value+"</p></div>");
						}
						else if (progressInfo[i].type == 3){
							$div = $("<div title='opacity' class='opacityAnimation sel'><p>A:"+progressInfo[i].value+"</p></div>");
						}

						var n = parseInt(progressInfo[i].progress)/2+1;
						$box2.find('.progress li:nth-child('+n+')').append($div);
					}
				}
				for(var i = 0; i<50; i++){
					if (currentType == 1){
						$p = $("<p><span>bottom</span> <span>center</span> <span>top</span>(vertical)</p>");
					} 
					else if (currentType == 2){
						$p = $("<p><span>left</span> <span>center</span> <span>right</span>(horizontal)</p>");
					}
					else if (currentType == 3){
						$p = $("<p><span>0</span> <span>1</span>(alpha)</p>");
					}
					$box2.find('.progress li:nth-child('+(i+1)+')').append($p);
				}
			}

			// set data 
			$box2.find('span').click(function(e){
				e.stopPropagation();

				var curvalue = $this.html();
				if(curvalue.indexOf("left") == -1 || curvalue.indexOf("top") == -1)
					curvalue = "-100%";
				else if(curvalue.indexOf("right") == -1 || curvalue.indexOf("bottom") == -1)
					curvalue = "100%";
				else if(curvalue.indexOf("center") == -1)
					curvalue = "0%";

				progressInfo.push({
					id : currentID,
					type : currentType,
					progress : $this.parent().parent().attr('title'),
					value : curvalue
				});
				if (currentType == 1) {
	        		var $a = $("<div title='top' class='topAnimation sel'><p>V:"+$(this).html()+"</p></div>");
	        	}
	        	else if(currentType == 2) {
	        		var $a = $("<div title='left' class='leftAnimation sel'><p>H:"+$(this).html()+"</p></div>");
	        	}
	        	else if(currentType == 3){
	        		var $a = $("<div title='opacity' class='opacityAnimation sel'><p>O:"+$(this).html()+"</p></div>");
	        	}

	        	$(this).parent().parent().append($a);
	        	$(this).parent().remove();
			});

		}
	}
		


	var isPlay = false;
	var jarallax;
	var interval;

	$('.play').click(function(e){

		togglePlayMode();
		if (isPlay){
			exitProgressMode();
			initAnimation();

			play(5, 200);
		}else{
			clearInterval(interval);
		}
	});

	function togglePlayMode(){
		isPlay = ! isPlay;
		if(isPlay){
			$('.play').addClass('active');
		}else{
			$('.play').removeClass('active');
		}
	}

	function play(time, fps){
		
		var step = 1/(time*fps);
		var progress = 0;
		interval = setInterval(function(){

			jarallax.setProgress(progress);
			progress += step;
			if(progress >= 1){
				clearInterval(interval);
				togglePlayMode();
			}
		}, 1000/fps);
	}

	function initAnimation(){

		jarallax = new Jarallax();
		
		// group by item.id
		var queues = {};
		progressInfo.forEach(function(item, idx){
			if( ! queues[item.id] ){
				queues[item.id] = [];
			}
			queues[item.id].push(item);
		})

		for(var id in queues){

			// default value
			jarallax.setDefault('#'+id, {
				opacity:$('#'+id).css('opacity'),
				top : $('#'+id).css('top'),
				left : $('#'+id).css('left')
			})

			var queue = queues[id];
			var arr = [];
			queue.sort(function(a, b){
				return parseInt(a.progress) - parseInt(b.progress);
			})

			queue.forEach(function(item, idx){
				switch(item.type){
					case 1:
						arr.push({
							progress : item.progress,
							top : item.value
						});
						break;
					case 2:
						arr.push({
							progress : item.progress,
							left: item.value
						});
						break;
					case 3:
						arr.push({
							progress : item.progress,
							opacity: item.value
						});
						break;
				}
			})
			jarallax.addAnimation('#'+id, arr);
		}

	}


});