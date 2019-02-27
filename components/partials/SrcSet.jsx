import React from 'react';
import BesugoComponent from 'Besugo';

import classnames from 'classnames';

const buildSrcSet = (src) => {
  const sharpConfig = require('../../temp/sharpConfig');
  const chunks = src.split('.');
  const ext = chunks.pop();

  // We don't build a srcset if we won't have any responsive images built for this src image.
  if (sharpConfig.types.indexOf(ext.toLowerCase()) === -1) {
    return null;
  }

  const path = chunks.join('.');
  return sharpConfig.sizes
    .map(size => `${path}${size.suffix}.${ext} ${size.width}w`)
    .join(', ');
};

export default class SrcSet extends BesugoComponent {
  static config = {
    tag: 'SrcSet',
  }

  static buildContainer(parserUtils, props) {
    const { className, classname, wrapperclass } = props;
    const div = parserUtils.createNode('div');
    const classes = [];

    if (className || classname) {
      classes.push(`${className || classname}-wrapper`);
    }

    if (wrapperclass) {
      classes.push(wrapperclass);
    }

    parserUtils.setAttribute(div, 'class', classes.join(' '));
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
    const data = this.getData();

    if (data.src.endsWith('.mp4')) {
      return (
        <SrcVideo { ...data } />
      );
    }

    // We always show the original image in the CMS pages, so that we're not dependent
    // on the build process as we edit the content.
    if (typeof CMS !== 'undefined') {
      return this.renderDefault();
    }

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
}

export class SrcSetBg extends BesugoComponent {
  static config = {
    tag: 'SrcSetBg',
  }

  constructor(props) {
    super(props);

    this._onLoad = null;
    this._onResize = null;
    this._resizeTimer = null;
  }

  renderDefault() {
    const data = this.props;

    return (
      <img
        { ...data }
        ref={ (img) => { this.domImg = img; } }
        style={ { display: 'none' } }
      />
    );
  }

  renderBlock() {
    const data = this.props;

    if (data.src.endsWith('.mp4')) {
      const wrapperClassName = classnames([
        'video-bg__wrapper',
        { [`${data.className}__wrapper`]: data.className },
      ]);

      return (
        <div className={ wrapperClassName }>
          <SrcVideo { ...data } />
        </div>
      );
    }

    // We always show the original image in the CMS pages, so that we're not dependent
    // on the build process as we edit the content.
    if (typeof CMS !== 'undefined') {
      return this.renderDefault();
    }

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
        style={ { display: 'none' }}
      />
    );
  }

  componentDidMount() {
    const data = this.props;

    if (data.src.endsWith('.mp4')) {
      return;
    }

    this.view().then((win) => {
      // We're applying the background to the parent element where this is appended by default,
      // unless the "bg-active-element" attribute is specified.
      const node = ('bg-active-element' in data) ? win.document.querySelector(data['bg-active-element']) : this.domImg.parentNode;
      if (!node) {
        return;
      }

      let activeSrc = null;
      this._onLoad = () => {
        const src = this.domImg.currentSrc || this.domImg.src;
        if (activeSrc !== src) {
          activeSrc = src;
          node.style.backgroundImage = `url("${src}")`;
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
      };
      win.addEventListener('resize', this._onResize);
    });
  }

  componentWillUnmount() {
    const data = this.props;

    if (data.src.endsWith('.mp4')) {
      return;
    }

    this.domImg.removeEventListener('load', this._onLoad);
    this.view().then((win) => {
      win.removeEventListener('resize', this._onResize);
    });
  }
}

export class SrcVideo extends BesugoComponent {
  static config = {
    tag: 'SrcVideo',
  }

  renderBlock() {
    const data = this.props;

    return (
      <video
        { ...data }
        autoPlay
        loop
        muted
      />
    );
  }
}
