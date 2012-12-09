//==============================
// initialize after the app is loaded
//==============================

var stage = null;

function initialize(){

	_.templateSettings = {
	  interpolate : /\{\{(.+?)\}\}/g
	};

	$('#btn_page_next').css("top", (window.innerHeight - 120)/2);
	$('#btn_page_prev').css("top", (window.innerHeight - 120)/2);

	// create a stage;
	stage = new Stage( $("#slide .slides") );
	stage.createSlide();

	$('#btn_page_next').click(function(e){
		stage.next();
	});
	$('#btn_page_prev').click(function(e){
		stage.prev();
	});
	
	/**
	 * keyboard control pre & next
	 */
	$(document).keydown(function(e){ 

		var code = e.keyCode;
		if (code === 33 || code == 37 || code == 38)/*pg up/ left/ up*/ {
			stage.prev();
		}
		else if (code === 32 || code === 34 || code == 39 || code == 40)/*space/ pg down/ right/ down*/{
			stage.next();
		}
	});

	$(".addCanvas").click(function(){
		stage.createSlide();
	});

}

var currentType = "";   // "rect" "arrow" "ellipse" "dash" "brush"
var lineWidth = 10; 	// line width

var shapes;
var shapeNum = [];

// append it inside each object
var functionDiv = "<div class='scaleControl'></div>\
					<div class='rotateControl'></div>\
					<div class='moveControl'></div>\
					<div class='deletePic'>\
						<div class='deleteBtn'></div>\
						<div class='text'>\
							<span>Really?</span>\
							<a click='' class='do_click'>Yes</a>\
							<span>/</span>\
							<a click='' class='cancel_click'>No</a>\
						</div>\
					</div>";

$('.toolbar ul li.tool').click(function(e){
	if($(this).hasClass("active")){
		$('.toolbar ul li').removeClass("active");
		stage.getCurrent().exitDrawMode();

	}
	else{
		$('.toolbar ul li').removeClass("active");
		$(this).addClass("active");
		stage.getCurrent().enterDrawMode();

		if ($(this).hasClass("addRect"))
			currentType = "rect";
		else if ($(this).hasClass("addArrow"))
			currentType = "arrow";
		else if ($(this).hasClass("addEllipse"))
			currentType = "ellipse";
		else if ($(this).hasClass("addDash"))
			currentType = "dash";
		else if ($(this).hasClass("addBrush"))
			currentType = "brush";
	}
		
});

//========================================
// Stage to put all slids
//========================================
var Stage = function( container ){

	this.slides = [];

	this.currentSlide = 0;

	this.$container = container ? $(container) : null;
}

Stage.prototype.createSlide = function(){

	var slide = new Slide();
	this.slides.push( slide );

	if( this.$container ){
		this.$container.append( slide.$el );
	}

	this.getCurrent().exitDrawMode();

	this.to(this.slides.length-1);
	updatePreview(); // update preview

}

Stage.prototype.next = function(){

	this.to( this.currentSlide +1 );
}

Stage.prototype.prev = function(){

	this.to( this.currentSlide-1 );
}

Stage.prototype.to = function(idx){

	if( ! this.slides[idx] ){
		return;
	}

	var $slides = $('#slide .slides .slide');
	$slides.removeClass("present");
	$slides.removeClass("past");
	$slides.removeClass("future");

	var past = this.slides[idx-1],
		future = this.slides[idx+1],
		present = this.slides[idx];

	if( past ){
		$('#btn_page_prev').show();
		past.$el.addClass('past').css('z-index', 10);	//todo need to put the z-index in the css
	}else{
		$('#btn_page_prev').hide();
	}
	if( future ){
		$('#btn_page_next').show();
		future.$el.addClass('future').css('z-index', 10);
	}else{
		$('#btn_page_next').hide();
	}
	
	present.$el.addClass('present').css('z-index', 100);

	this.currentSlide = idx;
	updatePreview(); // update preview

}

Stage.prototype.getCurrent = function(){
	return this.slides[ this.currentSlide ];
}

