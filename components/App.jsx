import BesugoComponent from 'Besugo';

import Previews from 'Previews';

import EndFooter from 'partials/EndFooter';
import MoreArrow from 'partials/MoreArrow';
import ReservationSlider from 'partials/Reservation/Slider';
import SlideShow from 'partials/SlideShow';
import SocialIcons from 'partials/SocialIcons';
import SrcSet, { SrcSetBg } from 'partials/SrcSet';
import SVGElements from 'partials/SVGElements';
import TopHeader from 'partials/TopHeader';

import Amenity from 'location/Amenity';
import BlogPost from 'blog/Post';
import BlogTeaser from 'blog/Teaser';
import Location from 'location/Location';
import PageSimple from 'page/Simple';
import Person from 'people/Person';
import PersonCard from 'people/Card';
import Plan from 'pricing/Plan';
import Quotes from 'partials/Quotes';

[
  Previews,

  EndFooter,
  MoreArrow,
  ReservationSlider,
  SlideShow,
  SocialIcons,
  SrcSet,
  SrcSetBg,
  SVGElements,
  TopHeader,

  Amenity,
  BlogPost,
  BlogTeaser,
  Location,
  PageSimple,
  Person,
  PersonCard,
  Plan,
  Quotes,
].forEach((Comp) => {
  Comp.initialize();
});

export default BesugoComponent.build();
