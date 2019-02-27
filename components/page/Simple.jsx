import React from 'react';
import BesugoComponent from 'Besugo';
import ReactHtmlParser from 'react-html-parser';

import EndFooter from 'partials/EndFooter';
import { SrcSetBg } from 'partials/SrcSet';
import SVGElements from 'partials/SVGElements';
import TopHeader from 'partials/TopHeader';

const cns = 'page-simple';

export default class PageSimple extends BesugoComponent {
  static config = {
    tag: 'PageSimple',
    categories: [ 'pages', 'pages-pt' ],
  }

  static extraProps(props, xplaceholder) {
    const content = xplaceholder.getChildren('Content');
    props.content = JSON.parse(content[0].text());
  }

  getData() {
    if (this.isPreview()) {
      const { entry, getAsset, widgetFor } = this.props;
      const data = entry.getIn([ 'data' ]);

      return {
        title: data.getIn([ 'title' ]),
        subtitle: data.getIn([ 'subtitle' ]),
        image: data.getIn([ 'image' ]) ? getAsset(data.getIn([ 'image' ])).toString() : '',
        content: widgetFor('body'),
      };
    }

    const data = Object.assign({}, this.props);

    // "Content" comes pre-built with HTML markup already.
    // We need to parse it so that it doesn't show up as simple text
    data.content = ReactHtmlParser(data.content);

    return data;
  }

  renderBlock() {
    const data = this.getData();

    return (
      <div className="page-main">
        <div className={ `${cns}__header` }>
          { data.image && (
            <SrcSetBg
              className={ `${cns}__header-image` }
              src={ data.image }
              sizes="120vw"
            />
          ) }

          <div className={ `${cns}__header-title-wrapper` }>
            <h1 className={ `${cns}__header-title` }>
              { data.title }
            </h1>
            { data.subtitle && (
              <h2 className={ `${cns}__header-subtitle` }>{ data.subtitle }</h2>
            ) }
          </div>
        </div>

        <section className="layout-container--inner">
          { data.content }
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
