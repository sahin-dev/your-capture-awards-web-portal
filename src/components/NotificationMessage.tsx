'use client';

import type { NotificationItem } from '@/store/types/notificationTypes';
import Link from 'next/link';

const stopPropagation = (event: React.MouseEvent) => event.stopPropagation();

const inlineLinkClass = 'text-primary font-medium hover:underline';

interface EntityLink {
  value: string;
  href: string;
}

const escapeForRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Wraps every occurrence of a known entity name/title inside the raw message
// text in a link to that entity's page, leaving the rest of the sentence as
// plain text - so only those specific words are clickable, never the whole
// notification card.
function linkifyMessage(message: string, links: EntityLink[]): React.ReactNode {
  const usableLinks = links.filter((link) => link.value.trim().length > 0);
  if (!usableLinks.length) return message;

  const pattern = new RegExp(
    `(${usableLinks.map((link) => escapeForRegExp(link.value)).join('|')})`,
    'g',
  );
  const parts = message.split(pattern);

  return parts.map((part, index) => {
    const match = usableLinks.find((link) => link.value === part);
    if (!match) return part;

    return (
      <Link
        key={`${index}-${match.href}`}
        href={match.href}
        onClick={stopPropagation}
        className={inlineLinkClass}
      >
        {part}
      </Link>
    );
  });
}

// Every event type below carries the entity ids needed to link the exact
// name/title already present in the stored message (contest, team, level,
// achievement) to that entity's page. Events without a usable id (no id was
// ever recorded for that entity) simply render no links, falling back to
// plain text.
function getEntityLinks(notification: NotificationItem): EntityLink[] {
  const data = notification.data;
  const event = typeof data?.event === 'string' ? data.event : undefined;
  if (!event) return [];

  const str = (key: string) =>
    typeof data?.[key] === 'string' ? (data[key] as string) : undefined;

  switch (event) {
    case 'ACHIEVEMENT_UNLOCKED': {
      const contestId = str('contestId');
      const achievementTitle = str('achievementTitle');
      return contestId && achievementTitle
        ? [{ value: achievementTitle, href: `/contest/${contestId}` }]
        : [];
    }
    case 'CONTEST_PHOTO_UPLOADED':
    case 'CONTEST_ENDED':
    case 'CONTEST_PHOTO_REMOVED': {
      const contestId = str('contestId');
      const contestName = str('contestName');
      return contestId && contestName
        ? [{ value: contestName, href: `/contest/${contestId}` }]
        : [];
    }
    case 'TEAM_INVITATION_RECEIVED':
    case 'TEAM_REWARD_GRANTED': {
      const teamId = str('teamId');
      const teamName = str('teamName');
      return teamId && teamName ? [{ value: teamName, href: `/teams/${teamId}` }] : [];
    }
    case 'LEVEL_UP': {
      const newLevel = str('newLevel');
      return newLevel ? [{ value: newLevel, href: '/profile' }] : [];
    }
    default:
      return [];
  }
}

// Renders a notification's message as plain text, except for a few event types
// where specific entities inside the sentence (the voter, the contest, the
// team, the level) become their own clickable links to that entity's page -
// separate from clicking the rest of the card, which only toggles read status
// (see NotificationModal's handleNotificationClick).
export default function NotificationMessage({ notification }: { notification: NotificationItem }) {
  const data = notification.data;
  const event = typeof data?.event === 'string' ? data.event : undefined;

  if (event === 'VOTE_RECEIVED') {
    const voterId = typeof data?.voterId === 'string' ? data.voterId : undefined;
    const voterName = typeof data?.voterName === 'string' ? data.voterName : undefined;
    const contestId = typeof data?.contestId === 'string' ? data.contestId : undefined;
    const contestTitle = typeof data?.contestTitle === 'string' ? data.contestTitle : undefined;
    const totalVotes = typeof data?.totalVotes === 'number' ? data.totalVotes : undefined;

    if (voterName && contestTitle) {
      return (
        <p className="text-muted-foreground mt-0.5 text-xs">
          {voterId ? (
            <Link
              href={`/profile/${voterId}`}
              onClick={stopPropagation}
              className={inlineLinkClass}
            >
              {voterName}
            </Link>
          ) : (
            voterName
          )}{' '}
          voted for your photo in{' '}
          {contestId ? (
            <Link
              href={`/contest/${contestId}`}
              onClick={stopPropagation}
              className={inlineLinkClass}
            >
              &quot;{contestTitle}&quot;
            </Link>
          ) : (
            `"${contestTitle}"`
          )}
          {typeof totalVotes === 'number' && <>! Total votes: {totalVotes}</>}
        </p>
      );
    }
  }

  return (
    <p className="text-muted-foreground mt-0.5 text-xs">
      {linkifyMessage(notification.message, getEntityLinks(notification))}
    </p>
  );
}
