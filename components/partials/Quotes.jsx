import React from 'react';
import BesugoComponent from 'Besugo';

import SlideShow from 'partials/SlideShow';
import { SrcSetBg } from 'partials/SrcSet';

const settings = {
  autoplay: true,
  mode: 'carousel',
};

export default class Quotes extends BesugoComponent {
  static config = {
    tag: 'Quotes',
  }

  static extraProps(props, xplaceholder) {
    props.quotes = xplaceholder
      .getChildren('Quote')
      .map(location => ({
        author: location.getAttribute('author'),
        occupation: location.getAttribute('occupation'),
        picture: location.getAttribute('picture'),
        text: location.getAttribute('text'),
      }));
  }

  container = null;

  render() {
    const {
      className,
      classname,
      quotestitle,
      quotes,
    } = this.props;

    if (!quotes.length && !quotes.size) {
      return null;
    }

    const classes = [
      'quotes__wrapper',
      className || classname,
    ];

    const prebuilt = (
      <div className={ classes.join(' ') } ref={(div) => { this.container = div; }}>
        { quotes.map(quote => (
          <div className="quotes__quote" key={ `quote-${quote.author}` }>
            <div className="quotes__quote-text">
              { quote.text }
            </div>

            <div className="quotes__quote-picture">
              <SrcSetBg
                src={ quote.picture }
                sizes="60px"
              />
            </div>

            <div className="quotes__quote-author">
              { quote.author }
            </div>

            <div className="quotes__quote-occupation">
              { quote.occupation }
            </div>
          </div>
        )) }
      </div>
    );

    const getContainer = () => this.container;

    return (
      <div className="quotes">
        <div className="quotes__title">
          { quotestitle }
        </div>

        <SlideShow
          className="quotes__slider"
          prebuilt={ prebuilt }
          getContainer={ getContainer }
          settings={ settings }
        />
      </div>
    );
  }
}
