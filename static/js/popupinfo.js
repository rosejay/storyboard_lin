//
//  shift.js
//  in linear mode, $('#btn_page_next') && $('#btn_page_prev') related functions
//
//  index: current canvas index
//  slidenum: total slide numbers , start from 0. 
//
	showTip("Double click on canvas to <b>add text</b>!");

	function showTip(text){
		$(".popupinfo p").html(text);
		$(".popupinfo").fadeIn(150).delay(3000).fadeOut(150);
	}