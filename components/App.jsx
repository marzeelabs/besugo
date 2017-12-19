import React from 'react';
import BesugoComponent from 'Besugo';

import Previews from 'Previews';
import SVGElements from 'partials/SVGElements';
import TopHeader from 'partials/TopHeader';
import EndFooter from 'partials/EndFooter';
import SlideShow from 'partials/SlideShow';
import SocialIcons from 'partials/SocialIcons';
import PersonCard from 'people/Card';
import Person from 'people/Person';
import BlogPost from 'blog/BlogPost';

const initialized = [
  Previews,
  SVGElements,
  TopHeader,
  EndFooter,
  SlideShow,
  SocialIcons,
  PersonCard,
  Person,
  BlogPost
].map((Comp) => {
  return Comp.initialize();
});

export default BesugoComponent.build();
