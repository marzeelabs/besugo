import BesugoComponent from 'Besugo';

import Previews from 'Previews';
import SVGElements from 'partials/SVGElements';
import TopHeader from 'partials/TopHeader';
import EndFooter from 'partials/EndFooter';
import SlideShow from 'partials/SlideShow';
import SocialIcons from 'partials/SocialIcons';
import MoreArrow from 'MoreArrow';
import SrcSet, { SrcSetBg } from 'SrcSet';
import PersonCard from 'people/Card';
import Person from 'people/Person';
import BlogPost from 'blog/BlogPost';

[
  Previews,
  SVGElements,
  TopHeader,
  EndFooter,
  SlideShow,
  SocialIcons,
  MoreArrow,
  SrcSet,
  SrcSetBg,
  PersonCard,
  Person,
  BlogPost,
].forEach((Comp) => {
  Comp.initialize();
});

export default BesugoComponent.build();
