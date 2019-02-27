import React, { Component } from 'react';

export default class ReservationMode extends Component {
  handleToggleMode = (e) => {
    const mode = e.target.value;
    const { state } = this.props;

    if (mode !== state.mode) {
      state.set({
        mode,
      });
    }
  }

  render() {
    const {
      slideIndex,
      strings,
      state,
    } = this.props;

    const {
      index,
      mode,
      dates,
    } = state;

    const singleDay = !dates || dates[0].toLocaleDateString() === dates[1].toLocaleDateString();

    return (
      <div className="reservation-mode__wrapper">
        { [ 'visit', 'booking' ].map(name => (
          <label
            className="reservation-mode__radiobtn"
            htmlFor={ name }
            key={ `name-${name}` }
            disabled={ (name === 'visit' && !singleDay) || (slideIndex !== index) }
          >
            <span className="reservation-mode__label">
              { strings.mode[name] }
            </span>
            <input
              type="radio"
              id={ name }
              name="mode"
              value={name}
              checked={ mode === name }
              onChange={ this.handleToggleMode }
              disabled={ (name === 'visit' && !singleDay) || (slideIndex !== index) }
            />
            <span className="reservation-mode__radiobtn-checkmark" />
          </label>
        )) }
      </div>
    );
  }
}
