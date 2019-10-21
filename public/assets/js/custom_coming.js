/* Js for Showing and hiding scrolltop button */
$(window).scroll(function () {
    /* Show hide scrolltop button */
    if ($(window).scrollTop() == 0) {
        $('.scroll_top').stop(false, true).fadeOut(600);
    } else {
        $('.scroll_top').stop(false, true).fadeIn(600);
    }
});

/* JS for scroll top */
$(document).on('click', '.scroll_top', function () {
    $('body,html').animate({scrollTop: 0}, 400);
    return false;
});


$(window).scroll(function() {    
    var scroll = $(window).scrollTop();

    if (scroll >= 75) {
        $(".header-main").addClass("bg-color");
    } else {
        $(".header-main").removeClass("bg-color");
    }
});

/*----wow initialization-----*/
wow = new WOW(
        {
            animateClass: 'animated',
            offset: 100,
            callback: function (box) {
                console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
            }
        }
);
wow.init();
/*----wow end-----*/


/*---- icheckbox -----*/
/*$(document).ready(function () {
 $('.input-checkbox').iCheck({
 checkboxClass: 'icheckbox_square-orange',
 increaseArea: '20%'
 });
 $('.input-radio').iCheck({
 radioClass: 'iradio_flat-orange',
 increaseArea: '20%'
 });
 });*/
/*---- end-----*/

/*----nice select-----*/
/*$(document).ready(function () {
 $('select').niceSelect();
 });*/
/*----nice select end-----*/

/* slick sliders */
/*$('.banners-slick').slick({
 autoplay: true,
 arrows: true,
 focusOnSelect: true,
 dots: true,
 infinite: true,
 speed: 1000,
 slidesToShow: 1,
 centerMode: true,
 variableWidth: true
 });*/
/* slick end */
























