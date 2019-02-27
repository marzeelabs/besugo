import React from 'react';
import BesugoComponent from 'Besugo';
import ReactHtmlParser from 'react-html-parser';

import EndFooter from 'partials/EndFooter';
import getData from 'partials/Reservation/getData';
import ReservationSlider from 'partials/Reservation/Slider';
import SlideShow from 'partials/SlideShow';
import { SrcSetBg } from 'partials/SrcSet';
import SVGElements from 'partials/SVGElements';
import TopHeader from 'partials/TopHeader';

import Amenity from 'location/Amenity';

export default class Location extends BesugoComponent {
  static config = {
    tag: 'Location',
    categories: [ 'location', 'location-pt' ],
  }

  static extraProps(props, xplaceholder) {
    const content = xplaceholder.getChildren('Content');
    props.content = JSON.parse(content[0].text());

    props.features = xplaceholder
      .getChildren('Feature')
      .map(feature => ({
        title: feature.getAttribute('title'),
        icon: feature.getAttribute('icon'),
      }));

    props.slides = xplaceholder
      .getChildren('GalleryImage')
      .map(image => ({
        image: image.getAttribute('image'),
        caption: image.getAttribute('caption'),
      }));

    // Data for the Resrevations widget.
    getData(props, xplaceholder);
  }

  getMapSrc(map) {
    // Get the src attribute from a full maps embed string.
    if (map && map.indexOf('<iframe') === 0) {
      const div = document.createElement('div');
      div.innerHTML = map;
      return div.firstChild.getAttribute('src');
    }

    return map;
  }

  getData() {
    if (this.isPreview()) {
      const { entry, getAsset, widgetFor } = this.props;
      const data = entry.getIn([ 'data' ]);

      return {
        name: data.getIn([ 'title' ]),
        catchphrase: data.getIn([ 'catchphrase' ]),
        content: widgetFor('body'),
        header: data.getIn([ 'header' ]) ? getAsset(data.getIn([ 'header' ])).toString() : '',
        map: this.getMapSrc(data.getIn([ 'map' ])),
        features: (data.getIn([ 'features' ]) || [])
          .map(perc => ({
            title: perc.getIn([ 'title' ]),
            icon: perc.getIn([ 'icon' ]),
          })),
        slides: (data.getIn([ 'images' ]) || [])
          .map(image => ({
            caption: image.getIn([ 'caption' ]),
            image: image.getIn([ 'image' ]) ? getAsset(image.getIn([ 'image' ])).toString() : '',
          })),
      };
    }

    const data = Object.assign({}, this.props);

    // "Content" comes pre-built with HTML markup already.
    // We need to parse it so that it doesn't show up as simple text
    data.content = ReactHtmlParser(data.content);

    data.map = this.getMapSrc(data.map);

    return data;
  }

  renderGallery(data) {
    return !data.slides.length && !data.slides.size ? null : (
      <SlideShow
        slides={ data.slides }
        settings={ {
          autoplay: true,
          autoplayTimeout: 5000,
          nav: true,
          navAsThumbnails: true,
        } }
        className="location__gallery"
        sizes="100vw"
      />
    );
  }

  renderFeatures(data) {
    return !data.features.length && !data.features.size ? null : (
      <div className="location__amenities-wrapper">
        <h1 className="location__amenities-title">
          { data.amenitiestitle }
        </h1>

        <ul className="location__amenities">
          { data.features.map(feature => (
            <li
              className="location-amenity__wrapper"
              key={ `amenity-${feature.title}` }
            >
              <Amenity { ...feature } />
            </li>
          )) }
        </ul>
      </div>
    );
  }

  renderBlock() {
    const data = this.getData();

    return (
      <div className="page-main">
        <div className="location__header">
          <SrcSetBg
            className="location__header-image"
            src={ data.header }
            sizes="120vw"
          />
          <div className="location__header-title-wrapper">
            <h1 className="location__header-title">
              { data.name }
            </h1>
          </div>
        </div>

        <div className="location__content location__content--contained">
          <div className="location__description">
            { data.content }
          </div>

          { this.renderGallery(data) }

          { this.renderFeatures(data) }

          { data.map && (
            <div className="location__map">
              <iframe
                src={ data.map }
                title="location-map"
                width="100%"
                height="450"
                frameBorder="0"
              />
            </div>
          ) }
        </div>

        <div className="location__content location__content--contained">
          { this.isPreview() ? null : (
            <div className="location__reservation">
              <h1 className="location__reservation-title">
                { data.reservationtitle }
              </h1>
              <ReservationSlider { ...data } />
            </div>
          ) }

          <div className="location__catchphrase">
            { data.catchphrase }
          </div>
        </div>
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
