'use client';

import TeamMatchStatusCard from '@/components/module/match/TeamMatchStatusCard';
import SafeBannerImage from '@/components/SafeBannerImage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import UploadModal, { UploadModalRef } from '@/components/UploadModal';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/providers/SocketProvider';
import { useGetContestQuery, useGetJoinedContestQuery } from '@/store/apis/contestApi';
import {
  useGetMyTeamQuery,
  useGetTeamMatchSearchStatusQuery,
  useUploadChatFileMutation,
} from '@/store/apis/teamApi';
import type { TeamMatchSearchStatus } from '@/store/types/teamTypes';
import { cn } from '@/utils/cn';
import { ArrowDown, FileUp, ImagePlus, Loader2, Send, Swords, TriangleAlert } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { toast } from 'sonner';

type ChatUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName?: string | null;
  avatar: string | null;
};

type SystemMessageMetadata = {
  event?: string;
  contestId?: string;
  contestTitle?: string;
  contestBanner?: string | null;
  maxUpload?: number | null;
  contestEndDate?: string;
  expiresAt?: string;
  matchId?: string;
  team1Name?: string;
  team2Name?: string;
  joinedCount?: number;
  minMembers?: number;
  reason?: string;
};

type ChatMessage = {
  id: string;
  message: string;
  messageType: 'text' | 'file' | 'system' | string;
  fileUrl: string | null;
  senderId: string | null;
  teamId: string;
  createdAt: string;
  updatedAt: string;
  sender: ChatUser | null;
  metadata?: SystemMessageMetadata | null;
};

type SocketAck = {
  success: boolean;
  message?: string;
  userId?: string;
  data?: ChatMessage | ChatMessage[];
};

