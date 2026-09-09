import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Role, TeamMember } from '@/types/team';
import { formatDateToDayMonYear } from '@/utils/formatDateToDayMonYear';
import { resolveImageUrl } from '@/utils/resolveImageUrl';
import { getAvatarClass, getInitials, getMemberName, getRoleChipClass } from '@/utils/team-utils';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import MemberManagePopover from './MemberManagePopover';

interface MemberListProps {
  members: TeamMember[];
  currentUserId: string;
  isLeader: boolean;
  isMod: boolean;
  canInvite: boolean;
  onChangeRole: (memberRowId: string, role: Role) => void;
  onRemove: (member: TeamMember) => void;
  onInvite: () => void;
  page: number;
  total: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

function MemberList({
  members,
  currentUserId,
  isLeader,
  isMod,
  canInvite,
  onChangeRole,
  onRemove,
  onInvite,
  page,
  total,
  totalPage,
  onPageChange,
}: MemberListProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3.5 sm:px-5">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          Members ({total})
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={!canInvite}
          title={canInvite ? 'Invite members' : 'No member slots available'}
          onClick={onInvite}
        >
          <UserPlus size={13} className="mr-1.5" /> Invite
        </Button>
      </div>

      <div className="divide-y">
        {members.map((m, index) => {
          const isMe = m.memberId === currentUserId;
          const name = getMemberName(m.member);
          const avatarUrl = resolveImageUrl(m.member.avatar);
          // last 2 rows → popover opens upward to avoid viewport clipping
          const openUp = index >= members.length - 2;

          return (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
              <Avatar className="size-9 shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} className="object-cover" />}
                <AvatarFallback className={`text-[11px] font-semibold ${getAvatarClass(m.level)}`}>
                  {getInitials(
                    m.member.fullName,
                    m.member.firstName ?? undefined,
                    m.member.lastName ?? undefined,
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {isMe ? (
                    <span className="truncate text-sm font-medium">{name}</span>
                  ) : (
                    <Link
                      href={`/profile/${m.memberId}`}
                      className="hover:text-primary truncate text-sm font-medium"
                    >
                      {name}
                    </Link>
                  )}
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${getRoleChipClass(m.level)}`}
                  >
                    {m.level}
                  </span>
                </div>
                <p className="text-muted-foreground truncate text-xs">
                  Joined {formatDateToDayMonYear(m.createdAt)}
                  {m.member.location ? ` · ${m.member.location}` : ''}
                </p>
              </div>

              {isMe ? (
                <span className="text-muted-foreground shrink-0 text-xs">You</span>
              ) : isMod ? (
                <MemberManagePopover
                  member={m}
                  isLeader={isLeader}
                  openUp={openUp}
                  onChangeRole={onChangeRole}
                  onRemove={onRemove}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      {totalPage > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3 sm:px-5">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-xs">
            Page {page} of {totalPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPage}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default MemberList;
