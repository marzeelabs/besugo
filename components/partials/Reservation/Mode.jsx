import React, { Component } from 'react';

const cns = 'reservation-mode';

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
      <div className={ `${cns}__wrapper` }>
        { [ 'visit', 'booking' ].map(name => (
          <label
            className={ `${cns}__radiobtn` }
            htmlFor={ name }
            key={ `name-${name}` }
            disabled={ (name === 'visit' && !singleDay) || (slideIndex !== index) }
          >
            <span className={ `${cns}__label` }>
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
            <span className={ `${cns}__radiobtn-checkmark` } />
          </label>
        )) }
      </div>
    );
  }
}
