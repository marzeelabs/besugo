import React from 'react';
import BesugoComponent from 'Besugo';

class SocialIcons extends BesugoComponent {
  constructor(props) {
    super(props);
  }

  getData() {
    // Set some default props
    return {
      section: this.props.section || "footer",
      social: this.props.social || {
        facebook: '#',
        instagram: '#',
        twitter: '#'
      }
    };
  }

  buildIcons(data) {
    let nodes = [];
    for(let x in data.social) {
      nodes.push(this.buildIcon(data.section, x, data.social[x]));
    }
    return nodes;
  }

  buildIcon(section, icon, link) {
    // If an empty url was set, don't show the corresponding icon
    if(!link) {
      return null;
    }

    return (
      <li
        key={ "social-li-" + icon }
        className={ section + "__social-icons__item" }>
        <a href={ link } target="_blank">
          <svg>
            <use href={ "#" + icon + "-icon" }></use>
          </svg>
        </a>
      </li>
    );
  }

  render() {
    const data = this.getData();

    return (
      <ul className={ data.section + "__social-icons" }>
        { this.buildIcons(data) }
      </ul>
    );
  }
};

SocialIcons.initialize();
export default SocialIcons;
