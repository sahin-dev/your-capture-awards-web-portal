'use client';

import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import Image from 'next/image';

const craftStats = [
  { value: '30K+', label: 'Captures judged' },
  { value: '120+', label: 'Countries represented' },
  { value: '48', label: 'Contests a year' },
];

const About = () => {
  return (
    <section id="about" className="relative overflow-hidden py-24 lg:py-32">
      {/* Soft brand wash behind the section */}
      <div
        className="bg-primary/5 pointer-events-none absolute top-1/3 -left-64 size-[36rem] rounded-full blur-[160px]"
        aria-hidden="true"
      />

      <div className="container">
        <SectionHeading
          eyebrow="About us"
          title={
            <>
              We capture all of your <span className="text-gradient-brand">beautiful memories</span>
            </>
          }
          lead="A community built around the craft — where the frame you spent all morning waiting for finally gets the audience it deserves."
        />

        <div className="mt-20 grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Portrait with layered frame */}
          <Reveal direction="right" className="relative">
            <div className="border-primary/25 absolute -top-5 -left-5 hidden size-40 border-t border-l lg:block" />
            <div className="border-primary/25 absolute -right-5 -bottom-5 hidden size-40 border-r border-b lg:block" />

            <div className="media-zoom ring-border-subtle relative aspect-[4/5] w-full overflow-hidden rounded-2xl ring-1">
              <Image
                src="/images/portrait.jpg"
                alt="A photographer at work"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
            </div>

            {/* Floating credential card */}
            <div className="glass edge-light absolute -right-4 bottom-8 rounded-xl px-5 py-4 sm:right-8">
              <p className="eyebrow">Est.</p>
              <p className="font-editorial text-heading text-2xl font-medium">2024</p>
            </div>
          </Reveal>

          {/* Copy column */}
          <div>
            <Reveal direction="left">
              <h3 className="font-editorial text-heading text-2xl leading-snug font-medium text-balance sm:text-3xl">
                A photographic journey through life&apos;s beautiful tapestry.
              </h3>
            </Reveal>

            <Reveal direction="left" delay={100}>
              <p className="text-muted-foreground mt-6 leading-relaxed text-pretty">
                Embark on a captivating odyssey through life&apos;s intricate tapestry, where each
                snapshot immortalises a moment of beauty and wonder. From sunrise vistas to candid
                smiles, this photographic journey unveils the richness and diversity of human
                experience.
              </p>
            </Reveal>

            <Reveal direction="left" delay={180}>
              <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
                Every entry is seen, scored and discussed by photographers who understand what went
                into it — no algorithms, no vanity metrics, just the work.
              </p>
            </Reveal>

            {/* Craft stats */}
            <div className="border-border-subtle mt-10 grid grid-cols-3 gap-4 border-t pt-8">
              {craftStats.map((stat, i) => (
                <Reveal key={stat.label} delay={240 + i * 90}>
                  <p className="font-editorial text-gradient-brand text-3xl font-medium">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs tracking-wide">{stat.label}</p>
                </Reveal>
              ))}
            </div>

            <Reveal direction="left" delay={480} className="mt-10">
              <div className="media-zoom ring-border-subtle relative aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1">
                <Image
                  src="/images/studio.jpg"
                  alt="Inside the studio"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