//========================================
// Slide
//========================================

var Slide = function( opt ){

	var defaultOpt = {
		width : 480,
		height : 480
	}

	_.extend(this, opt);
	_.defaults(this, defaultOpt);

	this.guid = Slide.genGUID();

	this.initialize();

}

Slide.prototype.initialize = function(){

	this.$el = $( _.template(Slide.tpl, {
		guid : this.guid
	}) );

	this.$el.addClass('present');

	this.bindEvents();

	var canvas = this.$el.find('canvas')[0];
	canvas.width = this.width;
	canvas.height = this.height;

	this.canvas = canvas;

	// init processing
	this.processingInstance = new Processing(canvas, drawObj);
	this.processingInstance.background(255,255,255,0);
}

Slide.prototype.bindEvents = function(){

	var $el = this.$el;

	$el[0].addEventListener('dragenter', function(e){
		e.stopPropagation();
		e.preventDefault();

		if ( $("#tip").length == 0 )
			$el.append($("<p id='tip'>Drag & drop image from left list or your disk folders</p>"));
			
		$el.addClass('rounded').css("z-index",100);
	});

	$el[0].addEventListener('dragover', function(e){
		e.stopPropagation();
		e.preventDefault();
	})

	$el[0].addEventListener('dragleave', function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#tip").remove();
		$el.removeClass('rounded').css("z-index",0);

	})

	$el[0].addEventListener('drop', function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#tip").remove();
		$el.removeClass('rounded').css("z-index",0);

		var parentOffset = $(this).parent().offset(); 
		var x = e.pageX - parentOffset.left;
		var y = e.pageY - parentOffset.top;

		if ( ! e.dataTransfer.files.length ) {  //drop img from left list

			var data = e.dataTransfer.getData('text/plain');
			if(data){
				data = JSON.parse(data);
			}
			var $box = createImageBox(data.src, x, y)
			//stage.getCurrent().$el.append($box);
			$box.insertBefore(stage.getCurrent().$el.find("canvas.drawCanvas"));
		}
		else{  //drop img from desktop

			var reader = new FileReader();
			reader.onload = function(evt) {
				
				var $box = createImageBox(evt.target.result, x, y);
				//stage.getCurrent().$el.append($box);
				$box.insertBefore(stage.getCurrent().$el.find("canvas.drawCanvas"));
			};
			reader.readAsDataURL(e.dataTransfer.files[0]);
		}

		updatePreview(); // update preview
	})

	$el.dblclick(function(e){
		e.stopPropagation();

		var parentOffset = $(this).parent().offset(); 
		var x = e.pageX - parentOffset.left;
		var y = e.pageY - parentOffset.top;

		var $box = createTextBox(x,y);
		$box.insertBefore(stage.getCurrent().$el.find("canvas.drawCanvas"));

		$box.find('.inputtext').focus();
		updatePreview();
	});
}

Slide.prototype.enterDrawMode = function(){
	$(this.canvas).show();
	this.processingInstance.background(255,255,255,0);
}

Slide.prototype.exitDrawMode = function(){
	$(this.canvas).hide();
}

// ----------
// static methods and properties
// generate a guid of created slide
Slide.genGUID = (function(){
	var guid = 0;
	return function(){
		return guid++;
	}
})()

Slide.tpl = '<div id="dropzone{{guid}}" class="wboard step slide rebuild" >\
				<span class="slidenum">{{guid}}</span>\
				<canvas resize class="drawCanvas" style="display:none"></canvas>\
			</div>';
	
