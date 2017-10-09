import React from 'react';
import BesugoComponent from 'Besugo';

class Previews extends BesugoComponent {
  static get config() {
    return {
      styles: [
        "/css/app.css",
        "https://fonts.googleapis.com/css?family=Muli:300,400,700"
      ]
    };
  }
};

Previews.initialize();
export default Previews;
