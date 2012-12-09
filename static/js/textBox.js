//
//  textBox.js
//  createTextBox object
//
//  
//
		
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