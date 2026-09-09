import { DiscoverItem, FeatureItem, MemoriesImage, NavLink } from '@/types';

export const navLinks: NavLink[] = [
  {
    name: 'Contest',
    href: '/contest',
    tags: ['/contest', '/joined', '/open', '/closed', '/completed', '/upcoming'],
  },
  { name: 'Discover', href: '/discover' },
  { name: 'Support', href: '/support' },
  { name: 'About', href: '/about' },
];

export const loggedInNavLinks: NavLink[] = [
  {
    name: 'Contest',
    href: '/contest',
    tags: ['/contest', '/joined', '/open', '/closed', '/completed', '/upcoming'],
  },
  {
    name: 'Teams',
    href: '/teams',
    tags: ['/teams/home', '/teams/create'],
  },
  { name: 'Support', href: '/support' },
  { name: 'About', href: '/about' },
];

export const memoriesImages: MemoriesImage[] = [
  {
    image: '/images/gallery-1.jpg',
  },
  {
    image: '/images/gallery-2.jpg',
  },
  {
    image: '/images/gallery-3.jpg',
  },
  {
    image: '/images/gallery-4.jpg',
  },
  {
    image: '/images/gallery-5.jpg',
  },
];

export const discoverItems: DiscoverItem[] = [
  {
    key: 'experiment',
    label: 'Experiment',
    sub: 'WITH YOUR PHOTOS',
    img: '/icons/experiment.png',
  },
  {
    key: 'promote',
    label: 'Promote',
    sub: 'SHARE YOUR CREATIONS',
    img: '/icons/promote.png',
  },
  {
    key: 'charges',
    label: 'Engage',
    sub: 'CONNECT WITH YOUR AUDIENCE',
    img: '/icons/votes.png',
  },
  {
    key: 'keys',
    label: 'Unlock',
    sub: 'DISCOVER NEW POSSIBILITIES',
    img: '/icons/keys.png',
  },
];

export const FeatureItems: FeatureItem[] = [
  {
    title: 'Photographer of the year',
    description:
      'Capturing moments that transcend time, Photographer of the Year unveils the world"s beauty through a lens of innovation and emotion.',
    img: '/images/poty.jpg',
    href: '/photographer-of-the-year',
  },
  {
    title: 'Create a Team',
    description:
      'A dynamic ensemble of diverse talents united by a common goal, synergy ing creativity, innovation, and excellence to achieve success.',
    img: '/images/team.jpg',
    href: '/contest/create-team',
  },
  // {
  //   title: 'Host a Exhibition',
  //   description:
  //     'Experience innovation and creativity at our immersive exhibition showcasing cutting-edge art, technology, and culture',
  //   img: '/images/exhibition.jpg',
  //   href: '/exhibitions',
  // },
];
