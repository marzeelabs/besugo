import React from 'react';
import BesugoComponent from 'Besugo';
import SocialIcons from 'partials/SocialIcons';
import SVGElements from 'partials/SVGElements';

export default class EndFooter extends BesugoComponent {
  static config = {
    tag: 'EndFooter',
    categories: [ 'footer', 'footer-pt' ],
  }

  static extraProps(props, xplaceholder) {
    const params = xplaceholder.getChildren('param');
    if (params.length > 0) {
      props.social = {};
      params.forEach((child) => {
        const name = child.getAttribute('name');
        const value = child.getAttribute('value');

        // eslint-disable-next-line
        props.social[name] = value;
      });
    }
  }

  getData() {
    if (this.isPreview()) {
      const { entry } = this.props;

      return {
        home: {
          url: '/',
        },
        about: {
          url: '/pages/about',
        },
        blog: {
          url: '/blog',
        },
        copyright: entry.getIn([ 'data', 'copyright' ]),
        social: {
          facebook: entry.getIn([ 'data', 'social', 'facebook' ]),
          instagram: entry.getIn([ 'data', 'social', 'instagram' ]),
          twitter: entry.getIn([ 'data', 'social', 'twitter' ]),
        },
      };
    }

    // Set some default props
    const data = {
      home: {
        url: ('home-url' in this.props) ? this.props['home-url'] : '/',
      },
      about: {
        url: ('about-url' in this.props) ? this.props['about-url'] : '/pages/about',
      },
      blog: {
        url: ('blog-url' in this.props) ? this.props['blog-url'] : '/blog',
      },
      copyright: '\xA9 2017 Besugo',
    };

    return Object.assign(data, this.props);
  }

  renderBlock() {
    const data = this.getData();

    return (
      <footer className="footer">
        <ul className="footer__menu">
          <li className="footer__menu-item">
            <a href={ data.home.url }>
              home
            </a>
          </li>
          <li className="footer__menu-item">
            <a href={ data.about.url }>
              About
            </a>
          </li>
          <li className="footer__menu-item">
            <a href={ data.blog.url }>
              Blog
            </a>
          </li>
        </ul>

        <SocialIcons section="footer" { ...data } />

        <div className="footer__copyright">
          <a href="/" className="footer__copyright-logo">
            <svg>
              <use href="#logo-main" />
            </svg>
          </a>
          <p>
            { data.copyright }
          </p>
        </div>

      </footer>
    );
  }

  renderPreview() {
    return (
      <div id="cmsPreview">
        <SVGElements />
        { this.renderBlock() }
      </div>
    );
  }
}
