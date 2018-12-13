import React, { PureComponent } from 'react';

const cns = 'reservation-finished';

export default class ReservationFinished extends PureComponent {
  componentDidUpdate() {
    const { state } = this.props;
    if (state.index > state.lastIndex) {
      console.log(state);
    }
  }

  render() {
    const {
      strings,
      state,
    } = this.props;

    const { mode } = state;

    return (
      <div className={ `${cns}__container reservation__panel` }>
        <div className={ `${cns}__icon` }>
          <svg>
            <use xlinkHref="#submit_baloon" />
          </svg>
        </div>
        <div className={ `${cns}__title` }>
          { strings.finished.title }
        </div>
        <div className={ `${cns}__message` }>
          { mode === 'visit'
            ? strings.finished.messageVisit
            : strings.finished.messageBooking
          }
        </div>
      </div>
    );
  }
}
