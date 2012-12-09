//
//  preview.js
//  preview for each slides
//
//  slideNum: slides number
//
	

	function updatePreview(){

		$(".preview-box").html("");

		for(var i = 0; i<=slideNum; i++){
			var $box = $("<li class='preview' id='preview"+i+"'></li>");
			var $dropzone = $(".slides #dropzone"+i).clone();
			$dropzone.css("zoom",1/6.0);


			if(i == index)
				$box.addClass("sel");

			$box.append($dropzone);
			$(".preview-box").append($box);


			var $canvasold = $(".slides #dropzone"+i).find(".draw-box div canvas");
			var $canvasnew = $(".preview #dropzone"+i).find(".draw-box div canvas");


			for (var j = 0; j<$canvasnew.length; j++){ 
				$canvasold[j] = $(".slides #dropzone"+i).find(".draw-box div canvas");

				console.log($canvasnew[j]);
				$canvasnew[j].width = $canvasold[j][0].width;
				$canvasnew[j].height = $canvasold[j][0].height;

				console.log($canvasold[j][0]);
				var c = $canvasnew[j].getContext('2d');
				c = cloneCanvas($canvasold[j][0], c);
				//$dropzone.find(".draw-box canvas")[j].replaceWith($canvasnew[j]);
			}
		}
		
	}

	function cloneCanvas(oldCanvas,context) {

	    //apply the old canvas to the new one
	    context.drawImage(oldCanvas, 0, 0);

	    //return the new canvas
	    return context;
	}
