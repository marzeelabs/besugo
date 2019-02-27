import React from 'react';
import BesugoComponent from 'Besugo';

import SrcSet from 'partials/SrcSet';

export default class BlogTeaser extends BesugoComponent {
  static config = {
    tag: 'BlogTeaser',
  }

  static buildContainer(parserUtils) {
    const li = parserUtils.createNode('li');
    parserUtils.setAttribute(li, 'class', 'teaser-text-side__wrapper');

    return li;
  }

  renderBlock() {
    const data = this.props;

    return (
      <div className="teaser-text-side__container">
        <div className="teaser-text-side__image__wrapper">
          <a href={ data.url }>
            <SrcSet
              classname="teaser-text-side__image"
              src={ data.image }
              sizes="
                (max-width: 729px) 100vw,
                (max-width: 1024px) 60vw,
                705px"
            />
          </a>
        </div>

        <div className="teaser-text-side__text__wrapper">
          <p className="teaser-text-side__text">
            { data.title }
          </p>

          <span className="teaser-text-side__text__link">
            <a href={ data.url } className="link__button-black-secondary">{ data.more }</a>
          </span>
        </div>
      </div>
    );
  }
}
