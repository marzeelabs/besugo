import React from 'react';
import BesugoComponent from 'Besugo';

export default class SocialIcons extends BesugoComponent {
  getData() {
    // Set some default props
    return {
      section: this.props.section || 'footer',
      social: this.props.social || {
        facebook: '#',
        instagram: '#',
        twitter: '#',
      },
    };
  }

  buildIcons(data) {
    return Object
      .keys(data.social)
      .map(x => this.buildIcon(data.section, x, data.social[x]));
  }

  buildIcon(section, icon, link) {
    // If an empty url was set, don't show the corresponding icon
    if (!link) {
      return null;
    }

    return (
      <li
        key={`social-li-${icon}`}
        className={`${section}__social-icons__item`}
      >
        <a href={link} target="_blank" rel="noopener noreferrer">
          <svg>
            <use xlinkHref={`#${icon.toLowerCase()}-icon`} />
          </svg>
        </a>
      </li>
    );
  }

  render() {
    const data = this.getData();

    return (
      <ul className={`${data.section}__social-icons`}>
        { this.buildIcons(data) }
      </ul>
    );
  }
}
