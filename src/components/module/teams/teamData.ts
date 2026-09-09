export type MemberRole = 'Leader' | 'Moderator' | 'Member';
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'yearly';

export type TeamProfile = {
  id: string;
  name: string;
  identity: string;
  description: string;
  leader: string;
  capacity: number;
  memberCount: number;
  rank: number;
  skillLevel: string;
  winRate: number;
  coins: number;
  banner: string;
  tags: string[];
  lookingFor: string;
  availability: 'Open' | 'Limited' | 'Full';
};

export type TeamMember = {
  id: string;
  name: string;
  role: MemberRole;
  specialty: string;
  status: 'Active' | 'Review' | 'Inactive';
  lastActive: string;
  votes: number;
  matchVotes: number;
};

export type JoinRequest = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  note: string;
};

export type Challenge = {
  id: string;
  name: string;
  theme: string;
  timeRemaining: string;
  durationHours: number;
  contestType: 'Standard' | 'Premium' | 'Pro';
  membersJoined: number;
  eligible: boolean;
  ineligibleReason?: string;
  banner: string;
  prizeCoins: number;
};

export type ActiveMatch = {
  id: string;
  challengeName: string;
  theme: string;
  rivalTeam: string;
  timeRemaining: string;
  teamScore: number;
  rivalScore: number;
  rewardCoins: number;
};

export const currentUser = {
  id: 'm1',
  name: 'Nadia Rahman',
  registered: true,
  subscribed: true,
  plan: 'Premium',
  teamId: 'aperture-alliance',
  role: 'Leader' as MemberRole,
  coins: 2480,
  keys: 14,
  boosts: 7,
  swaps: 5,
};

export const teams: TeamProfile[] = [
  {
    id: 'aperture-alliance',
    name: 'Aperture Alliance',
    identity: 'Editorial street photographers',
    description:
      'A focused team for photographers who like fast contests, fair matchups, and sharp weekly improvement.',
    leader: 'Nadia Rahman',
    capacity: 12,
    memberCount: 9,
    rank: 8,
    skillLevel: 'Gold III',
    winRate: 68,
    coins: 18400,
    banner: '/images/team.jpg',
    tags: ['Street', 'Portrait', 'Weekly push'],
    lookingFor: '2 active voters and 1 portrait specialist',
    availability: 'Limited',
  },
  {
    id: 'wild-frame',
    name: 'Wild Frame Club',
    identity: 'Nature and wildlife squad',
    description: 'Competitive nature team with steady match participation and moderator support.',
    leader: 'Mason Cole',
    capacity: 10,
    memberCount: 7,
    rank: 14,
    skillLevel: 'Silver I',
    winRate: 61,
    coins: 12950,
    banner: '/images/portrait.jpg',
    tags: ['Nature', 'Wildlife', 'Beginner friendly'],
    lookingFor: 'Macro, birds, and landscape contributors',
    availability: 'Open',
  },
  {
    id: 'monochrome-lab',
    name: 'Monochrome Lab',
    identity: 'Black and white specialists',
    description: 'Small ranked team built around visual consistency and high vote conversion.',
    leader: 'Aria West',
    capacity: 8,
    memberCount: 8,
    rank: 5,
    skillLevel: 'Platinum IV',
    winRate: 74,
    coins: 22300,
    banner: '/images/studio.jpg',
    tags: ['Fine art', 'Studio', 'Ranked'],
    lookingFor: 'Waitlist only',
    availability: 'Full',
  },
  {
    id: 'color-run',
    name: 'Color Run Collective',
    identity: 'Bright lifestyle creators',
    description: 'Casual team for active contests, social voting, and coin reward farming.',
    leader: 'Jun Park',
    capacity: 15,
    memberCount: 11,
    rank: 22,
    skillLevel: 'Silver II',
    winRate: 57,
    coins: 9800,
    banner: '/images/poty.jpg',
    tags: ['Lifestyle', 'Open contests', 'Coins'],
    lookingFor: 'Consistent daily members',
    availability: 'Open',
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: 'm1',
    name: 'Nadia Rahman',
    role: 'Leader',
    specialty: 'Street',
    status: 'Active',
    lastActive: 'Now',
    votes: 4280,
    matchVotes: 320,
  },
  {
    id: 'm2',
    name: 'Omar Silva',
    role: 'Moderator',
    specialty: 'Portrait',
    status: 'Active',
    lastActive: '8m ago',
    votes: 3610,
    matchVotes: 288,
  },
  {
    id: 'm3',
    name: 'Mila Grant',
    role: 'Member',
    specialty: 'Editorial',
    status: 'Review',
    lastActive: '2h ago',
    votes: 2140,
    matchVotes: 0,
  },
  {
    id: 'm4',
    name: 'Ray Chen',
    role: 'Member',
    specialty: 'Nightscape',
    status: 'Active',
    lastActive: '18m ago',
    votes: 2895,
    matchVotes: 241,
  },
  {
    id: 'm5',
    name: 'Lena Moore',
    role: 'Member',
    specialty: 'Documentary',
    status: 'Inactive',
    lastActive: '9d ago',
    votes: 820,
    matchVotes: 0,
  },
];

export const joinRequests: JoinRequest[] = [
  {
    id: 'r1',
    name: 'Tariq Hasan',
    specialty: 'Architecture',
    rating: 4.8,
    note: 'Available for weekly and monthly match pushes.',
  },
  {
    id: 'r2',
    name: 'Elise Carter',
    specialty: 'Food styling',
    rating: 4.6,
    note: 'Looking for an active team with clear roles.',
  },
];

