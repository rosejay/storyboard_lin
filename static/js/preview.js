//
//  preview.js
//  preview for each slides
//
//  stage.slides.length: slides number
//	stage.currentSlide
	

	function updatePreview(){

		$(".preview-box").html("");

		for(var i = 0; i<stage.slides.length; i++){
			var $box = $("<li class='preview' id='preview"+i+"'></li>");
			var $dropzone = $(".slides #dropzone"+i).clone();
			$dropzone.css("zoom",1/6.0);

			if(i == stage.currentSlide)
				$box.addClass("sel");

			$box.append($dropzone);
			$(".preview-box").append($box);

			var $canvasold = $(".slides #dropzone"+i).find(".draw-box div canvas");
			var $canvasnew = $dropzone.find(".draw-box div canvas");

			for (var j = 0; j < $canvasnew.length; j++){ 
				$canvasold[j] = $(".slides #dropzone"+i).find(".draw-box div canvas");

				var c = $canvasnew[j].getContext('2d');
				c = cloneCanvas($canvasold[0][j], c);
				//$dropzone.find(".draw-box canvas")[j].replaceWith($canvasnew[j]);
			}

			var $block = $("<div class='blockPreview' index='"+i+"'></div>");
			$dropzone.append($block);
		}

			
	}

	$(".blockPreview").live("click", function(){ 
		var n =	parseInt($(this).attr("index"));
		stage.to(n);
	});

	function cloneCanvas(oldCanvas,context) {

	    //apply the old canvas to the new one
	    context.drawImage(oldCanvas, 0, 0);

	    //return the new canvas
	    return context;
	}
