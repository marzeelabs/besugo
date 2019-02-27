import React from 'react';
import BesugoComponent from 'Besugo';

import SrcSet from 'partials/SrcSet';

// Extra options can be passed mapped to the config prop when referencing the
// react component, or mapped as individual attributes within hugo templates.
// Ref for all available options: https://github.com/ganlanyuan/tiny-slider

const config = {
  mode: 'gallery',
  nav: false,
  autoplayButtonOutput: false,
};

export default class SlideShow extends BesugoComponent {
  static config = {
    tag: 'SlideShow',
  }

  static extraProps(props, xplaceholder) {
    props.slides = xplaceholder
      .getChildren('SlideShowSlide')
      .map(slide => ({
        title: slide.getAttribute('title'),
        image: slide.getAttribute('image'),
        caption: slide.getAttribute('caption') || null,
        link: !slide.hasAttribute('link-label') ? null : {
          label: slide.getAttribute('link-label'),
          url: slide.getAttribute('link-url') || '#',
        },
      }));

    props.settings = xplaceholder.attributesOf();
  }

  componentDidMount() {
    const { tns } = require('tiny-slider/src/tiny-slider');
    const settings = {
      ...config,
      ...this.props.settings,
      container: this.props.prebuilt ? this.props.getContainer() : this.container,
    };

    if (settings.navAsThumbnails && !settings.navContainer) {
      settings.navContainer = this.thumbnails;
    }

    if (settings.prevButton === undefined) {
      settings.prevButton = this.prevButton;
    }

    if (settings.nextButton === undefined) {
      settings.nextButton = this.nextButton;
    }

    // Carousel mode doesn't work in the admin preview screen.
    if (typeof CMS !== 'undefined') {
      settings.mode = 'gallery';
    }

    tns(settings);
  }

  buildSlides(data) {
    let i = 0;
    return data.slides.map(slide => (
      <div className="teaser__wrapper" key={ `slide-${i++}` }>
        <div className="teaser__text">
          { slide.title && (
            <p className="teaser__text-content">
              { slide.title }
            </p>
          ) }
          { (slide.caption) && (
            <p className="teaser__text-content teaser__text-content--bg">
              { slide.caption }
            </p>
          ) }
          { (slide.link) && (
            <p className="teaser__text-content teaser__text-content__link">
              <a href={ slide.link.url } className="link__button-white-secondary">
                { slide.link.label }
              </a>
            </p>
          ) }
        </div>
        <SrcSet
          className="teaser__element"
          src={ slide.image }
          sizes={ data.sizes }
        />
      </div>
    ));
  }

  buildThumbnails(data) {
    let i = 0;
    return data.slides && data.slides.map(slide => (
      <div className="slider__thumbnail-item" key={ `slide-thumbnail-${i++}` }>
        <SrcSet
          className="slider__thumbnail"
          src={ slide.image }
          sizes="140px"
        />
      </div>
    ));
  }

  render() {
    const data = this.props;
    const thumbnails = data.settings && data.settings.navAsThumbnails;
    const classes = [
      'slider__wrapper',
    ];

    if (data.className || data.classname) {
      classes.push(data.className || data.classname);
    }

    return (
      <div className={ classes.join(' ') }>
        <div className="slider__overlay">
          { data.prebuilt ? data.prebuilt : (
            <div
              className="slider__container"
              ref={ (div) => { this.container = div; } }
            >
              { this.buildSlides(data) }
            </div>
          ) }

          <div
            className="slider__arrow-mz slider__arrow-mz--left"
            ref={ (div) => { this.prevButton = div; } }
          >
            <svg>
              <use xlinkHref="#slider_arrow_left" />
            </svg>
          </div>
          <div
            className="slider__arrow-mz slider__arrow-mz--right"
            ref={ (div) => { this.nextButton = div; } }
          >
            <svg>
              <use xlinkHref="#slider_arrow_right" />
            </svg>
          </div>
        </div>

        { thumbnails && (
          <div
            className="slider__thumbnail--wrapper"
            ref={ (div) => { this.thumbnails = div; } }
          >
            { this.buildThumbnails(data) }
          </div>
        ) }
      </div>
    );
  }
}
