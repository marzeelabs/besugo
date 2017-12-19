import { ucs2 } from 'punycode';

(function() {
  const findH1 = function(target) {
    const h1 = target && target.querySelectorAll('h1.nc-collectionPage-sidebarHeading')[0];
    if (h1) {
      let locales = [];
      let select = null;

      let items = document.querySelectorAll('.nc-collectionPage-sidebarLink');
      items.forEach(function(item) {
        let chunks = item.textContent.split(' ');
        let ucs = chunks.length > 1 && ucs2.decode(chunks[chunks.length -1]);

        // There must be two Regional Indicator Symbol codes for this to be a flag symbol
        if (ucs.length === 2 && ucs.every((code) => code >= 127462 && code <= 127487)) {
          let locale = ucs2.encode(ucs);
          if (locales.indexOf(locale) === -1) {
            locales.push(locale);
          }

          const applyLocaleAttr = function(hidden) {
            if (!item.classList.contains('locale')) {
              item.classList.add('locale');
              item.classList.add('locale-' + locale);
              if (hidden && select) {
                select._onChange(false);
              }
            }
          }
          applyLocaleAttr();

          // The CMS react app likes to reset the item's attributes when you switch between collections.
          const attrObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(m) {
              applyLocaleAttr(true);
            });
          });
          attrObserver.observe(item, { attributes: true });
        }
      });

      // Show the locale selector only when there are enough locales for it to be useful.
      if (locales.length > 1 && !h1.querySelectorAll('.nc-collectionPage-localeSelector').length) {
        select = document.createElement('select');
        select.classList.add('nc-collectionPage-localeSelector');

        locales.forEach(function(locale) {
          const option = document.createElement('option');
          option.setAttribute('value', locale);
          option.textContent = locale;
          select.appendChild(option);
        });

        h1.appendChild(select);

        // Changing the selector should update the shown content types according to the selection.
        select._onChange = function(e) {
          let locale = this.value;
          let items = document.querySelectorAll('.nc-collectionPage-sidebarLink');
          items.forEach(function(item) {
            if (item.classList.contains('locale-' + locale)) {
              item.classList.remove('locale-hidden');
            } else if(item.classList.contains('locale')) {
              item.classList.add('locale-hidden');
            }
          });
        };
        select.addEventListener('change', select._onChange);
        select._onChange();
      }
    }
  };

  // Because it's a React app, its nodes are constantly re-rendered, so we need to keep reapplying our listener.
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      findH1(m.target);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  findH1(document.body);
})();
