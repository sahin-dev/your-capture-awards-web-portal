'use client';

import NotificationModal from '@/components/NotificationModal';
import { SearchBar } from '@/components/SearchBar';
import { SearchModal } from '@/components/SearchModal';
import UserMenu from '@/components/UserMenu';
import { Skeleton } from '@/components/ui/skeleton';
import { loggedInNavLinks, navLinks } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useStoreModal } from '@/providers/StoreModalProvider';
import { useGetStoreStatsQuery } from '@/store/apis/storeApi';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa6';
import { IoKeyOutline } from 'react-icons/io5';
import { MdOutlineCameraswitch } from 'react-icons/md';
import LogoName from '../LogoName';
import Sidebar from './Sidebar';

const ResourceValue = ({
  isLoading,
  value,
  className,
}: {
  isLoading: boolean;
  value: number;
  className?: string;
}) => {
  if (isLoading) return <Skeleton className={cn('bg-surface-secondary h-3 w-5', className)} />;
  return <span className="tabular-nums">{value}</span>;
};

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { openStore } = useStoreModal();
  const { data: storeStats, isLoading: isStatsLoading } = useGetStoreStatsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const stats = storeStats?.data;

  // The landing hero sits under the header, so the bar starts transparent
  // there and only picks up its surface once the page moves.
  const overHero = pathname === '/';

  useLayoutEffect(() => setMounted(true), []);

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 24);

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(scrollable > 0 ? Math.min(y / scrollable, 1) : 0);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // "/" keyboard shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isAuthenticated) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAuthenticated]);

  const menuLinks = useMemo(
    () => (isAuthenticated ? loggedInNavLinks : navLinks),
    [isAuthenticated],
  );

  if (!mounted) return null;

  const transparent = overHero && !scrolled;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 border-b transition-all duration-500',
          transparent
            ? 'border-transparent bg-transparent'
            : 'border-border bg-background/85 supports-[backdrop-filter]:bg-background/70 backdrop-blur-xl backdrop-saturate-150',
        )}
      >
        <nav className="container flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-[400px]:gap-3">
            <Sidebar />
            <LogoName className="w-24 transition-transform duration-300 hover:scale-[1.03] min-[360px]:w-32 min-[400px]:w-38" />

            <ul className="font-kumbh ml-3 hidden flex-1 items-center justify-center gap-1 uppercase select-none lg:flex">
              {menuLinks.map((link, index) => {
                const href = link.href;
                const isActive =
                  pathname === href ||
                  (Array.isArray(link?.tags) && link?.tags.some((tag) => pathname.includes(tag)));

                return (
                  <li key={index}>
                    <Link
                      href={isActive ? '#' : href}
                      className={cn(
                        'group relative px-3 py-2 text-sm font-medium transition-colors duration-300',
                        isActive
                          ? 'text-primary pointer-events-none cursor-default'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {link?.name}

                      {/* Underline grows from the centre on hover, and sits
                          fully drawn on the active route. */}
                      <span
                        className={cn(
                          'bg-primary absolute inset-x-3 bottom-1 h-px origin-center transition-transform duration-300 ease-out',
                          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-2 max-lg:gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden items-center gap-2 text-sm lg:flex">
                  <button
                    type="button"
                    onClick={openStore}
                    className="group bg-surface-secondary hover:bg-surface-tertiary flex h-8.5 items-stretch overflow-hidden rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-md"
                    aria-label="Open store resources"
                  >
                    <span className="text-foreground flex items-center px-3 text-sm">
                      <span className="flex items-center gap-2" title="Charges">
                        <AiOutlineThunderbolt className="text-primary size-4" />
                        <ResourceValue isLoading={isStatsLoading} value={stats?.key ?? 0} />
                      </span>

                      <span className="bg-border-strong mx-3 h-3.5 w-px" />

                      <span className="flex items-center gap-2" title="Trades">
                        <MdOutlineCameraswitch className="text-primary size-4 rotate-90" />
                        <ResourceValue isLoading={isStatsLoading} value={stats?.swap ?? 0} />
                      </span>

                      <span className="bg-border-strong mx-3 h-3.5 w-px" />

                      <span className="flex items-center gap-2" title="Promotes">
                        <IoKeyOutline className="text-primary size-4" />
                        <ResourceValue isLoading={isStatsLoading} value={stats?.boost ?? 0} />
                      </span>
                    </span>

                    <span className="bg-primary/90 text-primary-foreground group-hover:bg-primary flex shrink-0 items-center justify-center px-2 transition-colors">
                      <FaPlus className="size-3 transition-transform duration-300 group-hover:rotate-90" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={openStore}
                    className="group bg-surface-secondary hover:bg-surface-tertiary flex h-8.5 items-stretch overflow-hidden rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-md"
                    aria-label="Open coin store"
                  >
                    <span className="flex items-center gap-2 px-3">
                      <Image
                        src="/icons/ycw-coin.png"
                        alt="YCW Coin"
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                      <ResourceValue
                        isLoading={isStatsLoading}
                        value={stats?.coins ?? 0}
                        className="w-8"
                      />
                    </span>

                    <span className="bg-primary/90 text-primary-foreground group-hover:bg-primary flex shrink-0 items-center justify-center px-2 transition-colors">
                      <FaPlus className="size-3 transition-transform duration-300 group-hover:rotate-90" />
                    </span>
                  </button>
                </div>

                <SearchBar onClick={() => setIsSearchOpen(true)} />
                <NotificationModal />
                <UserMenu />
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-muted-foreground hover:text-foreground hidden rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300 lg:block"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="group bg-primary text-primary-foreground relative hidden overflow-hidden rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-px hover:shadow-lg lg:block"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Register</span>
                </Link>
                <Link
                  href="/signin"
                  className="border-border-strong hover:border-primary hover:text-primary rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-300 min-[400px]:px-4 min-[400px]:text-sm lg:hidden"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-300 min-[400px]:px-4 min-[400px]:text-sm lg:hidden"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Reading progress — absolutely positioned so header height is unchanged */}
        <span
          aria-hidden="true"
          className="via-primary absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-transparent to-transparent transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </header>

      {/* Global Search Modal (rendered outside header to avoid z-index conflicts) */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
