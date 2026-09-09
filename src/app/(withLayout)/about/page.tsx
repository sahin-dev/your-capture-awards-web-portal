'use client';

import TipTapViewer from '@/components/custom/tiptap-editor/TipTapViewer';
import { Spinner } from '@/components/ui/spinner';
import { useGetSitePolicyQuery } from '@/store/apis/sitePolicyApi';
import { Aperture, Award, CheckCircle2, Trophy, UsersRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const proofPoints = [
  { value: 'Global', label: 'community access' },
  { value: 'Curated', label: 'creative contests' },
  { value: 'Fair', label: 'recognition systems' },
];

const pillars = [
  {
    title: 'Compete With Purpose',
    description:
      'Join photography challenges designed around craft, originality, storytelling, and steady creative growth.',
    icon: Trophy,
  },
  {
    title: 'Earn Visible Recognition',
    description:
      'Progress through levels, awards, and milestones that make achievement easy to understand and celebrate.',
    icon: Award,
  },
  {
    title: 'Grow With Community',
    description:
      'Upload, vote, discover photographers, and learn from the work that rises through each contest.',
    icon: UsersRound,
  },
];

const values = [
  {
    title: 'Integrity',
    description: 'Clear rules, transparent contest flow, and consistent standards.',
  },
  {
    title: 'Respect',
    description: 'A creative space where every photographer can participate with dignity.',
  },
  {
    title: 'Excellence',
    description: 'Recognition for technical strength, artistic instinct, and thoughtful stories.',
  },
  {
    title: 'Community',
    description: 'A platform shaped by feedback, participation, and shared creative momentum.',
  },
];

export default function AboutPage() {
  const { data, isLoading, error } = useGetSitePolicyQuery({ type: 'ABOUT' });
  const policy = data?.data?.[0];
  const updatedDate = policy?.updatedAt
    ? new Date(policy.updatedAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <main className="margin overflow-hidden">
      <section className="border-border relative min-h-[calc(100dvh-59px)] border-b">
        <Image
          src="/images/poty.jpg"
          alt="Award-winning photography moment"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_90%,transparent)_42%,color-mix(in_oklab,var(--background)_42%,transparent)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,var(--background)_0%,transparent_100%)]" />

        <div className="relative container grid min-h-[calc(100dvh-59px)] gap-10 py-14 lg:grid-cols-[0.92fr_0.68fr] lg:items-center">
          <div className="max-w-4xl">
            <div className="text-primary mb-6 inline-flex items-center gap-3 text-sm font-semibold">
              <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
                <Aperture className="size-5" />
              </span>
              Your Capture Awards
            </div>
            <h1 className="text-heading max-w-4xl text-5xl leading-[1.02] font-semibold tracking-normal sm:text-6xl lg:text-7xl">
              A serious home for photography contests, ranking, and recognition.
            </h1>
            <p className="text-body mt-6 max-w-2xl text-base leading-7 sm:text-lg">
              We bring photographers into curated competitions where strong images, fair voting, and
              visible achievement help creative work travel further.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contest/open"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition"
              >
                Explore Contests
              </Link>
              <Link
                href="/discover"
                className="border-border-strong bg-background/55 text-foreground hover:bg-surface inline-flex items-center justify-center rounded-md border px-5 py-3 text-sm font-semibold transition"
              >
                Discover Creators
              </Link>
            </div>
          </div>

          <div className="self-end lg:self-center">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {proofPoints.map((point) => (
                <div key={point.label} className="border-primary bg-background/55 border-l-2 p-4">
                  <p className="text-heading text-2xl font-semibold">{point.value}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{point.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1fr] lg:items-end">
          <div>
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">What We Do</p>
            <h2 className="text-heading mt-3 max-w-2xl text-3xl leading-tight font-semibold sm:text-4xl">
              We make photo contests feel organized, credible, and worth entering.
            </h2>
          </div>
          <p className="text-body max-w-2xl text-base leading-7">
            Your Capture Awards gives photographers a place to submit polished work, compete in
            themed contests, earn awards, and build momentum through a system that is easy to follow
            from upload to final recognition.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {pillars.map(({ title, description, icon: Icon }) => (
            <article key={title} className="border-border bg-surface rounded-lg border p-6">
              <div className="flex items-center gap-4">
                <span className="bg-primary/12 text-primary flex size-12 shrink-0 items-center justify-center rounded-md">
                  <Icon className="size-6" />
                </span>
                <h3 className="text-heading text-xl font-semibold">{title}</h3>
              </div>
              <p className="text-muted-foreground mt-5 text-sm leading-6">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-border bg-surface-secondary/35 border-y">
        <div className="container grid gap-10 py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-24">
          <div className="border-border relative min-h-[360px] overflow-hidden rounded-lg border sm:min-h-[520px]">
            <Image
              src="/images/studio.jpg"
              alt="Photography workspace"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--background)_0%,transparent_62%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-heading max-w-md text-2xl leading-tight font-semibold">
                Built for the people behind the lens.
              </p>
            </div>
          </div>

          <div>
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              Our Mission
            </p>
            <h2 className="text-heading mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
              Create a better standard for online photography competition.
            </h2>
            <p className="text-body mt-5 text-base leading-7">
              We care about a contest experience that feels calm, transparent, and rewarding:
              photographers know what to submit, voters know what matters, and winners feel
              genuinely earned.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Clear rules and expectations before photographers submit.',
                'Recognition systems that reward quality, consistency, and progress.',
                'A welcoming platform where creators can compete without losing community.',
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 size-5 shrink-0" />
                  <p className="text-muted-foreground text-sm leading-6">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              Core Values
            </p>
            <h2 className="text-heading mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
              The principles behind every contest.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((value) => (
              <article key={value.title} className="border-border border-t pt-5">
                <h3 className="text-heading text-lg font-semibold">{value.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-16 lg:pb-24">
        <div className="border-border border-t pt-10 text-left">
          <div>
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              Official Overview
            </p>
            <h2 className="text-heading mt-3 text-3xl font-semibold">About the platform</h2>
            {updatedDate && (
              <p className="text-muted-foreground mt-3 text-sm">Updated {updatedDate}</p>
            )}
          </div>

          <div className="mt-6 min-w-0 text-left">
            {isLoading ? (
              <div className="border-border bg-surface flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border">
                <Spinner className="text-primary size-8" />
                <p className="text-muted-foreground text-sm">Loading about information...</p>
              </div>
            ) : error ? (
              <div className="border-border bg-surface text-destructive flex min-h-48 items-center justify-center rounded-lg border text-center">
                Failed to load content. Please try again later.
              </div>
            ) : !policy?.content ? (
              <div className="border-border bg-surface text-muted-foreground flex min-h-48 items-center justify-center rounded-lg border text-center">
                No content available.
              </div>
            ) : (
              <TipTapViewer
                content={policy.content}
                className="text-body [&_a]:text-primary [&_h1]:text-heading [&_h2]:text-heading [&_h3]:text-heading border-border bg-surface max-w-full overflow-hidden rounded-lg border p-5 text-sm leading-7 break-words whitespace-normal sm:p-8 sm:text-base [&_*]:max-w-full [&_a]:underline [&_code]:break-words [&_code]:whitespace-pre-wrap [&_li]:my-1 [&_li]:break-words [&_p]:leading-7 [&_p]:break-words [&_pre]:overflow-hidden [&_pre]:break-words [&_pre]:whitespace-pre-wrap [&_ul]:space-y-1"
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
