'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useJustifiedLayout } from '@/hooks/useJustifiedLayout';
import { useStoreModal } from '@/providers/StoreModalProvider';
import {
  TradeContestPhotoPayload,
  useLazyGetTradeableHistoryQuery,
  useLazyGetUserPhotosQuery,
  usePromoteContestPhotoMutation,
  useTradeContestPhotoMutation,
} from '@/store/apis/contestApi';
import { storeApi, useGetStoreStatsQuery } from '@/store/apis/storeApi';
import { cn } from '@/utils/cn';
import { compressImage } from '@/utils/compressImage';
import { resolveImageUrl } from '@/utils/resolveImageUrl';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { FaRegUser } from 'react-icons/fa';
import { HiOutlineDesktopComputer } from 'react-icons/hi';
import { IoKeyOutline } from 'react-icons/io5';
import { MdOutlineCameraswitch, MdOutlineHowToVote } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

type ActionType = 'boost' | 'trade';
type ActionStep =
  | 'selectContestPhoto'
  | 'chooseSwapSource'
  | 'selectTradeSource'
  | 'selectTradeTarget'
  | 'review';
type SwapSource = 'computer' | 'profile';

export interface ContestActionModalRef {
  open: (type: ActionType) => void;
}

type ContestActionModalProps = {
  contestId: string;
  contestTitle?: string;
  contestPhotos?: any[];
  onSuccess?: () => Promise<void> | void;
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.data?.message || error?.message || fallback;

const getPhotoUrl = (photo: any) =>
  photo?.url ??
  photo?.imageUrl ??
  photo?.photoUrl ??
  photo?.photo?.url ??
  photo?.userPhoto?.url ??
  photo?.profilePhoto?.url ??
  photo?.image?.url ??
  '';

const getContestPhotoId = (photo: any, index: number) =>
  photo?.id ??
  photo?.contestPhotoId ??
  photo?.photoId ??
  photo?.photo?.id ??
  photo?.userPhoto?.id ??
  `contest-photo-${index}`;

const getSourcePhotoId = (photo: any, index: number) =>
  photo?.photoId ??
  photo?.userPhotoId ??
  photo?.photo?.id ??
  photo?.userPhoto?.id ??
  photo?.id ??
  `source-photo-${index}`;

// ── Helper: Contest photo picker with Justified Layout ───────────────────────
function ContestPhotoJustifiedPicker({
  photos,
  selectedId,
  onSelect,
}: {
  photos: { id: string; url: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { containerRef, rows } = useJustifiedLayout({
    items: photos.map((p) => ({ ...p })),
    targetHeight: 150,
    gap: 4,
  });

  if (!photos.length) {
    return (
      <div className="border-border text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
        No contest photos available for this contest.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-h-105 w-full scrollbar-thin overflow-x-hidden overflow-y-auto"
    >
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="mb-1 flex" style={{ height: `${row.height}px`, gap: '4px' }}>
          {row.items.map(({ item: photo, width, height }) => {
            const isSelected = selectedId === photo.id;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => onSelect(photo.id)}
                className="group relative shrink-0 overflow-hidden rounded-xl transition hover:opacity-90"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  outline: isSelected
                    ? '3px solid var(--color-primary)'
                    : '1px solid color-mix(in oklab, var(--foreground) 10%, transparent)',
                  outlineOffset: '-3px',
                }}
              >
                <Image
                  src={resolveImageUrl(photo.url)}
                  alt="Contest photo"
                  fill
                  sizes={`${Math.ceil(width)}px`}
                  className="object-cover transition group-hover:scale-[1.02]"
                />
                <span
                  className={cn(
                    'absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-medium transition',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-overlay text-foreground',
                  )}
                >
                  {isSelected ? '✓ Selected' : 'Select'}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Helper: Previously-traded photo picker - brings back a photo swapped out
// of this contest earlier, resuming the vote count it had banked ─────────────
function TradeHistoryPicker({
  photos,
  isLoading,
  selectedId,
  onSelect,
}: {
  photos: { id: string; url: string; frozenVoteCount: number }[];
  isLoading: boolean;
  selectedId: string;
  onSelect: (photo: { id: string; url: string }) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex max-h-64 scrollbar-thin flex-wrap gap-2 overflow-y-auto">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton
            key={item}
            className="bg-surface-secondary rounded-lg"
            style={{ height: 150, width: 150 }}
          />
        ))}
      </div>
    );
  }

  if (!photos.length) {
    return (
      <div className="border-border text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
        You haven&apos;t traded any photos out of this contest yet.
      </div>
    );
  }

  return (
    <div className="grid max-h-64 scrollbar-thin grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
      {photos.map((photo) => {
        const isSelected = selectedId === photo.id;
        return (
          <button
            key={photo.id}
            type="button"
            onClick={() => onSelect(photo)}
            className={cn(
              'relative aspect-square overflow-hidden rounded-lg border transition',
              isSelected ? 'border-primary ring-primary/40 ring-2' : 'border-transparent',
            )}
          >
            <Image
              src={resolveImageUrl(photo.url)}
              alt="Previously traded photo"
              fill
              sizes="150px"
              className="object-cover"
            />
            <span className="bg-overlay absolute right-1.5 bottom-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white">
              <MdOutlineHowToVote /> {photo.frozenVoteCount}
            </span>
            {isSelected && (
              <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold shadow">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Helper: Trade profile photo picker with Justified Layout ─────────────────
function TradePhotoJustifiedPicker({
  photos,
  isLoading,
  selectedId,
  onSelect,
}: {
  photos: { id: string; url: string }[];
  isLoading: boolean;
  selectedId: string;
  onSelect: (photo: { id: string; url: string }) => void;
}) {
  const { containerRef, rows } = useJustifiedLayout({
    items: photos.map((p) => ({ ...p })),
    targetHeight: 150,
    gap: 2,
  });

  if (isLoading) {
    return (
      <div className="flex max-h-64 scrollbar-thin flex-wrap gap-0.5 overflow-y-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <Skeleton
            key={item}
            className="bg-surface-secondary"
            style={{ height: 150, width: 150 }}
          />
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
        No profile photos available. Please upload some photos first.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-h-64 w-full scrollbar-thin overflow-x-hidden overflow-y-auto"
    >
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="mb-0.5 flex"
          style={{ height: `${row.height}px`, gap: '2px' }}
        >
          {row.items.map(({ item: photo, width, height }) => {
            const isSelected = selectedId === photo.id;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => onSelect(photo)}
                className="relative shrink-0 overflow-hidden transition hover:opacity-90"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  outline: isSelected ? '3px solid var(--color-primary)' : undefined,
                  outlineOffset: '-3px',
                }}
              >
                <Image
                  src={resolveImageUrl(photo.url)}
                  alt="profile photo"
                  fill
                  sizes={`${Math.ceil(width)}px`}
                  className="object-cover"
                />
                {isSelected && (
                  <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold shadow">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const ContestActionModal = forwardRef<ContestActionModalRef, ContestActionModalProps>(
  ({ contestId, contestTitle, contestPhotos = [], onSuccess }, ref) => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useAuth();
    const { openStore } = useStoreModal();
    const { data: storeStats, isFetching: isStatsFetching } = useGetStoreStatsQuery(undefined, {
      skip: !isAuthenticated,
    });
    const [triggerPhotos, { data: userPhotos, isFetching: isPhotosLoading }] =
      useLazyGetUserPhotosQuery();
    const [triggerHistory, { data: tradeHistoryData, isFetching: isHistoryLoading }] =
      useLazyGetTradeableHistoryQuery();
    const [promoteContestPhoto, { isLoading: isPromoting }] = usePromoteContestPhotoMutation();
    const [tradeContestPhoto, { isLoading: isTrading }] = useTradeContestPhotoMutation();

    const [open, setOpen] = useState(false);
    const [actionType, setActionType] = useState<ActionType>('boost');
    const [step, setStep] = useState<ActionStep>('selectContestPhoto');
    const [swapSource, setSwapSource] = useState<SwapSource | null>(null);
    const [selectedContestPhotoId, setSelectedContestPhotoId] = useState('');
    // For trade → profile: single photo id (swap is 1-for-1)
    const [selectedUserPhotoId, setSelectedUserPhotoId] = useState('');
    // FIX: store the URL directly so review step doesn't need to re-filter uploadedPhotos
    const [selectedUserPhotoUrl, setSelectedUserPhotoUrl] = useState('');
    const [replacementFile, setReplacementFile] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const stats = storeStats?.data;
    const currentContestPhotos = useMemo(() => {
      return contestPhotos
        .map((photo, index) => ({
          ...photo,
          id: getContestPhotoId(photo, index),
          sourcePhotoId: getSourcePhotoId(photo, index),
          url: resolveImageUrl(getPhotoUrl(photo)),
        }))
        .filter((photo) => Boolean(photo.id && photo.url));
    }, [contestPhotos]);
    const contestPhotoUrls = useMemo(
      () => new Set(currentContestPhotos.map((photo) => photo.url)),
      [currentContestPhotos],
    );
    const contestSourcePhotoIds = useMemo(
      () => new Set(currentContestPhotos.map((photo) => photo.sourcePhotoId).filter(Boolean)),
      [currentContestPhotos],
    );
    const tradeableHistory = useMemo(
      () =>
        (tradeHistoryData?.data ?? []).map((record) => ({
          id: record.photoId,
          url: resolveImageUrl(record.url),
          frozenVoteCount: record.frozenVoteCount,
        })),
      [tradeHistoryData],
    );
    const tradeHistoryPhotoIds = useMemo(
      () => new Set(tradeableHistory.map((photo) => photo.id)),
      [tradeableHistory],
    );
    // "Fresh" uploads - excludes anything currently occupying a slot in this
    // contest, and anything already offered below as a previously-traded photo
    // (see tradeableHistory) so a photo only ever appears in one section.
    const uploadedPhotos = useMemo(() => {
      const rawPhotos = Array.isArray(userPhotos?.data)
        ? userPhotos.data
        : (userPhotos?.data?.data ?? []);

      return rawPhotos
        .map((photo: any, index: number) => ({
          ...photo,
          id: getSourcePhotoId(photo, index),
          url: resolveImageUrl(getPhotoUrl(photo)),
        }))
        .filter(
          (photo: { id: string; url: string }) =>
            Boolean(photo.id && photo.url) &&
            !contestSourcePhotoIds.has(photo.id) &&
            !contestPhotoUrls.has(photo.url) &&
            !tradeHistoryPhotoIds.has(photo.id),
        );
    }, [contestPhotoUrls, contestSourcePhotoIds, tradeHistoryPhotoIds, userPhotos]);

    // ── Open ─────────────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      open: (type: ActionType) => {
        if (!isAuthenticated) {
          toast.error('Please sign in to use contest actions.');
          return;
        }

        if (isStatsFetching && !storeStats) {
          toast.loading('Checking your store tokens...');
          return;
        }

        const required = type === 'boost' ? (stats?.boost ?? 0) : (stats?.swap ?? 0);
        if (required <= 0) {
          openStore();
          return;
        }

        setActionType(type);
        setStep(type === 'trade' ? 'chooseSwapSource' : 'selectContestPhoto');
        setSwapSource(null);
        setSelectedContestPhotoId('');
        setSelectedUserPhotoId('');
        setSelectedUserPhotoUrl(''); // FIX: reset url state
        setReplacementFile(null);
        setPreview('');
        setOpen(true);
        if (type === 'trade') {
          triggerPhotos({ id: contestId });
          triggerHistory({ id: contestId });
        }
      },
    }));

    // ── Reset ─────────────────────────────────────────────────────────────
    const reset = () => {
      setOpen(false);
      setStep('selectContestPhoto');
      setSwapSource(null);
      setSelectedContestPhotoId('');
      setSelectedUserPhotoId('');
      setSelectedUserPhotoUrl(''); // FIX: reset url state
      setReplacementFile(null);
      setPreview('');
      setIsSubmitting(false);
    };

    // ── File handler ──────────────────────────────────────────────────────
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setReplacementFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(String(ev.target?.result || ''));
      reader.readAsDataURL(file);
    };

    // ── Submit ────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
      const targetPhotoId = selectedContestPhotoId;
      if (!targetPhotoId) {
        toast.error('Please select an existing contest photo.');
        return;
      }

      try {
        setIsSubmitting(true);
        if (actionType === 'boost') {
          const response = await promoteContestPhoto({
            contestId,
            photoId: targetPhotoId,
          }).unwrap();
          toast.success(response.message || 'Photo promoted successfully.');
        } else {
          const payload: TradeContestPhotoPayload = {
            contestId,
            contestPhotoId: selectedContestPhotoId,
          };
          if (swapSource === 'profile') {
            if (!selectedUserPhotoId) {
              toast.error('Please choose a replacement photo.');
              return;
            }
            payload.newPhotoId = selectedUserPhotoId;
          } else if (swapSource === 'computer') {
            if (!replacementFile) {
              toast.error('Please upload a replacement image.');
              return;
            }
            toast.loading('Compressing image...', { id: 'trade-compress' });
            const compressedReplacement = await compressImage(replacementFile);
            toast.dismiss('trade-compress');
            payload.file = compressedReplacement;
          } else {
            toast.error('Please choose a swap source.');
            return;
          }

          const response = await tradeContestPhoto(payload).unwrap();
          toast.success(response.message || 'Photo swapped successfully.');
        }

        // Invalidate store stats so the token count refreshes after consuming one
        dispatch(storeApi.util.invalidateTags(['StoreStats']));

        await onSuccess?.();
        reset();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Something went wrong. Please try again.'));
      } finally {
        setIsSubmitting(false);
      }
    };

    // ── Navigation helpers ────────────────────────────────────────────────
    const actionLabel = actionType === 'boost' ? 'Promote' : 'Trade';
    const actionLoading = actionType === 'boost' ? isPromoting : isTrading;
    const actionIcon =
      actionType === 'boost' ? (
        <IoKeyOutline className="text-primary size-5" />
      ) : (
        <MdOutlineCameraswitch className="text-primary size-5 rotate-90" />
      );

    const isInitialStep =
      actionType === 'boost' ? step === 'selectContestPhoto' : step === 'chooseSwapSource';
    const canGoBack = !isInitialStep;
    const goBack = () => {
      if (step === 'review') {
        setStep(actionType === 'boost' ? 'selectContestPhoto' : 'selectTradeTarget');
        return;
      }
      if (step === 'selectTradeTarget') {
        setSelectedContestPhotoId('');
        setStep('selectTradeSource');
        return;
      }
      if (step === 'selectTradeSource') {
        setSelectedUserPhotoId('');
        setSelectedUserPhotoUrl(''); // FIX: also clear url on back
        setReplacementFile(null);
        setPreview('');
        setStep('chooseSwapSource');
        return;
      }
    };

    const selectTradeSource = () => {
      if (swapSource === 'profile') {
        if (!selectedUserPhotoId) {
          toast.error('Please choose a replacement photo.');
          return;
        }
      } else if (swapSource === 'computer') {
        if (!replacementFile) {
          toast.error('Please attach the new image file.');
          return;
        }
      }
      setStep('selectTradeTarget');
    };

    const selectTradeTarget = () => {
      if (!selectedContestPhotoId) {
        toast.error('Please select the contest photo you want to replace.');
        return;
      }
      setStep('review');
    };

    const dialogTitle =
      actionType === 'boost'
        ? step === 'selectContestPhoto'
          ? 'Promote Contest Photo'
          : 'Confirm Promote'
        : step === 'chooseSwapSource'
          ? 'Trade Contest Photo'
          : step === 'selectTradeTarget'
            ? 'Select Photo To Replace'
            : step === 'selectTradeSource'
              ? swapSource === 'computer'
                ? 'Upload Replacement Photo'
                : 'Select Replacement Photo'
              : 'Review Trade';

    // ── Render ────────────────────────────────────────────────────────────
    return (
      <Dialog
        open={open}
        onOpenChange={(openVal) => {
          if (!openVal) reset();
          else setOpen(true);
        }}
      >
        <DialogContent className="border-border flex max-h-[85vh] min-h-100 scrollbar-thin flex-col justify-between overflow-y-auto border-2 sm:max-w-2xl">
          {/* ── Header ─────────────────────────────────── */}
          <DialogTitle className="flex shrink-0 items-center gap-2">
            {canGoBack ? (
              <button
                type="button"
                onClick={goBack}
                className="hover:text-primary hover:bg-surface-secondary flex size-10 items-center justify-center rounded-full transition"
              >
                <ArrowLeft />
              </button>
            ) : (
              actionIcon
            )}
            <span>{dialogTitle}</span>
          </DialogTitle>

          {/* ── Body ───────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* ── CHARGE: Select contest photo ───────────────────────────── */}
            {step === 'selectContestPhoto' && actionType === 'boost' && (
              <div className="space-y-5">
                <ContestPhotoJustifiedPicker
                  photos={currentContestPhotos}
                  selectedId={selectedContestPhotoId}
                  onSelect={setSelectedContestPhotoId}
                />

                {/* footer */}
                <div className="border-border-subtle flex items-center justify-between gap-5 border-t-[0.5px] pt-5">
                  <button
                    type="button"
                    onClick={reset}
                    className="text-primary border-primary rounded-sm border px-5 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedContestPhotoId || isSubmitting || actionLoading}
                    onClick={handleSubmit}
                    className="bg-primary text-primary-foreground rounded-sm px-5 py-2 text-sm disabled:opacity-60"
                  >
                    {isSubmitting || actionLoading ? 'Processing...' : 'Promote'}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Choose swap source ───────────────────────────── */}
            {step === 'chooseSwapSource' && actionType === 'trade' && (
              <div className="space-y-5">
                {/* header */}
                <div className="space-y-2 text-center uppercase">
                  <h1 className="text-lg font-semibold sm:text-xl">
                    TRADE PHOTO IN{' '}
                    {contestTitle && <span className="text-primary">{contestTitle}</span>}
                    {!contestTitle && 'THIS CONTEST'}
                  </h1>
                  <p className="text-foreground/50 text-sm">
                    Select where your replacement photo comes from
                  </p>
                </div>

                {/* content */}
                <div className="flex flex-wrap items-center justify-center gap-5">
                  {/* Computer */}
                  <button
                    type="button"
                    onClick={() => {
                      setSwapSource('computer');
                      setStep('selectTradeSource');
                    }}
                    className="border-primary hover:bg-primary/5 flex size-36 flex-col items-center justify-center gap-4 rounded-xl border transition-colors"
                  >
                    <HiOutlineDesktopComputer className="size-14" />
                    Computer
                  </button>

                  {/* Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setSwapSource('profile');
                      setStep('selectTradeSource');
                      triggerPhotos({ id: contestId });
                      triggerHistory({ id: contestId });
                    }}
                    className="border-primary hover:bg-primary/5 flex size-36 flex-col items-center justify-center gap-4 rounded-xl border transition-colors"
                  >
                    <FaRegUser className="size-14" />
                    Profile
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Select trade source ───────────────────────────── */}
            {step === 'selectTradeSource' && actionType === 'trade' && (
              <div className="space-y-5">
                {/* header */}
                <div className="space-y-2 text-center uppercase">
                  <h1 className="text-lg font-semibold sm:text-xl">
                    {swapSource === 'computer'
                      ? 'Upload replacement photo'
                      : 'Select replacement photo'}
                  </h1>
                  <p className="text-foreground/50 text-sm">
                    {swapSource === 'computer'
                      ? 'Choose a photo from your computer'
                      : 'Pick a fresh photo, or bring back one you traded out earlier'}
                  </p>
                </div>

                {/* content */}
                {swapSource === 'computer' ? (
                  <>
                    {preview ? (
                      <div className="flex items-center justify-center py-2">
                        <img
                          src={preview}
                          alt="Preview"
                          loading="lazy"
                          decoding="async"
                          onClick={() => fileInputRef.current?.click()}
                          // FIX: ring applied directly on the image wrapper — no broken absolute div
                          className="ring-primary ring-offset-background max-h-72 w-auto cursor-pointer rounded-xl object-contain ring-2 ring-offset-2 transition hover:opacity-90"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-primary hover:bg-primary/5 mx-auto flex h-48 w-80 flex-col items-center justify-center gap-3 rounded-xl border border-dashed transition"
                      >
                        <UploadCloud className="text-primary" size={40} />
                        <p className="text-sm">Choose photo from computer</p>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </>
                ) : (
                  swapSource === 'profile' && (
                    <div className="space-y-6">
                      <div className="space-y-2.5">
                        <p className="text-foreground/60 text-xs font-semibold tracking-wide uppercase">
                          Fresh uploads
                        </p>
                        <TradePhotoJustifiedPicker
                          photos={uploadedPhotos}
                          isLoading={isPhotosLoading}
                          selectedId={selectedUserPhotoId}
                          onSelect={(photo) => {
                            setSelectedUserPhotoId(photo.id);
                            setSelectedUserPhotoUrl(resolveImageUrl(photo.url));
                          }}
                        />
                      </div>

                      <div className="border-border-subtle space-y-2.5 border-t pt-5">
                        <p className="text-foreground/60 text-xs font-semibold tracking-wide uppercase">
                          Previously traded
                        </p>
                        <TradeHistoryPicker
                          photos={tradeableHistory}
                          isLoading={isHistoryLoading}
                          selectedId={selectedUserPhotoId}
                          onSelect={(photo) => {
                            setSelectedUserPhotoId(photo.id);
                            setSelectedUserPhotoUrl(resolveImageUrl(photo.url));
                          }}
                        />
                      </div>
                    </div>
                  )
                )}

                {/* footer */}
                <div className="border-border-subtle flex items-center justify-between gap-5 border-t-[0.5px] pt-5">
                  <button
                    type="button"
                    onClick={reset}
                    className="text-primary border-primary rounded-sm border px-5 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={swapSource === 'computer' ? !replacementFile : !selectedUserPhotoId}
                    onClick={selectTradeSource}
                    className="bg-primary text-primary-foreground rounded-sm px-5 py-2 text-sm disabled:opacity-60"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* ── TRADE: Select contest photo to replace ─────────────────── */}
            {step === 'selectTradeTarget' && actionType === 'trade' && (
              <div className="space-y-5">
                <div className="space-y-2 text-center uppercase">
                  <h1 className="text-lg font-semibold sm:text-xl">Select photo to replace</h1>
                  <p className="text-foreground/50 text-sm">
                    Choose one photo already uploaded to this contest
                  </p>
                </div>

                <ContestPhotoJustifiedPicker
                  photos={currentContestPhotos}
                  selectedId={selectedContestPhotoId}
                  onSelect={setSelectedContestPhotoId}
                />

                <div className="border-border-subtle flex items-center justify-between gap-5 border-t-[0.5px] pt-5">
                  <button
                    type="button"
                    onClick={reset}
                    className="text-primary border-primary rounded-sm border px-5 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedContestPhotoId}
                    onClick={selectTradeTarget}
                    className="bg-primary text-primary-foreground rounded-sm px-5 py-2 text-sm disabled:opacity-60"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: Review ─────────────────────────────────────────── */}
            {step === 'review' && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Left: selected contest photo */}
                  <div className="bg-surface-secondary flex flex-col items-center gap-2 rounded-xl p-4">
                    <p className="text-foreground/40 text-xs font-medium tracking-wider uppercase">
                      Contest photo
                    </p>
                    <div className="flex w-full items-center justify-center overflow-hidden rounded-lg">
                      {currentContestPhotos
                        .filter((p) => p.id === selectedContestPhotoId)
                        .map((photo) => (
                          <div key={photo.id} className="relative h-60 w-full">
                            <Image
                              src={resolveImageUrl(photo.url)}
                              alt="Selected contest photo"
                              fill
                              sizes="(max-width: 768px) 100vw, 480px"
                              className="rounded-lg object-contain"
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Right: action info or swap preview */}
                  {actionType === 'boost' ? (
                    <div className="bg-surface-secondary flex flex-col items-center justify-center gap-3 rounded-xl p-4">
                      <IoKeyOutline className="text-primary size-10" />
                      <p className="text-muted-foreground text-center text-sm">
                        This photo will be promoted (boosted in visibility) for approximately 24
                        hours.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-surface-secondary flex flex-col items-center gap-2 rounded-xl p-4">
                      <p className="text-foreground/40 text-xs font-medium tracking-wider uppercase">
                        Replacement photo
                      </p>
                      <div className="flex w-full items-center justify-center overflow-hidden rounded-lg">
                        {/* FIX: use stored selectedUserPhotoUrl directly — no filter needed */}
                        {swapSource === 'profile' && selectedUserPhotoUrl && (
                          <div className="relative h-60 w-full">
                            <Image
                              src={selectedUserPhotoUrl}
                              alt="Replacement photo"
                              fill
                              sizes="(max-width: 768px) 100vw, 480px"
                              className="rounded-lg object-contain"
                            />
                          </div>
                        )}
                        {swapSource === 'computer' && preview && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={preview}
                            alt="Replacement preview"
                            loading="lazy"
                            decoding="async"
                            className="max-h-60 w-auto max-w-full rounded-lg object-contain"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* footer */}
                <div className="border-border-subtle flex items-center justify-between gap-5 border-t-[0.5px] pt-5">
                  <button
                    type="button"
                    onClick={reset}
                    className="text-primary border-primary rounded-sm border px-5 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || actionLoading}
                    onClick={handleSubmit}
                    className="bg-primary text-primary-foreground rounded-sm px-5 py-2 text-sm disabled:opacity-60"
                  >
                    {isSubmitting || actionLoading ? 'Processing...' : actionLabel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

ContestActionModal.displayName = 'ContestActionModal';

export default ContestActionModal;
