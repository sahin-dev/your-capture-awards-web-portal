'use client';

import DisbandModal from '@/components/module/team/DisbandModal';
import EditTeamModal from '@/components/module/team/EditTeamModal';
import InviteModal from '@/components/module/team/InviteModal';
import JoinRequests from '@/components/module/team/JoinRequests';
import LeaveTeamDialog from '@/components/module/team/LeaveTeamDialog';
import MemberList from '@/components/module/team/MemberList';
import RemoveMemberDialog from '@/components/module/team/RemoveMemberDialog';
import TeamInfo from '@/components/module/team/TeamInfo';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { EditTeamValues } from '@/lib/schemas/teamSchema';
import {
  teamApi,
  useApproveJoinRequestMutation,
  useAssignRoleMutation,
  useDeleteTeamMutation,
  useGetMyTeamQuery,
  useGetTeamMembersQuery,
  useGetPendingRequestsQuery,
  useLeaveTeamMutation,
  useRejectJoinRequestMutation,
  useRemoveMemberMutation,
  useRevokeRoleMutation,
  useUpdateTeamMutation,
} from '@/store/apis/teamApi';
import { useAppDispatch } from '@/store/hooks';
import { Accessibility, Role, TeamMember } from '@/types/team';
import { showErrorToast } from '@/utils/team-feedback';
import { getMemberName } from '@/utils/team-utils';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type JoinRequestViewModel = {
  id: string;
  requesterId?: string;
  requester?: {
    fullName: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
  createdAt?: string;
};

export default function TeamPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const currentUserId = user?.id || '';

  const { data: teamData, isLoading: isTeamLoading, isError: isTeamError } = useGetMyTeamQuery();
  const team = teamData?.data?.team;
  const allTeamMembers = teamData?.data?.members ?? [];
  const membership = allTeamMembers.find((member) => member.memberId === currentUserId);
  const isLeader = membership?.level === 'LEADER';
  const isMod = membership?.level === 'LEADER' || membership?.level === 'MODERATOR';
  const [memberPage, setMemberPage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);
  const {
    data: membersData,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useGetTeamMembersQuery(
    { teamId: team?.id || '', page: memberPage, limit: 10 },
    {
      skip: !team?.id,
    },
  );
  const { data: requestsData } = useGetPendingRequestsQuery(
    {
      teamId: team?.id || '',
      page: requestPage,
      limit: 10,
    },
    {
      skip: !team?.id || !isMod,
    },
  );

  const [approveRequest] = useApproveJoinRequestMutation();
  const [rejectRequest] = useRejectJoinRequestMutation();
  const [assignRole] = useAssignRoleMutation();
  const [revokeRole] = useRevokeRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [leaveTeam] = useLeaveTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();

  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [disbandOpen, setDisbandOpen] = useState(false);

  const navigateToTeamsListing = useCallback(() => {
    dispatch(teamApi.util.resetApiState());
    router.replace('/teams');
  }, [dispatch, router]);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const members: TeamMember[] = membersData?.data || [];
  const requests = (requestsData?.data || []) as JoinRequestViewModel[];
  const memberMeta = membersData?.meta;
  const requestMeta = requestsData?.meta;
  const hasInviteSlots = team ? (teamData?.data?.memberCount ?? 0) < team.member_slots : false;
  const leaveCandidates = useMemo(
    () => allTeamMembers.filter((member: TeamMember) => member.memberId !== currentUserId),
    [allTeamMembers, currentUserId],
  );

  useEffect(() => {
    if (memberMeta?.totalPage && memberPage > memberMeta.totalPage) {
      setMemberPage(memberMeta.totalPage);
    }
  }, [memberMeta?.totalPage, memberPage]);

  useEffect(() => {
    if (requestMeta?.totalPage && requestPage > requestMeta.totalPage) {
      setRequestPage(requestMeta.totalPage);
    }
  }, [requestMeta?.totalPage, requestPage]);

  const handleAcceptRequest = useCallback(
    async (req: { id: string }) => {
      try {
        await approveRequest(req.id).unwrap();
        toast.success('Request approved!');
      } catch (error) {
        showErrorToast(error, 'Failed to approve request');
      }
    },
    [approveRequest],
  );

  const handleDeclineRequest = useCallback(
    async (req: { id: string }) => {
      try {
        await rejectRequest(req.id).unwrap();
        toast.success('Request declined');
      } catch (error) {
        showErrorToast(error, 'Failed to reject request');
      }
    },
    [rejectRequest],
  );

  const handleChangeRole = useCallback(
    async (memberId: string, newRole: Role) => {
      if (!team) return;
      try {
        if (newRole === 'MEMBER') {
          await revokeRole({ teamId: team.id, memberId }).unwrap();
        } else {
          await assignRole({ teamId: team.id, memberId, level: newRole }).unwrap();
        }
        const target = members.find((m: TeamMember) => m.id === memberId);
        if (target)
          toast.success(`${getMemberName(target.member)} is now ${newRole.toLowerCase()}.`);
      } catch (error) {
        showErrorToast(error, 'Failed to assign role');
      }
    },
    [team, members, assignRole, revokeRole],
  );

  const handleRemoveMember = useCallback(
    async (target: TeamMember) => {
      if (!team) return;
      try {
        await removeMember({ teamId: team.id, memberId: target.id }).unwrap();
        setRemoveTarget(null);
        toast.success(`${getMemberName(target.member)} removed from team.`);
      } catch (error) {
        showErrorToast(error, 'Failed to remove member');
      }
    },
    [team, removeMember],
  );

  const handleTogglePrivacy = useCallback(async () => {
    if (!team) return;
    try {
      const newAccessibility: Accessibility =
        team.accessibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
      await updateTeam({
        teamId: team.id,
        data: { accessibility: newAccessibility },
      }).unwrap();
      toast.success(`Team is now ${newAccessibility === 'PUBLIC' ? 'public' : 'private'}.`);
    } catch (error) {
      showErrorToast(error, 'Failed to update team privacy');
    }
  }, [team, updateTeam]);

  const handleLeaveTeamWithTransfer = useCallback(
    async (memberId?: string) => {
      if (!team) return;
      if (isLeader && !memberId) {
        toast.error('Select a member to transfer leadership before leaving.');
        return;
      }

      try {
        await leaveTeam({ teamId: team.id, memberId }).unwrap();
        toast.success('You left the team.');
        setLeaveOpen(false);
        await navigateToTeamsListing();
      } catch (error) {
        showErrorToast(error, 'Failed to leave team');
      }
    },
    [isLeader, leaveTeam, navigateToTeamsListing, team],
  );

  const handleEditTeam = useCallback(
    async (values: EditTeamValues & { badgeFile?: File | null; badgePreview?: string | null }) => {
      if (!team) return;
      try {
        await updateTeam({
          teamId: team.id,
          data: (() => {
            const payload = new FormData();
            payload.append('name', values.name);
            payload.append('description', values.description || '');
            payload.append('language', values.language);
            payload.append('country', values.country);
            payload.append('min_requirement', values.min_requirement);
            if (values.badgeFile) {
              payload.append('badge', values.badgeFile);
            }
            return payload;
          })(),
        }).unwrap();
        toast.success('Team info updated!');
        setEditOpen(false);
      } catch (error) {
        showErrorToast(error, 'Failed to update team');
      }
    },
    [team, updateTeam],
  );

  const handleDisband = useCallback(async () => {
    if (!team) return;
    try {
      await deleteTeam(team.id).unwrap();
      toast.success('Team disbanded.');
      setDisbandOpen(false);
      await navigateToTeamsListing();
    } catch (error) {
      showErrorToast(error, 'Failed to disband team');
    }
  }, [team, deleteTeam, navigateToTeamsListing]);

  const handleOpenInvite = useCallback(() => {
    if (!hasInviteSlots) {
      toast.error('This team has no open member slots.');
      return;
    }

    setInviteOpen(true);
  }, [hasInviteSlots]);

  const winRate = team?.total_matches ? Math.round((team.win / team.total_matches) * 100) : 0;

  if (isTeamLoading || isMembersLoading) {
    return (
      <section className="margin-user container space-y-6 py-6" aria-busy="true" aria-live="polite">
        <div className="rounded-xl border p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="size-18 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-6 w-40" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-7 w-28" />
              </div>
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
            <Skeleton className="h-9 w-10 rounded-md" />
          </div>
          <div className="my-5">
            <Skeleton className="h-px w-full" />
          </div>
          <Skeleton className="mb-3 h-4 w-28" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-16" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isTeamError || isMembersError || !team) {
    return null;
  }

  return (
    <section className="margin-user container space-y-6 py-6">
      <TeamInfo
        team={team}
        winRate={winRate}
        isLeader={isLeader}
        onEdit={() => setEditOpen(true)}
        onTogglePrivacy={handleTogglePrivacy}
        onLeave={() => setLeaveOpen(true)}
        onDisband={() => setDisbandOpen(true)}
      />

      {isMod && requests.length > 0 && (
        <JoinRequests
          requests={requests.map((req: (typeof requests)[number]) => ({
            id: req.id,
            memberId: req.requesterId ?? req.id,
            member: {
              fullName:
                req.requester?.fullName ||
                `${req.requester?.firstName ?? ''} ${req.requester?.lastName ?? ''}`.trim(),
              avatar: req.requester?.avatar ?? null,
            },
            requestedAt: req.createdAt ?? new Date().toISOString(),
          }))}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
          page={requestPage}
          total={requestMeta?.total ?? requests.length}
          totalPage={requestMeta?.totalPage ?? 1}
          onPageChange={setRequestPage}
        />
      )}

      <MemberList
        members={members}
        currentUserId={currentUserId}
        isLeader={isLeader}
        isMod={isMod}
        onChangeRole={handleChangeRole}
        onRemove={setRemoveTarget}
        canInvite={hasInviteSlots}
        onInvite={handleOpenInvite}
        page={memberPage}
        total={memberMeta?.total ?? members.length}
        totalPage={memberMeta?.totalPage ?? 1}
        onPageChange={setMemberPage}
      />

      <EditTeamModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        team={team}
        onSave={handleEditTeam}
      />

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        teamId={team.id}
        members={allTeamMembers}
        hasSlots={hasInviteSlots}
      />

      <DisbandModal
        open={disbandOpen}
        onClose={() => setDisbandOpen(false)}
        teamName={team.name}
        onDisband={handleDisband}
      />

      <LeaveTeamDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        teamName={team.name}
        currentUserId={currentUserId}
        members={leaveCandidates}
        isLeader={isLeader}
        onLeave={handleLeaveTeamWithTransfer}
      />

      <RemoveMemberDialog
        target={removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveMember}
      />
    </section>
  );
}