//===========================================
// pending(has not been rewrite yet)
//========================================
function drawObj(processing){

	processing.size( 480, 480 );
	processing.smooth();
	processing.background(255,255,255,0);
	processing.stroke(220,220,220);
	processing.strokeWeight(lineWidth);
	processing.strokeCap(processing.SQUARE);
	processing.noFill();
	processing.noLoop();

	shapes = new MyShape(currentType, 0, 0, 0, 0);

	processing.draw = function (){

		setProcessingStyle(processing);

		switch(currentType){
			case "rect":
				processing.rect(shapes.x,shapes.y,shapes.width,shapes.height);
				break;
			case "ellipse":
				processing.ellipse(shapes.x+shapes.width/2,
								   shapes.y+shapes.height/2,
								   shapes.width,
								   shapes.height);
				break;
			case "arrow":
				drawArrow(shapes.x,shapes.y,shapes.width,shapes.height,processing);
				break;
			case "brush":
				drawBrush(shapes.arrayX, shapes.arrayY,processing);
				break;
			case "dash":
				drawDash(shapes.x,shapes.y,shapes.width,shapes.height,processing);
				break;
		}

	}
	processing.mousePressed = function () {

		if(currentType == "brush"){
			shapes.arrayX[0] = processing.mouseX;
			shapes.arrayY[0] = processing.mouseY;
		}

		shapes.init(currentType, processing.mouseX, processing.mouseY);
	
	}
	processing.mouseDragged = function () {

		if(processing.mousePressed){

			if(currentType == "brush"){
				shapes.setArray(processing.mouseX, processing.mouseY);
			}
			else{
				shapes.setWH(processing.mouseX, processing.mouseY);
			}
			processing.redraw();
			//shapes.display();
		}
	}
	processing.mouseReleased = function () {

		stage.getCurrent().exitDrawMode();

		if(currentType == "brush"){
			shapes.setArray(processing.mouseX, processing.mouseY);
		}
		else{
			shapes.setWH(processing.mouseX, processing.mouseY);
		}

		if(currentType == "brush")
			shapes.reDisplay();
		else if(currentType == "rect" || currentType == "ellipse")
			shapes.reDisplayBox();
		
		isDrawing = false;

		// popup a draw object
		if(shapes.width!=0){
			var $html = createDrawObject(shapeNum[stage.currentSlide],shapes);
			//stage.getCurrent().$el.append($html);
			$html.insertBefore(stage.getCurrent().$el.find("canvas.drawCanvas"));
		}
		else{

		}

		$('.toolbar ul li').removeClass("active");
		stage.getCurrent().exitDrawMode();

		updatePreview();
		shapeNum[stage.currentSlide] ++;
	}

}

var createImageBox = (function(){
	var imageId = 0; // image id

	return function(src,x,y){

		var img =document.createElement('img');
		img.id="img"+imageId;

		img.onload = function(){

			// image resizable
			$(img).attr('width', img.width+'px');
			$(img).attr('height', img.height+'px');
			$(img).resizable({
				stop: function() {
	                updatePreview();
	            }
			}); 

			// image located according current cursor position
			// cursor position is the center of a image
			$box.css({
				left : (x-img.width/2) + 'px',
				top : (y-img.height/2) + 'px'
			})

		}
		img.src= src;

		// imageBox templates
		var $box = $("<div id='imgBox"+imageId+"' style='position:absolute;' class='img-box setcenter'></div>");
		$box.append(img);
		$box.append(functionDiv);

		/**
		 * drag an image
		 */
		$box.draggable({
            start: function() {
                
            },
            stop: function() {
                updatePreview();
            }
        });

		imageId++;

		return $box;
	}
})()

