import React, { Component } from 'react';

import makeSafeForCSS from 'utils/makeSafeForCSS';
import Mode from './Mode';

const cns = 'reservation-options';

export default class ReservationOptions extends Component {
  state = {
    reached: false,
  }

  componentDidUpdate() {
    const { state } = this.props;
    const { maxIndex } = state;
    const { reached } = this.state;

    if (!reached && maxIndex >= 1) {
      // eslint-disable-next-line
      this.setState({ reached: true }, () => {
        state.set({
          time: '10:00',
        });
      });
    }
  }

  handleChangeTime = (e) => {
    const time = e.target.value;
    const { state } = this.props;

    if (time !== state.time) {
      state.set({
        time,
      });
    }
  }

  handleToggleOption = (e) => {
    const { state } = this.props;
    const { options } = state;
    const { target } = e;
    const name = target.getAttribute('name');

    if (name && name in options && target.checked !== !!options[name]) {
      options[name] = target.checked ? target.getAttribute('label') : false;
      state.set({ options });
    }
  }

  handleChangePeople = (e) => {
    const { state } = this.props;
    const { target } = e;
    const people = target.value;

    if (people !== state.people) {
      state.set({ people });
    }
  }

  buildVisit() {
    const {
      strings,
      state,
    } = this.props;

    const {
      time,
    } = state;

    return (
      <div className={ `${cns}__time-wrapper` }>
        <div className={ `${cns}__time-label` }>
          { strings.options.time }
        </div>
        <input
          type="time"
          className={ `${cns}__time-input` }
          min="10:00"
          max="18:00"
          onChange={ this.handleChangeTime }
          value={ time }
        />
        <div className={ `${cns}__time-office-hours` }>
          { strings.options.officeHours }
        </div>
      </div>
    );
  }

  buildBooking() {
    const {
      slideIndex,
      strings,
      options,
      state,
    } = this.props;

    const {
      index,
      people,
    } = state;

    return (
      <div className={ `${cns}__outer-wrapper` }>
        <div className={ `${cns}__people-label` }>
          { strings.options.howManyPeople }
        </div>
        <input
          type="number"
          className={ `${cns}__people-number` }
          disabled={ slideIndex !== index }
          min="1"
          max="4"
          onChange={ this.handleChangePeople }
          value={ people }
        />
        { options.map((option) => {
          const optionName = makeSafeForCSS(option.label);
          const optionId = `reservation-options__${makeSafeForCSS(option.label)}`;

          return (
            <div
              className={ `${cns}__wrapper` }
              key={ `reservation-options__${option.label}` }
            >
              <label
                className={ `${cns}__option` }
                disabled={ slideIndex !== index }
                htmlFor={ optionId }
              >
                <span className={ `${cns}__label` }>
                  { option.label }
                </span>
                <input
                  type="checkbox"
                  id={ optionId }
                  className={ `${cns}__input` }
                  disabled={ slideIndex !== index }
                  name={ optionName }
                  label={ option.label }
                  onClick={ this.handleToggleOption }
                />
                <span className={ `${cns}__checkmark` } />
              </label>
            </div>
          );
        }) }
      </div>
    );
  }

  render() {
    const {
      slideIndex,
      strings,
      state,
    } = this.props;

    return (
      <div className={ `${cns}__container reservation__panel` }>
        <Mode
          slideIndex={ slideIndex }
          strings={ strings }
          state={ state }
        />

        { state.mode === 'visit' ? this.buildVisit() : this.buildBooking() }
      </div>
    );
  }
}
