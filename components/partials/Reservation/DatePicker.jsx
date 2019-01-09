import React, { Component } from 'react';
import Calendar from 'react-calendar';
import { formatShortWeekday } from 'react-calendar/src/shared/dateFormatter';

const config = {
  calendarType: 'ISO 8601',
  minDetail: 'year',
  next2Label: null,
  prev2Label: null,
  selectRange: true,
};

export default class DatePicker extends Component {
  state = {
    isMounted: false,
  }

  componentDidMount() {
    this.setState({
      isMounted: true,
    });
  }

  handleCalendarValue = (value) => {
    const dates = Array.isArray(value) ? value : [ value, value ];
    const { state } = this.props;

    if (!state.dates
    || dates.length !== state.dates.length
    || dates[0].toLocaleDateString() !== state.dates[0].toLocaleDateString()
    || dates[1].toLocaleDateString() !== state.dates[1].toLocaleDateString()) {
      const mode = dates[0].toLocaleDateString() !== dates[1].toLocaleDateString() ? 'booking' : state.mode;

      state.set({
        dates,
        mode,
      });
    }
  }

  render() {
    const { locale } = this.props;

    const { isMounted } = this.state;

    // Avoid out-of-sync errors when hydrating, since during SSR we would get
    // the server's date and not the current client date. The default is not
    // important, it will be replaced when the page is loaded.
    if (isMounted) {
      const date = new Date();
      const maxdate = new Date();
      maxdate.setFullYear(date.getFullYear() + 1);

      config.activeStartDate = date;
      config.minDate = date;
      config.maxDate = maxdate;
    }
    else {
      config.activeStartDate = new Date('September 30, 2018');
      config.minDate = new Date('September 30, 2018');
      config.maxDate = new Date('December 31, 2019');
    }

    config.locale = locale;
    config.onChange = this.handleCalendarValue;
    config.onClickDay = this.handleCalendarValue;

    // In pt, the 'short' date formatter still shows a full word for days; e.g. "Domingo".
    // This is still too long for our calendar display, so we force-shorten it.
    config.formatShortWeekday = (d, l) => formatShortWeekday(d, l).substr(0, 3);

    return (
      <div className="reservation__panel">
        <Calendar { ...config } />
      </div>
    );
  }
}
