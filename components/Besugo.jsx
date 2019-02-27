import React from 'react';
import { hydrate } from 'react-dom';

const SELECTORS = {
  // iframe: 'iframe.nc-previewPane-frame', // Netlify-cms 1.9.2
  iframe: '.css-1hcqc8j',
};

const Components = [];

export default class BesugoComponent extends React.Component {
  // Static methods, for internal use only. Likely irrelevant to building individual components.

  static initialize() {
    const Comp = this;
    const { config } = this;

    // Push this component into our internal array, so that we know
    // which and how many will be needed during build.
    Components.push(Comp);

    // We don't initialize the components here when building server-side,
    // that happens in .build() below.
    // eslint-disable-next-line
    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) {
      return Comp;
    }

    // TODO: Implement some time eventually.
    // Initialization is a little non-standard; ideally we'd set .propTypes directly on each
    // component, but I'm having a little trouble concatenating the objects that way, so
    // setting propTypes in config instead.
    // if(config.propTypes) {
    //   Object.assign(Comp.propTypes, config.propTypes);
    // }

    if (typeof CMS !== 'undefined') {
      // Load the necessary components as preview components of those content types.
      if (config.categories) {
        const cats = Array.isArray(config.categories) ? config.categories : [ config.categories ];
        cats.forEach((cat) => {
          CMS.registerPreviewTemplate(cat, Comp);
        });
      }

      // Custom widgets need to be registered by the appropriate methods as well.
      if (config.widget) {
        CMS.registerWidget(config.widget.name, Comp, config.widget.preview);
      }

      // This is only needed for CMS Previews currently; on website pages these will ideally
      // go in the baseof.html file directly.
      if (config.styles) {
        const styles = Array.isArray(config.styles) ? config.styles : [ config.styles ];
        styles.forEach((style) => {
          CMS.registerPreviewStyle(style);
        });
      }
    }

    // Otherwise we're in the main site, so we should build all the necessary components as
    // individual parts of the page
    else if (config.tag) {
      const nodes = document.querySelectorAll(`[besugo-component="${config.tag}"]`);
      nodes.forEach((node) => {
        // Send the node data into the component so that it knows what to build
        const props = Comp.getPropsFromPlaceholder(node);

        // The react component is already rendered at this point, so we "hydrate" any
        // needed dynamics and finishing routines on that same markup.
        hydrate(<Comp { ...props } />, node);
      });
    }

