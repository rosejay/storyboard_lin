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
			var $dropzone = $("#dropzone"+i).clone();
			$dropzone.css("zoom",1/6.0);

			var $canvasold = $("#dropzone"+i).find(".draw-box canvas");
			var $canvasnew = $dropzone.find(".draw-box canvas");

			for (var j = 0; j<$canvasnew.length; j++){ 
				$canvasold[j] = $("#dropzone"+i).find(".draw-box canvas");
				console.log($canvasold[j][0]);
				var c = $canvasnew[j][0].getContext('2d');
				//c = cloneCanvas($canvasold[j][0], c);
				//$dropzone.find(".draw-box canvas")[j].replaceWith($canvasnew[j]);
			}

			if(i == index)
				$box.addClass("sel");

			$box.append($dropzone);
			$(".preview-box").append($box);
		}
		
	}

	function cloneCanvas(oldCanvas,context) {

	    //apply the old canvas to the new one
	    context.drawImage(oldCanvas, 0, 0);

	    //return the new canvas
	    return context;
	}
