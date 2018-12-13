import React from 'react';
import BesugoComponent from 'Besugo';

const cns = 'location-amenity';

export default class Amenity extends BesugoComponent {
  static config = {
    tag: 'Amenity',
  }

  static buildContainer(parserUtils) {
    const li = parserUtils.createNode('li');
    parserUtils.setAttribute(li, 'class', `${cns}__wrapper`);

    return li;
  }

  render() {
    const data = this.props;

    return (
      <div key={data.title}>
        <span className={ `icon icon-${data.icon}` } />
        <span className={ `${cns}__title` }>
          { data.title }
        </span>
      </div>
    );
  }
}
