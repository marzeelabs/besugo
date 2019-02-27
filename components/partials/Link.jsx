import React, { PureComponent } from 'react';

export default class Link extends PureComponent {
  render() {
    const {
      className,
      label,
      url,
      external,
    } = this.props;

    if (external) {
      return (
        <a
          className={ className }
          href={ url }
          target="_blank"
          rel="noopener noreferrer"
        >
          { label }
        </a>
      );
    }

    return (
      <a
        className={ className }
        href={ url }
      >
        { label }
      </a>
    );
  }
}
