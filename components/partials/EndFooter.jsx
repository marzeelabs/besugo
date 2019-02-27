import React from 'react';
import BesugoComponent from 'Besugo';
import ReactHtmlParser from 'react-html-parser';

import SocialIcons from 'partials/SocialIcons';

const cns = 'footer';

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

    const copyright = xplaceholder.getChildren('Copyright');
    props.copyright = JSON.parse(copyright[0].text());
  }

  getData() {
    const data = Object.assign({
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

    // "Copyright" comes pre-built with HTML markup already.
    // We need to parse it so that it doesn't show up as simple text
    data.copyright = ReactHtmlParser(data.copyright);

    return data;
  }

  renderBlock() {
    const data = this.getData();

    return (
      <footer className={ `${cns}` }>
        <ul className={ `${cns}__menu` }>
          { data.links.map(link => (
            <li className={ `${cns}__menu-item` } key={ `link-${link.label}` }>
              <a href={ link.url }>
                { link.label }
              </a>
            </li>
          )) }
        </ul>

        <SocialIcons section="footer" { ...data } />

        <div className={ `${cns}__copyright` }>
          <a href={ data.homelink } className={ `${cns}__copyright-logo` }>
            <svg>
              <use xlinkHref="#logo-main" />
            </svg>
          </a>
          <div className={ `${cns}__copyright-text` }>
            { data.copyright }
          </div>
        </div>

      </footer>
    );
  }
}
