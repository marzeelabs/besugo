import React from 'react';
import BesugoComponent from 'Besugo';
import ReactHtmlParser from 'react-html-parser';
import SVGElements from 'partials/SVGElements';
import SocialIcons from 'partials/SocialIcons';
import TopHeader from 'partials/TopHeader';
import EndFooter from 'partials/EndFooter';
import PersonCard from 'people/Card';

export default class BlogPost extends BesugoComponent {
  constructor(props) {
    super(props);
  }

  static get config() {
    return {
      tag: "BlogPost",
      categories: [ "blog_post", "blog_post-pt" ]
    };
  }

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

  getData() {
    if(this.isPreview()) {
      const entry = this.props.entry;

      return {
        author: "Author",
        title: entry.getIn(['data', 'title']),
        Content: this.props.widgetFor('body'),
        image: entry.getIn(['data', 'image']) ? this.props.getAsset(entry.getIn(['data', 'image'])).toString() : '/admin/default.jpg',
        people: entry.getIn(['data', 'people']).map((person) => {
          const personData = this.props.fieldsMetaData.getIn(['people', person.getIn(['person'])]);
          return personData && {
            link: '#',
            Title: personData.getIn(['title']),
            Summary: personData.getIn(['body']),
            Params: {
              image: personData.getIn(['image'])
            }
          }
        })
      };
    }

    const data = Object.assign({}, this.props);

    // "Content" comes pre-built with HTML markup already. We need to parse it so that it doesn't show up as simple text
    data.Content = ReactHtmlParser(data.Content);

    return data;
  }

  buildPeople(data) {
    let p = 0;
    return data.people && data.people.map(function(person) {
      return person && (
        <PersonCard
          key={ "author-" + (++p) }
          { ...person }
        />
      );
    });
  }

  renderBlock() {
    const data = this.getData();

    return (
      <div>
        <div className="blog-post__header" style={{ backgroundImage: `url(${data.image})` }}>
          <div className="blog-post__header-title__wrapper">
            <h1 className="blog-post__header-title">{ data.title }</h1>
          </div>
        </div>

        <section className="layout-container--inner">
          { data.Content }

          <h1 className="profiles__title">{ data.author }</h1>
          <ul className="profiles__list">
            { this.buildPeople(data) }
          </ul>
        </section>
      </div>
    );
  }

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
};
