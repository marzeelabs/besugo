# Overview

Any piece of layout code that can potentially be shared between pages, or even repeated inside the same page, should go in its own `BesugoComponent` in *components/[CONTENT_TYPE]/[SomeThing].jsx* file. This way, we can reuse these components to render the final pages as well as for live CMS previews.

# BesugoComponent

A Class extension of ```React.Component```. What matters most to us is its ability to parse JSX from any data supplied to it, and that it can reuse other components when rendering itself.

## Script Basic Structure

```js
import React from 'react';
import BesugoComponent from 'Besugo';

export default class SomeThing extends BesugoComponent {
  // ...
}
```

## Structural Overview

### config

A static object that defines this component within our website. All properties are optional:

- `tag`: (string) representing the placeholder tag passed in the HTML layout and which will be replaced by the actual layout of the component;

- `categories`: (arr [str]) array of content categories that this component will preview in Netlify CMS.

- `styles`: (arr [str]) array of stylesheets, both internal and external, to be loaded into the CMS page.

```js
static config = {
  tag: "Person",
  categories: [ "people", "people-pt" ],
}
```

### constructor()
```js
constructor(props) {
  super(props);
  ...
}
```
Only mandatory if the component expects to be passed any props (i.e. data from attributes in html). Should always have the `super(props)` call as above.

### getData()

An optional method to fetch, process, and return whatever data is needed to build the component.

- It should fetch the data from its props object.

- Call `this.isPreview()` to check whether we're in a CMS preview content, in which case it must fetch the data from the methods supplied by the ```CMS``` global object.

```js
getData() {
  if(this.isPreview()) {
    const entry = this.props.entry;
    return {
      Title: entry.getIn(['data', 'title']),
      Content: this.props.widgetFor('body')
    };
  }
  return this.props;
}
```

In most cases, you would pass any necessary data as attributes of that placeholder, and they will be direct properties of the ```this.props``` object:

```html
<Person
  firstname="Foo"
  lastname="Bar"
></Person>
```

resolves automatically to

```js
this.props = {
  firstname: "Foo",
  lastname: "Bar"
}
```

### extraProps()

If there's a need, you can pass more complicated data from hugo templates as children of the placeholder element, or as a JSON text inside it:

```html
<BlogPost
  author="{{ i18n "Author" | default "Author" }}"
  image="{{ .Params.Image }}"
  title="{{ .Title }}"
>
  <BlogPostContent>
    {{ jsonify .Content }}
  </BlogPostContent>
  {{ range .Params.people }}
    {{ range where (where $.Site.RegularPages "Section" "people") ".Params.title" .person }}
      <BlogPostAuthor
        link="{{ .URL }}"
        image="{{ .Params.Image }}"
        title="{{ .Title }}"
        summary="{{ .Summary }}"
      ></BlogPostAuthor>
    {{ end }}
  {{ end }}
</BlogPost>
```

Define an `extraProps` method in your component to process all needed info into its props before rendering:

```js
static extraProps(props, xplaceholder) {
  const content = xplaceholder.getChildren('BlogPostContent');
  props.Content = JSON.parse(content[0].text());

  const authors = xplaceholder.getChildren('BlogPostAuthor');
  props.people = authors.map((author) => {
    return {
      link: author.getAttribute('link'),
      Title: author.getAttribute('title'),
      Summary: author.getAttribute('summary'),
      Params: {
        image: author.getAttribute('image')
      }
    };
  });
}
```

### renderBlock()

Where the actual layout for this component goes; must return a single JSX object, so if necessary you must encapsulate the whole output in an outer `div` container or equivalent.

React elements have some [syntax differences](https://reactjs.org/docs/dom-elements.html), the most important being:

- ```class``` attributes should be defined as ```className``` instead;

- ```style``` attributes expect a JS style object rather than a text string: ```style={ { background: 'red' } }```

```js
renderBlock() {
  const data = this.getData();

  return (
    <div>
      <div className="blog-post__header" style={{ backgroundImage: `url(${data.image})` }}>
        <div className="blog-post__header-title-wrapper">
          <h1 className="blog-post__header-title">{ data.title }</h1>
        </div>
      </div>
      <section className="layout-container--inner">
        { data.content }
      </section>
    </div>
  );
}
```

You can also include other components within another component's layouts; don't forget to pass any data necessary to build it:

```js
import React from 'react';
import BesugoComponent from 'Besugo';
import SocialIcons from 'partials/SocialIcons';

// ...

renderBlock() {
  const data = this.getData();

  return (
    <div className="profile__header-info">
      <h1 className="profile__header-info__title">{ data.Title }</h1>
      <SocialIcons section="profile" { ...data } />
    </div>
  );
}
```

### renderPreview()

This is the layout for the preview area of this component. Typically, you will encapsulate the above `renderBlock()` within another JSX layout:

```js
import React from 'react';
import BesugoComponent from 'Besugo';
import SVGElements from 'partials/SVGElements';
import TopHeader from 'partials/TopHeader';
import EndFooter from 'partials/EndFooter';

// ...

renderPreview() {
  return (
    <div id="cmsPreview">
      <SVGElements/>
      <TopHeader/>
      { this.renderBlock() }
      <EndFooter/>
    </div>
  );
}
```

### buildContainer()

What form should the component's container take; by default this returns a simple `div`. Useful when you're building lists and want to wrap `li`s in a `ul` for instance. Use the `parserUtils` object to create and setup the container.

Note that the `parserUtils` is only a low-level node manipulation utilities collection, you're not actually manipulating the DOM, although it should be enough for virtually every need we may have. [See here](https://github.com/webdeps/parse5-utils) what you can actually do with these.

```js
static buildContainer(parserUtils) {
  const container = parserUtils.createNode('li');
  parserUtils.setAttribute(container, 'class', 'profile');
  return container;
}
```

### view()

Some extra logic may require finding nodes within the document, or otherwise manipulate something within the scope where the component is rendered.

When in CMS preview, we're actually running in the parent window context, while for most cases we will need the preview iframe's environment. This method resolves to the `window` object of that iframe, or to the global object when rendered in the frontend pages.

```js
somethingOrOther() {
  this.view().then((win) => {
    // win === global object where the component is rendered
  });
}
```
