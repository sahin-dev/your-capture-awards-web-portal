'use client';

import { useDeletePhotoMutation } from '@/store/apis/profileApi';
import { Photo } from '@/store/types/profileTypes';
import { Eye, Heart, Loader2, Trash2, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSwiperPhotos } from '@/store/slices/profileSlice';

// Reuse the same aspect logic as PhotoCard for masonry flex layout
const getAspect = (id: string) => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const aspects = [1.3, 0.8, 1.5, 1.0, 1.8, 1.2, 0.9, 1.6];
  return aspects[hash % aspects.length] ?? 1.3;
};

const PortfolioCard = ({
  item,
  isOwn = true,
  allPhotos = [],
  style,
}: {
  item: Photo;
  isOwn?: boolean;
  allPhotos?: Photo[];
  style?: React.CSSProperties;
}) => {
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { photos } = useAppSelector((state) => state.profile);

  const [deletePhoto, { isLoading }] = useDeletePhotoMutation();

  const imageUrl = item?.url?.replace(/\\/g, '/');
  const aspect = getAspect(item.id);

  const handleDelete = async (id: string) => {
    try {
      await deletePhoto(id).unwrap();
      toast.success('Photo deleted successfully');
    } catch (err: any) {
      toast.error(err.message || err.data?.message || 'Something went wrong!');
    }
  };

  const handleCardClick = () => {
    dispatch(setSwiperPhotos(allPhotos.length > 0 ? allPhotos : photos));
    router.push(`/photo/${item.id}?source=profile&ownerId=${item.userId}`);
  };

  return (
    <article
      className="group bg-surface relative cursor-pointer overflow-hidden rounded-sm shadow-md transition-all duration-300 hover:shadow-xl"
      style={
        style || {
          height: '300px',
          flexGrow: aspect,
          flexBasis: `${aspect * 200}px`,
        }
      }
      onClick={handleCardClick}
    >
      {!imgError[item.id] ? (
        <Image
          src={imageUrl}
          alt={item.title || 'photo'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError((prev) => ({ ...prev, [item.id]: true }))}
        />
      ) : (
        <div className="bg-surface-secondary text-caption-foreground flex size-full items-center justify-center text-xs">
          No Image
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100" />

      {/* Delete button — own profile only */}
      {isOwn && (
        <button
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
          className="bg-destructive/10 text-destructive ring-destructive/30 hover:bg-destructive hover:text-destructive-foreground absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full opacity-0 shadow-lg ring-1 transition group-focus-within:opacity-100 group-hover:opacity-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </button>
      )}

      {/* Stats overlay (bottom) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <div className="text-foreground flex flex-wrap items-center gap-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-1">
            <Trophy size={18} />
            {(item.totalVotes ?? 0).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye size={18} />
            {(item.views ?? 0).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={18} />
            {(item.likes ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
};

export default PortfolioCard;