var createTextBox = (function(){
	
	// init font style variables
	var textId = 0;
	var color1 = (60,204,255);
	var color2 = (151,223,249);
	var color3 = (255,255,255);
	var color4 = (195,195,195);
	var color5 = (0,0,0);

	var textcolor = "rgb(255,255,255)";
	var textbgcolor = new Array();
	textbgcolor[0] = 0;
	textbgcolor[1] = 0;
	textbgcolor[2] = 0;
	var textsize = 30;
	var textbgalpha = 50;

	textbgA = generateRGBA(textbgcolor, textbgalpha);
	textbg = generateRGB(textbgcolor);

	var deleteBox = "<div class='deletePic'>\
						<div class='deleteBtn'></div>\
						<div class='text'>\
							<span>Really?</span>\
							<a click='' class='do_click'>Yes</a>\
							<span>/</span>\
							<a click='' class='cancel_click'>No</a>\
						</div>\
					</div>";

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
		var $box = $("<div class='text-editor' style='left:"+0+"px;top:"+y+"px;position:absolute' id='text-editor"+textId+"'>");

		$box.append("<div class='textArea'>\
						<input type='text' class='inputtext' style='color:"+textcolor+"; background:"+textbgA+";font-size:"+textsize+"' value=''>\
						"+deleteBox+"\
					</div>\
	      			<div class='attr'>\
	        			<div class='block background' title='background-color'>\
	        				<div class='bgcolor block' style='background:"+textbgA+"'></div>\
	        				<div class='color1 block' val='1'></div>\
	          				<div class='color2 block' val='2'></div>\
	         				<div class='color3 block' val='3'></div>\
	          				<div class='color4 block' val='4'></div>\
	          				<div class='color5 block' val='5'></div>\
	        			</div>\
	        			<div class='block bg-alpha' title='background-alpha' style='color:"+textbg+";background:"+textbgA+"'><p class='TKAdjustableNumber ' data-var='bgalpha' data-min='0' data-max='100'>%</p></div>\
	        			<div class='block fontsize' title='font-size' style='color:"+textcolor+";background:"+textbgA+"'><p class='TKAdjustableNumber ' data-var='fontsize' data-min='10' data-max='60'></p></div>\
	        			<div class='block fontcolor' title='font-color'>\
	        				<div class='fontcolor block' style='background:"+textcolor+"'></div>\
	        				<div class='color1 block' val='1'></div>\
	          				<div class='color2 block' val='2'></div>\
	         				<div class='color3 block' val='3'></div>\
	          				<div class='color4 block' val='4'></div>\
	          				<div class='color5 block' val='5'></div>\
	        			</div>\
	     			</div>\
	     		</div>");

		/**
		 * make text box dragable
		 */
		$box.draggable({
            start: function() {

            },
            stop: function() {
                updatePreview();
            }
        });

		/**
		 * press key enter equals to the focus of textinput blured 
		 */ 
		$box.find('input.inputtext').bind('keyup',function(event) {  
      		if(event.keyCode==13){  
            	$box.find('input.inputtext').blur();
    		}  
     	}); 

		/**
		 * the focus of textinput blur, replace the input element with p element
		 */ 
		$box.find('input.inputtext').blur(blur);

		function blur(e){

			if($(this).val() == ""){
				$(this).parent().parent().remove();
			}
			else{
				$box.find('.attr').fadeOut(150);
				//$box.css("height",70);
				
				e.stopPropagation();

				var text = $(this).val();
				var $p = $("<p class='inputtext' >"+text+"</p>");
				$(this).replaceWith($p);
				resetStyle();
				// click to show the input element
				// enter edit mode
				$p.dblclick(function(e){
					e.stopPropagation();


					var $input = $("<input type='text' class='inputtext' />");
					$box.find('.attr').fadeIn(150);
					$box.css("height",135);
					// use the text in the closure
					$input.val(text);
					$(this).replaceWith($input);
					resetStyle();
					$input.focus();

					$input.blur( blur );

					$input.bind('keyup',function(event) {  
		          		if(event.keyCode==13){  
		                	$box.find('input.inputtext').blur();
		        		}  
		         	}); 
				})
			}
			updatePreview(); 
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

                    $box.find('.inputtext').css({
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

        	$box.find('.inputtext').css("color",textcolor);
			$box.find('.block.fontsize').css("color",textcolor);
			$box.find('.block.fontcolor .block.fontcolor').css("background",textcolor);
			
			$box.find('.inputtext').css("font-size",textsize);

			$box.find('.inputtext').css("background",textbgA);
			$box.find('.block .bgcolor.block').css("background",textbg);
			$box.find('.block.bg-alpha').css("background",textbgA);
			$box.find('.block.bg-alpha p').css("color",textcolor);
			$box.find('.block.bg-alpha p span').css("color",textcolor);
			$box.find('.block.fontsize').css("background",textbgA);

			updatePreview();
        }


		textId++;

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


var createDrawObject = (function(){

	return function(id,shape){

		var x = shape.x;
		var y = shape.y;
		var w = shape.width;
		var h = shape.height;

		$box = $("<div class='draw-box setcenter' id='drawObject-"+stage.currentSlide+"-"+id+"' style='position:absolute; top:"+(y-lineWidth/2)+"px;left:"+(x-lineWidth/2)+"px;'></div>");
		//var canvas = "<canvas class='setcenter canvas' id='canvas-"+index+"-"+id+"' ></canvas>"

		var tempcanvas = document.createElement('canvas');
		processingInstance = new Processing(tempcanvas, drawObj);

		function drawObj(processing){

			// trick for arrow and dash
			if(shape.type == "arrow" || shape.type == "dash"){
				
				var x1, y1, w1, h1;
				var xBox, yBox;

				if (w<0) { w1 = -w; x1 = -w; xBox = x+w-lineWidth*2; }
				else{ w1 = w; x1 = 0; xBox = x-lineWidth*2; }

				if (h<0) { h1 = -h; y1 = -h; yBox = y+h-lineWidth*2; }
				else{ h1 = h; y1 = 0; yBox = y-lineWidth*2; }
				$box.css("left",xBox).css("top",yBox);

				processing.size( w1+lineWidth*4, h1+lineWidth*4 ); // init processing size
				$(tempcanvas).css("width",w1+lineWidth*4).css("height",h1+lineWidth*4);
				}
				else{
				processing.size( w+lineWidth, h+lineWidth ); // init processing size
					$(tempcanvas).css("width",w+lineWidth).css("height",h+lineWidth);
			}

				

			setProcessingStyle(processing);

			switch(shape.type){
				case "rect":
					processing.rect(lineWidth/2,lineWidth/2, w, h);
					break;
				case "ellipse":
					processing.ellipse(lineWidth/2+w/2,lineWidth/2+h/2, w, h);
					break;
				case "arrow":
					drawArrow(x1+lineWidth*2,y1+lineWidth*2,w,h,processing);
					break;
				case "brush":
					drawBrush(shape.arrayX, shape.arrayY,processing);
					break;
				case "dash":
					drawDash(x1+lineWidth*2,y1+lineWidth*2,w,h,processing);
					break;
			}
			
		}

		$box.append(tempcanvas);
		$box.append(functionDiv);
		$(tempcanvas).resizable({
			stop: function() {
                updatePreview();
            }
		});

		/**
		 * drag an image
		 */
		$box.draggable({
            start: function() {
                
            },
            stop: function() {
                updatePreview();
            }
        });

       

        return $box;
	}
})()


function drawDash(x,y,w,h,processing){

	setProcessingStyle(processing);

	var x1 = x;
	var y1 = y;

	var length = Math.sqrt((w)*(w) + (h)*(h));

	var units = length*1.0/(lineWidth*3);
	var dashSpaceRatio = 0.6;

	var divW = w/units*1.0;
	var divH = h/units*1.0;

	var dashW = divW*dashSpaceRatio;
	var dashH = divH*dashSpaceRatio;

	while (length > 0){

		processing.line(x1, y1, x1+dashW, y1+dashH);

		x1 += divW;
		y1 += divH;
		length -= lineWidth*3;
	}

}

function drawArrow(x,y,w,h,processing){
	setProcessingStyle(processing);

	processing.strokeCap(processing.ROUND);

	var Radius = 2*lineWidth;
	var endX = x+w;
	var endY = y+h;
	// line
	processing.strokeWeight(lineWidth);
	processing.line(x, y, endX, endY);

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

              
    processing.fill(220,220,220);
	processing.strokeWeight(1);

	processing.beginShape();
	processing.vertex(topX,topY);
	processing.vertex(leftX,leftY);
	processing.vertex(centerX,centerY);
	processing.vertex(rightX,rightY);
	processing.vertex(topX,topY);

	processing.endShape();

}
function drawBrush(arrayX,arrayY,processing){
	setProcessingStyle(processing);

	processing.beginShape();
	processing.curveVertex(arrayX[0],arrayY[0]);

	for(var i = 0; i<arrayX.length; i++)
		processing.curveVertex(arrayX[i],arrayY[i]);
	
	processing.curveVertex(arrayX[i-1],arrayY[1-1]);
	processing.endShape();
}

function setProcessingStyle(processing){

	processing.background(255,255,255,0);
	processing.stroke(220,220,220);
	processing.strokeWeight(lineWidth);
	processing.strokeCap(processing.SQUARE);
	processing.noFill();
	processing.noLoop();
}

function MyShape(t,x,y,w,h){

	this.type = t;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.arrayX = [];
	this.arrayY = [];
	this.maxX = 0;
	this.maxY = 0;
	this.minX = 100000;
	this.minY = 100000;
}
MyShape.prototype.init = function(t,x,y){
	this.type = t;
	this.x = x;
	this.y = y;
};
MyShape.prototype.reDisplay = function(){
	this.width = this.maxX - this.minX;
	this.height = this.maxY - this.minY;
	this.x = this.minX;
	this.y = this.minY; 

	for(var i = 0; i<this.arrayX.length; i++){
		this.arrayX[i] -= this.x - lineWidth/2;
		this.arrayY[i] -= this.y - lineWidth/2;
	}
};
MyShape.prototype.reDisplayBox = function(){
	if(this.width<0){
		this.x += this.width;
		this.width = -this.width;
	}
	if(this.height<0){
		this.y += this.height;
		this.height = -this.height;
	}

}
MyShape.prototype.setArray = function(x,y){
	var i = this.arrayX.length;
	this.arrayX[i] = x;
	this.arrayY[i] = y;

	if(x>this.maxX)
		this.maxX = x;
	if(x<this.minX)
		this.minX = x;
	if(y>this.maxY)
		this.maxY = y;
	if(y<this.minY)
		this.minY = y;
};
MyShape.prototype.setWH = function(x,y){
	this.width = x - this.x;
	this.height = y - this.y;
};



/**
 * delete an object
 */
$('.do_click').live("click", function(){ 
	if($(this).parent().parent().hasClass("text-editor"))
		$(this).parent().parent().remove(); 
	else
		$(this).parent().parent().parent().remove(); 
	updatePreview();
});	
/**
 * rotate an object
 */
var isRotate = false;
$(".rotateControl").live("mousedown", function(e){
	isRotate = true;
	e.stopPropagation();
	e.preventDefault();

	$(this).parent().draggable("destroy");

	var parentOffset = $(this).parent().offset(); 
	var centerX = parentOffset.left + parseInt($(this).parent().css("width")) /2 ;
	var centerY = parentOffset.top + parseInt($(this).parent().css("height")) /2 ;
	var startX = e.pageX;
	var startY = e.pageY;

	var angle1 = Math.atan2(startX - centerX, startY - centerY);


	$(this).live("mousemove", function(e){
		if(isRotate){
			e.stopPropagation();
			e.preventDefault();
			//$(this).parent().draggable({ disabled: true });
			var endX = e.pageX;
			var endY = e.pageY;

			var vector1 = [(centerX - startX), (centerY - startY)] ;
			var vector2 = [(centerX - endX), (centerY - endY)] ;
			
			var angle2 = Math.atan2(endX - centerX, endY - centerY);
			degree = (angle1 - angle2) * (180/Math.PI);

			$(this).parent().css("transform", "rotate("+degree+"deg)")
							.css("-ms-transform", "rotate("+degree+"deg)")
							.css("-webkit-transform", "rotate("+degree+"deg)")
							.css("-moz-transform", "rotate("+degree+"deg)")
							.css("-o-transform", "rotate("+degree+"deg)");
		}
	});
	
	$(this).live("mouseup", function(e){
		isRotate = false; 
		
		$(this).parent().unbind("mousemove");
		$(this).parent().draggable();
		updatePreview();
	});
});