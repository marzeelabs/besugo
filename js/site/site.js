import $ from 'jquery';

$(() => {
  function filtro() {
    const $filterControls = $('.section__tags-content__links');
    const $filterObjects = $('.event-cards__content-item');
    const filterOutClass = 'filtro-out';
    const controlActiveClass = 'section__tags-content__links--active';

    $filterControls.click(function onCLick(event) {
      const filterName = $(this).text();
      $filterControls.removeClass(controlActiveClass);
      $(this).addClass(controlActiveClass);

      if (!filterName.length) {
        return;
      }

      event.preventDefault();

      const $filteredIn = $filterObjects
        .addClass(filterOutClass)
        .filter(`[data-filtro*=${filterName}]`)
        .removeClass(filterOutClass);

      if (!$filteredIn.length) {
        $filterObjects.removeClass(filterOutClass);
      }
    });
  }

  // function for g maps
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
  // gmaps();
});
