import React from 'react';
import { hydrate } from 'react-dom';

const Components = [];

export default class BesugoComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  static initialize() {
    const Comp = this;
    const config = this.config;

    // Push this component into our internal array, so that we know which and how many will be needed during build.
    Components.push(Comp);

    // We don't initialize the components here when building server-side,
    // that happens in .build() below.
    if(typeof(name) !== 'undefined' && name === 'nodejs') {
      return Comp;
    }

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
      const nodes = document.querySelectorAll('div[besugo-component="'+config.tag+'"]');
      nodes.forEach(function(node) {
        // Send the node data into the component so that it knows what to build
        const props = Comp.getPropsFromPlaceholder(node);

        // The react component is already rendered at this point, so we "hydrate" any needed dynamics
        // and finishing routines on that same markup.
        hydrate(<Comp { ...props } />, node);
      });
    }

    return Comp;
  }

  static build() {
    // We're in webpack execution == server-side rendering.
    // StaticSiteGeneratorPlugin expects a function that returns a string or in our case an object with that string
    if(typeof(name) !== 'undefined' && name === 'nodejs') {
      return function(locals) {
        return new Promise(function(resolve, reject) {
          // parse5 builds only a bare tree of object representing nodes and not a full DOM document.
          // parser5-utils is a collection of functions to manipulate those objects, very lightweight,
          // so let's use that instead of writing our own.
          const { fs, parser, parserUtils, renderToString } = locals;

          fs.readFile(locals.path, function(err, data) {
            if(err) {
              reject(err);
              throw err;
            }

            try {
              const domtree = parser.parse(data.toString());

              Components.forEach((Comp) => {
                const config = Comp.config;
                if(config.tag) {
                  const nodes = Comp.getChildrenInPlaceholder(domtree, config.tag, parserUtils);
                  nodes.forEach(function(node) {
                    // Send the node data into the component so that it knows what to build
                    const props = Comp.getPropsFromPlaceholder(node);

                    // Replace the placeholder node with a normal div container for our component;
                    // we need one so that later during hydrate React knows what it's doing, but we don't use
                    // our original placeholders form now on because they're not exactly standard.
                    const container = parserUtils.createNode('div');
                    parserUtils.setAttribute(container, 'besugo-component', config.tag);
                    parserUtils.setAttribute(container, 'besugo-props', JSON.stringify(props));
                    parserUtils.replace(node, container);

                    // Render the React element's markup output and append it to our "document" to serialize
                    const rendered = renderToString(<Comp { ...props } />);
                    const parsed = parser.parse(rendered);
                    if(parsed && parsed.childNodes && parsed.childNodes.length === 1) {
                      const content = Comp.getChildrenInPlaceholder(parsed, 'body', parserUtils)[0];
                      parserUtils.append(container, content.childNodes[0]);
                    }
                  });
                }
              });

              let path = locals.path;
              if(locals.pathsReplace) {
                locals.pathsReplace.forEach(function(seek) {
                  path = path.replace(seek.from, seek.to);
                });
              }

              // Resolve with the stringified prebuilt markup.
              resolve({ [path]: parser.serialize(domtree) });
            }
            catch(ex) {
              reject(ex);
            }
          });
        });
      };
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

  // We filter all the node objects in the tree into a flat array,
  // just like a document.querySelectorAll(nodeName) or $(document).find(nodeName) would do.
  // Except these objects don't have attribute methods, so instead of having a separate routine,
  // let's just polyfill those methods into the objects here and pretend like they do everywhere else.
  static getChildrenInPlaceholder(parent, nodeName, parserUtils) {
    nodeName = nodeName.toLowerCase();
    return parserUtils.flatten(parent)
      .filter((child) => child.nodeName === nodeName)
      .map((child) => {
        return Object.assign(child, {
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
          getChildren(nodeName) {
            return BesugoComponent.getChildrenInPlaceholder(child, nodeName, parserUtils);
          }
        });
      });
  }

  static getPropsFromPlaceholder(node) {
    if(node.hasAttribute('besugo-component')) {
      return JSON.parse(node.getAttribute('besugo-props'));
    }

    const props = node.attributesOf();
    this.extraProps(props, node);
    return props;
  }

  // Placeholder methods that no-op unless specific components override them
  static extraProps() {}
}

// When in CMS preview, we're running in the parent window context, while for most cases we will need
// the preview iframe's environment.
export function frameView() {
  if(typeof(CMS) !== 'undefined') {
    const $ = require('jquery');
    return $('iframe.cms__PreviewPane__frame')[0].contentWindow;
  }
  return window;
}
