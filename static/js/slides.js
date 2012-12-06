
	$('#btn_page_next').css("top", (window.innerHeight - 120)/2);
	$('#btn_page_prev').css("top", (window.innerHeight - 120)/2);

	var index = 0;
	var slideNum = -1;


	var canvas=[], stage=[];


	var currentID= -1;
	var shapeId = [];
	var shapes = new Array(new Array(),new Array());

	var currentType = "";
	var lineWidth = 10; 	// line width

	var isDrawing = false;  // if it is in drawing mode
	var isPressed = false;
	var isOver = false;

	$('.addRect').click(function(e){
		setDrawing($(this));
		showDrawCanvas();
		currentType = "rect";
	});
	$('.addArrow').click(function(){
		setDrawing($(this));
		showDrawCanvas();
		currentType = "arrow";
	});
	$('.addEllipse').click(function(){
		setDrawing($(this));
		showDrawCanvas();
		currentType = "ellipse";
	});
	$('.addDash').click(function(){
		setDrawing($(this));
		showDrawCanvas();
		currentType = "dash";
	});
	$('.addBrush').click(function(){
		setDrawing($(this));
		showDrawCanvas();
		currentType = "brush";
	});
	function showDrawCanvas(){
		$(".drawCanvas").css("display","block");
	}
	function hideDrawCanvas(){
		$(".drawCanvas").css("display","none");
	}


	function setDrawing(obj){
		isDrawing = true;
		resetToolbarStyle(obj);
		obj.addClass("active");
	}
	function setUnDrawing(){
		isDrawing = false;
		resetToolbarStyle();
	}
	function resetToolbarStyle(){
		$('.toolbar ul li').removeClass("active");
	}







	var createSlide = (function(){

		var width = 478;
		var height = 478;


		return function(num){

			var $slide = $("<div id='dropzone"+num+"' class='wboard step slide rebuild' >\
				<span class='slidenum' id='slidenum"+num+"'>"+numberTwo(num+1)+"</span>\
				<canvas id='canvas"+num+"' width='"+width+"px' height='"+height+"px' resize class='drawCanvas' style='display:none'></canvas>\
				</div>");
			
			if(slideNum == 0)
				$slide.addClass("present");
			else if(slideNum > 0)
				$slide.addClass("future");

			function numberTwo(n){
				if (n<10) {
					return '0'+n;
				};
				return n;
			}

			initStage(num);

			return $slide;
		}

	})();
		
	function initStage(num){
			
		// create stage and point it to the canvas:
		canvas[num] = document.getElementById("canvas"+num);

		//check to see if we are running in a browser with touch support
		stage[index] = new createjs.Stage(canvas[num]);

		// enable touch interactions if supported on the current device:
		createjs.Touch.enable(stage[index]);

		// enabled mouse over / out events
		stage[index].enableMouseOver(10);
		stage[index].mouseMoveOutside = false; // keep tracking the mouse even when it leaves the canvas

		shapeId[num] = 0;

		stage[index].onMouseDown = function(evt){

			if(!isOver && isDrawing){
				isPressed = true;

				shapes[index][shapeId[index]] = new myShape(currentType, shapeId[index], 
										evt.stageX, evt.stageY, 0, 0);
				
				if(currentType == "brush"){
					shapes[index][shapeId[index]].arrayX[0] = evt.stageX;
					shapes[index][shapeId[index]].arrayY[0] = evt.stageY;
				}

				console.log("d",shapeId[index]);


				shapes[index][shapeId[index]].init(evt);
			}
				
		};
		stage[index].onMouseMove = function(evt){
			if(isPressed && !isOver && isDrawing){
				if(currentType == "brush"){
					shapes[index][shapeId[index]].setArray(evt.stageX,evt.stageY);

				}
				else{
					shapes[index][shapeId[index]].width = evt.stageX - shapes[index][shapeId[index]].x;
					shapes[index][shapeId[index]].height = evt.stageY - shapes[index][shapeId[index]].y;
				}

				shapes[index][shapeId[index]].display();
				stage[index].update();
			}
				
		};
		stage[index].onMouseUp = function(evt){

			hideDrawCanvas();

			if(!isOver && isDrawing){
				setUnDrawing();
				shapes[index][shapeId[index]].shape.scaleX = shapes[index][shapeId[index]].shape.scaleY = shapes[index][shapeId[index]].shape.scale = 1;
				
				if(currentType == "brush")
					shapes[index][shapeId[index]].reDisplay();

				if(currentType == "rect" || currentType == "ellipse" || currentType == "brush")
					shapes[index][shapeId[index]].initHit();


				shapes[index][shapeId[index]].shape.onMouseOver = mouseOverHandler;
				shapes[index][shapeId[index]].shape.onMouseOut = mouseOutHandler;
				shapes[index][shapeId[index]].shape.onMouseMove = mouseMoveHandler;

				shapes[index][shapeId[index]].shape.onPress = pressedHandler;
				shapes[index][shapeId[index]].shape.onClick = clickHandler;
				shapeId[index] ++;
				isPressed = false;
			}
		}


	}


	addSlides();

	$(".addCanvas").click(function(){
		addSlides();
	});

	function addSlides(){
		slideNum++;
		//index = slideNum;

		var $slide = createSlide(slideNum);
		$('.slides').append($slide);

		if(slideNum > 0){
			nextSlide();
		}
		else if(slideNum == 0){
			initStage(0);
		}

/*
			$slide.bind('dragenter', dragStyle, false);
			$slide.bind('dragover', dragStyle, false);
			$slide.bind('dragleave', removeDragStyle, false);
			$slide.bind('drop', droppedImage, false);


			

			*/



		document.getElementById('dropzone'+index).addEventListener('dragenter', dragStyle);
		document.getElementById('dropzone'+index).addEventListener('dragover', dragStyle);
		document.getElementById('dropzone'+index).addEventListener('dragleave', removeDragStyle);
		document.getElementById('dropzone'+index).addEventListener('drop', droppedImage);

		function droppedImage(e){

			removeDragStyle(e);

			var parentOffset = $(this).parent().offset(); 
			var x = e.pageX - parentOffset.left;
			var y = e.pageY - parentOffset.top;

			if ( ! e.dataTransfer.files.length ) {  //drop img from left list

				var data = e.dataTransfer.getData('text/plain');
				if(data){
					data = JSON.parse(data);
				}
				var $box = createImageBox(data.src, x, y);
				$box.insertBefore($("#canvas"+index));

			}
			else{  //drop img from desktop

				var reader = new FileReader();
				reader.onload = function(evt) {
					
					var $box = createImageBox(evt.target.result, x, y);
					$box.insertBefore($("#canvas"+index));

				};
				reader.readAsDataURL(e.dataTransfer.files[0]);
			}
		}

		function dragStyle(e){
			e.stopPropagation();
			e.preventDefault();
			$(".dropzone"+index).addClass('rounded');
			$(".dropzone"+index).css("z-index",100);
		}
		function removeDragStyle(e){
			e.stopPropagation();
			e.preventDefault();
			$(".dropzone"+index).removeClass('rounded');
			$(".dropzone"+index).css("z-index",0);
		}

		$('#dropzone'+index).dblclick(function(e){
			e.stopPropagation();

			var parentOffset = $(this).parent().offset(); 
			var x = e.pageX - parentOffset.left;
			var y = e.pageY - parentOffset.top;

			var $box = createTextBox(x,y);
			$box.insertBefore($("#canvas"+index));

			$box.find('.text').focus();
		});

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
			/*
			if (isLeftShow)
				x -= 250;
			*/
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
	                
	            }
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

	            }
	        });

			/**
			 * hover on box to show buttons
			 */
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
			}
			/**
			 * exit edit mode
			 */
			function setNotEditMode(){
				$box.find('.textDelete').fadeIn(150);
			}

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






	$('#btn_page_next').click(function(e){
		nextSlide();
	});
	$('#btn_page_prev').click(function(e){
		preSlide();
	});

	$(document).keydown(function(e){ 
		var code = e.keyCode;
		if (code === 33 || code == 37 || code == 38/*pg up/ left/ up*/) {
			preSlide();
		}
		else if (code === 32 || code === 34 || code == 39 || code == 40/*space/ pg down/ right/ down*/) {
			nextSlide();
		}
	});


	function nextSlide(){

		$('#slide .slides .slide').removeClass("present");
		$('#slide .slides .slide').removeClass("past");
		$('#slide .slides .slide').removeClass("future");

		$('#slide .slides .slide:eq(' + index + ')').addClass("past").css("z-index",10);
		
		index ++;
		$('#slide .slides .slide:eq(' + index + ')').addClass("present").css("z-index",100);
		
		var i = index + 1;
		if( i<=slideNum )		
			$('#slide .slides .slide:eq(' + i + ')').addClass("future").css("z-index",10);
		
		checkPreNextBtn(index);
		setindex(index);
		
	}
	function preSlide(){
		$('#slide .slides .slide').removeClass("present");
		$('#slide .slides .slide').removeClass("past");
		$('#slide .slides .slide').removeClass("future");

		$('#slide .slides .slide:eq(' + index + ')').addClass("future").css("z-index",10);

		index --;
		$('#slide .slides .slide:eq(' + index + ')').addClass("present").css("z-index",100);

		var i = index - 1;
		if(i>=0)
			$('#slide .slides .slide:eq(' + i + ')').addClass("past").css("z-index",10);

		checkPreNextBtn(index);
		setindex(index);


	}
	function setindex(a){

	}		
	function checkPreNextBtn(a){
		if(a == slideNum){
			$('#btn_page_next').hide();
			$('#btn_page_prev').show();
		}
		else if(a == 0){
			$('#btn_page_prev').hide();
			$('#btn_page_next').show();
		}
		else{
			$('#btn_page_prev').show();
			$('#btn_page_next').show();
		}
	}


















	function stageMouseDown(evt){
		console.log("s");
		if(!isOver && isDrawing){
			isPressed = true;

			shapes[index][shapeId[index]] = new myShape(currentType, shapeId[index], 
									evt.stageX, evt.stageY, 0, 0);
			
			if(currentType == "brush"){
				shapes[index][shapeId[index]].arrayX[0] = evt.stageX;
				shapes[index][shapeId[index]].arrayY[0] = evt.stageY;
			}

			shapes[index][shapeId[index]].init(evt);
		}
			
	};
	function stageMouseMove(evt){
		if(isPressed && !isOver && isDrawing){
			if(currentType == "brush"){
				shapes[index][shapeId[index]].setArray(evt.stageX,evt.stageY);

			}
			else{
				shapes[index][shapeId[index]].width = evt.stageX - shapes[index][shapeId[index]].x;
				shapes[index][shapeId[index]].height = evt.stageY - shapes[index][shapeId[index]].y;
			}

			shapes[index][shapeId[index]].display();
			stage[index].update();
		}
			
	};
	function stageMouseUp(evt){

		//hideDrawCanvas();

		if(!isOver && isDrawing){
			setUnDrawing();
			shapes[index][shapeId[index]].shape.scaleX = shapes[index][shapeId[index]].shape.scaleY = shapes[index][shapeId[index]].shape.scale = 1;
			
			if(currentType == "brush")
				shapes[index][shapeId[index]].reDisplay();

			if(currentType == "rect" || currentType == "ellipse" || currentType == "brush")
				shapes[index][shapeId[index]].initHit();


			shapes[index][shapeId[index]].shape.onMouseOver = mouseOverHandler;
			shapes[index][shapeId[index]].shape.onMouseOut = mouseOutHandler;
			shapes[index][shapeId[index]].shape.onMouseMove = mouseMoveHandler;

			shapes[index][shapeId[index]].shape.onPress = pressedHandler;
			shapes[index][shapeId[index]].shape.onClick = clickHandler;
			shapeId[index] ++;
			isPressed = false;
		}
	}

	function mouseMoveHandler(e){
		if(isOver){
			if(e.stageX>e.target.x+shapes[index][e.target.id].width/2-16&& e.stageX<shapes[index][e.target.id].width/2)
				$("#canvas").addClass("resize");
			else
				$("#canvas").removeClass("resize");

			console.log(e.stageX, e.target.x+shapes[index][e.target.id].width/2);
		}

	}
	function mouseOverHandler(e) {
		if(!isDrawing){
			isOver = true;
			var shadow = new createjs.Shadow("rgb(220,220,220)" , 2 , 2 , 5 );
			e.target.shadow = shadow;
			//e.target.scaleX = e.target.scaleY = e.target.scale*1.1;
			stage[index].update();
		}
	}
	function mouseOutHandler(e) {
		if(!isDrawing){
			e.target.shadow = null;
			isOver = false;
			e.target.scaleX = e.target.scaleY = e.target.scale;
			stage[index].update();
		}
	}
	function pressedHandler(evt){

		if(isOver && !isDrawing){
			//container.addChild(evt.target);
			var offset = {x:evt.target.x-evt.stageX, y:evt.target.y-evt.stageY};

			evt.onMouseMove = function(e) {
				e.target.x = e.stageX+offset.x;
				e.target.y = e.stageY+offset.y;
				stage[index].update();
			}
		}

	}

	// toggle rotate and scale mode
	function clickHandler(evt){
		var html;
		var i = evt.target.id;
		var x = shapes[index][i].x-lineWidth/2;
		var y = shapes[index][i].y-lineWidth/2;
		var w = shapes[index][i].width + lineWidth;
		var h = shapes[index][i].height + lineWidth;

		$html = "<canvas class='setcenter' id='popup' style='top:"+y+"px;left:"+x+"px;width:"+w+"px;height="+h+"px'></canvas>"

		$html.insertBefore("#canvas"+index);

		var p = Processing("popup");
		var canvas = document.getElementById("popup");
		var context = canvas.getContext("2d");

		p.size(shapes[index][i].width, shapes[index][i].height);
		p.smooth();
		p.noFill();
		p.stroke(220,220,220);
		p.strokeWeight(lineWidth);
		p.rect(lineWidth/2,lineWidth/2, shapes[index][i].width-lineWidth, shapes[index][i].height-lineWidth);

		//shapes[index][i].shape.visible = false;

		$("#popup").resizable(); 
		$("#popup").draggable(); 

		$("#popup").css("top", 0).css("left",0);
	}



	function drawDash(x,y,w,h,shape){

		shape.graphics.beginFill("rgba(0,0,0,0)");
		shape.graphics.setStrokeStyle(lineWidth,"square").beginStroke("rgb(220,220,220)");

		var x1 = x;
		var x2 = w;
		var y1 = y;
		var y2 = h;

		var length = Math.sqrt((w)*(w) + (h)*(h));

		var units = length*1.0/(lineWidth*3);
		var dashSpaceRatio = 0.3;
		
		var dashW = (w/units*1.0)*dashSpaceRatio;
		var spaceW = (w/units*1.0)-dashW;
		var dashH = (h/units*1.0)*dashSpaceRatio;
		var spaceH = (h/units*1.0)-dashH;

		shape.graphics.moveTo(x1, y1);
		while (length > 0)
		{
			x1 += dashW;
			y1 += dashH;
			shape.graphics.lineTo(x1, y1);

			x1 += spaceW;
			y1 += spaceH;
			shape.graphics.moveTo(x1, y1);

			length -= lineWidth*3;
		}
		shape.graphics.lineTo(x1, y1);

	}

	function drawArrow(x,y,w,h,shape){

		shape.graphics.beginFill("rgba(0,0,0,0)");
		shape.graphics.setStrokeStyle(lineWidth,"round").beginStroke("rgb(220,220,220)");

		var Radius = 2*lineWidth;
		var endX = x+w;
		var endY = y+h;
		var mouseX = 
		// line
		shape.graphics.moveTo(x, y);
		shape.graphics.lineTo(endX, endY);

		// arrow
        var angle = Math.atan2(h,w)*(180/Math.PI);
       
        var centerX = endX-Radius * Math.cos(-angle *(Math.PI/180)) ;
        var centerY = endY+Radius * Math.sin(-angle *(Math.PI/180)) ;
        var topX = endX+Radius * Math.cos(-angle *(Math.PI/180));
        var topY = endY-Radius * Math.sin(-angle *(Math.PI/180));
        
        var leftX = centerX + Radius * Math.cos((-angle +120) *(Math.PI/180));
        var leftY = centerY - Radius * Math.sin((-angle +120) *(Math.PI/180));
        
        var rightX = centerX + Radius * Math.cos((-angle -120) *(Math.PI/180))  ;
        var rightY = centerY - Radius * Math.sin((-angle -120) *(Math.PI/180))  ;
 
                  
        shape.graphics.beginFill("rgb(220,220,220)");
		shape.graphics.setStrokeStyle(1,"round").beginStroke("rgb(220,220,220)");

        shape.graphics.moveTo(topX,topY);
        shape.graphics.lineTo(leftX,leftY);
        shape.graphics.lineTo(centerX,centerY);
        shape.graphics.lineTo(rightX,rightY);
        shape.graphics.lineTo(topX,topY);

	}




	function myShape(t,id,x,y,w,h){

		this.type = t;
		this.id = id;
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.shape;
		this.hit;
		this.arrayX = [];
		this.arrayY = [];
		this.maxX = 0;
		this.maxY = 0;
		this.minX = 100000;
		this.minY = 100000;
	}
	myShape.prototype = {
		init: function(e){
			this.shape = new createjs.Shape();
			this.shape.graphics.beginFill("rgba(0,0,0,0)");
			this.shape.graphics.setStrokeStyle(lineWidth,"square").beginStroke("rgb(220,220,220)");
			this.shape.x = e.stageX;
			this.shape.y = e.stageY;
			this.shape.id = this.id;
			if(this.type == "rect"){
				this.shape.graphics.drawRect(0, 0, 0, 0);
			}
			else if(this.type == "ellipse"){
				this.shape.graphics.drawEllipse(0, 0, 0, 0);
			}
			else if (this.type == "arrow") {
				drawArrow(0,0,0,0,this.shape);
			}
			else if(this.type == "dash"){
				drawDash(0,0,0,0,this.shape);
			}
			else if (this.type == "brush") {
				this.shape.x = 0;
				this.shape.y = 0;
			}
			stage[index].addChild(this.shape);
			stage[index].update();
			

		},
		reDisplay: function(){
			
			this.shape.graphics.clear();
			this.shape.graphics.beginFill("rgba(0,0,0,0)");
			this.shape.graphics.setStrokeStyle(lineWidth,"square").beginStroke("rgb(220,220,220)");

			this.width = this.maxX - this.minY;
			this.height = this.maxY - this.minY;
			this.x = this.width/2;
			this.y = this.height/2; 
			this.shape.x = this.width/2;
			this.shape.y = this.height/2;

			for(var i = 0; i<this.arrayX.length; i++){
				this.arrayX[i] -= this.width/2;
				this.arrayY[i] -= this.height/2;
			}
			for(var i = 0; i<this.arrayX.length-1; i++){
				this.shape.graphics.moveTo(this.arrayX[i], this.arrayY[i])
							  .lineTo(this.arrayX[i+1], this.arrayY[i+1]);
			}
			stage[index].update();
		},
		setArray: function(mx,my){

			var i = this.arrayX.length;
			this.arrayX[i] = mx;
			this.arrayY[i] = my;

			if(mx>this.maxX)
				this.maxX = mx;
			if(mx<this.minX)
				this.minX = mx;
			if(my>this.maxY)
				this.maxY = my;
			if(my<this.minY)
				this.minY = my;

		},
		display: function(){
			this.shape.graphics.clear();

			this.shape.graphics.beginFill("rgba(0,0,0,0)");
			this.shape.graphics.setStrokeStyle(lineWidth,"square").beginStroke("rgb(220,220,220)");
			if(this.type == "rect"){
				this.shape.graphics.drawRect( - this.width/2, - this.height/2, this.width, this.height);
			}
			else if (this.type == "ellipse") {
				this.shape.graphics.drawEllipse( - this.width/2, - this.height/2, this.width, this.height);
			}
			else if(this.type == "arrow"){
				drawArrow( - this.width/2, - this.height/2, this.width, this.height ,this.shape);
			}
			else if(this.type == "dash"){
				drawDash( - this.width/2, - this.height/2, this.width, this.height ,this.shape);
			}
			else if(this.type == "brush"){
				for(var i = 0; i<this.arrayX.length-1; i++){
					this.shape.graphics.moveTo(this.arrayX[i], this.arrayY[i])
								  .lineTo(this.arrayX[i+1], this.arrayY[i+1]);
				}
			}
			if(this.type == "brush"){
				this.shape.x = 0;
				this.shape.y = 0;
			}
			else{
				this.shape.x = this.x + this.width/2;
				this.shape.y = this.y + this.height/2;
			}
			
			stage[index].update();

		},
		initHit: function() {
			this.hit = new createjs.Shape();
			if(this.type == "rect" || this.type == "brush"){
				this.hit.graphics.beginFill("#000").drawRect( - this.width/2, - this.height/2, this.width, this.height);
			}
			else if (this.type == "ellipse") {
				this.hit.graphics.beginFill("#000").drawEllipse( - this.width/2, - this.height/2, this.width, this.height);
			}

			this.shape.hitArea = this.hit;
		}
	};
