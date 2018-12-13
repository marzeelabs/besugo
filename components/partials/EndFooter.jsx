import React from 'react';
import BesugoComponent from 'Besugo';
import SocialIcons from 'partials/SocialIcons';

export default class EndFooter extends BesugoComponent {
  static config = {
    tag: 'EndFooter',
  }

  static extraProps(props, xplaceholder) {
    const socials = xplaceholder.getChildren('Social');
    if (socials.length > 0) {
      props.social = {};
      socials.forEach((child) => {
        const name = child.getAttribute('name');
        const value = child.getAttribute('value');

        // eslint-disable-next-line
        props.social[name] = value;
      });
    }

    props.links = xplaceholder
      .getChildren('Link')
      .map(link => ({
        label: link.getAttribute('label'),
        url: link.getAttribute('url'),
      }));
  }

  getData() {
    return Object.assign({
      copyright: '\xA9 2018 Marzee Labs.',
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
    }, this.props);
  }

  renderBlock() {
    const data = this.getData();

    return (
      <footer className="footer">
        <ul className="footer__menu">
          { data.links.map(link => (
            <li className="footer__menu-item" key={ `link-${link.label}` }>
              <a href={ link.url }>
                { link.label }
              </a>
            </li>
          )) }
        </ul>

        <SocialIcons section="footer" { ...data } />

        <div className="footer__copyright">
          <a href={ data.homelink } className="footer__copyright-logo">
            <svg>
              <use xlinkHref="#logo-main" />
            </svg>
          </a>
          <p>
            { data.copyright }
          </p>
        </div>

      </footer>
    );
  }
}