type TeamMessagesResponse = {
  success?: boolean;
  message?: string;
  data?: ChatMessage[] | { data?: ChatMessage[] } | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type ChatMessageGroup = {
  id: string;
  senderId: string | null;
  sender: ChatUser | null;
  createdAt: string;
  messages: ChatMessage[];
};

type NewMessagePayload = {
  event: 'message';
  data: ChatMessage;
};

const isSystemMessage = (message: Pick<ChatMessage, 'messageType' | 'senderId'>) =>
  message.messageType === 'system' || !message.senderId;

const getDisplayName = (sender: ChatUser | null) => {
  if (!sender) return 'Team member';
  const name = sender.fullName ?? `${sender.firstName ?? ''} ${sender.lastName ?? ''}`.trim();
  return name || 'Team member';
};

const getInitial = (sender: ChatUser | null) => {
  return getDisplayName(sender).charAt(0).toUpperCase() || 'U';
};

const getFileLabel = (url: string | null) => {
  if (!url) return 'Shared file';
  const clean = url.split('?')[0];
  return decodeURIComponent(clean.split('/').pop() || 'Shared file');
};

const isImageUrl = (url: string | null) => {
  if (!url) return false;
  return /\.(avif|bmp|gif|jpe?g|png|webp|svg)$/i.test(url.split('?')[0]);
};

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

export default function TeamChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    data: teamData,
    isLoading: teamLoading,
    isError: teamError,
    refetch: refetchTeam,
  } = useGetMyTeamQuery();
  const [uploadChatFile] = useUploadChatFileMutation();

  const team = teamData?.data?.team;
  const teamId = team?.id ?? '';
  const currentUserId = user?.id ?? '';

  const { data: matchSearchStatusData } = useGetTeamMatchSearchStatusQuery(teamId, {
    skip: !teamId,
    pollingInterval: 15000,
  });
  const activeQueueEntries = matchSearchStatusData?.data ?? [];

  const [joiningContestId, setJoiningContestId] = useState<string | null>(null);
  const uploadModalRef = useRef<UploadModalRef>(null);
  const { data: joiningContestData } = useGetContestQuery(
    { id: joiningContestId ?? '' },
    { skip: !joiningContestId },
  );
  const { data: joinedContestData } = useGetJoinedContestQuery(
    { page: 1, limit: 10 },
    { skip: !joiningContestId },
  );

  useEffect(() => {
    if (joiningContestId && joiningContestData) {
      uploadModalRef.current?.open();
    }
  }, [joiningContestId, joiningContestData]);

  const joiningContest = joiningContestData?.data;
  const joiningContestJoinedEntry = joinedContestData?.data?.find(
    (contestItem: any) => contestItem.id === joiningContestId,
  );
  const joiningContestMaxUploads: number =
    joiningContest?.maxUploads ?? joiningContest?.maxUpload ?? 0;
  const joiningContestUploadedCount =
    joiningContestJoinedEntry?.uploadCount ?? joiningContestJoinedEntry?.photos?.length ?? 0;
  const joiningContestRemaining = Math.max(
    0,
    joiningContestMaxUploads - joiningContestUploadedCount,
  );

  const { socket, isConnected, isAuthenticated: isAuthenticatedSocket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [, setIsJoiningTeam] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const isPrependingOlderRef = useRef(false);
  const olderScrollStateRef = useRef<{ top: number; height: number } | null>(null);
  const skipNextAutoScrollRef = useRef(false);
  const isAtBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current;

    if (container) {
      isAtBottomRef.current = true;
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  const normalizeMessages = useCallback((response: TeamMessagesResponse) => {
    return Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
        ? response.data.data
        : [];
  }, []);

  const sortMessages = useCallback((items: ChatMessage[]) => {
    return [...items].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, []);

  const appendIncomingMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const handleNewMessage = useCallback(
    (payload: NewMessagePayload) => {
      if (payload?.data) {
        appendIncomingMessage(payload.data);
      }
    },
    [appendIncomingMessage],
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadChatFile(formData).unwrap();
      const fileUrl = result?.data?.fileUrl || result?.data?.url;

      if (!fileUrl) {
        throw new Error('Upload response did not include a file URL');
      }

      return fileUrl;
    },
    [uploadChatFile],
  );

  const loadTeamMessages = useCallback(
    (socket: Socket, currentTeamId: string, targetPage = 1, appendOlder = false) => {
      if (appendOlder && isPrependingOlderRef.current) return;

      if (appendOlder) {
        setIsLoadingOlder(true);
        isPrependingOlderRef.current = true;
        olderScrollStateRef.current = {
          top: scrollContainerRef.current?.scrollTop ?? 0,
          height: scrollContainerRef.current?.scrollHeight ?? 0,
        };
      }

      socket.emit(
        'get_team_messages',
        { teamId: currentTeamId, page: targetPage, limit },
        (response: TeamMessagesResponse) => {
          if (!response?.success) {
            toast.error(response?.message || 'Failed to load team messages');
            setIsLoadingOlder(false);
            isPrependingOlderRef.current = false;
            olderScrollStateRef.current = null;
            return;
          }

          const incomingMessages = sortMessages(normalizeMessages(response));
          const meta = response.meta;

          setHasMoreOlder(meta?.hasNextPage ?? incomingMessages.length === limit);

          if (appendOlder) {
            const container = scrollContainerRef.current;

            setMessages((prev) => {
              const merged = [...incomingMessages, ...prev];
              const deduped = merged.filter(
                (item, index, array) => array.findIndex((entry) => entry.id === item.id) === index,
              );
              return sortMessages(deduped);
            });

            requestAnimationFrame(() => {
              if (container && olderScrollStateRef.current) {
                const nextHeight = container.scrollHeight;
                const { top, height } = olderScrollStateRef.current;
                container.scrollTop = nextHeight - height + top;
                const isAwayFromBottom =
                  container.scrollHeight - container.scrollTop - container.clientHeight > 96;
                isAtBottomRef.current = !isAwayFromBottom;
              }
              olderScrollStateRef.current = null;
              isPrependingOlderRef.current = false;
              skipNextAutoScrollRef.current = true;
              setPage(meta?.page ?? targetPage);
              setIsLoadingOlder(false);
            });
            return;
          }

          setMessages(incomingMessages);
          setPage(meta?.page ?? targetPage);
          setInitialLoaded(true);
          requestAnimationFrame(() => scrollToBottom('auto'));
        },
      );
    },
    [limit, normalizeMessages, scrollToBottom, sortMessages],
  );

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (
      container.scrollTop < 24 &&
      socket &&
      teamId &&
      hasMoreOlder &&
      !isLoadingOlder &&
      !isPrependingOlderRef.current
    ) {
      void loadTeamMessages(socket, teamId, page + 1, true);
    }

    const isAwayFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight > 96;
    isAtBottomRef.current = !isAwayFromBottom;
    setShowScrollButton(isAwayFromBottom);
  }, [hasMoreOlder, isLoadingOlder, loadTeamMessages, page, socket, teamId]);

  const sendMessage = useCallback(
    async ({ text, file }: { text?: string; file?: File | null }) => {
      if (!socket || !teamId || !isAuthenticatedSocket) return;

      const trimmedText = text?.trim() ?? '';
      if (!trimmedText && !file) return;

      setIsSending(true);

      try {
        let fileUrl: string | undefined;
        let message = trimmedText;
        let messageType: 'text' | 'file' = 'text';

        if (file) {
          fileUrl = await uploadFile(file);
          messageType = 'file';
          message = trimmedText || file.name;
        }

        socket.emit(
          'send_message',
          {
            teamId,
            message,
            messageType,
            fileUrl,
          },
          (response: SocketAck) => {
            if (!response?.success) {
              toast.error(response?.message || 'Failed to send message');
              return;
            }

            if (response.data && !Array.isArray(response.data)) {
              appendIncomingMessage(response.data);
            }
          },
        );

        setDraft('');
        setPendingFile(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send message';
        toast.error(message);
      } finally {
        setIsSending(false);
      }
    },
    [appendIncomingMessage, isAuthenticatedSocket, socket, teamId, uploadFile],
  );

  const handleSubmit = useCallback(async () => {
    await sendMessage({ text: draft, file: pendingFile });
  }, [draft, pendingFile, sendMessage]);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPendingFile(file);
  }, []);

  useEffect(() => {
    if (!socket || !teamId || !isAuthenticatedSocket) return;

    setMessages([]);
    setInitialLoaded(false);
    setIsJoiningTeam(true);

    socket.emit('join_team', teamId, (joinResponse: SocketAck) => {
      setIsJoiningTeam(false);

      if (!joinResponse?.success) {
        toast.error(joinResponse?.message || 'Failed to join team chat');
        return;
      }

      const joinedMessages = normalizeMessages({
        success: joinResponse.success,
        message: joinResponse.message,
        data: joinResponse.data as ChatMessage[] | { data?: ChatMessage[] } | null,
      });

      if (joinedMessages.length > 0) {
        setMessages(sortMessages(joinedMessages));
        setInitialLoaded(true);
        requestAnimationFrame(() => scrollToBottom('auto'));
        return;
      }

      loadTeamMessages(socket, teamId, 1, false);
    });

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.emit('leave_team', teamId);
    };
  }, [
    handleNewMessage,
    isAuthenticatedSocket,
    loadTeamMessages,
    normalizeMessages,
    scrollToBottom,
    socket,
    sortMessages,
    teamId,
  ]);

  useEffect(() => {
    if (messages.length === 0 || !initialLoaded || isLoadingOlder || isPrependingOlderRef.current)
      return;
    if (skipNextAutoScrollRef.current) {
      skipNextAutoScrollRef.current = false;
      return;
    }
    if (!isAtBottomRef.current) return;

    const frame1 = requestAnimationFrame(() => {
      scrollToBottom('auto');
      requestAnimationFrame(() => scrollToBottom('auto'));
    });

    return () => cancelAnimationFrame(frame1);
  }, [initialLoaded, isLoadingOlder, messages, scrollToBottom]);

  const groupedMessages = useMemo<ChatMessageGroup[]>(() => {
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return sortedMessages.reduce<ChatMessageGroup[]>((groups, message) => {
      const lastGroup = groups[groups.length - 1];
      const lastMessage = lastGroup?.messages[lastGroup.messages.length - 1];
      const currentTime = new Date(message.createdAt).getTime();
      const lastTime = lastMessage ? new Date(lastMessage.createdAt).getTime() : 0;
      const canMerge =
        !!lastGroup &&
        !isSystemMessage(message) &&
        !isSystemMessage({
          messageType: lastMessage?.messageType ?? '',
          senderId: lastGroup.senderId,
        }) &&
        lastGroup.senderId === message.senderId &&
        currentTime - lastTime <= 1 * 60 * 1000;

      if (canMerge) {
        lastGroup.messages.push(message);
        lastGroup.createdAt = message.createdAt;
        return groups;
      }

      groups.push({
        id: message.id,
        senderId: message.senderId,
        sender: message.sender,
        createdAt: message.createdAt,
        messages: [message],
      });

      return groups;
    }, []);
  }, [messages]);

  const isReady = isConnected && isAuthenticatedSocket && !!teamId;

  if (teamLoading || authLoading) {
    return (
      <section className="margin-user container py-6" aria-busy="true" aria-live="polite">
        <div className="border-border-subtle bg-surface-secondary rounded-2xl border p-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-60" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-18 w-full rounded-2xl" />
            <Skeleton className="ml-auto h-18 w-4/5 rounded-2xl" />
            <Skeleton className="h-18 w-3/4 rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  if (teamError) {
    return (
      <section className="margin-user container py-6">
        <div className="border-border-subtle bg-surface-secondary rounded-2xl border p-6 text-center">
          <TriangleAlert className="text-primary mx-auto size-10" />
          <p className="mt-3 text-lg font-semibold">Failed to load team chat</p>
          <p className="text-muted-foreground mt-1 text-sm">We could not load your team data.</p>
          <Button className="mt-4" onClick={() => refetchTeam()}>
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!team) {
    return (
      <section className="margin-user container py-6">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground text-sm">Team not found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="margin-user container flex h-[calc(100dvh-93px)] min-w-0 flex-col overflow-x-hidden py-6">
      <div className="border-border-subtle bg-background/95 shadow-overlay relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border">
        {/* Header — shows TEAM info, not the current user */}
        <div className="border-border-subtle bg-background/95 sticky top-0 z-20 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="border-border-subtle size-10 shrink-0 border">
              <AvatarImage src={team.badge ?? undefined} alt={team.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {team.name?.slice(0, 2).toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-semibold">
                {team.name || 'Team Chat'}
              </p>
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    'size-1.5 shrink-0 rounded-full',
                    isReady ? 'bg-success-500' : 'bg-warning-500',
                  )}
                />
                {isReady ? 'Connected' : 'Connecting...'}
              </p>
            </div>
          </div>

          <div
            className={cn(
              'hidden shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium sm:inline-flex',
              isReady
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
            )}
          >
            <span className="size-2 rounded-full bg-current" />
            {isReady ? 'Live' : 'Connecting'}
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex min-w-0 flex-1 scrollbar-thin flex-col gap-4 overflow-x-hidden overflow-y-auto px-4 py-5"
        >
          {groupedMessages.length === 0 ? (
            <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center sm:min-h-70">
              <MessageState isReady={isReady} />
            </div>
          ) : (
            groupedMessages.map((group) => {
              if (
                isSystemMessage({
                  messageType: group.messages[0]?.messageType ?? '',
                  senderId: group.senderId,
                })
              ) {
                return (
                  <div key={group.id} className="flex flex-col items-center gap-2">
                    {group.messages.map((message) => {
                      const event = message.metadata?.event;

                      if (
                        event === 'TEAM_MATCH_WAITING_FOR_MEMBERS' ||
                        event === 'TEAM_MATCH_SEARCH_STARTED'
                      ) {
                        return (
                          <TeamMatchQueueCard
                            key={message.id}
                            message={message}
                            status={
                              event === 'TEAM_MATCH_WAITING_FOR_MEMBERS'
                                ? 'WAITING_FOR_MEMBERS'
                                : 'SEARCHING'
                            }
                            liveEntries={activeQueueEntries}
                            onJoinClick={setJoiningContestId}
                          />
                        );
                      }

                      if (event === 'TEAM_MATCH_FOUND') {
                        return <MatchFoundCard key={message.id} message={message} />;
                      }

                      return (
                        <p
                          key={message.id}
                          className="text-muted-foreground bg-surface-secondary border-border-subtle max-w-[85%] rounded-full border px-3 py-1.5 text-center text-xs wrap-break-word"
                        >
                          {message.message}
                        </p>
                      );
                    })}
                  </div>
                );
              }

              const isMine = group.senderId === currentUserId;
              const senderName = getDisplayName(group.sender);

              return (
                <div
                  key={group.id}
                  className={cn(
                    'flex min-w-0 items-end gap-3',
                    isMine ? 'flex-row-reverse' : 'flex-row',
                  )}
                >
                  <Avatar className="border-border-subtle size-9 shrink-0 border">
                    <AvatarImage src={group.sender?.avatar ?? undefined} alt={senderName} />
                    <AvatarFallback
                      className={cn(
                        'text-primary-foreground text-xs font-semibold',
                        isMine ? 'bg-primary' : 'bg-surface-tertiary',
                      )}
                    >
                      {getInitial(group.sender)}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      'flex max-w-[min(78%,100%)] min-w-0 flex-col gap-1',
                      isMine ? 'items-end' : 'items-start',
                    )}
                  >
                    <div className="flex flex-col gap-2">
                      {group.messages.map((message) => {
                        const bubbleRadius = isMine
                          ? 'rounded-t-2xl rounded-bl-2xl rounded-br-none'
                          : 'rounded-t-2xl rounded-tr-2xl rounded-bl-none rounded-br-2xl';
                        const bubbleAlign = isMine ? 'ml-auto' : 'mr-auto';

                        return (
                          <div
                            key={message.id}
                            className={cn(
                              'w-fit max-w-full overflow-hidden px-4 py-3 text-sm leading-relaxed shadow-sm',
                              isMine
                                ? 'bg-primary text-primary-foreground'
                                : 'border-border-subtle bg-surface-secondary text-foreground border',
                              bubbleRadius,
                              bubbleAlign,
                            )}
                          >
                            {message.messageType === 'file' ? (
                              <div className="flex w-full max-w-full flex-col gap-2 wrap-break-word">
                                {message.fileUrl && (
                                  <>
                                    {isImageUrl(message.fileUrl) ? (
                                      <a href={message.fileUrl} target="_blank" rel="noreferrer">
                                        <Image
                                          src={message.fileUrl}
                                          alt={getFileLabel(message.fileUrl)}
                                          width={900}
                                          height={600}
                                          unoptimized
                                          className="border-border-subtle h-auto max-h-64 w-auto max-w-full rounded-xl border object-cover"
                                        />
                                      </a>
                                    ) : (
                                      <div className="flex min-w-0 items-center gap-2">
                                        <FileUp className="size-4 shrink-0" />
                                        <a
                                          href={message.fileUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="min-w-0 font-medium break-all underline decoration-white/30 underline-offset-4 hover:decoration-white"
                                        >
                                          {getFileLabel(message.fileUrl)}
                                        </a>
                                      </div>
                                    )}
                                  </>
                                )}
                                {message.message && (
                                  <p className="text-foreground/85 text-sm">{message.message}</p>
                                )}
                              </div>
                            ) : (
                              <p className="wrap-break-word">{message.message}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div
                      className={cn(
                        'text-foreground/50 flex items-center gap-2 px-1 text-xs',
                        isMine ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <span className="text-foreground/75 font-medium">{senderName}</span>
                      <span>{timeFormatter.format(new Date(group.createdAt))}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-border-subtle bg-surface-secondary shrink-0 border-t p-3 backdrop-blur">
          {pendingFile && (
            <div className="border-border-subtle bg-surface-secondary mb-3 flex min-w-0 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate font-medium">{pendingFile.name}</p>
                <p className="text-foreground/50 text-xs">
                  {Math.round(pendingFile.size / 1024)} KB selected
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setPendingFile(null)}
              >
                Remove
              </Button>
            </div>
          )}

          <div className="flex min-w-0 items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Attach file"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:bg-surface-secondary hover:text-foreground size-10 shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-4" />
            </Button>

            <div className="min-w-0 flex-1">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message to your team..."
                className="focus-visible:ring-primary/40 border-border-subtle bg-surface-secondary text-foreground placeholder:text-foreground/35 h-11"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
              />
            </div>

            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 shrink-0 px-3 sm:px-4"
              disabled={isSending || (!draft.trim() && !pendingFile)}
              onClick={() => void handleSubmit()}
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              <span className="ml-2 hidden sm:inline">{pendingFile ? 'Send file' : 'Send'}</span>
            </Button>
          </div>
        </div>

        <div
          className={cn(
            'pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 transition duration-200',
            showScrollButton
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'translate-y-2 opacity-0',
          )}
        >
          <button
            type="button"
            onClick={() => scrollToBottom()}
            className="bg-primary text-primary-foreground shadow-overlay flex size-9 items-center justify-center rounded-full shadow-lg transition active:scale-95"
          >
            <ArrowDown className="size-4" />
          </button>
        </div>
      </div>

      {joiningContestId && joiningContest && (
        <UploadModal
          ref={uploadModalRef}
          type="join"
          contest={joiningContest}
          contestType={joiningContest?.type}
          title={joiningContest?.title}
          description={joiningContest?.description}
          remaining={joiningContestRemaining}
          maxUploads={joiningContestMaxUploads}
          contestId={joiningContestId}
        />
      )}
    </section>
  );
}

function MessageState({ isReady }: { isReady: boolean }) {
  return (
    <div className="mx-auto max-w-xs px-4 text-center">
      <div className="bg-primary/10 border-primary/20 mx-auto flex size-14 items-center justify-center rounded-full border">
        <Send className="text-primary size-6" />
      </div>
      <p className="text-foreground mt-4 text-base font-semibold">
        {isReady ? 'No messages yet' : 'Connecting to chat'}
      </p>
      <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
        {isReady ? 'Send the first message to start the conversation with your team.' : ''}
      </p>
      {!isReady && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span className="bg-primary/60 size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
          <span className="bg-primary/60 size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
          <span className="bg-primary/60 size-1.5 animate-bounce rounded-full" />
        </div>
      )}
    </div>
  );
}

function TeamMatchQueueCard({
  message,
  status,
  liveEntries,
  onJoinClick,
}: {
  message: ChatMessage;
  status: 'WAITING_FOR_MEMBERS' | 'SEARCHING';
  liveEntries: TeamMatchSearchStatus[];
  onJoinClick: (contestId: string) => void;
}) {
  const {
    contestId,
    contestTitle,
    contestBanner,
    maxUpload,
    contestEndDate,
    expiresAt,
    minMembers,
  } = message.metadata ?? {};

  const live = liveEntries.find(
    (entry) => entry.contestId === contestId && entry.status === status,
  );

  // Older messages sent before contestEndDate was added to the metadata only
  // have expiresAt — fall back to that instead of dropping the card.
  const resolvedEndDate = live?.contestEndDate ?? contestEndDate ?? expiresAt;

  if (!resolvedEndDate) return null;

  return (
    <TeamMatchStatusCard
      heading="New Match selected!"
      contestTitle={live?.contestTitle || contestTitle || 'Contest'}
      contestBanner={live?.contestBanner ?? contestBanner}
      maxUpload={live?.maxUpload ?? maxUpload}
      contestEndDate={resolvedEndDate}
      status={status}
      minMembers={live?.minMembers ?? minMembers}
      currentUserJoined={live?.currentUserJoined}
      onJoinClick={contestId ? () => onJoinClick(contestId) : undefined}
      className="w-full max-w-sm"
    />
  );
}

function MatchFoundCard({ message }: { message: ChatMessage }) {
  const { contestTitle, contestBanner, team1Name, team2Name } = message.metadata ?? {};

  return (
    <article className="border-border bg-surface-secondary/80 w-full max-w-sm overflow-hidden rounded-xl border-2">
      <div className="relative h-32 overflow-hidden sm:h-40">
        <SafeBannerImage
          src={contestBanner}
          alt={`${contestTitle || 'Contest'} banner`}
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-black/85 to-transparent" />

        <div className="bg-success-500/95 absolute top-3 right-3 z-10 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
          <Swords className="size-3" />
          Match found
        </div>

        <div className="absolute top-3 right-24 left-3 z-10">
          <h3 className="line-clamp-2 text-sm leading-snug font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,1)] sm:text-base">
            {contestTitle || 'Contest'}
          </h3>
        </div>

        {(team1Name || team2Name) && (
          <div className="text-foreground absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 bg-zinc-950/90 py-2.5 text-sm font-semibold">
            <span className="max-w-[40%] truncate">{team1Name}</span>
            <span className="text-muted-foreground text-xs font-normal">vs</span>
            <span className="max-w-[40%] truncate">{team2Name}</span>
          </div>
        )}
      </div>
    </article>
  );
}
