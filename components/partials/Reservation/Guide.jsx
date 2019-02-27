import React, { PureComponent } from 'react';

const split = (str, options) => {
  let exploded = (typeof str === 'string') ? [ str ] : str;

  Object.keys(options).forEach((key) => {
    const newExploded = exploded.map((portion) => {
      if (typeof portion === 'string' && portion.indexOf(`%${key}`) !== -1) {
        const portionSplit = portion.split(`%${key}`);

        portionSplit.splice(1, 0, (
          <span key={ `split-text--${key}` } className={ `split-text--${key}` }>
            { options[key] }
          </span>
        ));

        return portionSplit;
      }

      return portion;
    });

    let toMerge = [];

    newExploded.forEach((value) => {
      if (value) {
        if (Array.isArray(value)) {
          toMerge = toMerge.concat(value);
        }
        else {
          toMerge.push(value);
        }
      }
    });

    exploded = toMerge;
  });

  return exploded.map((value) => {
    if (typeof value === 'string') {
      return (
        <span key={ `notext-${value}` }>{ value }</span>
      );
    }

    return value;
  });
};

const isWeekend = (dates) => {
  if (dates) {
    const date1 = new Date(dates[0]);
    const date2 = new Date(dates[1]);

    while (date1 <= date2) {
      const day = date1.getDay();
      if (day === 6 || day === 0) {
        return true;
      }

      date1.setDate(date1.getDate() + 1);
    }
  }

  return false;
};

export default class ReservationGuide extends PureComponent {
  isEverything() {
    const { state } = this.props;

    const {
      dates,
      mode,
      options,
      people,
    } = state;

    if (!dates) {
      return false;
    }

    const days = [
      dates[0].toLocaleDateString ? dates[0].toLocaleDateString() : dates[0].toString(),
      dates[1].toLocaleDateString ? dates[1].toLocaleDateString() : dates[1].toString(),
    ];

    const today = new Date();
    const apocalypse = new Date();
    apocalypse.setFullYear(apocalypse.getFullYear() + 1);

    const limits = [
      today.toLocaleDateString ? today.toLocaleDateString() : today.toString(),
      apocalypse.toLocaleDateString ? apocalypse.toLocaleDateString() : apocalypse.toString(),
    ];

    if (days[0] !== limits[0] || days[1] !== limits[1]) {
      return false;
    }

    if (mode !== 'booking') {
      return false;
    }

    if (Object.values(options).some(value => !value)) {
      return false;
    }

    if (people !== 4 && people !== '4') {
      return false;
    }

    return true;
  }

  render() {
    const {
      strings,
      state,
    } = this.props;

    const {
      index,
      dates,
      time,
      mode,
      options,
      people,
    } = state;

    const hasOptions = Object.keys(options).some(key => options[key]);
    const days = dates && [
      dates[0].toLocaleDateString ? dates[0].toLocaleDateString() : dates[0].toString(),
      dates[1].toLocaleDateString ? dates[1].toLocaleDateString() : dates[1].toString(),
    ];

    let status = '';
    if (days) {
      const dateStr = days[0] === days[1] ? days[0] : `${days[0]} - ${days[1]}`;

      if (mode === 'booking') {
        if (people > 1) {
          status = split(strings.status.bookingPeople, {
            date: dateStr,
            people,
          });
        }
        else {
          status = split(strings.status.booking, {
            date: dateStr,
          });
        }
      }
      else if (time) {
        status = split(strings.status.visitTime, {
          date: dateStr,
          time,
        });
      }
      else {
        status = split(strings.status.visitDate, {
          date: dateStr,
        });
      }
    }

    const guide = [];
    switch (index) {
      case 0:
        guide.push({
          key: 'calendar',
          text: strings.guide.calendar,
        });

        if (isWeekend(dates)) {
          guide.push({
            key: 'weekend',
            text: strings.guide.weekend,
          });
        }
        break;

      case 1:
        if (mode === 'visit') {
          guide.push({
            key: 'time',
            text: strings.guide.time,
          });
        }
        else if (mode === 'booking') {
          guide.push({
            key: 'extras',
            text: strings.guide.extras,
          });
        }
        break;

      case 2:
        guide.push({
          key: 'info',
          text: strings.guide.info,
        });
        break;

      default:
        break;
    }

    return (
      <div className="reservation-guide__content">
        { !guide.length ? null : (
          <div className="reservation-guide__guide">
            { guide.map(line => (
              <p className="reservation-guide__guide-line" key={ `guide-line-${line.key}` }>
                { line.text }
              </p>
            )) }
          </div>
        ) }

        { status && (
          <div className="reservation-guide__dates">
            { status }
          </div>
        ) }

        { hasOptions && (
          <div className="reservation-guide__options">
            <div>
              { strings.status.options }
            </div>
            <ul>
              { Object.keys(options)
                .filter(key => options[key])
                .map(key => (
                  <li key={ `option-${key}` }>
                    { options[key] }
                  </li>
                ))
              }
            </ul>
          </div>
        ) }

        { this.isEverything() && (
          <div className="reservation-guide__fries">
            { strings.status.fries }
          </div>
        ) }
      </div>
    );
  }
}
