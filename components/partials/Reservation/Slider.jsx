import React from 'react';
import BesugoComponent from 'Besugo';

import makeSafeForCSS from 'utils/makeSafeForCSS';

import DatePicker from './DatePicker';
import Finished from './Finished';
import Guide from './Guide';
import Info from './Info';
import LocationButtons from './LocationButtons';
import Options from './Options';

import getData from './getData';

const config = {
  mode: 'carousel',
  loop: false,
  nav: false,
  autoplayButtonOutput: false,
  touch: false,
};

const cns = 'reservation';

export default class ReservationSlider extends BesugoComponent {
  static config = {
    tag: 'ReservationSlider',
  }

  slider = null

  container = null

  btnNext = null

  btnPrevious = null

  state = {
    isMounted: false,
    lastIndex: 2,

    index: 0,
    maxIndex: 0,
    location: '',
    dates: null,
    time: '',
    options: {},
    mode: 'visit',
    people: 1,
    name: '',
    email: '',
    notes: '',

    set: (state, callback) => this.setState(state, callback),
  }

  constructor(props) {
    super(props);

    props.options.forEach((option) => {
      this.state.options[makeSafeForCSS(option.label)] = false;
    });
  }

  static extraProps(props, xplaceholder) {
    getData(props, xplaceholder);
  }

  componentDidMount() {
    const { tns } = require('tiny-slider/src/tiny-slider');
    const settings = {
      ...config,
      ...this.props.settings,
      container: this.container,
    };

    settings.prevButton = this.btnPrevious;
    settings.nextButton = this.btnNext;

    this.slider = tns(settings);
    this.slider.events.on('indexChanged', this.handleSliderIndex);

    let { isMounted, location } = this.state;
    const { buttons } = this.props;

    if (!isMounted && buttons) {
      buttons.forEach((button) => {
        if (button.active) {
          location = button.label;
        }
      });

      if (!location) {
        location = buttons[0].label;
      }
    }

    isMounted = true;

    this.setState({
      isMounted,
      location,
    });
  }

  handleSliderIndex = (info) => {
    if (info.index !== this.state.index) {
      const { index } = info;
      // eslint-disable-next-line
      const maxIndex = Math.max(info.index, this.state.index);

      this.setState({
        index,
        maxIndex,
      });
    }
  }

  render() {
    const data = this.props;
    const { state } = this;

    const classes = [
      `${cns}__wrapper`,
      data.className || data.classname,
    ];

    const nextClasses = [
      `${cns}__bottom-button`,
      `${cns}__bottom-button--next`,
    ];

    if (!state.dates
    || (state.index === state.lastIndex && (!state.name || !state.email))) {
      nextClasses.push(`${cns}__bottom-button--disabled`);
    }

    return (
      <div
        className={ classes.join(' ') }
        index={ state.index }
      >
        <div className={ `${cns}__top-section` }>
          <LocationButtons
            buttons={ data.buttons }
            state={ state }
          />

          <div className={ `${cns}__panels` } ref={(div) => { this.container = div; }}>
            <DatePicker
              slideIndex={ 0 }
              locale={ data.locale }
              strings={ data.strings }
              state={ state }
            />

            <Options
              slideIndex={ 1 }
              strings={ data.strings }
              options={ data.options }
              state={ state }
            />

            <Info
              slideIndex={ 2 }
              strings={ data.strings }
              state={ state }
            />

            <Finished
              slideIndex={ 3 }
              strings={ data.strings }
              state={ state }
            />
          </div>

          <Guide
            strings={ data.strings }
            state={ state }
          />

          <div className={ `${cns}__controls` }>
            <button
              type="button"
              className={ `${cns}__bottom-button ${cns}__bottom-button--previous` }
              ref={(btn) => { this.btnPrevious = btn; }}
            >
              { data.strings.label.previous }
            </button>
            <button
              type="button"
              className={ nextClasses.join(' ') }
              ref={(btn) => { this.btnNext = btn; }}
            >
              { state.index === state.lastIndex
                ? data.strings.label.finish
                : data.strings.label.next
              }
            </button>
          </div>
        </div>
      </div>
    );
  }
}
