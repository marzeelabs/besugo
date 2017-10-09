import React from 'react';
import BesugoComponent from 'Besugo';
import $ from 'jquery';
import 'slick-carousel';

const config = {
  autoplay: true,
  autoplaySpeed: 5000,
  fade: true,
  speed: 1200,
  prevArrow: '<a href="#" class="slick-prev"><span class="slick-arrow-mz slick-arrow-mz--left"><svg><use xlink:href="#slider_arrow_left"></use></svg></span></a>',
  nextArrow: '<a href="#" class="slick-next"><span class="slick-arrow-mz slick-arrow-mz--right"><svg><use xlink:href="#slider_arrow_right"></use></svg></span></a>'
};

class SlideShow extends BesugoComponent {
  static get config() {
    return {
      tag: 'SlideShow'
    };
  }

  getData() {
    const data = Object.assign({
      slides: []
    }, this.props);

    if(this.props.xplaceholder) {
      const slides = this.props.xplaceholder.querySelectorAll('SlideShowSlide');
      slides.forEach(function(slide) {
        data.slides.push({
          title: slide.getAttribute('title'),
          image: slide.getAttribute('image'),
          link: {
            label: slide.getAttribute('link-label'),
            url: slide.getAttribute('link-url')
          }
        });
      });
    }

    return data;
  }

  componentDidMount() {
    // It would be SO MUCH BETTER if we could use react-slick (https://github.com/akiran/react-slick),
    // but that has trouble in the CMS preview page, likely because we're running in the parent frame but
    // building in an inner frame (fails to find the DOM node: "unable to find node on an unmounted component").
    // And simply injecting the main.min.js file won't work because the component keeps rebuilding, so we have
    // to constantly reinitialize it. Hence this "hybrid" approach.
    // PS. Couldn't find other react-based carousel modules that supported a fade animation like slick does.
    $(this.wrapper).slick(config);
  }

  buildSlides(data) {
    let i = 0;
    return data.slides && data.slides.map(function(slide) {
      return (
        <div className="teaser__wrapper" key={ "slide-" + (i++) }>
          <div className="teaser__text">
            <p className="teaser__text-content">{ slide.title }</p>
            <p className="teaser__text-content">
              <a href={ slide.link.url } className="link__button-white-secondary">{ slide.link.label }</a>
            </p>
          </div>
          <img className="teaser__element" src={ slide.image }/>
        </div>
      )
    })
  }

  render() {
    const data = this.getData();

    return (
      <div
        className="slider__wrapper"
        ref={ (wrapper) => { this.wrapper = wrapper; } }>

        { this.buildSlides(data) }
      </div>
    );
  }
};

SlideShow.initialize();
export default SlideShow;
