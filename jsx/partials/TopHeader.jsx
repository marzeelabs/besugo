import React from 'react';
import BesugoComponent from 'Besugo';

class TopHeader extends BesugoComponent {
  constructor(props) {
    super(props);
  }

  static get config() {
    return {
      tag: 'TopHeader'
    };
  }

  getData() {
    // Set some default props
    return {
      home: {
        active: ('home-active' in this.props && this.props['home-active'] === "true") ? " is-active" : "",
        url: ('home-url' in this.props) ? this.props['home-url'] : "/",
        label: ('home-label' in this.props) ? this.props['home-label'] : "Home"
      },
      pages: {
        label: ('pages-label' in this.props) ? this.props['pages-label'] : "Pages"
      },
      about: {
        active: ('about-active' in this.props && this.props['about-active'] === "true") ? " is-active" : "",
        url: ('about-url' in this.props) ? this.props['about-url'] : "/pages/about",
        label: ('about-label' in this.props) ? this.props['about-label'] : "About"
      },
      people: {
        active: ('people-active' in this.props && this.props['people-active'] === "true") ? " is-active" : "",
        url: ('people-url' in this.props) ? this.props['people-url'] : "/people",
        label: ('people-label' in this.props) ? this.props['people-label'] : "People"
      },
      blog: {
        active: ('blog-active' in this.props && this.props['blog-active'] === "true") ? " is-active" : "",
        url: ('blog-url' in this.props) ? this.props['blog-url'] : "/blog",
        label: ('blog-label' in this.props) ? this.props['blog-label'] : "Blog"
      }
    };
  }

  render() {
    const data = this.getData();

    return (
      <header>
        <div className="navigation">

          <div className="navigation__mobile-menu__toggle">
            <span className="navigation__mobile-menu__icon"></span>
          </div>

          <div className="navigation-logo">
            <a href="/" className="navigation-logo__svg">
              <svg className="navigation-logo__svg-minified">
                <use href="#logo-main"></use>
              </svg>
            </a>
          </div>

          <ul className="navigation__menu">

            <li className={ "navigation__menu-item" + data.home.active }>
              <a className="navigation__menu-link" href={ data.home.url }>{ data.home.label }</a>
            </li>

            <li className="navigation__menu-item">
              <a className="navigation__menu-link is-hidden">{ data.pages.label }</a>

              <ul className="navigation__submenu">
                <li className={ "navigation__menu-item" + data.about.active }>
                  <a className="navigation__menu-link" href={ data.about.url }>{ data.about.label }</a>
                </li>
                <li className={ "navigation__menu-item" + data.people.active }>
                  <a className="navigation__menu-link" href={ data.people.url }>{ data.people.label }</a>
                </li>
              </ul>
            </li>

            <li className={ "navigation__menu-item" + data.blog.active }>
              <a className="navigation__menu-link" href={ data.blog.url }>{ data.blog.label }</a>
            </li>

          </ul>

        </div>
      </header>
    );
  }
};

TopHeader.initialize();
export default TopHeader;
