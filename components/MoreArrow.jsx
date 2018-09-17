import React from 'react';
import BesugoComponent from 'Besugo';

export default class MoreArrow extends BesugoComponent {
  static config = {
    tag: 'MoreArrow',
  }

  getData() {
    return Object.assign({
      className: 'link-more',
      href: '#',
      target: '_self',
      label: 'More',
      selNext: '#next',
      selNavigation: '.navigation',
    }, this.props);
  }

  render() {
    const data = this.getData();

    return (
      <a
        className={ data.className }
        href={ data.href }
        target={ data.target }
        ref={(a) => { this.domMore = a; }}
      >
        { data.label }
      </a>
    );
  }

  componentDidMount() {
    const $ = require('jquery');
    const data = this.getData();

    $(this.domMore).click(() => {
      this.view().then((win) => {
        const nav = win.document.querySelector(data.selNavigation);
        const offset = nav ? $(nav).innerHeight() : 0;

        // Smooth scrolling
        $([ win.document.body, win.document.documentElement ]).animate({
          scrollTop: $(win.document.querySelector(data.selNext)).offset().top - offset,
        }, 600);
      });
    });
  }
}
