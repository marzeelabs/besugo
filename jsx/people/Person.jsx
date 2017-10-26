import React from 'react';
import BesugoComponent from 'Besugo';
import ReactHtmlParser from 'react-html-parser';
import SVGElements from 'partials/SVGElements';
import SocialIcons from 'partials/SocialIcons';
import TopHeader from 'partials/TopHeader';
import EndFooter from 'partials/EndFooter';

export default class Person extends BesugoComponent {
  constructor(props) {
    super(props);
  }

  static get config() {
    return {
      tag: "Person",
      categories: [ "people", "people-pt" ]
    };
  }

  static extraProps(props, xplaceholder) {
    const textContent = xplaceholder.text();
    const jsondata = JSON.parse(textContent);
    Object.assign(props, jsondata);
  }

  getData() {
    if(this.isPreview()) {
      const entry = this.props.entry;

      return {
        Title: entry.getIn(['data', 'title']),
        Content: this.props.widgetFor('body'),
        Params: {
          image: entry.getIn(['data', 'image']) ? this.props.getAsset(entry.getIn(['data', 'image'])).toString() : '/admin/default.jpg'
        }
      };
    }

    const data = Object.assign({}, this.props);

    // "Content" comes pre-built with HTML markup already. We need to parse it so that it doesn't show up as simple text.
    data.Content = ReactHtmlParser(data.Content);

    return data;
  }

  renderBlock() {
    const data = this.getData();

    return (
      <div>
        <div className="profile__header">
          <img className="profile__header__image-bg" src={ data.Params.image } />
        </div>

        <div className="profile__header-info">
          <div className="profile__header-info__image__wrapper">
             <img className="profile__header-info__image" src={ data.Params.image } />
          </div>

          <h1 className="profile__header-info__title">{ data.Title }</h1>

          <SocialIcons section="profile" { ...data } />
        </div>

        <section className="layout-container--inner">
          <div className="profile__bio-content">
            { data.Content }
          </div>
        </section>
      </div>
    );
  }

  renderPreview() {
    return (
      <div id="cmsPreview">
        <SVGElements/>
        <TopHeader/>
        { this.renderBlock() }
        <EndFooter/>
      </div>
    );
  }
};
