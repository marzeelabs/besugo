import React from 'react';
import BesugoComponent from 'Besugo';
import classnames from 'classnames';

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

const encode = data => Object.keys(data)
  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
  .join('&');

export default class ReservationSlider extends BesugoComponent {
  static config = {
    tag: 'ReservationSlider',
  }

  slider = null

  container = null

  btnNext = null

  btnPrevious = null

  form = null

  state = {
    isMounted: false,
    lastIndex: 2,

    index: 0,
    maxIndex: 0,
    finished: false,
    failed: false,

    location: '',
    dates: null,
    time: '',
    options: {},
    mode: 'visit',
    people: 1,
    name: '',
    email: '',
    message: '',

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

  componentDidUpdate() {
    const {
      index,
      lastIndex,
      failed,
      finished,

      location,
      dates,
      time,
      options,
      mode,
      people,
      name,
      email,
      message,
    } = this.state;

    const { locale } = this.props;

    if (failed || finished || index <= lastIndex) {
      return;
    }

    const days = [
      dates[0].toLocaleDateString ? dates[0].toLocaleDateString() : dates[0].toString(),
      dates[1].toLocaleDateString ? dates[1].toLocaleDateString() : dates[1].toString(),
    ];

    const data = {
      'form-name': 'reservation',
      locale,
      subject: `Porto i/o - ${mode} for ${name}`,
      location,
      dates: days[0] !== days[1] ? `${days[0]} to ${days[1]}` : days[0],
      time: '',
      people: '',
      extras: '',
      name,
      email,
      message,
      'winnie-the-pooh': this.form['winnie-the-pooh'].value,
    };

    if (mode === 'visit') {
      data.time = time;
    }
    else {
      data.people = people;
      data.extras = Object.values(options)
        .filter(value => value)
        .join(', ');
    }

    const { fetch } = window;

    fetch(this.form.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: encode(data),
    })
      .then((response) => {
        if (!response.ok) {
          // eslint-disable-next-line no-console
          console.error(response);

          this.setState({
            failed: true,
          });
        }
        else {
          this.setState({
            finished: true,
          });
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);

        this.setState({
          failed: true,
        });
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

  buildHiddenFields() {
    // These fields are only to allow Netlify to properly process all the data
    // on form submission.
    return [
      <input type="hidden" key="form-name" name="form-name" value="reservation" />,
      <input type="hidden" key="form-locale" name="locale" />,
      <input type="hidden" key="form-subject" name="subject" />,
      <input type="hidden" key="form-location" name="location" />,
      <input type="hidden" key="form-dates" name="dates" />,
      <input type="hidden" key="form-time" name="time" />,
      <input type="hidden" key="form-people" name="people" />,
      <input type="hidden" key="form-extras" name="extras" />,

      (
        <div key="form-winnie-the-pooh" style={ { display: 'none' } }>
          <input type="text" name="winnie-the-pooh" defaultValue="" />
        </div>
      ),
    ];
  }

  render() {
    const data = this.props;
    const { state } = this;

    const className = classnames([
      'reservation__wrapper',
      data.className || data.classname,
      { isMounted: state.isMounted },
      { lastSlide: state.index > state.lastIndex },
    ]);

    let nextDisabled = false;

    if (!state.dates
    || (state.index === state.lastIndex && (!state.name || !state.email))) {
      nextDisabled = true;
    }

    const nextClasses = classnames([
      'reservation__bottom-button',
      'reservation__bottom-button--next',
      { 'reservation__bottom-button--disabled': nextDisabled },
    ]);

    return (
      <div className={ className }>
        <form
          ref={(el) => { this.form = el; }}
          name="reservation"
          netlify="true"
          netlify-honeypot="foo-bar"
        >
          { this.buildHiddenFields() }

          <div className="reservation__top-section">
            <LocationButtons
              buttons={ data.buttons }
              state={ state }
            />

            <div className="reservation__panels" ref={(div) => { this.container = div; }}>
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
                email={ data.email }
              />
            </div>

            <Guide
              strings={ data.strings }
              state={ state }
            />

            <div className="reservation__controls">
              <button
                type="button"
                className="reservation__bottom-button reservation__bottom-button--previous"
                ref={(btn) => { this.btnPrevious = btn; }}
              >
                { data.strings.label.previous }
              </button>
              <button
                type="button"
                className={ nextClasses }
                ref={(btn) => { this.btnNext = btn; }}
              >
                { state.index === state.lastIndex
                  ? data.strings.label.finish
                  : data.strings.label.next
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
