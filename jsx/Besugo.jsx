import React from 'react';
import ReactDOM from 'react-dom';

const initialized = new Set();

export default class BesugoComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  static initialize() {
    const Comp = this;
    const config = this.config;

    // There's no point in initializing the same component more than once.
    if(initialized.has(Comp)) {
      return;
    }
    initialized.add(Comp);

    // TODO: Implement some time eventually.
    // Initialization is a little non-standard; ideally we'd set .propTypes directly on each component,
    // but I'm having a little trouble concatenating the objects that way, so setting propTypes in config instead.
    // if(config.propTypes) {
    //   Object.assign(Comp.propTypes, config.propTypes);
    // }

    // If we're in the CMS admin pages, load the necessary components as preview components of those content types
    if(typeof(CMS) !== 'undefined') {
      const cats = Array.isArray(config.categories) ? config.categories : [ config.categories ];

      cats.forEach(function(cat) {
        CMS.registerPreviewTemplate(cat, Comp);
      });

      // This is only needed for CMS Previews currently; on website pages these will ideally go in the baseof.html file directly.
      if(config.styles) {
        const styles = Array.isArray(config.styles) ? config.styles : [ config.styles ];
        styles.forEach(function(style) {
          CMS.registerPreviewStyle(style);
        });
      }
    }

    // Otherwise we're in the main site, so we should build all the necessary components as individual parts of the page
    else if(config.tag) {
      const nodes = document.querySelectorAll(config.tag);
      nodes.forEach(function(node) {
        // Send the node data into the component so that it knows what to build
        const props = {};
        for(let i = 0; i < node.attributes.length; i++) {
          let attr = node.attributes[i];
          props[attr.name] = attr.value;
        }

        // Build the react component into the placeholder node in our layout
        ReactDOM.render(<Comp xplaceholder={ node.cloneNode(true) } { ...props } />, node);

        // Trick to replace the container DOM node with the react node, instead of building inside it
        const compNode = node.firstChild;
        node.parentNode.insertBefore(compNode, node);
        node.remove();
      });
    }
  }

  static get config() { return {}; }

  isPreview() {
    const config = this.constructor.config;
    try {
      return  config
              && config.categories
              && this.props.collection
              && config.categories.indexOf(this.props.collection.getIn(['name'])) !== -1;
    }
    catch(ex) {
      return false;
    }
  }

  render() {
    if(this.isPreview()) {
      return this.renderPreview();
    }
    return this.renderBlock();
  }
}

// BesugoComponent.propTypes = {
//   xplaceholder: PropTypes.instanceOf(Element)
// };

// When in CMS preview, we're running in the parent window context, while for most cases we will need
// the preview iframe's environment.
export function frameView() {
  // Fakes a synchronous response in the form of a promise chain,
  // to avoid async issues when unmounting components for instance.
  const fakePromise = function(win) {
    return {
      then: function(cb) {
        cb(win);
      }
    };
  };

  if(typeof(CMS) !== 'undefined') {
    let selector = 'iframe.nc-previewPane-frame';

    let iframe = document.querySelectorAll(selector)[0];
    if(iframe) {
      return fakePromise(iframe.contentWindow);
    }

    return new Promise(function(resolve, reject) {
      try {
        // Because it's a React app, its nodes are constantly re-rendered, so we need to keep reapplying our listener.
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(m) {
            let iframe = m.target.querySelectorAll(selector)[0];
            if(iframe) {
              resolve(iframe.contentWindow);
            }
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
      catch(ex) {
        reject(ex);
      }
    });
  }

  return fakePromise(window);
}
