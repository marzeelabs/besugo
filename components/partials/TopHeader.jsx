import React from 'react';
import BesugoComponent from 'Besugo';

export default class TopHeader extends BesugoComponent {
  static config = {
    tag: 'TopHeader',
  }

  getData() {
    // Set some default props
    return {
      home: {
        active: ('home-active' in this.props && this.props['home-active'] === 'true') ? ' is-active' : '',
        url: ('home-url' in this.props) ? this.props['home-url'] : '/',
        label: ('home-label' in this.props) ? this.props['home-label'] : 'Home',
      },
      pages: {
        label: ('pages-label' in this.props) ? this.props['pages-label'] : 'Pages',
      },
      about: {
        active: ('about-active' in this.props && this.props['about-active'] === 'true') ? ' is-active' : '',
        url: ('about-url' in this.props) ? this.props['about-url'] : '/pages/about',
        label: ('about-label' in this.props) ? this.props['about-label'] : 'About',
      },
      people: {
        active: ('people-active' in this.props && this.props['people-active'] === 'true') ? ' is-active' : '',
        url: ('people-url' in this.props) ? this.props['people-url'] : '/people',
        label: ('people-label' in this.props) ? this.props['people-label'] : 'People',
      },
      blog: {
        active: ('blog-active' in this.props && this.props['blog-active'] === 'true') ? ' is-active' : '',
        url: ('blog-url' in this.props) ? this.props['blog-url'] : '/blog',
        label: ('blog-label' in this.props) ? this.props['blog-label'] : 'Blog',
      },
    };
  }

  render() {
    const data = this.getData();

    return (
      <header>
        <div className="navigation" ref={(div) => { this.domNavigation = div; }}>

          <div className="navigation__mobile-menu__toggle" ref={(div) => { this.domMenuToggle = div; }}>
            <span className="navigation__mobile-menu__icon" />
          </div>

          <div className="navigation-logo" ref={(div) => { this.domLogo = div; }}>
            <a href="/" className="navigation-logo__svg">
              <svg className="navigation-logo__svg-minified">
                <use href="#logo-main" />
              </svg>
            </a>
          </div>

          <ul className="navigation__menu">

            <li className={ `navigation__menu-item${data.home.active}` }>
              <a className="navigation__menu-link" href={ data.home.url }>
                { data.home.label }
              </a>
            </li>

            <li className="navigation__menu-item">
              <div className="navigation__menu-link is-hidden">
                { data.pages.label }
              </div>

              <ul className="navigation__submenu">
                <li className={ `navigation__menu-item${data.about.active}` }>
                  <a className="navigation__menu-link" href={ data.about.url }>
                    { data.about.label }
                  </a>
                </li>
                <li className={ `navigation__menu-item${data.people.active}` }>
                  <a className="navigation__menu-link" href={ data.people.url }>
                    { data.people.label }
                  </a>
                </li>
              </ul>
            </li>

            <li className={ `navigation__menu-item${data.blog.active}` }>
              <a className="navigation__menu-link" href={ data.blog.url }>
                { data.blog.label }
              </a>
            </li>

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
          this.toggleClass(this.domLogo, 'visible-logo', scrollTop > 150);
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
