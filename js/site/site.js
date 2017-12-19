import $ from 'jquery';

$(function() {
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
