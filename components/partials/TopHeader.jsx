import React from 'react';
import BesugoComponent from 'Besugo';

import LocaleSwitcher from 'partials/LocaleSwitcher';
import SrcSet from 'partials/SrcSet';

export default class TopHeader extends BesugoComponent {
  static config = {
    tag: 'TopHeader',
  }

  static extraProps(props, xplaceholder) {
    props.localeSwitches = xplaceholder
      .getChildren('LocaleSwitch')
      .map(localeSwitch => ({
        locale: localeSwitch.getAttribute('locale'),
        url: localeSwitch.getAttribute('url'),
      }));

    props.links = xplaceholder
      .getChildren('Link')
      .map(link => ({
        label: link.getAttribute('label'),
        url: link.getAttribute('url'),
        active: link.getAttribute('url') === props.activeurl,
      }));

    props.locations = xplaceholder
      .getChildren('Location')
      .map(location => ({
        label: location.getAttribute('label'),
        url: location.getAttribute('url'),
        image: location.getAttribute('image'),
        active: location.getAttribute('url') === props.activeurl,
      }));
  }

  getData() {
    // Set some default props
    return Object.assign({
      links: [
        {
          label: 'About us',
          url: '#',
        },
        {
          label: 'Pricing',
          url: '#',
        },
        {
          label: 'Contact us',
          url: '#',
        },
      ],

      locale: 'en',
      localeSwitches: [],
      locations: [],

    }, this.props);
  }

  render() {
    const data = this.getData();

    const locationsActive = data.locations.some(location => location.active);

    return (
      <header>
        <div className="navigation" ref={(div) => { this.domNavigation = div; }}>

          <div className="navigation__mobile-menu__toggle" ref={(div) => { this.domMenuToggle = div; }}>
            <span className="navigation__mobile-menu__icon" />
          </div>

          <div className="navigation-logo" ref={(div) => { this.domLogo = div; }}>
            <a href="/" className="navigation-logo__svg">
              <svg className="navigation-logo__svg-element">
                <use xlinkHref="#logo-main" />
              </svg>
            </a>
          </div>

          <ul className="navigation__menu">
            <li className={ `navigation__menu-item has-dropdown ${locationsActive ? 'is-active' : ''}` }>
              <div className="navigation__menu-link">
                { data.locationslabel }
              </div>

              <ul className="navigation__submenu navigation__submenu--locations">
                { data.locations.map(location => (
                  <li
                    className={ `navigation__menu-item ${location.active ? 'is-active' : ''}` }
                    key={ `location-${location.label}` }
                  >
                    <a className="navigation__menu-link" href={ location.url }>
                      <span className="navigation__submenu--locations__img__wrapper">
                        <SrcSet
                          className="navigation__submenu--locations__img"
                          src={ location.image }
                          sizes="60px"
                        />
                      </span>
                      <span>{ location.label }</span>
                    </a>
                  </li>
                )) }
              </ul>
            </li>

            { data.links.map(link => (
              <li
                className={ `navigation__menu-item ${link.active ? 'is-active' : ''}` }
                key={ `link-${link.label}` }
              >
                <a className="navigation__menu-link" href={ link.url }>
                  { link.label }
                </a>
              </li>
            )) }

            <LocaleSwitcher { ...data } />
          </ul>
        </div>
      </header>
    );
  }

  componentWillUnmount() {
    // We need to remove the listeners on unmount because while the components' DOM tree is rebuilt,
    // the document itself stays, otherwise we'd end up with multiple listeners, which would be
    // useless (and eventually resource-consuming).
    this.setListeners(false);
  }

  componentDidMount() {
    this.setListeners(true);
  }

  setListeners(mounted) {
    const method = (mounted) ? 'addEventListener' : 'removeEventListener';
    this.view().then((win) => {
      win[method]('resize', this);

      // We can only catch these in the capture phase in the iframe from the CMS preview.
      win[method]('scroll', this, (typeof CMS !== 'undefined'));

      // Toggle mobile navigation
      if (this.domMenuToggle) {
        this.domMenuToggle[method]('click', this);
      }

      // Force close mobile navigation when clicking anywhere (except the toggle button itself)
      win.document[method]('mousedown', this);
      win.document[method]('touchstart', this);
    });
  }

  handleEvent(e) {
    const $ = require('jquery');

    switch (e.type) {
      case 'scroll':
      case 'resize': {
        this.view().then((win) => {
          const scrollTop = $(win).scrollTop();

          // fixed header color change
          this.toggleClass(this.domNavigation, 'navigation--fixed-top', scrollTop > 1);

          // show logo
          // this.toggleClass(this.domLogo, 'visible-logo', scrollTop > 150);
        });
        break;
      }

      case 'click':
        $(this.domNavigation).toggleClass('is-open');
        break;

      case 'mousedown':
      case 'touchstart':
        if (!$(e.target).closest('.navigation').length) {
          $(this.domNavigation).removeClass('is-open');
        }
        break;

      default: break;
    }
  }

  toggleClass(node, name, toggle) {
    if (node) {
      if (toggle) {
        node.classList.add(name);
      }
      else {
        node.classList.remove(name);
      }
    }
  }
}
