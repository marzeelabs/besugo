import React, { Component } from 'react';
import classnames from 'classnames';

import makeSafeForCSS from 'utils/makeSafeForCSS';

export default class ReservationLocationButtons extends Component {
  handleChangeLocation = (e) => {
    const { target } = e;
    const { state } = this.props;

    if (target.hasAttribute('label')) {
      const location = target.getAttribute('label');

      if (location !== state.location) {
        state.set({
          location,
        });
      }
    }
  }

  render() {
    const {
      buttons,
      state,
    } = this.props;

    return !buttons.length ? null : (
      <div className="reservation-location-buttons__container">
        { buttons.map((button) => {
          const className = classnames([
            'reservation-location-buttons__button',
            `button-${makeSafeForCSS(button.label)}`,
            { 'reservation-location-buttons__button--active': button.label === state.location },
          ]);

          return (
            <span
              className="reservation-location-buttons__button-wrapper"
              key={ `reservation-location-buttons__button-${button.label}` }
            >
              <button
                type="button"
                className={ className }
                label={ button.label }
                onClick={ this.handleChangeLocation }
              >
                { button.label }

                <span className="reservation-location-buttons__button-icon">
                  <svg>
                    <use xlinkHref="#location_icon" />
                  </svg>
                </span>
              </button>
            </span>
          );
        }) }
      </div>
    );
  }
}
