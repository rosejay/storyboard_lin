//
//  shift.js
//  in linear mode, $('#btn_page_next') && $('#btn_page_prev') related functions
//
//  index: current canvas index
//  slidenum: total slide numbers , start from 0. 
//


	$('#btn_page_next').css("top", (window.innerHeight - 120)/2);
	$('#btn_page_prev').css("top", (window.innerHeight - 120)/2);

	$('#btn_page_next').click(function(e){
		nextSlide();
	});
	$('#btn_page_prev').click(function(e){
		preSlide();
	});

	/**
	 * use keyboard to control pre & next
	 */
	$(document).keydown(function(e){ 

		var code = e.keyCode;
		if (index!=0 && (code === 33 || code == 37 || code == 38)/*pg up/ left/ up*/) {
			preSlide();
		}
		else if (index<slideNum && (code === 32 || code === 34 || code == 39 || code == 40)/*space/ pg down/ right/ down*/) {
			nextSlide();
		}
	});

	/**
	 * shift to next slide
	 */
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

	}

	/**
	 * shift to pre slide
	 */
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

	}	

	/**
	 * check if btn_page_next and btn_page_pre should be active or not
	 */
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




