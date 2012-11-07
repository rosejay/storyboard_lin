
$(document).ready(function(){
	

	var dirs = new Array(new Array(), new Array());
	var folders = new Array();
	var isLeftShow = 1;

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
		}

		// add dragstart event;

		$('.material-list li').each(function(){
			var img = $(this).find('')
			this.addEventListener('dragstart', function(e){
				e.dataTransfer.setData('text/plain', JSON.stringify({
					src : "materials/"+folders[currentFolder]+"/"+e.target.innerHTML
				}))
			  	this.style.opacity = '0.4';  // this / e.target is the source node.
			}, false);
		})

	}) 
	
	init();
		
	function init(){
		var width=window.innerWidth;
		var height=window.innerHeight;
		$('.left-panel').css("height",height);
		$('.right-panel').css("height",height);
		$('.toolbar').css("height",height);
		$('.left-panel .material-list').css("height",height - 125);
		$('.right-panel').css("width",width - 250 - 80);
		
		
		var slidenum = 0;
		var topDistance = 0;

		addBigSlides();

		function addBigSlides(){
			slidenum++;
			var newSlideHtml = "";

			var curWidth, curLeft;
			if (isLeftShow) {
				curWidth = width - 250;
				curLeft = 250;
			}
			else{
				curWidth = width;
				curLeft = 0;
			}
				
			newSlideHtml +="<div id='dropzone' class='slides slide-"+slidenum+ " dropzone' style='position:absolute; top:"+topDistance+";left:"+curLeft+"px;width:"+curWidth+"px;height:"+height+"px'></div>";
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
				
				e.stopPropagation();
				e.preventDefault();
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
    
						topDistance += curWidth*height/width;

						// click image add scale btn
						$box.click(function(e){
							var img = $(this).children('img');
							var x = $(this).attr("left");
							var y = $(this).attr("top");

					        var isScale = false;
					        
					        function setPosition(e){
					        	img.css("width",(e.pageX - x));
					        	img.css("height",(e.pageY - y));
					        }
					    });
					};
					reader.readAsDataURL(e.dataTransfer.files[0]);
				}
				
			}, false);

		}


		  

		$('.closeLeftBtn').click(function(e){
			if(isLeftShow == 1){// close left
				$('.left-panel').animate({ left:-250 },150);
				$('.right-panel').animate({ left:0 },150).animate({width: width},150);
				$(this).animate({ left:15 },150).css("color", "#ccc");
				isLeftShow = 0;
			}
			else{// open left
				$('.left-panel').animate({ left:0 },150);
				$('.right-panel').animate({ left:250 },150).animate({width: width-250},150);
				$(this).animate({ left:220 },150).css("color", "#ccc");
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
			}
			img.src= src;

			var winWidth = window.innerWidth;
			if(isLeftShow){
				x -= 250;
				winWidth -= 250;
			}
				
			if((x-img.width/2)<0)
				x = 0;
			else if((x+img.width/2)>winWidth)
				x = winWidth - img.width;
			else
				x = x-img.width/2;

			if((y-img.height/2)<0)
				y=0;
			else if((y+img.width/2)>window.innerHeight)
				y = window.innerHeight - img.height;
			else
				y = y-img.height/2;

			var $box = $("<div id='imgBox"+imageId+"' style='position:absolute;left:"+x+"px;top:"+y+"px' class='img-box'></div>");
			$box.append(img);
			$box.append("<div class='scaleControl'></div>\
						<div class='deletePic'>\
							<div class='deleteBtn'></div>\
							<div class='text'>\
								<span>Really?</span>\
								<a click=''>Yes</a>\
								<span>/</span>\
								<a click=''>No</a>\
							</div>\
						</div>");		    
			// make image dragable
			$box.draggable();

			imageId++;

			return $box;
		}
	})()

    
      

	var createTextBox = (function(){
		var textId = 0;

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

			$box.append("<input type='text' class='text' value='Ye Lin' onLoad=”this.focus()”>\
      			<div class='attr'>\
        			<div class='block background'>\
        				<div class='bgcolor block'></div>\
        				<div class='color1 block' val='1'></div>\
          				<div class='color2 block' val='2'></div>\
         				<div class='color3 block sel' val='3'></div>\
          				<div class='color4 block' val='4'></div>\
          				<div class='color5 block' val='5'></div>\
        			</div>\
        			<div class='block bg-alpha'><p class='TKAdjustableNumber ' data-var='bgalpha' data-min='0' data-max='100'>%</p></div>\
        			<div class='block fontsize'><p class='TKAdjustableNumber ' data-var='fontsize' data-min='10' data-max='60'></p></div>\
        			<div class='block fontcolor'>\
        				<div class='fontcolor block'></div>\
        				<div class='color1 block sel' val='1'></div>\
          				<div class='color2 block' val='2'></div>\
         				<div class='color3 block' val='3'></div>\
          				<div class='color4 block' val='4'></div>\
          				<div class='color5 block' val='5'></div>\
        			</div>\
     			</div></div>");

			// make image dragable
			$box.draggable();

			// replace the input element with p element 
			$box.find('input.text').blur(blur)

			function blur(e){

				e.stopPropagation();

				var text = $(this).val();
				var $p = $("<p class='text'>"+text+"<span class='deleteText'></span></p>");
				$(this).replaceWith($p);

				// click to show the input element
				// enter edit mode
				$p.click(function(e){
					e.stopPropagation();

					if( isAddText ){

						var $input = $("<input type='text' class='text' />");
						// use the text in the closure
						$input.val(text);
						$(this).replaceWith($input);
						$input.focus();

						$input.blur( blur );
					} 
				})
			}


			setUpTangle();

			function setUpTangle () {

	            var tangle = new Tangle($box[0], {
	                initialize: function () {
	                    this.fontsize = 30;
	                    this.bgalpha = 60;
	                },
	                update: function () {
	                    $box.children('.text').css({
	                    		"font-size": this.fontsize,
	                    		"background": "rgba(255,255,255,"+this.bgalpha/100.0+")"
	                    });
	                    $box.find('.bg-alpha').css({
	                    	"background": "rgba(255,255,255,"+this.bgalpha/100.0+")"
	                    });
						$box.find('.fontsize').css({
							"background": "rgba(255,255,255,"+this.bgalpha/100.0+")"
						});
	                }
	            });
	        }

			textId++;
			return $box;
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
			
			toggleTextMode();
		}
	});

	function toggleTextMode(){

		isAddText = ! isAddText;
		if(isAddText){
			$('.addText').addClass('active');
		}else{
			$('.addText').removeClass('active');
		}
	}


	
	$(window).resize(function() {
		
	});


	

	
});