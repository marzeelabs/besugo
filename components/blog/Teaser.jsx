import React from 'react';
import BesugoComponent from 'Besugo';

import SrcSet from 'partials/SrcSet';

const cns = 'teaser-text-side';

export default class BlogTeaser extends BesugoComponent {
  static config = {
    tag: 'BlogTeaser',
  }

  static buildContainer(parserUtils) {
    const li = parserUtils.createNode('li');
    parserUtils.setAttribute(li, 'class', `${cns}__wrapper`);

    return li;
  }

  renderBlock() {
    const data = this.props;

    return (
      <div className={ `${cns}__container` }>
        <div className={ `${cns}__image__wrapper` }>
          <a href={ data.url }>
            <SrcSet
              classname={ `${cns}__image` }
              src={ data.image }
              sizes="
                (max-width: 729px) 100vw,
                (max-width: 1024px) 60vw,
                705px"
            />
          </a>
        </div>

        <div className={ `${cns}__text__wrapper` }>
          <p className={ `${cns}__text` }>
            { data.title }
          </p>

          <span className={ `${cns}__text__link` }>
            <a href={ data.url } className="link__button-black-secondary">{ data.more }</a>
          </span>
        </div>
      </div>
    );
  }
}
