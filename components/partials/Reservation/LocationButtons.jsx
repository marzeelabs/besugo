import React, { Component } from 'react';
import classnames from 'classnames';

import makeSafeForCSS from 'utils/makeSafeForCSS';

const cns = 'reservation-location-buttons';

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
      <div className={ `${cns}__container` }>
        { buttons.map((button) => {
          const className = classnames([
            `${cns}__button`,
            `button-${makeSafeForCSS(button.label)}`,
            { [`${cns}__button--active`]: button.label === state.location },
          ]);

          return (
            <span
              className={ `${cns}__button-wrapper` }
              key={ `${cns}__button-${button.label}` }
            >
              <button
                type="button"
                className={ className }
                label={ button.label }
                onClick={ this.handleChangeLocation }
              >
                { button.label }

                <span className={ `${cns}__button-icon` }>
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
