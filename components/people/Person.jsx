import React from 'react';
import BesugoComponent from 'Besugo';

import EndFooter from 'partials/EndFooter';
import SocialIcons from 'partials/SocialIcons';
import SrcSet from 'SrcSet';
import SVGElements from 'partials/SVGElements';
import TopHeader from 'partials/TopHeader';

export default class Person extends BesugoComponent {
  constructor(props) {
    super(props);
  }

  static get config() {
    return {
      tag: 'Person',
      categories: [ 'people', 'people-pt' ],
    };
  }

  getData() {
    if (this.isPreview()) {
      const { entry } = this.props;

      return {
        title: entry.getIn([ 'data', 'title' ]),
        content: this.props.widgetFor('body'),
        image: entry.getIn([ 'data', 'image' ]) ? this.props.getAsset(entry.getIn([ 'data', 'image' ])).toString() : '/admin/default.jpg',
      };
    }

    return this.props;
  }

  renderBlock() {
    const data = this.getData();

    return (
      <div>
        <div className="profile__header">
          <SrcSet
            className="profile__header__image-bg"
            src={ data.image }
            sizes="120vw"
          />
        </div>

        <div className="profile__header-info">
          <div className="profile__header-info__image__wrapper">
            <SrcSet
              className="profile__header-info__image"
              src={ data.image }
              sizes="
                (max-width: 500px) 100vw,
                500px"
            />
          </div>

          <h1 className="profile__header-info__title">
            { data.title }
          </h1>

          <SocialIcons section="profile" { ...data } />
        </div>

        <section className="layout-container--inner">
          <div className="profile__bio-content is-markdown">
            { data.content }
          </div>
        </section>
      </div>
    );
  }

  renderPreview() {
    return (
      <div id="cmsPreview">
        <SVGElements />
        <TopHeader />
        { this.renderBlock() }
        <EndFooter />
      </div>
    );
  }
}
