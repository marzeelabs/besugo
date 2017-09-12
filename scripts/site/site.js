import $ from 'jquery';
import 'slick-carousel';

$(function() {

  var breakMobile = 730; // viewport px breakpoint

  const fixedHeader = function() {
    var viewportWidth = $( window ).width(),
        fixedClass = 'navigation--fixed-top',
        $navElement = $(".navigation");

    if ($(window).scrollTop() > '1' && viewportWidth >= breakMobile) {
      $navElement.addClass(fixedClass);
    } else {
      $navElement.removeClass(fixedClass);
    }
  };

  const showLogo = function() {
    var viewportWidth = $( window ).width(),
        logovisibleClass = 'visible-logo',
        $logoElement = $(".navigation-logo");

    if ($(window).scrollTop() > '150' && viewportWidth >= breakMobile) {
      $logoElement.addClass(logovisibleClass);
    } else {
     $logoElement.removeClass(logovisibleClass);
    }
  };

  // Toggle mobile navigation
  $(".navigation__mobile-menu__toggle").click(function() {
    $(this).parent().toggleClass('is-open');
  });

  // Force close mobile navigation when clicking anywhere (except the toggle button itself)
  $( document ).on('mousedown touchstart', function(event) {
    if (!$(event.target).closest(".navigation").length) {
      $(".navigation.is-open").removeClass('is-open');
    }
  });

  $('.slider__wrapper').slick({
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    speed: 1200,
    prevArrow: '<a href="#" class="slick-prev"><span class="slick-arrow-mz slick-arrow-mz--left"><svg><use xlink:href="#slider_arrow_left"></use></svg></span></a>',
    nextArrow: '<a href="#" class="slick-next"><span class="slick-arrow-mz slick-arrow-mz--right"><svg><use xlink:href="#slider_arrow_right"></use></svg></span></a>'
  });

  //- function for g maps
  /*
  function gmaps() {
    $('.section__content__map').click(function () {
        $('.section__content__map iframe').css("pointer-events", "auto");
    });

    $( ".section__content__map" ).mouseleave(function() {
      $('.section__content__map iframe').css("pointer-events", "none");
    });
  };
  */
  $(window).on('resize scroll', fixedHeader);
    $(window).on('resize scroll', showLogo);
  filtro();
  //gmaps();
});

function filtro() {
  var $filterControls = $(".section__tags-content__links"),
  $filterObjects = $(".event-cards__content-item"),
  filterOutClass = 'filtro-out',
  controlActiveClass = 'section__tags-content__links--active';

  $filterControls.click(function(event) {
    var filterName = $(this).text();
    $filterControls.removeClass(controlActiveClass);
    $(this).addClass(controlActiveClass);

    if (!filterName.length) {
      return;
    } else {
      event.preventDefault();
    }

    $filteredIn = $filterObjects.addClass(filterOutClass).filter("[data-filtro*=" + filterName + "]")
      .removeClass(filterOutClass);

    if (!$filteredIn.length) {
      $filterObjects.removeClass(filterOutClass);
    }
  });
}
