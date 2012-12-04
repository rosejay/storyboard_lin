
$(document).ready(function(){
	
	var drawObjNum = 0;

	$('.addRect').click(function(){

		var tempHTML = "<canvas id='drawObj"+drawObjNum+"' resize class='drawObj'></canvas>";
		$("#dropzone").append(tempHTML);

		var p = Processing('drawObj'+drawObjNum);
		var canvas = document.getElementById('drawObj'+drawObjNum);
		var context = canvas.getContext("2d");

		p.size(300, 300);
		p.smooth();
		p.noFill();
		p.stroke(200,200,200,70);
		p.strokeWeight(6);  
		p.rect(300, 200, -55, -55);
		alert("h");
		

	});

	$('#dropzone').mousedown(function(){
		
	});



var myShape = {

    type: "rect", // arrow ellipse
    color: "color(0, 0, 0, 0)",
    stroke: "color(200,200,200,70)",
    strokeWeight: 6,
    move: function () {
        
    }
}



});

