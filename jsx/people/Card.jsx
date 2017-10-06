import React from 'react';
import BesugoComponent from 'Besugo';
import SocialIcons from 'partials/SocialIcons';

class PersonCard extends BesugoComponent {
  constructor(props) {
    super(props);
  }

  static get config() {
    return {
      tag: "PersonCard"
    };
  }

  getData() {
    const data = Object.assign({}, this.props);

    if(this.props.xplaceholder) {
      const textContent = this.props.xplaceholder.textContent.trim();
      const jsondata = JSON.parse(textContent);
      Object.assign(data, jsondata);
    }

    // Trim the summary to fit in a smaller card.
    if(data.Summary.length > 144) {
      data.Summary = data.Summary.substring(0, 144) + '...';
    }

    return data;
  }

  render() {
    const data = this.getData();

    return (
      <li className="profile">
        <div className="profile__image__wrapper">
          <a href={ data.link } target="_self">
            <img className="profile__image" src={ data.Params.image } />
          </a>
        </div>

        <div className="profile__text__wrapper">

          <a href={ data.link } target="_self" className="profile__text-link">
            <h3 className="profile__text">{ data.Title }</h3>
          </a>

          <p className="profile__text">{ data.Summary }</p>
          <span className="profile__text">
            <SocialIcons section="profile" { ...data } />
          </span>
        </div>
      </li>
    );
  }
};

PersonCard.initialize();
export default PersonCard;
