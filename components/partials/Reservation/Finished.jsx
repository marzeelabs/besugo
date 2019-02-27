import React, { PureComponent } from 'react';

export default class ReservationFinished extends PureComponent {
  render() {
    const {
      strings,
      state,
      email,
    } = this.props;

    const {
      mode,
      finished,
      failed,
    } = state;

    const title = [];
    const message = [];

    if (failed) {
      title.push(strings.finished.failed);
      message.push(strings.finished.messageFailed);
      message.push(<a href={ `mailto:${email}` } key="text-email">{ email }</a>);
    }
    else if (finished) {
      // eslint-disable-next-line prefer-destructuring
      title.push(strings.finished.title);

      if (mode === 'visit') {
        message.push(strings.finished.messageVisit);
      }
      else {
        message.push(strings.finished.messageBooking);
      }
    }
    else {
      title.push(strings.finished.sending);
    }

    return (
      <div className="reservation-finished__container reservation__panel">
        <div className="reservation-finished__icon">
          <svg>
            <use xlinkHref="#submit_baloon" />
          </svg>
        </div>
        <div className="reservation-finished__title">
          { title }
        </div>

        { !message.length ? null : (
          <div className="reservation-finished__message">
            { message.map((text, i) => (
              /* eslint-disable-next-line react/no-array-index-key */
              <p key={ `text-${i}` }>
                { text }
              </p>
            )) }
          </div>
        ) }
      </div>
    );
  }
}
