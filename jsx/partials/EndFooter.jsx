import React from 'react';
import BesugoComponent from 'Besugo';
import SocialIcons from 'partials/SocialIcons';
import SVGElements from 'partials/SVGElements';

class EndFooter extends BesugoComponent {
  constructor(props) {
    super(props);
  }

  static get config() {
    return {
      tag: 'EndFooter',
      categories: ['footer', 'footer-pt']
    };
  }

  getData() {
    if(this.isPreview()) {
      const entry = this.props.entry;

      return {
        home: {
          url: "/"
        },
        about: {
          url: "/pages/about"
        },
        blog: {
          url: "/blog"
        },
        copyright: entry.getIn(['data', 'copyright']),
        social: {
          facebook: entry.getIn(['data', 'social', 'facebook']),
          instagram: entry.getIn(['data', 'social', 'instagram']),
          twitter: entry.getIn(['data', 'social', 'twitter']),
        }
      };
    }

    // Set some default props
    const data = {
      home: {
        url: ('home-url' in this.props) ? this.props['home-url'] : "/"
      },
      about: {
        url: ('about-url' in this.props) ? this.props['about-url'] : "/pages/about"
      },
      blog: {
        url: ('blog-url' in this.props) ? this.props['blog-url'] : "/blog"
      },
      copyright: ('copyright' in this.props) ? this.props.copyright : '\xA9 2017 Besugo'
    };

    if(this.props.xplaceholder) {
      const params = this.props.xplaceholder.querySelectorAll('param');
      if(params.length > 0) {
        data.social = {};
        for(let i = 0; i < params.length; i++) {
          let child = params[i];
          let name = child.getAttribute('name');
          let value = child.getAttribute('value');
          data.social[name] = value;
        }
      }
    }

    return data;
  }

  renderBlock() {
    const data = this.getData();

    return (
      <footer className="footer">
        <ul className="footer__menu">
          <li className="footer__menu-item"><a href={ data.home.url }>home</a></li>
          <li className="footer__menu-item"><a href={ data.about.url }>About</a></li>
          <li className="footer__menu-item"><a href={ data.blog.url }>Blog</a></li>
        </ul>

        <SocialIcons section="footer" { ...data } />

        <div className="footer__copyright">
          <a href="/" className="footer__copyright-logo">
            <svg>
              <use href="#logo-main"></use>
            </svg>
          </a>
          <p>{ data.copyright }</p>
        </div>

      </footer>
    );
  }

  renderPreview() {
    return (
      <div id="cmsPreview">
        <SVGElements/>
        { this.renderBlock() }
      </div>
    );
  }
};

EndFooter.initialize();
export default EndFooter;
