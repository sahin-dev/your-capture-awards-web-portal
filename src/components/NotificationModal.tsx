'use client';

import NotificationMessage from '@/components/NotificationMessage';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetUserNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/store/apis/notificationApi';
import { useJoinByInvitationMutation, useRejectInvitationMutation } from '@/store/apis/teamApi';
import { NotificationItem, NotificationType } from '@/store/types/notificationTypes';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const typeLabel: Record<NotificationType, string> = {
  [NotificationType.DEFAULT]: 'Update',
  [NotificationType.INVITATION]: 'Invitation',
  [NotificationType.PAYMENT]: 'Payment',
  [NotificationType.VOTE]: 'Vote',
  [NotificationType.LIKE]: 'Like',
  [NotificationType.TEAM_JOIN_REQUEST]: 'Team request',
  [NotificationType.TEAM_JOIN_APPROVED]: 'Team approved',
  [NotificationType.TEAM_JOIN_REJECTED]: 'Team rejected',
};

const formatRelative = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

export default function NotificationModal() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>([]);
  const { data, isLoading, isFetching } = useGetUserNotificationsQuery(
    { page, limit: 10 },
    { skip: !token },
  );
  const [markAllRead, { isLoading: isMarking }] = useMarkAllNotificationsReadMutation();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [joinByInvitation, { isLoading: isAcceptingInvitation }] = useJoinByInvitationMutation();
  const [rejectInvitation, { isLoading: isRejectingInvitation }] = useRejectInvitationMutation();
  const [activeInvitationId, setActiveInvitationId] = useState<string | null>(null);
  const [handledInvitations, setHandledInvitations] = useState<
    Record<string, 'accepted' | 'rejected'>
  >({});
  const isHandlingInvitation = isAcceptingInvitation || isRejectingInvitation;

  const notifications = notificationItems;
  const loadedUnreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );
  const unreadCount = data?.data.meta.unreadCount ?? loadedUnreadCount;
  const hasMore = data?.data.meta.hasNextPage ?? false;

  useEffect(() => {
    setPage(1);
    setNotificationItems([]);
  }, [token]);

  useEffect(() => {
    const incoming = data?.data.notifications;
    if (!incoming) return;

    setNotificationItems((current) => {
      if (page === 1) return incoming;
      const map = new Map(current.map((notification) => [notification.id, notification]));
      incoming.forEach((notification) => map.set(notification.id, notification));
      return Array.from(map.values());
    });
  }, [data?.data.notifications, page]);

  const handleMarkAllRead = async () => {
    if (!unreadCount) return;
    try {
      await markAllRead().unwrap();
      setNotificationItems((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  // Clicking a notification only ever marks it read - it never navigates or
  // closes the panel. Navigation happens exclusively through the specific
  // entity links rendered inside the message itself (see NotificationMessage),
  // so the rest of the card stays a plain "mark as read" surface.
  const handleNotificationClick = async (notification: NotificationItem) => {
    if (notification.isRead) return;

    try {
      await markNotificationRead(notification.id).unwrap();
      setNotificationItems((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)),
      );
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleAcceptInvitation = async (notification: NotificationItem) => {
    const code = notification.data?.code;

    if (!code) {
      toast.error('Invitation code is missing.');
      return;
    }

    setActiveInvitationId(notification.id);
    try {
      await joinByInvitation({ code, notificationId: notification.id }).unwrap();
      setHandledInvitations((current) => ({ ...current, [notification.id]: 'accepted' }));
      toast.success('Team invitation accepted.');
      setOpen(false);
    } catch {
      toast.error('Failed to accept invitation.');
    } finally {
      setActiveInvitationId(null);
    }
  };

  const handleRejectInvitation = async (notification: NotificationItem) => {
    const code = notification.data?.code;

    if (!code) {
      toast.error('Invitation code is missing.');
      return;
    }

    setActiveInvitationId(notification.id);
    try {
      await rejectInvitation({ code, notificationId: notification.id }).unwrap();
      setHandledInvitations((current) => ({ ...current, [notification.id]: 'rejected' }));
      toast.success('Team invitation rejected.');
    } catch {
      toast.error('Failed to reject invitation.');
    } finally {
      setActiveInvitationId(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open notifications"
          className="group border-border bg-surface-secondary text-muted-foreground hover:border-border-strong hover:text-foreground relative inline-flex h-8.5 items-center justify-center rounded-full border p-2 transition"
        >
          <Bell className="group-hover:text-primary size-4 transition-colors" />
          {unreadCount > 0 && (
            <span className="bg-primary border-background absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full border" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-80 p-0 max-lg:-mr-10.5 lg:w-88"
      >
        <div className="border-border flex items-center justify-between border-b p-4">
          <p className="text-sm font-semibold">Notifications</p>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={!unreadCount || isMarking}
            className="text-primary inline-flex items-center gap-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="size-4" />
            Mark all read
          </button>
        </div>

        <div className="max-h-100 space-y-2 overflow-y-auto p-3">
          {isLoading ? (
            <div className="text-muted-foreground p-4 text-center text-sm">Loading...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notification: NotificationItem) => {
              const isClickable = !notification.isRead;

              return (
              <div
                key={notification.id}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={isClickable ? () => void handleNotificationClick(notification) : undefined}
                onKeyDown={(event) => {
                  if (!isClickable || (event.key !== 'Enter' && event.key !== ' ')) return;
                  event.preventDefault();
                  void handleNotificationClick(notification);
                }}
                className={cn(
                  'relative flex items-start gap-3 rounded-xl border p-3 transition',
                  notification.isRead ? 'border-border bg-background' : 'border-primary/20 bg-primary/5',
                  isClickable && 'cursor-pointer',
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    notification.isRead
                      ? 'bg-surface-secondary text-foreground'
                      : 'bg-primary text-primary-foreground',
                  )}
                >
                  {typeLabel[notification.type].slice(0, 1)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{notification.title}</p>
                      <NotificationMessage notification={notification} />
                    </div>
                    {!notification.isRead && (
                      <span className="bg-primary mt-1 size-2 shrink-0 rounded-full" />
                    )}
                  </div>
                  <div className="text-muted-foreground mt-2 flex items-center justify-between text-[11px]">
                    <span>{typeLabel[notification.type]}</span>
                    <span>{formatRelative(notification.createdAt)}</span>
                  </div>
                  {notification.type === NotificationType.INVITATION && (
                    <div className="mt-3 flex gap-2">
                      {handledInvitations[notification.id] ||
                      notification.data?.invitationStatus ? (
                        <span className="border-border bg-surface-secondary text-muted-foreground inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium capitalize">
                          {handledInvitations[notification.id] ||
                            notification.data?.invitationStatus}
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isHandlingInvitation}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAcceptInvitation(notification);
                            }}
                          >
                            {activeInvitationId === notification.id && isAcceptingInvitation
                              ? 'Accepting...'
                              : 'Accept'}
                          </button>
                          <button
                            type="button"
                            className="border-border bg-background hover:bg-accent inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition"
                            disabled={isHandlingInvitation}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRejectInvitation(notification);
                            }}
                          >
                            {activeInvitationId === notification.id && isRejectingInvitation
                              ? 'Rejecting...'
                              : 'Reject'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              );
            })
          ) : (
            <div className="border-border bg-surface-secondary text-muted-foreground rounded-2xl border p-6 text-center text-sm">
              <BellOff className="text-muted-foreground mx-auto mb-3 size-6" />
              No new notifications.
            </div>
          )}
          {hasMore && (
            <button
              type="button"
              disabled={isFetching}
              onClick={() => setPage((current) => current + 1)}
              className="border-border text-primary hover:bg-surface-secondary w-full rounded-md border px-3 py-2 text-sm disabled:opacity-60"
            >
              {isFetching ? 'Loading...' : 'Load more'}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
