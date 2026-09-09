'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { useAuth } from '@/hooks/useAuth';
import { useGetMeQuery } from '@/store/apis/authApi';
import { useUpdateCoverMutation } from '@/store/apis/userApi';
import Image from 'next/image';
import { ChangeEvent, useRef, useState } from 'react';
import { FiEdit2, FiImage, FiUpload } from 'react-icons/fi';
import { toast } from 'sonner';
import { compressImage } from '@/utils/compressImage';

type Step = 'idle' | 'crop' | 'preview';

export default function AddCoverDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [isDragging, setIsDragging] = useState(false);

  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateCover, { isLoading }] = useUpdateCoverMutation();
  const { refetch: triggerGetMe } = useGetMeQuery();

  const revokePreview = (url: string | null) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  };

  const resetState = () => {
    revokePreview(croppedPreview);
    setStep('idle');
    setRawSrc(null);
    setRawFile(null);
    setCroppedFile(null);
    setCroppedPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetState();
  };

  const processFile = (selected: File) => {
    setError(null);

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowed.includes(selected.type)) {
      setError('Unsupported format. Please upload a JPG, PNG, AVIF, or WebP file.');
      return;
    }
    if (selected.size < 50 * 1024) {
      setError('Image is too small. Minimum file size is 50 KB.');
      return;
    }
    if (selected.size > 8 * 1024 * 1024) {
      setError('Image is too large. Maximum file size is 8 MB.');
      return;
    }
    if (selected.size > 1.5 * 1024 * 1024) {
      toast.info('Large image detected. Consider optimizing it for faster page load.', {
        duration: 5000,
      });
    }

    setRawFile(selected);
    setRawSrc(URL.createObjectURL(selected));
    setStep('crop');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
    e.currentTarget.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleCropConfirm = (file: File, preview: string) => {
    revokePreview(croppedPreview);
    setCroppedFile(file);
    setCroppedPreview(preview);
    setStep('preview');
  };

  const handleCropCancel = () => {
    setRawSrc(null);
    setRawFile(null);
    revokePreview(croppedPreview);
    setStep('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!croppedFile)
      return setError('No image selected. Please upload and crop a cover photo first.');
    const formData = new FormData();
    const fileToUpload = await compressImage(croppedFile);
    formData.append('cover', fileToUpload);
    try {
      await updateCover(formData).unwrap();
      triggerGetMe().unwrap();
      toast.success('Cover photo updated.');
      resetState();
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Upload failed. Please try again.');
    }
  };

  // What to display in idle — new crop > existing cover > nothing
  const displaySrc = croppedPreview || user?.cover || null;
  const steps: Step[] = ['idle', 'crop', 'preview'];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="border-border bg-surface/90 text-foreground hover:border-border hover:bg-surface-secondary inline-flex items-center gap-2 rounded-sm border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-200 active:scale-[0.98]">
          <FiEdit2 className="size-4" />
          <span>Change Banner</span>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-background text-foreground shadow-modal ring-border-subtle gap-0 overflow-hidden border-0 p-0 ring-1 sm:max-w-2xl">
        {/* ── Header ── */}
        <DialogHeader className="relative px-7 pt-6 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-foreground text-[16px] font-semibold tracking-tight">
                {user?.cover ? 'Update cover photo' : 'Add cover photo'}
              </DialogTitle>
              <p className="text-caption-foreground mt-1 text-[11px]">
                JPG, PNG, AVIF, WebP &nbsp;·&nbsp; 50 KB – 8 MB
              </p>
            </div>

            {step !== 'idle' && (
              <div className="flex items-center gap-1.5 pt-0.5">
                {steps.map((s) => (
                  <div
                    key={s}
                    className={[
                      'h-1.5 rounded-full transition-all duration-300',
                      step === s
                        ? 'bg-primary w-4'
                        : steps.indexOf(s) < steps.indexOf(step)
                          ? 'bg-primary/40 w-1.5'
                          : 'bg-surface-secondary w-1.5',
                    ].join(' ')}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="bg-border-subtle mx-7 h-px" />

        {/* ── Body ── */}
        <div className="px-7 py-5">
          {/* Step: idle */}
          {step === 'idle' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={[
                'group relative flex aspect-21/9 w-full cursor-pointer items-center justify-center overflow-hidden rounded border-2 text-left transition-all duration-300',
                isDragging
                  ? 'border-primary bg-primary/8 shadow-[inset_0_0_30px_-10px_color-mix(in_oklab,var(--primary)_12%,transparent)]'
                  : displaySrc
                    ? 'border-border hover:border-border'
                    : 'border-border bg-surface/40 hover:border-border hover:bg-surface/60 border-dashed',
              ].join(' ')}
            >
              {displaySrc ? (
                <>
                  <Image
                    src={displaySrc}
                    alt="Cover photo"
                    fill
                    unoptimized={displaySrc.startsWith('blob:') || displaySrc.startsWith('data:')}
                    className="object-cover transition-all duration-300 group-hover:brightness-60"
                  />
                  {/* Change overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="bg-overlay flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm">
                      <FiUpload className="text-foreground size-4" />
                    </div>
                    <span className="text-foreground text-[12px] font-semibold drop-shadow">
                      Change cover photo
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <div
                    className={[
                      'flex h-12 w-12 items-center justify-center rounded ring-1 transition-all duration-300',
                      isDragging
                        ? 'bg-primary/20 ring-primary/40 text-primary'
                        : 'bg-surface-secondary text-muted-foreground ring-border-subtle group-hover:bg-surface-secondary/80 group-hover:text-muted-foreground group-hover:ring-border-subtle',
                    ].join(' ')}
                  >
                    <FiImage className="size-5" />
                  </div>
                  <div>
                    <p
                      className={[
                        'text-[13px] font-medium transition-colors',
                        isDragging
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground',
                      ].join(' ')}
                    >
                      {isDragging ? 'Drop your image here' : 'Upload a cover photo'}
                    </p>
                    <p className="text-caption-foreground mt-0.5 text-[11px]">
                      Drag & drop or click to browse &nbsp;·&nbsp; Landscape images work best
                    </p>
                  </div>
                </div>
              )}
            </button>
          )}

          {/* Step: crop */}
          {step === 'crop' && rawSrc && rawFile && (
            <ImageCropper
              src={rawSrc}
              aspectRatio={21 / 9}
              targetWidth={1920}
              targetHeight={1080}
              originalFile={rawFile}
              shape="banner"
              onCrop={handleCropConfirm}
              onCancel={handleCropCancel}
            />
          )}

          {/* Step: preview */}
          {step === 'preview' && croppedPreview && (
            <div className="flex flex-col items-center gap-3">
              <div className="shadow-modal ring-border-subtle relative w-full overflow-hidden rounded ring-1">
                <div className="relative aspect-21/9 w-full">
                  <Image
                    src={croppedPreview}
                    alt="Cover preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_6%,transparent)]" />
              </div>

              <div className="text-caption-foreground flex items-center gap-3 text-[11px]">
                <button
                  type="button"
                  onClick={() => setStep('crop')}
                  className="hover:text-muted-foreground transition-colors"
                >
                  Adjust crop
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:text-muted-foreground transition-colors"
                >
                  Choose different photo
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            className="hidden"
          />

          {error && (
            <div className="border-destructive/20 bg-destructive/8 mt-4 flex items-start gap-2 rounded border px-3.5 py-2.5">
              <span className="text-destructive mt-px shrink-0 text-[11px]">⚠</span>
              <p className="text-destructive text-[11px] leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {step !== 'crop' && (
          <>
            <div className="bg-border-subtle mx-7 h-px" />
            <DialogFooter className="flex items-center justify-between px-7 py-4">
              <DialogClose asChild>
                <button
                  type="button"
                  className="border-border bg-surface/60 text-muted-foreground hover:bg-surface-secondary rounded-sm border px-4 py-2 text-[13px] transition"
                >
                  Cancel
                </button>
              </DialogClose>

              <button
                type="button"
                disabled={isLoading || step !== 'preview'}
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm px-6 py-2 text-[13px] font-semibold shadow-[0_2px_12px_-3px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-all hover:shadow-[0_2px_16px_-3px_color-mix(in_oklab,var(--primary)_60%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="border-primary-foreground/30 border-t-primary-foreground inline-block h-3 w-3 animate-spin rounded-full border" />
                    Saving…
                  </span>
                ) : user?.cover ? (
                  'Save changes'
                ) : (
                  'Add cover'
                )}
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