export const challenges: Challenge[] = [
  {
    id: 'c1',
    name: 'City Pulse',
    theme: 'Street motion',
    timeRemaining: '7h 42m',
    durationHours: 8,
    contestType: 'Standard',
    membersJoined: 4,
    eligible: true,
    banner: '/images/portrait.jpg',
    prizeCoins: 1000,
  },
  {
    id: 'c2',
    name: 'Golden Faces',
    theme: 'Portrait light',
    timeRemaining: '13h 05m',
    durationHours: 14,
    contestType: 'Standard',
    membersJoined: 2,
    eligible: true,
    banner: '/images/person.png',
    prizeCoins: 1250,
  },
  {
    id: 'c3',
    name: 'Pro Studio Clash',
    theme: 'Controlled studio',
    timeRemaining: '10h 10m',
    durationHours: 10,
    contestType: 'Pro',
    membersJoined: 3,
    eligible: false,
    ineligibleReason: 'Pro contests are not eligible',
    banner: '/images/studio.jpg',
    prizeCoins: 2400,
  },
  {
    id: 'c4',
    name: 'Long Horizon',
    theme: 'Landscape story',
    timeRemaining: '26h 20m',
    durationHours: 26,
    contestType: 'Standard',
    membersJoined: 1,
    eligible: false,
    ineligibleReason: 'Contest duration is over 24 hours',
    banner: '/images/poty.jpg',
    prizeCoins: 1400,
  },
  {
    id: 'c5',
    name: 'Rapid Frame',
    theme: 'Five hour sprint',
    timeRemaining: '4h 54m',
    durationHours: 5,
    contestType: 'Standard',
    membersJoined: 6,
    eligible: true,
    banner: '/images/backdrop.jpg',
    prizeCoins: 700,
  },
];

export const activeMatch: ActiveMatch | null = {
  id: 'city-pulse-battle',
  challengeName: 'City Pulse',
  theme: 'Street motion',
  rivalTeam: 'Wild Frame Club',
  timeRemaining: '7h 42m',
  teamScore: 849,
  rivalScore: 792,
  rewardCoins: 1000,
};

export const leaderboard: Record<
  LeaderboardPeriod,
  { rank: number; team: string; level: string; wins: number; points: number; trend: string }[]
> = {
  weekly: [
    { rank: 1, team: 'Monochrome Lab', level: 'Platinum IV', wins: 9, points: 1840, trend: '+3' },
    { rank: 2, team: 'Aperture Alliance', level: 'Gold III', wins: 7, points: 1695, trend: '+2' },
    { rank: 3, team: 'Wild Frame Club', level: 'Silver I', wins: 6, points: 1440, trend: '+1' },
    {
      rank: 4,
      team: 'Color Run Collective',
      level: 'Silver II',
      wins: 5,
      points: 1210,
      trend: '-1',
    },
  ],
  monthly: [
    { rank: 1, team: 'Aperture Alliance', level: 'Gold III', wins: 21, points: 6420, trend: '+1' },
    { rank: 2, team: 'Monochrome Lab', level: 'Platinum IV', wins: 19, points: 6180, trend: '-1' },
    { rank: 3, team: 'Wild Frame Club', level: 'Silver I', wins: 16, points: 5190, trend: '+4' },
    {
      rank: 4,
      team: 'Color Run Collective',
      level: 'Silver II',
      wins: 13,
      points: 4740,
      trend: '+2',
    },
  ],
  yearly: [
    {
      rank: 1,
      team: 'Monochrome Lab',
      level: 'Platinum IV',
      wins: 124,
      points: 38240,
      trend: '+6',
    },
    {
      rank: 2,
      team: 'Aperture Alliance',
      level: 'Gold III',
      wins: 116,
      points: 36180,
      trend: '+8',
    },
    { rank: 3, team: 'Wild Frame Club', level: 'Silver I', wins: 97, points: 30940, trend: '+3' },
    {
      rank: 4,
      team: 'Color Run Collective',
      level: 'Silver II',
      wins: 84,
      points: 27820,
      trend: '-2',
    },
  ],
};

export const matchHistory = [
  {
    opponent: 'Wild Frame Club',
    challenge: 'Rain Stories',
    result: 'Win',
    score: '1,420 - 1,188',
    reward: '+900 coins',
    date: 'May 10',
  },
  {
    opponent: 'Color Run Collective',
    challenge: 'Daily Frames',
    result: 'Win',
    score: '1,032 - 990',
    reward: '+650 coins',
    date: 'May 7',
  },
  {
    opponent: 'Monochrome Lab',
    challenge: 'Shadow Work',
    result: 'Loss',
    score: '876 - 940',
    reward: '+120 coins',
    date: 'May 4',
  },
];

export const chatMessages = [
  {
    author: 'Omar',
    role: 'Moderator',
    message: 'Two hours left on Portrait Sprint. Charges should go to the top three entries.',
    time: '11:20',
  },
  {
    author: 'Mila',
    role: 'Member',
    message: 'I will join after uploading the editorial set.',
    time: '11:32',
  },
  {
    author: 'Nadia',
    role: 'Leader',
    message: 'Good. Keep swaps for the last hour only.',
    time: '11:39',
  },
];

export function getTeamById(teamId: string) {
  return teams.find((team) => team.id === teamId);
}
