'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect, useState } from 'react';
import { toast } from 'sonner';

import { PhotoError } from './photo/PhotoError';
import { PhotoSkeleton } from './photo/PhotoSkeleton';
import { PhotoViewer } from './photo/PhotoViewer';
import { Comment, SidebarComments } from './photo/SidebarComments';
import { SidebarHeader } from './photo/SidebarHeader';
import { SidebarMetrics } from './photo/SidebarMetrics';

import { useAuth } from '@/hooks/useAuth';
import {
  useAddCommentMutation,
  useAddReplyMutation,
  useDeleteCommentMutation,
  useLazyGetPhotoCommentsQuery,
  useUpdateCommentMutation,
} from '@/store/apis/commentsApi';
import { useLazyGetUserPhotosQuery } from '@/store/apis/contestApi';
import {
  useLazyGetMyPhotoDetailsQuery,
  useLazyGetOtherUserPhotosQuery,
  useLazyGetPublicPhotoDetailsQuery,
} from '@/store/apis/profileApi';
import { useToggleFollowMutation, useToggleLikeMutation } from '@/store/apis/socialApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { cn } from '@/utils/cn';

interface Props {
  photoId: string;
}

export function PublicPhotoPage({ photoId: initialPhotoId }: Props) {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || '';
  const profileParam = searchParams.get('profile') || '';
  const ownerIdParam = searchParams.get('ownerId') || '';
  const contestParam = searchParams.get('contest') || '';
  const returnToParam = searchParams.get('returnTo') || '';

  const dispatch = useAppDispatch();
  const { user: currentUser } = useAuth();

  const swiperPhotos = useAppSelector((state) => state.profile.swiperPhotos);

  // ── Photo / slide state ────────────────────────────────────────────────────
  const [currentPhotoId, setCurrentPhotoId] = useState(initialPhotoId);
  const [photo, setPhoto] = useState<any>(null);
  const [profileOwner, setProfileOwner] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);
  const [ownerIsFollowed, setOwnerIsFollowed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [transitionReady, setTransitionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local photo-data cache to skip the loading overlay when navigating to
  // a photo we've already seen in this session
  const [photoCache, setPhotoCache] = useState<Record<string, any>>({});

  useEffect(() => {
    if (photo) {
      setLocalLikesCount(photo.likes ?? 0);
    }
  }, [photo]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const isOwnPhoto =
    !!currentUser?.id && (ownerIdParam === currentUser.id || photo?.userId === currentUser.id);

  const activeIndex = Math.max(
    0,
    slides.findIndex((p) => p.id === currentPhotoId),
  );

  const backUrl = (() => {
    if (returnToParam.startsWith('/') && !returnToParam.startsWith('//')) {
      return returnToParam;
    }
    if (source === 'contest' && (contestParam || photo?.contestId)) {
      return `/contest/${contestParam || photo.contestId}`;
    }
    if (source === 'profile') {
      if (
        isOwnPhoto ||
        profileParam === currentUser?.id ||
        profileParam === currentUser?.username
      ) {
        return '/profile';
      }
      return `/profile/${profileParam || ownerIdParam}`;
    }
    if (profileParam) {
      if (profileParam === currentUser?.id || profileParam === currentUser?.username) {
        return '/profile';
      }
      return `/profile/${profileParam}`;
    }
    return '/';
  })();

  // ── RTK Query hooks ────────────────────────────────────────────────────────
  const [fetchMyPhotoDetails, { isLoading: isLoadingOwn, isFetching: isFetchingOwn }] =
    useLazyGetMyPhotoDetailsQuery();
  const [fetchPublicPhotoDetails, { isLoading: isLoadingPublic, isFetching: isFetchingPublic }] =
    useLazyGetPublicPhotoDetailsQuery();
  const isLoading = isLoadingOwn || isLoadingPublic;
  const isFetching = isFetchingOwn || isFetchingPublic;

  const [toggleLike, { isLoading: isLiking }] = useToggleLikeMutation();
  const [toggleFollow, { isLoading: isFollowToggling }] = useToggleFollowMutation();

  // Comments RTK Query — lazy so we control when to fetch
  const [fetchComments] = useLazyGetPhotoCommentsQuery();
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [addReply, { isLoading: isAddingReply }] = useAddReplyMutation();
  const [updateComment, { isLoading: isUpdatingComment }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment }] = useDeleteCommentMutation();

  // Local comments state — populated from RTK cache or fresh fetch
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [commentTotal, setCommentTotal] = useState(0);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const loadComments = async (photoId: string, page = 1) => {
    try {
      // preferCacheValue: true — returns cached data immediately if available
      return await fetchComments({ photoId, page, limit: 10 }, true).unwrap();
    } catch {
      return null;
    }
  };

  // ── Load photo data ────────────────────────────────────────────────────────
  const loadPhotoData = async (photoId: string) => {
    setError(null);

    const viewingOwn = !!currentUser?.id && ownerIdParam === currentUser.id;

    // Serve from local cache instantly (no loading overlay on previously visited photos)
    if (photoCache[photoId]) {
      const cached = photoCache[photoId];
      setPhoto(cached.photo);
      setProfileOwner(cached.profileOwner);
      setLiked(cached.liked);
      setOwnerIsFollowed(cached.ownerIsFollowed);
      setComments(cached.comments);
      setCommentPage(1);
      setCommentsHasMore(false);
      setCommentTotal(cached.comments.length);
      const commentsResult = await loadComments(photoId);
      if (commentsResult) {
        setComments((commentsResult.data as Comment[]) || []);
        setCommentPage(1);
        setCommentsHasMore(commentsResult.meta?.hasNextPage ?? false);
        setCommentTotal(commentsResult.meta?.total ?? commentsResult.data.length);
      }
      return;
    }

    // First visit — fetch photo details and comments together
    try {
      let photoData: any = null;
      let photoOwner: any = null;
      let isLikedFromApi = false;
      let isFollowedFromApi = false;

      if (viewingOwn) {
        const result = await fetchMyPhotoDetails(photoId, true).unwrap();
        const apiData: any = result.data;
        // Create a shallow copy so we don't mutate potentially non-extensible API objects
        photoData = {
          ...(apiData.photo || {}),
          totalVotes: apiData.votes ?? apiData.photo?.totalVotes ?? 0,
        };
        photoOwner = photoData?.user ?? null;
        // `isLiked` may be present at top-level `apiData` or under `photo`.
        isLikedFromApi = apiData.isLiked ?? photoData?.isLiked ?? false;
        isFollowedFromApi = false;
      } else {
        const ownerId = ownerIdParam || photo?.userId || '';
        if (!ownerId) {
          setError('Could not determine photo owner. Please navigate back and try again.');
          return;
        }
        // Force fresh fetch from server for public details so `isLiked` is accurate
        const result = await fetchPublicPhotoDetails({ id: ownerId, photoId }).unwrap();
        const apiData: any = result.data;
        // Create a shallow copy so we don't mutate potentially non-extensible API objects
        photoData = {
          ...(apiData.photo || {}),
          totalVotes: apiData.votes ?? apiData.photo?.totalVotes ?? 0,
        };
        // API sometimes returns owner nested under `photo.user` instead of `photoOwner`.
        photoOwner = apiData.photoOwner ?? apiData.photo?.user ?? null;
        // Read isLiked/isFollowed from top-level apiData when present
        isLikedFromApi = apiData.isLiked ?? photoData?.isLiked ?? false;
        isFollowedFromApi = apiData.isFollowed ?? photoOwner?.isFollowed ?? false;
        // If API returns aggregate votes at top-level, merge into photo for display
        photoData.totalVotes = apiData.votes ?? photoData.totalVotes ?? 0;
      }

      // Fetch comments via RTK Query (uses cache automatically on revisit)
      const commentsResult = await loadComments(photoId);
      const commentsList = (commentsResult?.data as Comment[]) || [];

      setPhoto(photoData);
      setProfileOwner(photoOwner);
      setLiked(isLikedFromApi);
      // eslint-disable-next-line no-console
      console.debug('PublicPhotoPage setLiked', isLikedFromApi, 'photoId', photoId);
      setOwnerIsFollowed(isFollowedFromApi);
      setComments(commentsList);
      setCommentPage(1);
      setCommentsHasMore(commentsResult?.meta?.hasNextPage ?? false);
      setCommentTotal(commentsResult?.meta?.total ?? commentsList.length);

      // Save to local cache
      setPhotoCache((prev) => ({
        ...prev,
        [photoId]: {
          photo: photoData,
          profileOwner: photoOwner,
          liked: isLikedFromApi,
          ownerIsFollowed: isFollowedFromApi,
          comments: commentsList,
        },
      }));
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to load photo.';
      setError(msg);
    }
  };

  // ── Effects ────────────────────────────────────────────────────────────────
  // ── RTK Query lazy loaders for backup slide loading ────────────────────────
  const [fetchContestUserPhotos] = useLazyGetUserPhotosQuery();
  const [fetchProfileUserPhotos] = useLazyGetOtherUserPhotosQuery();

  // On mount: seed slides from Redux swiper state, or fetch dynamically if empty
  useEffect(() => {
    const initializeSlides = async () => {
      if (swiperPhotos.length > 0) {
        setSlides(swiperPhotos);
        const seed = swiperPhotos.find((p) => p.id === initialPhotoId) || swiperPhotos[0];
        if (seed) setPhoto((prev: any) => prev ?? seed);
        return;
      }

      // If swiper is empty, fetch based on context
      if (source === 'contest' && contestParam) {
        try {
          const res = await fetchContestUserPhotos({ id: contestParam }).unwrap();
          const items = (res?.data?.data || []).map((p: any) => ({
            id: p.id,
            url: p.url,
            userId: ownerIdParam || p.userId,
            title: p.title || '',
            views: p.views || 0,
            likes: p.likes || 0,
            totalVotes: p.voteCount || 0,
          }));
          setSlides(items);
          const seed = items.find((p: any) => p.id === initialPhotoId) || items[0];
          if (seed) setPhoto((prev: any) => prev ?? seed);
        } catch {}
      } else if (source === 'profile' && ownerIdParam) {
        try {
          const res = await fetchProfileUserPhotos({
            id: ownerIdParam,
            page: 1,
            limit: 50,
          }).unwrap();
          const items = (res?.data || []).map((p: any) => ({
            id: p.id,
            url: p.url,
            userId: ownerIdParam,
            title: p.title || '',
            views: p.views || 0,
            likes: p.likes || 0,
            totalVotes: p.totalVotes || p.voteCount || 0,
          }));
          setSlides(items);
          const seed = items.find((p: any) => p.id === initialPhotoId) || items[0];
          if (seed) setPhoto((prev: any) => prev ?? seed);
        } catch {}
      }
    };

    initializeSlides();
  }, []);

  // Fetch full details when photo ID changes
  useEffect(() => {
    loadPhotoData(currentPhotoId);
  }, [currentPhotoId]);

  // SSR-safe: collapse sidebar on mobile
  useLayoutEffect(() => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, []);

  // Enable CSS transitions after first paint (avoids flash of unstyled transition)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setTransitionReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const updateAddressBar = (photoId: string) => {
    window.history.replaceState(null, '', `/photo/${photoId}${window.location.search}`);
  };

  const handleNext = () => {
    if (slides.length <= 1) return;
    const next = slides[(activeIndex + 1) % slides.length];
    if (next) {
      setCurrentPhotoId(next.id);
      updateAddressBar(next.id);
    }
  };

  const handlePrev = () => {
    if (slides.length <= 1) return;
    const prev = slides[(activeIndex - 1 + slides.length) % slides.length];
    if (prev) {
      setCurrentPhotoId(prev.id);
      updateAddressBar(prev.id);
    }
  };

  const handleIndexChange = (index: number) => {
    const selected = slides[index];
    if (selected) {
      setCurrentPhotoId(selected.id);
      updateAddressBar(selected.id);
    }
  };

  // ── Like / Follow ──────────────────────────────────────────────────────────
  const handleToggleLike = async () => {
    if (isLiking) return;
    try {
      const res = await toggleLike(currentPhotoId).unwrap();
      if (res.success) {
        setLiked((prev) => {
          const next = !prev;
          setLocalLikesCount((count) => count + (next ? 1 : -1));
          setPhotoCache((old) => {
            if (!old[currentPhotoId]) return old;
            return {
              ...old,
              [currentPhotoId]: {
                ...old[currentPhotoId],
                liked: next,
                photo: {
                  ...old[currentPhotoId].photo,
                  likes: (old[currentPhotoId].photo.likes ?? 0) + (next ? 1 : -1),
                },
              },
            };
          });
          return next;
        });
      }
    } catch {}
  };

  const handleToggleFollow = async () => {
    const targetUserId = profileOwner?.id;
    if (!targetUserId) return;
    try {
      const res = await toggleFollow({ userId: targetUserId }).unwrap();
      if (res.success) {
        setOwnerIsFollowed((prev) => {
          const next = !prev;
          setPhotoCache((old) => {
            const updated = { ...old };
            Object.keys(updated).forEach((id) => {
              if (updated[id].profileOwner?.id === targetUserId) {
                updated[id] = { ...updated[id], ownerIsFollowed: next };
              }
            });
            return updated;
          });
          return next;
        });
      }
    } catch {}
  };

  // ── Comment handlers (all via RTK Query) ───────────────────────────────────
  const refreshComments = async () => {
    // Force fresh fetch and update local state + cache
    const result = await fetchComments({ photoId: currentPhotoId, page: 1, limit: 10 }).unwrap();
    const updated = (result.data as unknown as Comment[]) || [];
    setComments(updated);
    setCommentPage(1);
    setCommentsHasMore(result.meta?.hasNextPage ?? false);
    setCommentTotal(result.meta?.total ?? updated.length);
    setPhotoCache((old) => {
      if (!old[currentPhotoId]) return old;
      return { ...old, [currentPhotoId]: { ...old[currentPhotoId], comments: updated } };
    });
    return updated;
  };

  const handleLoadMoreComments = async () => {
    if (!commentsHasMore || isLoadingMoreComments) return;

    setIsLoadingMoreComments(true);
    try {
      const nextPage = commentPage + 1;
      const result = await fetchComments({
        photoId: currentPhotoId,
        page: nextPage,
        limit: 10,
      }).unwrap();
      const incoming = (result.data as Comment[]) || [];
      setComments((current) => {
        const ids = new Set(current.map((comment) => comment.id));
        return [...current, ...incoming.filter((comment) => !ids.has(comment.id))];
      });
      setCommentPage(nextPage);
      setCommentsHasMore(result.meta?.hasNextPage ?? false);
      setCommentTotal(result.meta?.total ?? 0);
    } catch {
      toast.error('Could not load more comments.');
    } finally {
      setIsLoadingMoreComments(false);
    }
  };

  const handleAddComment = async (text: string, parentId?: string) => {
    try {
      if (parentId) {
        await addReply({ commentId: parentId, text, photoId: currentPhotoId }).unwrap();
      } else {
        await addComment({ photoId: currentPhotoId, text }).unwrap();
      }
      await refreshComments();
      toast.success(parentId ? 'Reply submitted!' : 'Comment added!');
    } catch {
      toast.error('Could not submit comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment({ commentId, photoId: currentPhotoId }).unwrap();
      await refreshComments();
      toast.success('Comment deleted.');
    } catch {
      toast.error('Could not delete comment. Please try again.');
    }
  };

  const handleUpdateComment = async (commentId: string, text: string) => {
    try {
      await updateComment({ commentId, text, photoId: currentPhotoId }).unwrap();
      await refreshComments();
      toast.success('Comment updated.');
    } catch {
      toast.error('Could not update comment. Please try again.');
    }
  };

  // ── Derived display values ─────────────────────────────────────────────────
  // Only show loading overlay when it's a first visit (not cached)
  const isImageLoading = isFetching && !photoCache[currentPhotoId];

  const isCommentBusy = isAddingComment || isAddingReply || isUpdatingComment || isDeletingComment;

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isLoading && !photo) return <PhotoSkeleton isSidebarOpen={isSidebarOpen} />;
  if (error)
    return (
      <PhotoError message={error} onRetry={() => loadPhotoData(currentPhotoId)} backUrl={backUrl} />
    );
  if (!photo) return <PhotoSkeleton isSidebarOpen={isSidebarOpen} />;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="bg-background text-foreground min-h-screen overflow-hidden">
      <div className="flex h-screen flex-col lg:flex-row">
        {/* Left: Photo Viewer */}
        <section className="relative flex h-full w-full min-w-0 flex-1 items-center justify-center overflow-hidden bg-zinc-950">
          <PhotoViewer
            photo={photo}
            slidePhotos={slides}
            index={activeIndex}
            onPrev={handlePrev}
            onNext={handleNext}
            onIndexChange={handleIndexChange}
            isLiked={liked}
            isLiking={isLiking}
            onToggleLike={handleToggleLike}
            backUrl={backUrl}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isOwnPhoto={isOwnPhoto}
            isImageLoading={isImageLoading}
          />
        </section>

        {/* Right: Detail Sidebar */}
        <aside
          className={cn(
            'border-border bg-background text-foreground flex flex-col',
            transitionReady && 'transition-all duration-300 ease-in-out',
            'lg:static lg:z-auto lg:h-full lg:shrink-0 lg:border-l',
            isSidebarOpen ? 'lg:w-108.75' : 'lg:w-0 lg:overflow-hidden lg:border-l-0',
            'fixed inset-y-0 right-0 z-50 h-full w-full lg:static lg:inset-auto lg:z-auto',
            isSidebarOpen
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none translate-x-full opacity-0 lg:pointer-events-auto lg:translate-x-0 lg:opacity-100',
          )}
        >
          <SidebarHeader
            owner={profileOwner}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(false)}
            isOwnPhoto={isOwnPhoto}
            isFollowed={ownerIsFollowed}
            onToggleFollow={handleToggleFollow}
            isLoading={isLoading && !profileOwner}
            isFollowToggling={isFollowToggling}
          />

          <div className="bg-background min-h-0 flex-1 scrollbar-thin overflow-y-auto">
            <SidebarMetrics
              votes={photo.totalVotes ?? photo.votes ?? 0}
              views={photo.views ?? 0}
              likes={localLikesCount}
              achievements={photo.contestUpload?.length ?? photo.achievememnts?.length ?? 0}
            />
            <SidebarComments
              photoId={currentPhotoId}
              comments={comments}
              currentUserId={currentUser?.id}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onEditComment={handleUpdateComment}
              isLoading={isCommentBusy}
              hasMore={commentsHasMore}
              isLoadingMore={isLoadingMoreComments}
              onLoadMore={handleLoadMoreComments}
              total={commentTotal}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