    return Comp;
  }

  // eslint-disable-next-line
  static build() {
    // We're in webpack execution == server-side rendering.
    // StaticSiteGeneratorPlugin expects a function that returns a string
    // or in our case an object with that string
    // eslint-disable-next-line
    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) {
      return locals => new Promise((resolve, reject) => {
        // parse5 builds only a bare tree of object representing nodes and not a full DOM document.
        // parser5-utils is a collection of functions to manipulate those objects, very lightweight,
        // so let's use that instead of writing our own.
        const {
          fs,
          parser,
          parserUtils,
          renderToString,
        } = locals;

        fs.readFile(locals.path, (err, data) => {
          if (err) {
            reject(err);
            throw err;
          }

          try {
            const domtree = parser.parse(data.toString());

            Components.forEach((Comp) => {
              const { config } = Comp;

              if (config.tag) {
                const nodes = Comp.getChildrenInPlaceholder(domtree, config.tag, parserUtils);
                nodes.forEach((node) => {
                  // Send the node data into the component so that it knows what to build
                  const props = Comp.getPropsFromPlaceholder(node);

                  // Replace the placeholder node with a normal div container for our component;
                  // we need one so that later during hydrate React knows what it's doing,
                  // but we don't use our original placeholders from now on because they're
                  // not exactly standard.
                  const container = Comp.buildContainer(parserUtils, props);
                  parserUtils.setAttribute(container, 'besugo-component', config.tag);
                  parserUtils.setAttribute(container, 'besugo-props', JSON.stringify(props));
                  parserUtils.replace(node, container);

                  // Render the React element's markup output and append it to our "document"
                  // to serialize
                  const rendered = renderToString(<Comp { ...props } />);
                  const parsed = parser.parse(rendered);
                  if (parsed && parsed.childNodes && parsed.childNodes.length === 1) {
                    const content = Comp.getChildrenInPlaceholder(parsed, 'body', parserUtils)[0];
                    parserUtils.append(container, content.childNodes[0]);
                  }
                });
              }
            });

            let { path } = locals;
            if (locals.pathsReplace) {
              locals.pathsReplace.forEach((seek) => {
                path = path.replace(seek.from, seek.to);
              });
            }

            // Resolve with the stringified prebuilt markup.
            resolve({ [path]: parser.serialize(domtree) });
          }
          catch (ex) {
            reject(ex);
          }
        });
      });
    }
  }

  // We filter all the node objects in the tree into a flat array,
  // just like a document.querySelectorAll(nodeName) or $(document).find(nodeName) would do.
  // Except these objects don't have attribute methods, so instead of having a separate routine,
  // let's just polyfill those methods into the objects here and pretend like they do
  // everywhere else.
  // eslint-disable-next-line
  static getChildrenInPlaceholder(parent, nodeName, parserUtils) {
    nodeName = nodeName.toLowerCase();
    return parserUtils.flatten(parent)
      .filter(child => child.nodeName === nodeName)
      .map(child => Object.assign(child, {
        hasAttribute(attr) {
          return parserUtils.getAttribute(child, attr) !== undefined;
        },
        getAttribute(attr) {
          return parserUtils.getAttribute(child, attr);
        },
        attributesOf() {
          return parserUtils.attributesOf(child);
        },
        text() {
          return parserUtils.textOf(child);
        },
        getChildren(childName) {
          return BesugoComponent.getChildrenInPlaceholder(child, childName, parserUtils);
        },
      }));
  }

  static getPropsFromPlaceholder(node) {
    if (node.hasAttribute('besugo-component')) {
      return JSON.parse(node.getAttribute('besugo-props'));
    }

    const props = node.attributesOf();
    this.extraProps(props, node);
    return props;
  }

  // Placeholder methods that no-op or append default basic behavior
  // unless specific components override them

  // Any props required by the component that are not attributes in the placeholder should
  // be fetched here, for example any info contained within the placeholder's children and/or
  // their contents as stringified JSON.
  static extraProps() {}

  // What form should the component's container take; by default this returns a simple div.
  // eslint-disable-next-line no-unused-vars
  static buildContainer(parserUtils, props) {
    return parserUtils.createNode('div');
  }

  // The components configuration directives; expects the following optional properties:
  //  .tag - (string) representing the nodeName of the placeholder nodes where the
  //         component should be built
  //  .categories - (arr [str]) array of categories that this component will render in the CMS page
  //  .styles - (arr [str]) array of stylesheets, both internal and external, to be
  //            loaded into the CMS page
  //  .widget - (obj { name [str], (opt) preview [Comp] }) if this is a custom controller widget
  //            to be used in content types with special fields
  static config = {}

  // Non-static methods

  constructor(props) {
    super(props);
  }

  // Helper function to let the component know if it's being used in the CMS or in a frontend page.
  isPreview() {
    const { config } = this.constructor;
    const { collection } = this.props;
    try {
      return config
              && config.categories
              && collection
              && config.categories.indexOf(collection.getIn([ 'name' ])) !== -1;
    }
    catch (ex) {
      return false;
    }
  }

  // When in CMS preview, we're running in the parent window context, while for most cases
  // we will need the preview iframe's environment.
  view() {
    // Fakes a synchronous response in the form of a promise chain,
    // to avoid async issues when unmounting components for instance.
    const fakePromise = win => ({
      then: (cb) => {
        cb(win);
      },
    });

    if (typeof CMS !== 'undefined') {
      const iframe = document.querySelector(SELECTORS.iframe);

      if (iframe) {
        return fakePromise(iframe.contentWindow);
      }

      return new Promise((resolve, reject) => {
        try {
          // Because it's a React app, its nodes are constantly re-rendered,
          // so we need to keep reapplying our listener.
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
              const subframe = m.target.querySelector(SELECTORS.iframe);
              if (subframe) {
                resolve(subframe.contentWindow);
              }
            });
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
        catch (ex) {
          reject(ex);
        }
      });
    }

    return fakePromise(window);
  }

  // Expected React render method.
  render() {
    if (this.isPreview()) {
      return this.renderPreview();
    }
    return this.renderBlock();
  }
}
