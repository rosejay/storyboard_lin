
$(document).ready(function(){
	

	var canvas, stage;

	var mouseTarget;	// the display object currently under the mouse, or being dragged
	var dragStarted;	// indicates whether we are currently in a drag operation
	var offset;
	var update = true;


	var currentID= -1;
	var currentType = "";
	var shapeId = 0;
	var shapes = [];
	var isDrawing = false;  // if it is in drawing mode
	var lineWidth = 10; 	// line width

	$('.addRect').click(function(e){
		setDrawing($(this));
		currentType = "rect";
	});
	$('.addArrow').click(function(){
		setDrawing($(this));
		currentType = "arrow";
	});
	$('.addEllipse').click(function(){
		setDrawing($(this));
		currentType = "ellipse";
	});
	$('.addDash').click(function(){
		setDrawing($(this));
		currentType = "dash";
	});
	$('.addBrush').click(function(){
		setDrawing($(this));
		currentType = "brush";
	});
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




	var width = parseInt($("#dropzone").css("width"));
	var height = parseInt($("#dropzone").css("height"));

	var tempHTML = "<canvas id='canvas' width='"+width+"px' height='"+height+"px' resize class='drawObj'></canvas>";
	$("#dropzone").append(tempHTML);

	// create stage and point it to the canvas:
	canvas = document.getElementById("canvas");

	//check to see if we are running in a browser with touch support
	stage = new createjs.Stage(canvas);

	// enable touch interactions if supported on the current device:
	createjs.Touch.enable(stage);

	// enabled mouse over / out events
	stage.enableMouseOver(10);
	stage.mouseMoveOutside = false; // keep tracking the mouse even when it leaves the canvas

	// load the source image:
	//var image = new Image();
	//image.src = "assets/daisy.png";
	//image.onload = handleImageLoad;


	var container = new createjs.Container();
	stage.addChild(container);

	var isPressed = false;
	var isOver = false;


	stage.onMouseDown = function(evt){

		if(!isOver && isDrawing){
			isPressed = true;

			shapes[shapeId] = new myShape(currentType, shapeId, 
									evt.stageX, evt.stageY, 0, 0);
			
			if(currentType == "brush"){
				shapes[shapeId].arrayX[0] = evt.stageX;
				shapes[shapeId].arrayY[0] = evt.stageY;
			}

			shapes[shapeId].init(evt);
		}
			
	};
	stage.onMouseMove = function(evt){
		if(isPressed && !isOver && isDrawing){
			if(currentType == "brush"){
				shapes[shapeId].setArray(evt.stageX,evt.stageY);

			}
			else{
				shapes[shapeId].width = evt.stageX - shapes[shapeId].x;
				shapes[shapeId].height = evt.stageY - shapes[shapeId].y;
			}

			shapes[shapeId].display();
			stage.update();
		}
			
	};
	stage.onMouseUp = function(evt){
		
		if(!isOver && isDrawing){
			setUnDrawing();
			shapes[shapeId].shape.scaleX = shapes[shapeId].shape.scaleY = shapes[shapeId].shape.scale = 1;
			
			if(currentType == "brush")
				shapes[shapeId].reDisplay();

			if(currentType == "rect" || currentType == "ellipse" || currentType == "brush")
				shapes[shapeId].initHit();


			shapes[shapeId].shape.onMouseOver = mouseOverHandler;
			shapes[shapeId].shape.onMouseOut = mouseOutHandler;
			shapes[shapeId].shape.onPress = pressedHandler;
			shapeId ++;
			isPressed = false;
		}
	}

	function mouseOverHandler(e) {
		if(!isDrawing){
			isOver = true;
			e.target.scaleX = e.target.scaleY = e.target.scale*1.1;
			stage.update();
		}
	}
	function mouseOutHandler(e) {
		if(!isDrawing){
			isOver = false;
			e.target.scaleX = e.target.scaleY = e.target.scale;
			stage.update();
		}
	}
	function pressedHandler(evt){

		if(isOver && !isDrawing){
			container.addChild(evt.target);
			var offset = {x:evt.target.x-evt.stageX, y:evt.target.y-evt.stageY};

			evt.onMouseMove = function(e) {
				e.target.x = e.stageX+offset.x;
				e.target.y = e.stageY+offset.y;
				stage.update();
			}
		}

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
			this.shape.graphics.setStrokeStyle(lineWidth,"square").beginStroke("rgba(200,200,200,0.5)");
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
			stage.addChild(this.shape);
			stage.update();
			

		},
		reDisplay: function(){
			
			this.shape.graphics.clear();
			this.shape.graphics.beginFill("rgba(0,0,0,0)");
			this.shape.graphics.setStrokeStyle(lineWidth,"square").beginStroke("rgba(200,200,200,0.5)");

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
			stage.update();
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
			this.shape.graphics.setStrokeStyle(lineWidth,"square").beginStroke("rgba(200,200,200,0.5)");
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
			
			stage.update();

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
	function drawDash(x,y,w,h,shape){

		shape.graphics.beginFill("rgba(0,0,0,0)");
		shape.graphics.setStrokeStyle(lineWidth,"square").beginStroke("rgba(200,200,200,0.5)");

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
			console.log("1",x1,y1);
			shape.graphics.lineTo(x1, y1);
			x1 += spaceW;
			y1 += spaceH;
			console.log("2",x1,y1);
			shape.graphics.moveTo(x1, y1);
			length -= lineWidth*3;
		}
		shape.graphics.lineTo(x1, y1);

	}

	function drawArrow(x,y,w,h,shape){

		shape.graphics.beginFill("rgba(0,0,0,0)");
		shape.graphics.setStrokeStyle(lineWidth,"round").beginStroke("rgba(200,200,200,1)");

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
 
                  
        shape.graphics.beginFill("rgba(200,200,200,1)");
		shape.graphics.setStrokeStyle(1,"round").beginStroke("rgba(200,200,200,1)");

        shape.graphics.moveTo(topX,topY);
        shape.graphics.lineTo(leftX,leftY);
        shape.graphics.lineTo(centerX,centerY);
        shape.graphics.lineTo(rightX,rightY);
        shape.graphics.lineTo(topX,topY);

	}

});

