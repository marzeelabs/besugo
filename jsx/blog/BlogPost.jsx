import React from 'react';
import BesugoComponent from 'Besugo';
import ReactHtmlParser from 'react-html-parser';
import SVGElements from 'partials/SVGElements';
import SocialIcons from 'partials/SocialIcons';
import TopHeader from 'partials/TopHeader';
import EndFooter from 'partials/EndFooter';
import PersonCard from 'people/Card';

class BlogPost extends BesugoComponent {
  constructor(props) {
    super(props);
  }

  static get config() {
    return {
      tag: "BlogPost",
      categories: [ "blog_post", "blog_post-pt" ]
    };
  }

  getData() {
    if(this.isPreview()) {
      const entry = this.props.entry;

      return {
        author: "Author",
        title: entry.getIn(['data', 'title']),
        content: this.props.widgetFor('body'),
        image: entry.getIn(['data', 'image']) ? this.props.getAsset(entry.getIn(['data', 'image'])).toString() : '/admin/default.jpg',
        people: (entry.getIn(['data', 'people']) || []).map((person) => {
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

    const data = Object.assign({
      people: []
    }, this.props);

    if(this.props.xplaceholder) {
      const authors = this.props.xplaceholder.querySelectorAll('BlogPostAuthor');
      for(let i = 0; i < authors.length; i++) {
        let author = authors[i];

        let person = {
          link: author.getAttribute('link'),
          Title: author.getAttribute('title'),
          Summary: author.getAttribute('summary'),
          Params: {
            image: author.getAttribute('image')
          }
        };

        data.people.push(person);
      }
    }

    // "Content" comes pre-built with HTML markup already. We need to parse it so that it doesn't show up as simple text
    const parsed = new DOMParser().parseFromString(data.content, "text/html");
    data.content = ReactHtmlParser(parsed.documentElement.textContent);

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
          <div className="is-markdown">
            { data.content }
          </div>

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

BlogPost.initialize();
export default BlogPost;
