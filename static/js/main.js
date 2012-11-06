
$(document).ready(function(){
	

	var dirs = new Array(new Array(), new Array());
	var folders = new Array();

	$.get('http://localhost:8888/get/files', function(res){
		//generate files dirs
		var temphtml = "";
		var temphtmldrop = "";

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

		}


			
	}) 
	
	init();
		
	function init(){
		var width=window.innerWidth;
		var height=window.innerHeight;
		$('.left-panel').css("height",height);
		$('.left-panel .material-list').css("height",height-70);

		var isLeftShow = 1;
		var slidenum = 0;
		var imagenum = 0;
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
				
			newSlideHtml +="<div id='dropzone' class='slides slide-"+slidenum+ " dropzone' style='position:absolute;top:"+topDistance+";left:"+curLeft+"px;width:"+curWidth+"px;height:"+height+"px'></div>";
			$('.right-panel').append(newSlideHtml);


			var dragTarget;
			function handleDragStart(e) {
				alert("d");
				dragTarget = e.target.src;
				console.log(dragTarget);
			  	this.style.opacity = '0.4';  // this / e.target is the source node.
			}

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
			var cols = document.querySelectorAll('.material-list ul li');
			[].forEach.call(cols, function(col) {
			  	col.addEventListener('dragstart', handleDragStart, false);		
			});
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
				if (dragTarget) {  //drop img from left list
					imagenum++;

					var $box = $("<div id='imgBox"+imagenum+"' class='img-box'></div>");
					$('#dropzone').append($box);

					var img =document.createElement('img');
					img.id="img"+imagenum;
					img.src = dragTarget;

					document.getElementById('imgBox'+imagenum).appendChild(img);

				}
				else{  //drop img from desktop
					imagenum++;

					var reader = new FileReader();
					reader.onload = function(evt) {
						var img =document.createElement('img');
						img.id="img"+imagenum;
						img.onload = function(){
							$(img).attr('width', img.width+'px');
							$(img).attr('height', img.height+'px');
							$(img).resizable();
						}
						img.src=evt.target.result;
						
						var $box = $("<div id='imgBox"+imagenum+"' class='img-box'></div>");
						$('#dropzone').append($box);
						// make image dragable
						$box.addClass("ui-widget-content").draggable();

						document.getElementById('imgBox'+imagenum).appendChild(img);
						$box.append("<div class='scaleControl'></div><div class='deletePic'><div class='deleteBtn'></div><div class='text'><span>Really?</span><a click=''>Yes</a><span>/</span><a click=''>No</a></div></div>");
					        
						topDistance += curWidth*height/width;

						// click image add scale btn
						$('#imgBox'+imagenum).click(function(e){
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
				dragTarget = "";
				
			}, false);

		}


		  

		$('.closeLeftBtn').click(function(e){
			if(isLeftShow == 1){
				$('.left-panel').animate({ left:-250 },150);
				$('.right-panel').animate({ left:0 },150).animate({width: width},150);
				$(this).animate({ left:15 },150).css("color", "#ccc");
				isLeftShow = 0;
			}
			else{
				$('.left-panel').animate({ left:0 },150);
				$('.right-panel').animate({ left:250 },150).animate({width: width-250},150);
				$(this).animate({ left:220 },150).css("color", "#ccc");
				isLeftShow = 1;
			}
		});

	}




	$('.addText').click(function(){
		setUpTangle () ;

		function setUpTangle () {

            var element = document.getElementById("text-editor");

            var tangle = new Tangle(element, {
                initialize: function () {
                    this.fontsize = 30;
                    this.bgalpha = 60;
                },
                update: function () {
                    $('#text-editor .text').css("font-size", this.fontsize);
                    $('#text-editor .text').css("background", "rgba(255,255,255,"+this.bgalpha/100.0+")");
                    $('#text-editor .block.bg-alpha').css("background", "rgba(255,255,255,"+this.bgalpha/100.0+")");
					$('#text-editor .block.fontsize').css("background", "rgba(255,255,255,"+this.bgalpha/100.0+")");
                }
            });
        }

	});

	
	


	



	

	
});