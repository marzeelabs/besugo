import React, { PureComponent } from 'react';

export default class Info extends PureComponent {
  handleInput = (e) => {
    const { state } = this.props;
    const { target } = e;
    const name = target.getAttribute('name');

    if (state[name] !== target.value) {
      state.set({
        [name]: target.value,
      });
    }
  }

  render() {
    const {
      slideIndex,
      strings,
      state,
    } = this.props;

    const { index } = state;

    return (
      <div className="reservation__info-container reservation__panel">
        <div className="reservation__info-name__container">
          <div className="reservation__info-name__label">
            { strings.info.name }
          </div>
          <input
            type="text"
            name="name"
            className="reservation__info-name__input"
            disabled={ slideIndex !== index }
            required
            size="45"
            onInput={ this.handleInput }
          />
        </div>
        <div className="reservation__info-email__container">
          <div className="reservation__info-email__label">
            { strings.info.email }
          </div>
          <input
            type="email"
            name="email"
            className="reservation__info-email__input"
            disabled={ slideIndex !== index }
            required
            size="45"
            onInput={ this.handleInput }
          />
        </div>
        <div className="reservation__info-notes__container">
          <div className="reservation__info-notes__label">
            { strings.info.notes }
          </div>
          <textarea
            name="message"
            className="reservation__info-notes__input"
            disabled={ slideIndex !== index }
            cols="44"
            rows="4"
            onInput={ this.handleInput }
          />
        </div>
      </div>
    );
  }
}
