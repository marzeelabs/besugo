import React, { PureComponent } from 'react';

const cns = 'locale-switcher';

export default class LocaleSwitcher extends PureComponent {
  render() {
    const {
      locale,
      localeSwitches,
    } = this.props;

    return !localeSwitches.length ? null : (
      <li className={ `${cns}` }>
        { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
        <a>{ locale.toUpperCase() }</a>

        <ul className={ `${cns}__list` }>
          { localeSwitches.map(localeSwitch => (
            <li
              className={ `${cns}__locale` }
              key={ `locale-switcher-${localeSwitch.locale}` }
            >
              <a
                className={ `${cns}__locale-link` }
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
