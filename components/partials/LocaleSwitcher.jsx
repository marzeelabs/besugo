import React, { PureComponent } from 'react';

export default class LocaleSwitcher extends PureComponent {
  render() {
    const {
      locale,
      localeSwitches,
    } = this.props;

    return !localeSwitches.length ? null : (
      <li className="locale-switcher">
        { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
        <a>{ locale.toUpperCase() }</a>

        <ul className="locale-switcher__list">
          { localeSwitches.map(localeSwitch => (
            <li
              className="locale-switcher__locale"
              key={ `locale-switcher-${localeSwitch.locale}` }
            >
              <a
                className="locale-switcher__locale-link"
                href={ localeSwitch.url }
              >
                { localeSwitch.locale.toUpperCase() }
              </a>
            </li>
          )) }
        </ul>
      </li>
    );
  }
}
