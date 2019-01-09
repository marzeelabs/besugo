import { ucs2 } from 'punycode';

(() => {
  const SELECTORS = {
    // heading: 'h1.nc-collectionPage-sidebarHeading', // Netlify-cms 1.9.2
    // link: '.nc-collectionPage-sidebarLink', // Netlify-cms 1.9.2
    heading: '.el9l68m1',
    link: '.el9l68m4 > li',
  };

  const findH1 = (target) => {
    const h1 = target && target.querySelector(SELECTORS.heading);
    if (h1) {
      const locales = [];
      let select = null;

      const items = document.querySelectorAll(SELECTORS.link);
      items.forEach((item) => {
        const chunks = item.textContent.split(' ');
        chunks.forEach((chunk) => {
          const ucs = ucs2.decode(chunk);

          // There must be two Regional Indicator Symbol codes for this to be a flag symbol
          if (ucs.length === 2 && ucs.every(code => code >= 127462 && code <= 127487)) {
            const locale = ucs2.encode(ucs);
            if (locales.indexOf(locale) === -1) {
              locales.push(locale);
            }

            const applyLocaleAttr = (hidden) => {
              if (!item.classList.contains('locale')) {
                item.classList.add('locale');
                item.classList.add(`locale-${locale}`);
                if (hidden && select) {
                  select._onChange(false);
                }
              }
            };
            applyLocaleAttr();

            // The CMS react app likes to reset the item's attributes when you switch
            // between collections.
            const attrObserver = new MutationObserver((mutations) => {
              mutations.forEach(() => {
                applyLocaleAttr(true);
              });
            });
            attrObserver.observe(item, { attributes: true });
          }
        });
      });

      // Show the locale selector only when there are enough locales for it to be useful.
      if (locales.length > 1 && !h1.querySelectorAll('.custom-locale-selector').length) {
        select = document.createElement('select');
        select.classList.add('custom-locale-selector');

        locales.forEach((locale) => {
          const option = document.createElement('option');
          option.setAttribute('value', locale);
          option.textContent = locale;
          select.appendChild(option);
        });

        h1.appendChild(select);

        // Changing the selector should update the shown content types according to the selection.
        select._onChange = () => {
          const locale = select.value;
          const links = document.querySelectorAll(SELECTORS.link);
          links.forEach((link) => {
            if (link.classList.contains(`locale-${locale}`)) {
              link.classList.remove('locale-hidden');
            }
            else if (link.classList.contains('locale')) {
              link.classList.add('locale-hidden');
            }
          });
        };
        select.addEventListener('change', select._onChange);
        select._onChange();
      }
    }
  };

  // Because it's a React app, its nodes are constantly re-rendered,
  // so we need to keep reapplying our listener.
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      findH1(m.target);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  findH1(document.body);
})();
