import React from 'react';
import BesugoComponent from 'Besugo';

export default class Amenity extends BesugoComponent {
  static config = {
    tag: 'Amenity',
  }

  static buildContainer(parserUtils) {
    const li = parserUtils.createNode('li');
    parserUtils.setAttribute(li, 'class', 'location-amenity__wrapper');

    return li;
  }

  render() {
    const data = this.props;

    return (
      <div key={data.title}>
        <span className={ `icon icon-${data.icon}` } />
        <span className="location-amenity__title">
          { data.title }
        </span>
      </div>
    );
  }
}
