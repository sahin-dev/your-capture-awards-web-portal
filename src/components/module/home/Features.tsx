'use client';

import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { FeatureItems } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa6';

const Features = () => {
  const { isAuthenticated } = useAuth();
  const contestHref = '/contest/open';
  const featureHref = isAuthenticated
    ? contestHref
    : `/signin?returnTo=${encodeURIComponent(contestHref)}`;

  return (
    <section id="features" className="relative overflow-hidden py-24 lg:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Key features of <span className="text-gradient-brand">Your Capture Awards</span>
            </>
          }
          lead="We are constantly working to bring new updates and features to Upload, such as:"
        />

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
          {FeatureItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 130} className="h-full">
              <Link
                href={featureHref}
                className="group border-border-subtle bg-surface/50 hover:border-primary/40 focus-visible:ring-ring relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                {/* Cover image */}
                <div className="media-zoom relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    alt={item.title}
                    src={item.img}
                    fill
                    sizes="(min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                  />
                  <div className="from-surface absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-editorial text-heading group-hover:text-primary text-2xl font-medium transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground mt-3 flex-1 text-sm leading-relaxed text-pretty">
                    {item.description}
                  </p>

                  <span className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                    Explore
                    <FaArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Closing call to action */}
        <Reveal delay={120} className="mt-24">
          <div className="border-border-subtle from-surface to-surface-tertiary relative overflow-hidden rounded-3xl border bg-gradient-to-br px-6 py-16 text-center sm:px-16">
            <div
              className="bg-primary/15 animate-pulse-glow pointer-events-none absolute -top-32 left-1/2 size-[28rem] -translate-x-1/2 rounded-full blur-[120px]"
              aria-hidden="true"
            />

            <div className="relative">
              <h3 className="font-editorial text-heading text-3xl font-medium text-balance sm:text-4xl">
                And so much more…
              </h3>
              <p className="text-muted-foreground mx-auto mt-4 max-w-md leading-relaxed text-pretty">
                Earn achievements, read reviews, explore custom recommendations, and more.
              </p>

              <Link
                href="/contest/open"
                className="group bg-primary text-primary-foreground relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Explore contests</span>
                <FaArrowRight className="relative size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Features;
