import React from 'react';
import BesugoComponent from 'Besugo';

export default class SrcSet extends BesugoComponent {
  constructor(props) {
    super(props);
  }

  static get config() {
    return {
      tag: 'SrcSet'
    };
  }

  static buildContainer(parserUtils, props) {
    const div = parserUtils.createNode('div');
    parserUtils.setAttribute(div, 'class', (props.className || props.classname) + '-wrapper');
    return div;
  }

  getData() {
    const data = Object.assign({}, this.props);

    if (data.classname) {
      data.className = data.classname;
      delete data.classname;
    }

    return data;
  }

  renderDefault() {
    const data = this.getData();

    return (
      <img { ...data } />
    );
  }

  renderBlock() {
    // We always show the original image in the CMS pages, so that we're not dependent
    // on the build process as we edit the content.
    if(typeof(CMS) !== 'undefined') {
      return this.renderDefault();
    }

    const data = this.getData();

    // We can't build a srcset if we don't have an image path to use,
    // or if it won't have any sizes to calculate from.
    if (!data.src || !data.sizes) {
      return this.renderDefault();
    }

    const srcset = buildSrcSet(data.src);
    if (!srcset) {
      return this.renderDefault();
    }

    return (
      <img { ...data } srcSet={srcset} />
    );
  }
};

export class SrcSetBg extends BesugoComponent {
  constructor(props) {
    super(props);

    this._onLoad = null;
    this._onResize = null;
    this._resizeTimer = null;
  }

  static get config() {
    return {
      tag: 'SrcSetBg'
    };
  }

  renderDefault() {
    const data = this.props;

    return (
      <img
        { ...data }
        ref={ (img) => { this.domImg = img; } }
        style={ { display: 'none' }} />
    );
  }

  renderBlock() {
    // We always show the original image in the CMS pages, so that we're not dependent
    // on the build process as we edit the content.
    if(typeof(CMS) !== 'undefined') {
      return this.renderDefault();
    }

    const data = this.props;

    // We can't build a srcset if we don't have an image path to use,
    // or if it won't have any sizes to calculate from.
    if (!data.src || !data.sizes) {
      return this.renderDefault();
    }

    const srcset = buildSrcSet(data.src);
    if (!srcset) {
      return this.renderDefault();
    }

    return (
      <img
        { ...data }
        srcSet={srcset}
        ref={ (img) => { this.domImg = img; } }
        style={ { display: 'none' }} />
    );
  }

  componentDidMount() {
    const data = this.props;

    this.view().then((win) => {
      // We're applying the background to the parent element where this is appended by default,
      // unless the "bg-active-element" attribute is specified.
      const node = ("bg-active-element" in data) ? win.document.querySelector(data['bg-active-element']) : this.domImg.parentNode;
      if (!node) {
        return;
      }

      let activeSrc = null;
      this._onLoad = () => {
        let src = this.domImg.currentSrc || this.domImg.src;
        if (activeSrc !== src) {
          activeSrc = src;
          node.style.backgroundImage = 'url("' + src + '")';
        }
      };

      // Update the background source every time the "image" node loads a new picture.
      this.domImg.addEventListener('load', this._onLoad);
      if (this.domImg.complete) {
        this._onLoad();
      }

      // Check if we need to update the background source when we resize the window;
      // the load event doesn't necessarily fire every time the picture changes.
      this._onResize = () => {
        if (this._resizeTimer) {
          win.clearTimeout(this._resizeTimer);
        }

        this._resizeTimer = win.setTimeout(() => {
          this._onLoad();
        }, 50);
      }
      win.addEventListener('resize', this._onResize);
    });
  }

  componentWillUnmount() {
    this.domImg.removeEventListener('load', this._onLoad);
    this.view().then((win) => {
      win.removeEventListener('resize', this._onResize);
    });
  }
};

const buildSrcSet = function(src) {
  const sassConfig = require('../temp/sassConfig');
  const chunks = src.split('.');
  const ext = chunks.pop();

  // We don't build a srcset if we won't have any responsive images built for this src image.
  if (sassConfig.types.indexOf(ext) === -1) {
    return null;
  }

  const path = chunks.join('.');
  return sassConfig.sizes.map((size) => {
    return path + size.suffix + '.' + ext + ' ' + size.width + 'w';
  }).join(', ');
};
