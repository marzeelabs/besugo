import React from 'react';
import BesugoComponent from 'Besugo';

import SocialIcons from 'partials/SocialIcons';
import SrcSet from 'partials/SrcSet';

export default class PersonCard extends BesugoComponent {
  static config = {
    tag: 'PersonCard',
  }

  static buildContainer(parserUtils) {
    const container = parserUtils.createNode('li');
    parserUtils.setAttribute(container, 'class', 'profile');
    return container;
  }

  getData() {
    const data = Object.assign({}, this.props);

    // Trim the summary to fit in a smaller card.
    if (data.summary) {
      data.summary = data.summary.trim();
      if (data.summary.length > 144) {
        data.summary = `${data.summary.substring(0, 144)}...`;
      }
    }

    return data;
  }

  render() {
    const data = this.getData();

    return (
      <div className="profile__wrapper">
        <div className="profile__image__wrapper">
          <a href={ data.link } target="_self">
            <SrcSet
              className="profile__image"
              src={ data.image }
              sizes="
                (max-width: 730px) 100vw,
                730px"
            />
          </a>
        </div>

        <div className="profile__text__wrapper">

          <a href={ data.link } target="_self" className="profile__text-link">
            <h3 className="profile__text">
              { data.title }
            </h3>
          </a>

          <p className="profile__text">
            { data.summary }
          </p>
          <span className="profile__text">
            <SocialIcons section="profile" {...data} />
          </span>
        </div>
      </div>
    );
  }
}
